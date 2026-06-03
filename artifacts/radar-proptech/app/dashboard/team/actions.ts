// artifacts/radar-proptech/app/dashboard/team/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers"; 

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

  // === ENVÍO DEL CORREO DE ONBOARDING POR RESEND (HTML INDESTRUCTIBLE) ===
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://kavox.tech";
      const loginUrl = `${origin}/login?email=${encodeURIComponent(email)}`;
      const agencyName = agencyData?.nombre_empresa || "tu agencia";

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
        </head>
        <body style="background-color: #f3f4f6; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                  <tr>
                    <td style="background-color: #008799; padding: 35px; text-align: center;">
                      <h1 style="color: #ffffff; font-family: 'Space Grotesk', Helvetica, Arial, sans-serif; font-size: 32px; margin: 0; letter-spacing: 2px;">KAVOX</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                      <h2 style="font-size: 22px; color: #111827; margin-top: 0; margin-bottom: 20px;">Hola, ${name}</h2>
                      <p style="margin-bottom: 20px;">El administrador de <strong>${agencyName}</strong> ha creado tu cuenta como Agente Comercial en el ecosistema KAVOX.</p>
                      <p style="margin-bottom: 30px; padding: 15px; background-color: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">
                        Tu correo de acceso es: <strong>${email}</strong><br>
                        <strong>La contraseña te la ha enviado tu administrador por canal privado.</strong>
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center">
                            <a href="${loginUrl}" style="background-color: #111827; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Iniciar Sesión en el CRM</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 30px 30px; text-align: center; color: #9ca3af; font-size: 13px; border-top: 1px solid #f3f4f6;">
                      © 2025 KAVOX. Tecnología de interceptación B2B para Real Estate.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'KAVOX System <hola@kavox.tech>',
          to: email,
          subject: `Acceso concedido a KAVOX para ${agencyName}`,
          html: htmlContent
        })
      });
    } catch (e) {
      console.error("Fallo al enviar correo a nuevo agente:", e);
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