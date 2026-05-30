import { LayoutDashboard, Users, Settings, CreditCard } from "lucide-react";
import Sidebar, { type NavLink } from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let rol = "agente"; // Por defecto, el rol más restrictivo

  if (user) {
    const { data: userData } = await supabase
      .from("usuarios")
      .select("rol")
      .eq("id_usuario", user.id)
      .single();

    if (userData) rol = userData.rol;
  }

  // Menú dinámico basado en el rol (admin y dios ven todo)
  const navLinks: NavLink[] = [
    { href: "/dashboard", label: "Panel Principal", icon: LayoutDashboard },
    ...(rol === 'admin' || rol === 'dios' ? [
      { href: "/dashboard/team",      label: "Equipo",          icon: Users },
      { href: "/dashboard/config",    label: "Configuración",   icon: Settings },
      { href: "/dashboard/billing",   label: "Facturación",     icon: CreditCard },
    ] : [])
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar navLinks={navLinks} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}