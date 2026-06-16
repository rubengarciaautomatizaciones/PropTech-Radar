// artifacts/radar-proptech/app/dashboard/support-actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function sendSupportTicket(formData: FormData) {
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  if (!subject || !message) {
    return { error: "Por favor, rellena todos los campos." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado." };

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error("Falta RESEND_API_KEY en las variables de entorno.");
    return { error: "Servicio de correo no configurado." };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'KAVOX System <info@kavox.tech>', // Debe ser un correo verificado en Resend
        to: 'info@kavox.tech', // A dónde te llegará el mensaje
        reply_to: user.email, // Si le das a "Responder" en tu email, le responderá al cliente
        subject: `TICKET SOPORTE: ${subject}`,
        html: `
          <h2>Nuevo ticket de soporte desde la plataforma</h2>
          <p><strong>Usuario:</strong> ${user.email}</p>
          <hr />
          <p><strong>Asunto:</strong> ${subject}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${message.replace(/\n/g, '<br />')}</p>
        `
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Resend API Error:", errorData);
      return { error: "Error al enviar el mensaje. Inténtalo más tarde." };
    }

    return { success: "Mensaje enviado correctamente. Te responderemos pronto." };
  } catch (error) {
    console.error("Network Error:", error);
    return { error: "Error de red al conectar con el servidor de correo." };
  }
}