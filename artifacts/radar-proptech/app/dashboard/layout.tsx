import Sidebar from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let rol = "agente";

  if (user) {
    const { data: userData } = await supabase
      .from("usuarios")
      .select("rol")
      .eq("id_usuario", user.id)
      .single();

    if (userData) rol = userData.rol;
  }

  return (
    <div className="h-screen w-full flex bg-kavox-surface overflow-hidden">
      <Sidebar rol={rol} />
      {/* ALERTA: Cambiamos overflow-hidden por overflow-y-auto */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}