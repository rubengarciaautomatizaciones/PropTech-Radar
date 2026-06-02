// artifacts/radar-proptech/app/dashboard/layout.tsx
import { LayoutDashboard, Users, Settings, CreditCard, User } from "lucide-react";
import Sidebar, { type NavLink } from "@/components/Sidebar";
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

  const navLinks: NavLink[] = [
    { href: "/dashboard", label: "Panel Principal", icon: LayoutDashboard },
    { href: "/dashboard/profile", label: "Mi Perfil", icon: User },
    ...(rol === 'admin' || rol === 'dios' ? [
      { href: "/dashboard/team",      label: "Equipo",          icon: Users },
      { href: "/dashboard/config",    label: "Configuración",   icon: Settings },
      { href: "/dashboard/billing",   label: "Facturación",     icon: CreditCard },
    ] : [])
  ];

  return (
    <div className="h-screen w-full flex bg-kavox-surface overflow-hidden">
      <Sidebar navLinks={navLinks} />
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}