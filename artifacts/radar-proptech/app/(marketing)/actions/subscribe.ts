// artifacts/radar-proptech/app/(marketing)/actions/subscribe.ts
"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function subscribeEmail(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email || !email.includes("@")) {
    return { error: "Por favor, introduce un email válido." };
  }

  // 1. GUARDAR RESPALDO EN SUPABASE
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: dbError } = await supabaseAdmin
    .from("leads_iniciales")
    .insert([{ email }]);

  if (dbError && dbError.code !== '23505') {
    console.error("Error guardando en Supabase:", dbError);
  }

  // 2. ENVIAR A MAILERLITE (API v2)
  const ML_TOKEN = process.env.MAILERLITE_API_TOKEN;
  const ML_GROUP_ID = process.env.MAILERLITE_GROUP_ID;

  if (ML_TOKEN && ML_GROUP_ID) {
    try {
      await fetch("https://connect.mailerlite.com/api/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ML_TOKEN}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email: email,
          groups: [ML_GROUP_ID],
          status: "active" 
        })
      });
    } catch (error) {
      console.error("Error conectando con MailerLite:", error);
    }
  }

  // 3. ALERTA POR EMAIL A TI (RESEND)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'KAVOX System <info@kavox.tech>', // Remitente verificado
          to: 'info@kavox.tech', // A dónde te llega la alerta
          subject: `🔥 NUEVO LEAD (Landing Page)`,
          html: `
            <h2>Nuevo email capturado en la web</h2>
            <p>Alguien acaba de dejar su correo en la landing page:</p>
            <h3>${email}</h3>
            <p><em>Este usuario ha sido enviado a MailerLite al grupo de Pendientes.</em></p>
          `
        })
      });
    } catch (e) {
      console.error("Error enviando alerta Resend:", e);
    }
  }

  return { success: true };
}