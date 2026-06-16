// artifacts/radar-proptech/app/(marketing)/actions/waitlist.ts
"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function joinWaitlist(data: {
  nombre: string;
  agencia: string;
  email: string;
  telefono: string;
  zona: string;
  q_situacion: string;
  q_objetivo: string;
  q_obstaculo: string;
  q_presupuesto: string;
  q_abierta: string;
}) {
  if (!data.email || !data.zona || !data.nombre || !data.telefono || !data.agencia) {
    return { error: "Todos los campos de contacto son obligatorios." };
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. GUARDAR EN SUPABASE
  const { error } = await supabaseAdmin
    .from("waitlist")
    .insert([data]);

  if (error) {
    if (error.code === '23505') {
      return { error: "Este email ya está en la lista de espera." };
    }
    console.error("Waitlist DB Error:", error.message);
    return { error: "Error interno del servidor. Inténtalo de nuevo." };
  }

  // 2. ALERTA POR EMAIL A TI (RESEND)
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
          subject: `🚨 NUEVA AGENCIA EN WAITLIST: ${data.agencia}`,
          html: `
            <h2 style="color: #008799;">Nuevo formulario completado</h2>
            <p>Un usuario acaba de rellenar las 10 preguntas de la Waitlist.</p>
            <hr />
            <h3>Datos de Contacto:</h3>
            <ul>
              <li><strong>Nombre:</strong> ${data.nombre}</li>
              <li><strong>Agencia:</strong> ${data.agencia}</li>
              <li><strong>Email:</strong> ${data.email}</li>
              <li><strong>Teléfono:</strong> ${data.telefono}</li>
              <li><strong>Zona a monopolizar:</strong> ${data.zona}</li>
            </ul>
            <h3>Auditoría Táctica:</h3>
            <ul>
              <li><strong>Situación actual:</strong> ${data.q_situacion}</li>
              <li><strong>Objetivo:</strong> ${data.q_objetivo}</li>
              <li><strong>Obstáculo:</strong> ${data.q_obstaculo}</li>
              <li><strong>Presupuesto:</strong> ${data.q_presupuesto}</li>
            </ul>
            <h3>Justificación (Por qué dárselo a ellos):</h3>
            <p style="background-color: #f3f4f6; padding: 15px; border-radius: 8px;"><em>"${data.q_abierta}"</em></p>
          `
        })
      });
    } catch (e) {
      console.error("Error enviando alerta Resend:", e);
    }
  }

  return { success: true };
}