// artifacts/radar-proptech/app/dashboard/config/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
  const agencyName = formData.get("agencyName") as string;
  const idealistaUrl = formData.get("idealistaUrl") as string;

  if (!agencyName || !idealistaUrl) {
    return { error: "Faltan datos por rellenar." };
  }

  // 1. Verificamos que el usuario esté logueado (con el cliente normal)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // 2. Creamos el cliente ADMIN para saltarnos las reglas de seguridad (Solo para backend)
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 3. Creamos la agencia en la tabla 'agencias'
  const { data: agencia, error: agenciaError } = await supabaseAdmin
    .from("agencias")
    .insert({ nombre_empresa: agencyName })
    .select("id_agencia")
    .single();

  if (agenciaError || !agencia) {
    console.error("Error al crear agencia:", agenciaError);
    return { error: "Hubo un problema al registrar la agencia." };
  }

  // 4. Vinculamos al usuario actual con esa nueva agencia
  const { error: userError } = await supabaseAdmin
    .from("usuarios")
    .update({ id_agencia: agencia.id_agencia })
    .eq("id_usuario", user.id);

  if (userError) {
    console.error("Error al vincular usuario:", userError);
    return { error: "Hubo un problema al vincular tu perfil." };
  }

  // 5. Guardamos la URL de rastreo
  const { error: configError } = await supabaseAdmin
    .from("configuracion_rastreo")
    .insert({
      id_agencia: agencia.id_agencia,
      url_idealista: idealistaUrl,
      activa: true
    });

  if (configError) {
    console.error("Error al guardar URL:", configError);
    return { error: "Hubo un problema al configurar el rastreador." };
  }

  // Si todo sale bien, lo enviamos al panel principal
  return redirect("/dashboard");
}