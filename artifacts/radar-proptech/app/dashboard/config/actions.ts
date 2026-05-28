// artifacts/radar-proptech/app/dashboard/config/actions.ts
"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Stripe from "stripe"; // <-- Importamos Stripe

// Función para obtener un cliente de Supabase con permisos de admin (Llave Maestra)
async function createSupabaseAdminClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (e) {
            // Ignorar errores en Server Components
          }
        },
      },
    }
  );
}

export async function completeOnboarding(formData: FormData) {
  const agencyName = formData.get("agencyName") as string;
  const idealistaUrl = formData.get("idealistaUrl") as string;

  if (!agencyName || !idealistaUrl) {
    return { error: "Faltan datos por rellenar." };
  }

  const supabaseAdmin = await createSupabaseAdminClient();
  const { data: { user } } = await supabaseAdmin.auth.getUser();

  if (!user) return redirect("/login");

  // 1. Creamos la agencia
  const { data: agencia, error: agenciaError } = await supabaseAdmin
    .from("agencias")
    .insert({ nombre_empresa: agencyName })
    .select("id_agencia")
    .single();

  if (agenciaError || !agencia) {
    console.error("ERROR CREANDO AGENCIA:", agenciaError);
    return { error: "Hubo un problema al registrar la agencia." };
  }

  // 2. Vinculamos al usuario
  const { error: userError } = await supabaseAdmin
    .from("usuarios")
    .update({ id_agencia: agencia.id_agencia })
    .eq("id_usuario", user.id);

  if (userError) {
    console.error("ERROR VINCULANDO USUARIO:", userError);
    return { error: "Hubo un problema al vincular tu perfil." };
  }

  // 3. Guardamos la URL de rastreo
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

  // 4. --- INTEGRACIÓN DE STRIPE ---
  // Inicializamos Stripe con la clave secreta
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  // Obtenemos la URL actual de tu SaaS (para decirle a Stripe a dónde volver)
  const headersList = await headers();
  const origin = headersList.get("origin") || "https://prop-tech-radar.vercel.app";

  try {
    // Creamos la sesión de Checkout de Stripe
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard`, // A dónde va si paga o activa el trial
      cancel_url: `${origin}/dashboard/config`, // A dónde vuelve si le da a "Atrás"
      client_reference_id: agencia.id_agencia, // ¡CRÍTICO! Así sabremos qué agencia pagó
      customer_email: user.email, // Autocompleta el email en Stripe
    });

    if (stripeSession.url) {
      // Redirigimos al usuario a la pasarela de pago de Stripe
      return redirect(stripeSession.url);
    }
  } catch (stripeError) {
    console.error("ERROR CREANDO SESIÓN STRIPE:", stripeError);
    return { error: "Hubo un problema al conectar con la pasarela de pago." };
  }

  // Fallback de seguridad
  return redirect("/dashboard");
}


// --- Acción para actualizar configuración (ya la tenías, la mantenemos) ---
export async function updateScrapingConfig(formData: FormData) {
  const idealistaUrl = formData.get("idealistaUrl") as string;
  const supabaseAdmin = await createSupabaseAdminClient();
  const { data: { user } } = await supabaseAdmin.auth.getUser();

  if (!user) return { error: "No autorizado." };

  const { data: userData, error: userError } = await supabaseAdmin
      .from("usuarios")
      .select("id_agencia")
      .eq("id_usuario", user.id)
      .single();

  if (userError || !userData?.id_agencia) {
      return { error: "No se encontró la agencia del usuario." };
  }

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