// artifacts/radar-proptech/app/(marketing)/actions/waitlist.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function joinWaitlist(formData: FormData) {
  const email = formData.get("email") as string;
  const zona = formData.get("zona") as string;

  if (!email || !zona) {
    return { error: "Ambos campos son obligatorios." };
  }

  const supabase = await createClient();

  // Insertamos en la tabla waitlist
  const { error } = await supabase
    .from("waitlist")
    .insert([{ email, zona }]);

  if (error) {
    // Si tienes constraint de UNIQUE en email
    if (error.code === '23505') {
      return { error: "Este email ya está en la lista de espera." };
    }
    console.error("Waitlist Error:", error.message);
    return { error: "Error interno del servidor. Inténtalo de nuevo." };
  }

  return { success: true };
}