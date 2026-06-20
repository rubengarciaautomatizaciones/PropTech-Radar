// artifacts/radar-proptech/components/Sidebar.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Settings, CreditCard, User, LogOut, LifeBuoy, X, Send } from "lucide-react";
import { signOut } from "@/app/(auth)/actions/login";
import { sendSupportTicket } from "@/app/dashboard/support-actions";

export default function Sidebar({ rol }: { rol: string }) {
  const pathname = usePathname();

  // Estado para el Modal de Soporte
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [supportMsg, setSupportMsg] = useState<{ text: string, type: "error" | "success" } | null>(null);

  const navLinks = [
    { href: "/dashboard", label: "Panel Principal", icon: LayoutDashboard },
    { href: "/dashboard/profile", label: "Mi Perfil", icon: User },
    ...(rol === 'admin' || rol === 'dios' ? [
      { href: "/dashboard/team",      label: "Equipo",          icon: Users },
      { href: "/dashboard/config",    label: "Configuración",   icon: Settings },
      { href: "/dashboard/billing",   label: "Facturación",     icon: CreditCard },
    ] : [])
  ];

  const handleSupportSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSupportMsg(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await sendSupportTicket(formData);
      if (result.error) {
        setSupportMsg({ text: result.error, type: "error" });
      } else if (result.success) {
        setSupportMsg({ text: result.success, type: "success" });
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setIsSupportOpen(false), 2000);
      }
    });
  };

  return (
    <>
      <aside className="w-16 hover:w-64 transition-all duration-300 ease-in-out bg-slate-900 text-white flex flex-col group relative z-40 h-screen border-r border-slate-800 shrink-0">

        {/* CABECERA / LOGO */}
        <div className="h-16 flex items-center justify-center group-hover:justify-start px-5 border-b border-slate-800 overflow-hidden shrink-0">
          {/* Icono cuando la barra está cerrada */}
          <img src="/icon.png" alt="KAVOX" className="w-8 h-8 object-contain group-hover:hidden rounded-md" />

          {/* Icono + Texto cuando la barra se expande */}
          <div className="hidden group-hover:flex items-center gap-3">
            <img src="/icon.png" alt="KAVOX" className="w-7 h-7 object-contain rounded-md" />
            <span className="text-lg font-bold tracking-tight whitespace-nowrap">KAVOX</span>
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto overflow-x-hidden no-scrollbar">
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

        {/* BOTONES INFERIORES */}
        <div className="p-3 border-t border-slate-800 flex flex-col gap-2 overflow-hidden shrink-0">

          {/* BOTÓN SOPORTE */}
          <button 
            onClick={() => setIsSupportOpen(true)}
            className="flex items-center gap-4 w-full px-2.5 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LifeBuoy className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Soporte KAVOX
            </span>
          </button>

          {/* BOTÓN SALIR */}
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

      {/* MODAL DE SOPORTE */}
      {isSupportOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative flex flex-col p-6 animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsSupportOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-slate-800">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2 text-slate-900">
              <LifeBuoy className="w-6 h-6 text-kavox-accent" />
              <h2 className="text-xl font-bold">Contactar Soporte</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">Describe tu problema o duda. El equipo técnico te responderá por correo electrónico.</p>

            {supportMsg && (
              <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${supportMsg.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                {supportMsg.text}
              </div>
            )}

            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                <input 
                  type="text" 
                  name="subject"
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-kavox-accent text-slate-900" 
                  placeholder="Ej: Problema con un radar" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea 
                  name="message"
                  required
                  rows={4}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-kavox-accent resize-none text-slate-900" 
                  placeholder="Explica detalladamente lo que necesitas..." 
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isPending}
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-black transition-colors disabled:opacity-60 flex justify-center items-center gap-2 mt-2"
              >
                {isPending ? "Enviando..." : <><Send className="w-4 h-4" /> Enviar Mensaje</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}