// artifacts/radar-proptech/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { signOut } from "@/app/(auth)/actions/login";

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type SidebarProps = {
  navLinks: NavLink[];
};

export default function Sidebar({ navLinks }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-16 hover:w-64 transition-all duration-300 ease-in-out bg-slate-900 text-white flex flex-col group relative z-50 h-screen border-r border-slate-800 shrink-0">

      {/* CABECERA / LOGO */}
      <div className="h-16 flex items-center justify-center group-hover:justify-start px-5 border-b border-slate-800 overflow-hidden shrink-0">
        <span className="text-xl font-bold tracking-tight text-kavox-accent group-hover:hidden">K</span>
        <span className="text-lg font-bold tracking-tight hidden group-hover:block whitespace-nowrap">Radar PropTech</span>
      </div>

      {/* NAVEGACIÓN */}
      <nav className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-hidden">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 px-2.5 py-2.5 rounded-lg transition-colors ${
                isActive ? 'bg-kavox-accent text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* BOTÓN SALIR */}
      <div className="p-3 border-t border-slate-800 overflow-hidden shrink-0">
        <form action={signOut}>
          <button className="flex items-center gap-4 w-full px-2.5 py-2.5 rounded-lg text-red-400 hover:bg-red-900/30 hover:text-white transition-colors">
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Cerrar Sesión
            </span>
          </button>
        </form>
      </div>
    </aside>
  );
}