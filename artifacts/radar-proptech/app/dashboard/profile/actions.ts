// artifacts/radar-proptech/app/dashboard/profile/actions.ts
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

// 1. Actualizar Datos de la Agencia (Solo Admin/Dios)
export async function updateAgencyProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado." };

  const agencyName = formData.get("agencyName") as string;
  const logoFile = formData.get("logoFile") as File | null;

  if (!agencyName?.trim()) return { error: "El nombre de la agencia es obligatorio." };

  const supabaseAdmin = await getAdminClient();

  const { data: userData } = await supabaseAdmin
    .from("usuarios")
    .select("id_agencia, rol")
    .eq("id_usuario", user.id)
    .single();

  if (!userData || (userData.rol !== "admin" && userData.rol !== "dios")) {
    return { error: "Solo el administrador puede modificar los datos de la agencia." };
  }

  let logoUrl = undefined;

  // Lógica de subida del logo usando Uint8Array (Seguro para Vercel)
  if (logoFile && logoFile.size > 0) {
    if (!logoFile.type.startsWith("image/")) {
      return { error: "El archivo debe ser una imagen válida." };
    }

    const bytes = new Uint8Array(await logoFile.arrayBuffer());
    const fileExt = logoFile.name.split('.').pop();
    const fileName = `${userData.id_agencia}/logo_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('logos')
      .upload(fileName, bytes, { contentType: logoFile.type, upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { error: "Error al subir el logo." };
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from('logos').getPublicUrl(fileName);
    logoUrl = publicUrlData.publicUrl;
  }

  // Actualizar tabla agencias
  const updatePayload: any = { nombre_empresa: agencyName };
  if (logoUrl) updatePayload.logo_url = logoUrl;

  const { error: updateError } = await supabaseAdmin
    .from("agencias")
    .update(updatePayload)
    .eq("id_agencia", userData.id_agencia);

  if (updateError) return { error: "Error al actualizar los datos de la agencia." };

  revalidatePath("/dashboard/profile");
  return { success: "Datos de agencia actualizados correctamente." };
}

// 2. Actualizar Credenciales del Usuario (Email y/o Contraseña)
export async function updateUserCredentials(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado." };

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const updateData: any = {};

  if (email && email !== user.email) {
    updateData.email = email;
  }

  if (password && password.trim() !== "") {
    if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres." };
    updateData.password = password;
  }

  if (Object.keys(updateData).length === 0) {
    return { error: "No se ha modificado ningún dato." };
  }

  // Supabase Auth maneja automáticamente el envío de correos si cambia el email
  const { error } = await supabase.auth.updateUser(updateData);

  if (error) {
    console.error("Auth update error:", error);
    return { error: `Error de seguridad: ${error.message}` };
  }

  let msg = "Credenciales actualizadas.";
  if (updateData.email) {
    msg += " Importante: Te hemos enviado un correo de confirmación a ambas direcciones. Debes confirmar el cambio.";
  }

  return { success: msg };
}