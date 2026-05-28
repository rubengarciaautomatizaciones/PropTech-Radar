// artifacts/radar-proptech/app/dashboard/config/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";

export async function completeOnboarding(formData: FormData) {
  const agencyName = formData.get("agencyName") as string;
  const idealistaUrl = formData.get("idealistaUrl") as string;

  if (!agencyName || !idealistaUrl) {
    return { error: "Faltan datos por rellenar." };
  }

  // 1. Verificamos quién es el usuario con el cliente normal
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return redirect("/login");
  }

  // 2. Creamos el cliente ADMIN PURO (Sin cookies) para saltar el RLS
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 3. Creamos la agencia
  const { data: agencia, error: agenciaError } = await supabaseAdmin
    .from("agencias")
    .insert({ nombre_empresa: agencyName })
    .select("id_agencia")
    .single();

  if (agenciaError || !agencia) {
    console.error("ERROR CREANDO AGENCIA:", agenciaError);
    return { error: "Hubo un problema al registrar la agencia." };
  }

  // 4. Vinculamos al usuario
  const { error: userError } = await supabaseAdmin
    .from("usuarios")
    .update({ id_agencia: agencia.id_agencia })
    .eq("id_usuario", user.id);

  if (userError) {
    console.error("ERROR VINCULANDO USUARIO:", userError);
    return { error: "Hubo un problema al vincular tu perfil." };
  }

  // 5. Guardamos la URL de rastreo
  const { error: configError } = await supabaseAdmin
    .from("configuracion_rastreo")
    .insert({
      id_agencia: agencia.id_agencia,
      url_idealista: idealistaUrl,
      activa: true,
    });

  if (configError) {
    console.error("ERROR GUARDANDO CONFIG:", configError);
    return { error: "Hubo un problema al configurar el rastreador." };
  }

  // 6. --- INTEGRACIÓN DE STRIPE ---
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const origin = (await headers()).get("origin") || "https://prop-tech-radar.vercel.app";

  try {
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard`,
      cancel_url: `${origin}/dashboard/config`,
      client_reference_id: agencia.id_agencia, // CRÍTICO: vincula el pago a la agencia
      customer_email: user.email,
    });

    if (stripeSession.url) {
      return redirect(stripeSession.url); // Redirige a la pasarela de pago
    }
  } catch (stripeError) {
    console.error("ERROR CREANDO SESIÓN STRIPE:", stripeError);
    return { error: "Hubo un problema al conectar con la pasarela de pago." };
  }

  // Fallback
  return redirect("/dashboard");
}

// --- Acción para actualizar la configuración después del onboarding ---
export async function updateScrapingConfig(formData: FormData) {
  const idealistaUrl = formData.get("idealistaUrl") as string;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado." };

  const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .select("id_agencia")
      .eq("id_usuario", user.id)
      .single();

  if (userError || !userData?.id_agencia) {
      return { error: "No se encontró la agencia del usuario." };
  }

  // Cliente ADMIN PURO para escribir
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: upsertError } = await supabaseAdmin
      .from("configuracion_rastreo")
      .upsert({
          id_agencia: userData.id_agencia,
          url_idealista: idealistaUrl,
          activa: true,
      }, { onConflict: 'id_agencia' });

  if (upsertError) {
      console.error("Error en UPSERT de config_rastreo:", upsertError);
      return { error: "No se pudo guardar la configuración." };
  }

  revalidatePath("/dashboard/config");
  return { success: "¡Configuración guardada con éxito!" };
}