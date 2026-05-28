// artifacts/radar-proptech/app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Inicializamos Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
  // En Next.js App Router, necesitamos el "raw body" para que Stripe valide la firma
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  let event: Stripe.Event;

  try {
    // Verificamos que la llamada viene REALMENTE de Stripe y no de un hacker
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Error desconocido";
    console.error("⚠️ Error verificando webhook de Stripe:", errorMessage);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  // Creamos el cliente ADMIN de Supabase para poder escribir en la base de datos
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // --- LÓGICA DE NEGOCIO: ¿QUÉ PASÓ EN STRIPE? ---

  // Escuchamos cuando una sesión de Checkout (el pago inicial) se completa con éxito
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Recuperamos el ID de la agencia que le mandamos a Stripe cuando creamos el checkout
    const agencyId = session.client_reference_id;
    const subscriptionId = session.subscription as string; // El ID de la suscripción para el futuro

    if (agencyId) {
      console.log(`✅ Pago recibido para la agencia: ${agencyId}. Actualizando base de datos...`);

      const { error } = await supabaseAdmin
        .from("agencias")
        .update({
          estado_suscripcion: "activa",
          plan_stripe_id: subscriptionId,
        })
        .eq("id_agencia", agencyId);

      if (error) {
        console.error("❌ Error actualizando el estado de la agencia en Supabase:", error);
      } else {
        console.log("✅ Agencia actualizada a 'activa' correctamente.");
      }
    }
  }

  // Escuchamos cuando a un cliente se le cancela la suscripción (ej: deja de pagar)
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const subscriptionId = subscription.id;

    console.log(`⚠️ Suscripción cancelada: ${subscriptionId}. Desactivando agencia...`);

    await supabaseAdmin
      .from("agencias")
      .update({ estado_suscripcion: "cancelada" })
      .eq("plan_stripe_id", subscriptionId);
  }

  // Devolvemos un 200 a Stripe para decirle "Mensaje recibido, gracias"
  return NextResponse.json({ received: true }, { status: 200 });
}