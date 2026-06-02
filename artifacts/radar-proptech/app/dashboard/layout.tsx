// artifacts/radar-proptech/app/dashboard/layout.tsx
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
      {/* Pasamos únicamente el rol de forma segura */}
      <Sidebar rol={rol} />
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}