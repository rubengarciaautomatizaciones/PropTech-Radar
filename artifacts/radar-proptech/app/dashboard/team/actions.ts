// artifacts/radar-proptech/app/dashboard/team/actions.ts
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

// 1. AÑADIR AGENTE
export async function addAgent(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password || password.length < 6) {
    return { error: "Proporciona nombre, email válido y contraseña (mínimo 6 caracteres)." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado." };

  const supabaseAdmin = await getAdminClient();

  const { data: adminData } = await supabaseAdmin
    .from("usuarios")
    .select("id_agencia, rol")
    .eq("id_usuario", user.id)
    .single();

  if (!adminData || (adminData.rol !== "admin" && adminData.rol !== "dios")) {
    return { error: "Solo los administradores pueden añadir equipo." };
  }

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true, 
  });

  if (authError) return { error: `Error: ${authError.message}` };

  // Guardamos también el nombre en la BD
  const { error: dbError } = await supabaseAdmin.from("usuarios").update({
    id_agencia: adminData.id_agencia,
    rol: "agente",
    nombre: name
  }).eq("id_usuario", authUser.user.id);

  if (dbError) return { error: "Usuario creado, pero hubo un error al vincularlo." };

  revalidatePath("/dashboard/team");
  // Devolvemos el email para construir el Magic Link en el frontend
  return { success: "¡Agente añadido correctamente!", createdEmail: email };
}

// 2. ELIMINAR AGENTE
export async function removeAgent(agentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado." };

  const supabaseAdmin = await getAdminClient();
  const { data: adminData } = await supabaseAdmin.from("usuarios").select("rol").eq("id_usuario", user.id).single();

  if (!adminData || (adminData.rol !== "admin" && adminData.rol !== "dios")) return { error: "No autorizado." };
  if (user.id === agentId) return { error: "No puedes eliminarte a ti mismo." };

  const { error } = await supabaseAdmin.auth.admin.deleteUser(agentId);
  if (error) return { error: "Error al eliminar el agente." };

  revalidatePath("/dashboard/team");
  return { success: "Agente eliminado del sistema." };
}

// 3. RESETEAR CONTRASEÑA
export async function resetAgentPassword(agentId: string, newPassword: string) {
  if (!newPassword || newPassword.length < 6) return { error: "Mínimo 6 caracteres." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado." };

  const supabaseAdmin = await getAdminClient();
  const { data: adminData } = await supabaseAdmin.from("usuarios").select("rol").eq("id_usuario", user.id).single();

  if (!adminData || (adminData.rol !== "admin" && adminData.rol !== "dios")) return { error: "No autorizado." };

  const { error } = await supabaseAdmin.auth.admin.updateUserById(agentId, { password: newPassword });

  if (error) return { error: "Error al cambiar la contraseña." };
  return { success: "Contraseña actualizada correctamente." };
}