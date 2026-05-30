  "use server";

  import { createClient } from "@/lib/supabase/server";
  import { createClient as createAdminClient } from "@supabase/supabase-js";
  import { redirect } from "next/navigation";
  import { headers } from "next/headers";
  import { revalidatePath } from "next/cache";
  import Stripe from "stripe";

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  async function createSupabaseAdminClient() {
      return createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
  }

  // ------------------------------------------------------------------
  // 1. ONBOARDING
  // ------------------------------------------------------------------
  export async function completeOnboarding(formData: FormData) {
    const agencyName = formData.get("agencyName") as string;
    const nombreRastreo = formData.get("nombreRastreo") as string;
    const idealistaUrl = formData.get("idealistaUrl") as string;

    if (!agencyName || !idealistaUrl || !nombreRastreo) return { error: "Faltan datos." };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    const supabaseAdmin = await createSupabaseAdminClient();

    // Verificamos si el usuario fue seteado manualmente como "dios" en la BD
    const { data: currentUser } = await supabaseAdmin.from("usuarios").select("rol").eq("id_usuario", user.id).single();
    const isDios = currentUser?.rol === "dios";

    const { data: agencia, error: agenciaError } = await supabaseAdmin
      .from("agencias")
      .insert({ nombre_empresa: agencyName, estado_suscripcion: isDios ? "activa" : "pendiente" })
      .select("id_agencia")
      .single();

    if (agenciaError || !agencia) return { error: "Error creando agencia." };

    // Asignamos el rol. Si ya era dios, se queda como dios. Si no, es admin.
    await supabaseAdmin.from("usuarios").update({ 
        id_agencia: agencia.id_agencia,
        rol: isDios ? "dios" : "admin" 
    }).eq("id_usuario", user.id);

    await supabaseAdmin.from("configuracion_rastreo").insert({
        id_agencia: agencia.id_agencia,
        nombre_rastreo: nombreRastreo,
        url_idealista: idealistaUrl,
        activa: true,
    });

    // SI ES DIOS, SE SALTA EL PAGO Y VA AL PANEL
    if (isDios) {
      return redirect("/dashboard");
    }

    // SI ES UN CLIENTE NORMAL (ADMIN), VA A STRIPE
    const origin = (await headers()).get("origin") || "https://prop-tech-radar.vercel.app";
    let checkoutUrl = ""; 

    try {
      const stripeSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID, quantity: 1 }],
        subscription_data: { trial_period_days: 3 }, 
        success_url: `${origin}/dashboard`,
        cancel_url: `${origin}/dashboard/config`,
        client_reference_id: agencia.id_agencia, 
        customer_email: user.email,
      });
      if (stripeSession.url) checkoutUrl = stripeSession.url; 
    } catch (stripeError) {
      return { error: "Error de Stripe." };
    }

    if (checkoutUrl) redirect(checkoutUrl);
    return redirect("/dashboard");
  }

  // ------------------------------------------------------------------
  // 2. AÑADIR NUEVO RADAR
  // ------------------------------------------------------------------
  export async function addRadarUpfrontCharge(formData: FormData) {
    const idealistaUrl = formData.get("idealistaUrl") as string;
    const nombreRastreo = formData.get("nombreRastreo") as string;

    if (!idealistaUrl || !nombreRastreo) return { error: "Faltan datos." };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No autorizado." };

    const supabaseAdmin = await createSupabaseAdminClient();
    const { data: userData } = await supabaseAdmin.from("usuarios").select("id_agencia, rol").eq("id_usuario", user.id).single();
    const isDios = userData?.rol === "dios";

    if (!isDios) {
      // LÓGICA DE COBRO EN STRIPE PARA CLIENTES NORMALES
      const { data: agencia } = await supabaseAdmin.from("agencias").select("plan_stripe_id").eq("id_agencia", userData?.id_agencia).single();
      if (!agencia?.plan_stripe_id) return { error: "Suscripción no encontrada." };

      try {
        const subscription = await stripe.subscriptions.retrieve(agencia.plan_stripe_id);
        const subItemId = subscription.items.data[0].id;
        const currentQty = subscription.items.data[0].quantity || 1;

        await stripe.subscriptions.update(subscription.id, {
          items: [{ id: subItemId, quantity: currentQty + 1 }],
          proration_behavior: "always_invoice",
          trial_end: "now", 
        });
      } catch (error: any) {
        console.error("Error Stripe Upsell:", error);
        return { error: "Error al procesar el pago. Verifica tu tarjeta en facturación." };
      }
    }

    // TANTO SI ES DIOS COMO SI EL CLIENTE PAGÓ, SE INSERTA EN DB
    await supabaseAdmin.from("configuracion_rastreo").insert({
        id_agencia: userData!.id_agencia,
        nombre_rastreo: nombreRastreo,
        url_idealista: idealistaUrl,
        activa: true,
    });

    revalidatePath("/dashboard/config");
    return { success: "Radar añadido correctamente." };
  }

  // ------------------------------------------------------------------
  // 3. EDITAR SOLO EL NOMBRE
  // ------------------------------------------------------------------
  export async function updateRadarName(id: string, newName: string) {
    const supabaseAdmin = await createSupabaseAdminClient();
    const { error } = await supabaseAdmin.from("configuracion_rastreo").update({ nombre_rastreo: newName }).eq("id", id);
    if (error) return { error: "Error actualizando el nombre." };

    revalidatePath("/dashboard/config");
    return { success: true };
  }

  // ------------------------------------------------------------------
  // 4. ELIMINAR RADAR
  // ------------------------------------------------------------------
  export async function deleteRadar(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No autorizado" };

    const supabaseAdmin = await createSupabaseAdminClient();
    const { data: userData } = await supabaseAdmin.from("usuarios").select("id_agencia, rol").eq("id_usuario", user.id).single();
    const isDios = userData?.rol === "dios";

    try {
      const { count } = await supabaseAdmin.from("configuracion_rastreo").select("id", { count: 'exact' }).eq("id_agencia", userData!.id_agencia);
      if (count && count <= 1) return { error: "No puedes eliminar tu único radar. Cancela la suscripción en Facturación." };

      await supabaseAdmin.from("configuracion_rastreo").delete().eq("id", id);

      if (!isDios) {
        // LÓGICA STRIPE PARA DEVOLVER DINERO A CLIENTES NORMALES
        const { data: agencia } = await supabaseAdmin.from("agencias").select("plan_stripe_id").eq("id_agencia", userData?.id_agencia).single();
        if (!agencia?.plan_stripe_id) return { error: "Suscripción no encontrada." };

        const subscription = await stripe.subscriptions.retrieve(agencia.plan_stripe_id);
        const subItemId = subscription.items.data[0].id;
        const currentQty = subscription.items.data[0].quantity || 2;

        await stripe.subscriptions.update(subscription.id, {
          items: [{ id: subItemId, quantity: currentQty - 1 }],
          proration_behavior: "always_invoice" 
        });
      }

      revalidatePath("/dashboard/config");
      return { success: "Radar eliminado correctamente." };
    } catch (error) {
      return { error: "Error interno al eliminar." };
    }
  }