// artifacts/radar-proptech/app/dashboard/config/actions.ts
"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
  const agencyName = formData.get("agencyName") as string;
  const idealistaUrl = formData.get("idealistaUrl") as string;

  if (!agencyName || !idealistaUrl) {
    return { error: "Faltan datos por rellenar." };
  }

  const cookieStore = await cookies();

  // Cliente con la LLAVE MAESTRA para esta operación administrativa
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // ¡¡LA CORRECCIÓN DEFINITIVA!! Tipado estricto para que TypeScript no llore.
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (e) {
            // Ignorar errores en Server Components, el proxy se encarga.
          }
        },
      },
    }
  );

  const { data: { user } } = await supabaseAdmin.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // 1. Creamos la agencia
  const { data: agencia, error: agenciaError } = await supabaseAdmin
    .from("agencias")
    .insert({ nombre_empresa: agencyName })
    .select("id_agencia")
    .single();

  if (agenciaError || !agencia) {
    console.error("ERROR CREANDO AGENCIA:", agenciaError);
    return { error: "Hubo un problema al registrar la agencia." };
  }

  // 2. Vinculamos al usuario
  const { error: userError } = await supabaseAdmin
    .from("usuarios")
    .update({ id_agencia: agencia.id_agencia })
    .eq("id_usuario", user.id);

  if (userError) {
    console.error("ERROR VINCULANDO USUARIO:", userError);
    return { error: "Hubo un problema al vincular tu perfil." };
  }

  // 3. Guardamos la URL de rastreo
  const { error: configError } = await supabaseAdmin
    .from("configuracion_rastreo")
    .insert({
      id_agencia: agencia.id_agencia,
      url_idealista: idealistaUrl, // Corregido de mi typo anterior
      activa: true,
    });

  if (configError) {
    console.error("ERROR GUARDANDO CONFIG:", configError);
    return { error: "Hubo un problema al configurar el rastreador." };
  }

  return redirect("/dashboard");
}