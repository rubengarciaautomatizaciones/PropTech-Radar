import { LayoutDashboard, Users, Settings, CreditCard } from "lucide-react";
import Sidebar, { type NavLink } from "@/components/Sidebar";

const navLinks: NavLink[] = [
  { href: "/dashboard/dashboard", label: "Panel Principal", icon: LayoutDashboard },
  { href: "/dashboard/team",      label: "Equipo",          icon: Users },
  { href: "/dashboard/config",    label: "Configuración",   icon: Settings },
  { href: "/dashboard/billing",   label: "Facturación",     icon: CreditCard },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar navLinks={navLinks} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
