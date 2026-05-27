// artifacts/radar-proptech/app/dashboard/config/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
  const agencyName = formData.get("agencyName") as string;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // 1. Creamos la agencia
  const { data: agencia, error: agenciaError } = await supabase
    .from("agencias")
    .insert({ nombre_empresa: agencyName })
    .select("id_agencia")
    .single();

  if (agenciaError || !agencia) {
    console.error("Error al crear agencia:", agenciaError); // Logueamos el error real en Vercel
    return { error: "Hubo un problema al crear la agencia en la base de datos." };
  }

  // 2. Vinculamos al usuario con esa agencia
  const { error: userError } = await supabase
    .from("usuarios")
    .update({ id_agencia: agencia.id_agencia })
    .eq("id_usuario", user.id);

  if (userError) {
    console.error("Error al vincular usuario con agencia:", userError);
    return { error: "Hubo un problema al vincular tu perfil de usuario." };
  }

  // Si todo sale bien, redirigimos
  return redirect("/dashboard");
}