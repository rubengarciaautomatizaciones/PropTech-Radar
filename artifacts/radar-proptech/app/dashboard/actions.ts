// artifacts/radar-proptech/app/dashboard/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateLeadStatus(id_anuncio: string, id_agencia: string, newStatus: string) {
  const supabase = await createClient();

  // Seguridad: Verificamos que el usuario logueado pertenezca a esa agencia
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: userData } = await supabase
    .from("usuarios")
    .select("id_agencia")
    .eq("id_usuario", user.id)
    .single();

  if (userData?.id_agencia !== id_agencia) {
    return { error: "Acción no permitida" };
  }

  // Actualizamos el estado en la base de datos
  const { error } = await supabase
    .from("propiedades_rastreadas")
    .update({ estado: newStatus })
    .eq("id_anuncio", id_anuncio)
    .eq("id_agencia", id_agencia);

  if (error) {
    console.error("Error updating lead status:", error);
    return { error: "Error al actualizar el estado" };
  }

  // Forzamos a Next.js a refrescar la página para ver el cambio
  revalidatePath("/dashboard");
  return { success: true };
}