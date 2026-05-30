import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TeamManager from "./TeamManager";

export default async function TeamRouter() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  // Obtener datos del admin
  const { data: adminData } = await supabase
    .from("usuarios")
    .select("id_agencia, rol")
    .eq("id_usuario", user.id)
    .single();

  if (!adminData || adminData.rol !== "admin") {
    return redirect("/dashboard"); // Expulsar si no es admin
  }

  // Obtener todos los usuarios de esa misma agencia
  const { data: teamMembers } = await supabase
    .from("usuarios")
    .select("id_usuario, rol")
    .eq("id_agencia", adminData.id_agencia);

  // Vamos a buscar los emails de estos usuarios (usualmente guardados en Supabase o los sacaremos vía auth si fuera necesario, pero mostraremos IDs o roles de momento de forma segura)

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