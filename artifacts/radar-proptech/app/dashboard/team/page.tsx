import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import TeamManager from "./TeamManager";

export default async function TeamRouter() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  // Obtener datos del usuario logueado
  const { data: adminData } = await supabase
    .from("usuarios")
    .select("id_agencia, rol")
    .eq("id_usuario", user.id)
    .single();

  // Expulsar si no es admin ni dios
  if (!adminData || (adminData.rol !== "admin" && adminData.rol !== "dios")) {
    return redirect("/dashboard"); 
  }

  // ⚠️ LA LLAVE MAESTRA: Usamos el cliente Admin para poder leer las filas de todo el equipo
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Obtener todos los usuarios de esa misma agencia saltándonos el RLS de lectura
  const { data: teamMembers } = await supabaseAdmin
    .from("usuarios")
    .select("id_usuario, rol")
    .eq("id_agencia", adminData.id_agencia);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gestión de Equipo</h1>
        <p className="text-gray-500 mt-1">Añade a tus agentes comerciales para que puedan acceder y trabajar los leads de Idealista.</p>
      </div>

      <TeamManager teamMembers={teamMembers || []} currentUserId={user.id} />
    </div>
  );
}