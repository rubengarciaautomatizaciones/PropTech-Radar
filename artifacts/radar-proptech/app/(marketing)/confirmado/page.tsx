// artifacts/radar-proptech/app/(marketing)/confirmado/page.tsx
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function ConfirmadoPage() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in duration-700 px-6">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-gray-100 text-center relative overflow-hidden">
        {/* Detalle visual de fondo */}
        <div className="absolute top-0 left-0 w-full h-2 bg-kavox-accent"></div>

        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-100">
          <CheckCircle2 className="w-10 h-10 text-kavox-success" />
        </div>

        <h1 className="font-heading font-bold text-3xl text-slate-900 mb-4">
          ¡Email Confirmado!
        </h1>

        <p className="text-slate-600 leading-relaxed mb-8">
          Tu plaza en la lista de espera está asegurada. Te acabamos de enviar el primer correo de la secuencia de acceso a tu bandeja de entrada.
        </p>

        <Link 
          href="/"
          className="inline-block text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}