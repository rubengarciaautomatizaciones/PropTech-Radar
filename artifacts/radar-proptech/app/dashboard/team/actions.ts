"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

async function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function addAgent(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password || password.length < 6) {
    return { error: "Proporciona un email válido y una contraseña de al menos 6 caracteres." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado." };

  const supabaseAdmin = await getAdminClient();

  // 1. Verificar que el que intenta hacer esto es un ADMIN
  const { data: adminData } = await supabaseAdmin
    .from("usuarios")
    .select("id_agencia, rol")
    .eq("id_usuario", user.id)
    .single();

  if (!adminData || adminData.rol !== "admin") {
    return { error: "Solo los administradores pueden añadir equipo." };
  }

  // 2. Crear el usuario en Supabase Auth directamente (sin confirmar email)
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true, // Auto-confirmado para que puedan entrar al instante
  });

  if (authError) {
    console.error("Error Auth:", authError);
    return { error: "No se pudo crear el usuario. Asegúrate de que el email no esté ya registrado." };
  }

  // 3. Vincularlo a la agencia con rol de AGENTE
  const { error: dbError } = await supabaseAdmin.from("usuarios").update({
    id_agencia: adminData.id_agencia,
    rol: "agente"
  }).eq("id_usuario", authUser.user.id);

  if (dbError) {
    console.error("Error DB:", dbError);
    return { error: "Usuario creado, pero hubo un error al vincularlo a la agencia." };
  }

  revalidatePath("/dashboard/team");
  return { success: "¡Agente añadido correctamente!" };
}


export async function removeAgent(agentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado." };

  const supabaseAdmin = await getAdminClient();

  // Verificación de seguridad
  const { data: adminData } = await supabaseAdmin.from("usuarios").select("id_agencia, rol").eq("id_usuario", user.id).single();
  if (!adminData || adminData.rol !== "admin") return { error: "No autorizado." };
  if (user.id === agentId) return { error: "No puedes eliminarte a ti mismo." };

  // Eliminar al agente del sistema de autenticación de Supabase (esto borra también sus datos por cascada si está configurado)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(agentId);

  if (error) {
    return { error: "Error al eliminar el agente." };
  }

  revalidatePath("/dashboard/team");
  return { success: "Agente eliminado del sistema." };
}