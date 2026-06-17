import Link from "next/link";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      <header className="h-20 shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center z-50">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="font-heading font-bold text-2xl tracking-[0.15em] text-slate-900 flex items-center">
            KAVO<span className="text-kavox-accent">X</span>
          </Link>
        </div>
      </header>

      {/* ALERTA: overflow-x-hidden mata el scroll fantasma, overflow-y-auto permite leer en móvil */}
      <main className="flex-1 min-h-0 flex flex-col overflow-y-auto overflow-x-hidden">
        {children}
      </main>

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