"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateIdealistaUrl(formData: FormData) {
  const url = formData.get("idealistaUrl") as string;

  if (!url || url.trim() === "") {
    return redirect("/dashboard/config?error=url_empty");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: userData } = await supabase
    .from("usuarios")
    .select("id_agencia")
    .eq("id_usuario", user.id)
    .single();

  if (!userData?.id_agencia) return redirect("/dashboard/config?error=no_agency");

  const { error } = await supabase
    .from("configuracion_rastreo")
    .upsert({ 
      id_agencia: userData.id_agencia, 
      url_idealista: url,
      activa: true 
    });

  if (error) return redirect("/dashboard/config?error=db_error");

  revalidatePath("/dashboard/config");
  // Redirección de éxito
  return redirect("/dashboard/dashboard?success=config_saved");
}