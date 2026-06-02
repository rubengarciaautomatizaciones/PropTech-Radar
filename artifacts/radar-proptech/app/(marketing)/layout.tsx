// artifacts/radar-proptech/app/(marketing)/layout.tsx
import Link from "next/link";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-kavox-bg">
      {/* Navbar Minimalista */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* Logo KAVOX Wordmark */}
          <Link href="/" className="font-heading font-semibold text-2xl tracking-[0.2em] text-kavox-body flex items-center">
            KAVO<span className="text-kavox-accent">X</span>
          </Link>

          {/* Ocultamos Pricing/Signup por la fase Waitlist. Solo Login para usuarios existentes */}
          <Link 
            href="/login" 
            className="text-sm font-medium text-kavox-muted hover:text-kavox-body transition-colors"
          >
            Acceso Clientes
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      {/* Footer Aséptico */}
      <footer className="border-t border-gray-100 py-10 mt-20">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-sm text-kavox-muted">
          <p>KAVOX. Tecnología de interceptación B2B para Real Estate.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/legal/terminos" className="hover:text-kavox-body">Términos y Condiciones</Link>
            <Link href="/legal/privacidad" className="hover:text-kavox-body">Política de Privacidad</Link>
            <a href="mailto:info@kavox.tech" className="hover:text-kavox-body">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}