// artifacts/radar-proptech/app/dashboard/team/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers"; // Para sacar el dominio dinámico

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

  // Obtenemos el nombre de la empresa para ponerlo en el correo
  const { data: agencyData } = await supabaseAdmin
    .from("agencias")
    .select("nombre_empresa")
    .eq("id_agencia", adminData.id_agencia)
    .single();

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true, 
  });

  if (authError) return { error: `Error: ${authError.message}` };

  const { error: dbError } = await supabaseAdmin.from("usuarios").update({
    id_agencia: adminData.id_agencia,
    rol: "agente",
    nombre: name
  }).eq("id_usuario", authUser.user.id);

  if (dbError) return { error: "Usuario creado, pero hubo un error al vincularlo." };

  // === ENVÍO DEL CORREO DE ONBOARDING POR RESEND ===
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const origin = (await headers()).get("origin") || "https://kavox.tech";
      const loginUrl = `${origin}/login?email=${encodeURIComponent(email)}`;
      const agencyName = agencyData?.nombre_empresa || "tu agencia";

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'KAVOX System <hola@kavox.tech>', // Modifica si es necesario
          to: email,
          subject: `Acceso concedido a KAVOX para ${agencyName}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 40px 0; margin: 0; }
                .container { max-w-[600px]; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .header { background-color: #008799; text-align: center; padding: 40px 20px; }
                .header img { max-width: 120px; height: auto; }
                .content { padding: 40px; color: #111827; }
                .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #111827; }
                .text { font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 30px; }
                .btn { display: inline-block; background-color: #111827; color: #ffffff !important; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <img src="https://res.cloudinary.com/dd9plduuc/image/upload/v1780418666/KAVOX_1_dd9xyx.png" alt="KAVOX">
                </div>
                <div class="content">
                  <div class="title">Hola, ${name}</div>
                  <div class="text">
                    El administrador de <strong>${agencyName}</strong> ha creado tu cuenta como Agente Comercial en el ecosistema KAVOX.
                    <br><br>
                    Tu correo de acceso es: <strong>${email}</strong><br>
                    <strong>La contraseña temporal te la ha enviado tu administrador por canal privado.</strong>
                  </div>
                  <div style="text-align: center; margin-bottom: 30px;">
                    <a href="${loginUrl}" class="btn">Iniciar Sesión en el CRM</a>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `
        })
      });
    } catch (e) {
      console.error("Fallo al enviar correo a nuevo agente:", e);
      // No bloqueamos el proceso aunque falle el correo
    }
  }

  revalidatePath("/dashboard/team");
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