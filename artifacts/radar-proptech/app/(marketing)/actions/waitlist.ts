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

  return { success: true };
}