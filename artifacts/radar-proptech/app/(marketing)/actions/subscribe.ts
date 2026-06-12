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

  // Lo insertamos. Si da error de duplicado (código 23505), lo ignoramos.
  const { error: dbError } = await supabaseAdmin
    .from("leads_iniciales")
    .insert([{ email }]);

  if (dbError && dbError.code !== '23505') {
    console.error("Error guardando en Supabase:", dbError);
  }

  // 2. ENVIAR A MAILERLITE (API v2)
  const ML_TOKEN = process.env.MAILERLITE_API_TOKEN;
  const ML_GROUP_ID = process.env.MAILERLITE_GROUP_ID; // El ID del grupo "KAVOX Pendientes"

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
          status: "active" // Entra directo como activo para que salte la automatización
        })
      });
    } catch (error) {
      console.error("Error conectando con MailerLite:", error);
    }
  } else {
    console.warn("Falta MAILERLITE_API_TOKEN o MAILERLITE_GROUP_ID en las variables de entorno.");
  }

  return { success: true };
}