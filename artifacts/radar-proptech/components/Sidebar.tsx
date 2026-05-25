import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type SidebarProps = {
  navLinks: NavLink[];
};

export default function Sidebar({ navLinks }: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="px-6 py-7 border-b border-slate-700">
        <span className="text-lg font-bold tracking-tight">Radar PropTech</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium"
          >
            <Icon className="w-5 h-5 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-6 py-5 border-t border-slate-700">
        <p className="text-xs text-slate-500">© 2025 Radar PropTech</p>
      </div>
    </aside>
  );
}
