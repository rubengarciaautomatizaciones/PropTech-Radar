"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
  const agencyName = formData.get("agencyName") as string;
  const idealistaUrl = formData.get("idealistaUrl") as string;

  if (!agencyName || !idealistaUrl) {
    return { error: "Faltan datos por rellenar." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // 1. Creamos la agencia en la tabla 'agencias'
  const { data: agencia, error: agenciaError } = await supabase
    .from("agencias")
    .insert({ nombre: agencyName })
    .select("id") // Asumimos que la clave primaria es 'id'
    .single();

  if (agenciaError || !agencia) {
    console.error("Error al crear agencia:", agenciaError);
    return { error: "Hubo un problema al registrar la agencia." };
  }

  // 2. Vinculamos al usuario actual con esa nueva agencia
  const { error: userError } = await supabase
    .from("usuarios")
    .update({ id_agencia: agencia.id })
    .eq("id_usuario", user.id);

  if (userError) {
    console.error("Error al vincular usuario:", userError);
    return { error: "Hubo un problema al vincular tu perfil." };
  }

  // 3. Guardamos la URL de rastreo
  const { error: configError } = await supabase
    .from("configuracion_rastreo")
    .insert({
      id_agencia: agencia.id,
      url_idealista: idealistaUrl,
      activa: true
    });

  if (configError) {
    console.error("Error al guardar URL:", configError);
    return { error: "Hubo un problema al configurar el rastreador." };
  }

  // Si todo sale bien, lo enviamos al panel principal
  return redirect("/dashboard?success=onboarding_completed");
}