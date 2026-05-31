// artifacts/radar-proptech/app/(marketing)/actions/waitlist.ts
"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function joinWaitlist(formData: FormData) {
  const email = formData.get("email") as string;
  const zona = formData.get("zona") as string;

  if (!email || !zona) {
    return { error: "Ambos campos son obligatorios." };
  }

  // ⚠️ Usamos el Admin Client (Service Role) para saltarnos el RLS de Supabase.
  // Como esto es un formulario público, los usuarios no están autenticados.
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from("waitlist")
    .insert([{ email, zona }]);

  if (error) {
    // Código de error de PostgreSQL para "Unique violation" (Email duplicado)
    if (error.code === '23505') {
      return { error: "Este email ya está en la lista de espera." };
    }

    // Mostramos el error exacto en la consola de tu servidor para debugging
    console.error("Waitlist DB Error:", error.message, error.details);
    return { error: "Error interno del servidor. Inténtalo de nuevo." };
  }

  return { success: true };
}