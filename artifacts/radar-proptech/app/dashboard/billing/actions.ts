"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function redirectToCustomerPortal() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  // Usamos el admin client para leer la agencia de forma segura
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: userData } = await supabaseAdmin
    .from("usuarios")
    .select("id_agencia, rol")
    .eq("id_usuario", user.id)
    .single();

  // ⚠️ ESCUDO TYPESCRIPT: Verificamos que userData exista
  if (!userData || !userData.id_agencia) {
    return { error: "No tienes una agencia vinculada." };
  }

  if (userData.rol === "dios") {
    return { error: "Modo Dios activado. Tienes acceso gratuito de por vida y no requieres portal de facturación." };
  }

  const { data: agencia } = await supabaseAdmin
    .from("agencias")
    .select("plan_stripe_id")
    .eq("id_agencia", userData.id_agencia)
    .single();

  if (!agencia?.plan_stripe_id) {
    return { error: "No se encontró una suscripción activa de Stripe." };
  }

  try {
    // Recuperamos la suscripción para sacar el ID del Customer
    const subscription = await stripe.subscriptions.retrieve(agencia.plan_stripe_id);
    const customerId = subscription.customer as string;

    const origin = (await headers()).get("origin") || "https://prop-tech-radar.vercel.app";

    // Generamos la sesión del portal de cliente
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard/billing`,
    });

    return redirect(portalSession.url);
  } catch (error) {
    console.error("Error Stripe Portal:", error);
    return { error: "Hubo un error de conexión con Stripe." };
  }
}