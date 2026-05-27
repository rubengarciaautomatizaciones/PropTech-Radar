// artifacts/radar-proptech/app/dashboard/config/actions.ts
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
  const agencyName = formData.get("agencyName") as string;
  const idealistaUrl = formData.get("idealistaUrl") as string;

  const cookieStore = await cookies();

  // ¡¡¡LA MAGIA!!! Creamos un cliente con la LLAVE MAESTRA para esta operación
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // <-- Usamos la llave maestra
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabaseAdmin.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // --- AHORA TODAS LAS OPERACIONES USAN EL CLIENTE ADMIN ---

  // 1. Creamos la agencia
  const { data: agencia, error: agenciaError } = await supabaseAdmin
    .from("agencias")
    .insert({ nombre_empresa: agencyName })
    .select("id_agencia")
    .single();

  if (agenciaError || !agencia) {
    console.error("Error creando agencia con service_role:", agenciaError);
    return { error: "Hubo un problema al registrar la agencia." };
  }

  // 2. Vinculamos al usuario
  const { error: userError } = await supabaseAdmin
    .from("usuarios")
    .update({ id_agencia: agencia.id_agencia })
    .eq("id_usuario", user.id);

  if (userError) {
    console.error("Error vinculando usuario con service_role:", userError);
    return { error: "Hubo un problema al vincular tu perfil." };
  }

  // 3. Guardamos la URL de rastreo
  const { error: configError } = await supabaseAdmin
    .from("configuracion_rastreo")
    .insert({
      id_agencia: agencia.id_agencia,
      url_idealista: idealistaUrl,
      activa: true,
    });

  if (configError) {
    console.error("Error guardando config con service_role:", configError);
    return { error: "Hubo un problema al configurar el rastreador." };
  }

  return redirect("/dashboard");
}