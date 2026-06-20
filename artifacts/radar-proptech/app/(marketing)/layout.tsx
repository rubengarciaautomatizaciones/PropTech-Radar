// artifacts/radar-proptech/app/(marketing)/layout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "El Problema", href: "#problema" },
    { name: "Infraestructura", href: "#infraestructura" },
    { name: "Precios", href: "#precios" },
    { name: "FAQ", href: "#faq" },
  ];

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    e.preventDefault();
    setIsOpen(false); // Cierra el menú móvil si está abierto
    const targetId = href.replace(/.*\#/, "");
    const elem = document.getElementById(targetId);
    if (elem) {
      // Ajustamos el scroll para que la navbar sticky no tape el título
      const offset = 80; // Altura de la navbar
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans text-slate-900">
      {/* Inyectamos smooth scroll globalmente */}
      <style jsx global>{`
        html { scroll-behavior: smooth; }
      `}</style>

      {/* NAVBAR STICKY */}
      <header className="sticky top-0 h-20 shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center z-50">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="font-heading font-bold text-2xl tracking-[0.15em] text-slate-900 flex items-center z-50">
            <span className="text-kavox-accent">K</span>AVOX
          </Link>

          {/* ENLACES PC (Ocultos en móvil) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={(e) => handleScroll(e, link.href)}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* BOTONES PC (Ocultos en móvil) */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/signup" 
              className="bg-kavox-accent hover:bg-teal-700 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              Empezar Gratis
            </Link>
          </div>

          {/* MENÚ HAMBURGUESA (Solo en móvil) */}
          <div className="md:hidden flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button className="p-2 -mr-2 text-slate-600 hover:text-slate-900 transition-colors">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white border-l border-gray-100 p-6 flex flex-col">
                <SheetTitle className="sr-only">Menú de navegación</SheetTitle>

                <div className="flex flex-col gap-6 mt-12">
                  {navLinks.map((link) => (
                    <a 
                      key={link.name} 
                      href={link.href} 
                      onClick={(e) => handleScroll(e, link.href)}
                      className="text-lg font-bold text-slate-700 hover:text-kavox-accent transition-colors"
                    >
                      {link.name}
                    </a>
                  ))}
                </div>

                <div className="mt-auto flex flex-col gap-4 pb-8">
                  <Link 
                    href="/login" 
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-3 text-sm font-bold text-slate-600 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    href="/signup" 
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-3 text-sm font-bold text-white bg-kavox-accent rounded-xl shadow-md"
                  >
                    Empezar Gratis
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="h-16 shrink-0 border-t border-gray-200 bg-white flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium">
          <p className="tracking-wide">KAVOX © {new Date().getFullYear()}. Infraestructura B2B para Real Estate.</p>
          <div className="flex gap-6 mt-2 sm:mt-0">
            <Link href="/legal/terminos" className="hover:text-slate-900 transition-colors">Términos</Link>
            <Link href="/legal/privacidad" className="hover:text-slate-900 transition-colors">Privacidad</Link>
            <a href="mailto:info@kavox.tech" className="hover:text-slate-900 transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}