// artifacts/radar-proptech/app/(marketing)/page.tsx
"use client";

import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="w-full h-full flex items-center">
      <section className="w-full max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center py-10 lg:py-0">

        {/* COLUMNA IZQUIERDA: Copy de Francotirador */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left animate-in fade-in slide-in-from-bottom-8 duration-700">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kavox-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-kavox-accent"></span>
            </span>
            Beta Privada: 50 Plazas
          </div>

          <h1 className="font-heading font-bold text-5xl lg:text-6xl text-slate-900 leading-[1.05] tracking-tight mb-6">
            El radar sub-segundo que te hace llegar el primero.
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed max-w-lg mb-10">
            Mientras actualizas los portales a mano, otro agente ya está llamando a tu exclusiva. KAVOX burla los antibots y te envía los particulares a Telegram en milisegundos. Sin fricción. Abres, llamas, captas.
          </p>

          <Link 
            href="/waitlistform"
            className="bg-slate-900 hover:bg-black text-white font-heading font-bold uppercase tracking-widest text-sm px-10 py-5 rounded-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-3 group"
          >
            Solicitar Admisión a la Beta 
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Huevo de pascua tuyo temporal */}
          <Link href="/pro" className="mt-8 text-[10px] text-gray-300 hover:text-gray-400">Ver versión PLG (/pro)</Link>
        </div>

        {/* COLUMNA DERECHA: Placeholder de la Animación */}
        <div className="w-full flex flex-col items-center justify-center animate-in fade-in duration-1000 delay-300">

          {/* Marco del móvil/vídeo */}
          <div className="relative w-full max-w-md aspect-[9/16] max-h-[60vh] bg-slate-100 border-2 border-dashed border-slate-300 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center group">
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-slate-400 translate-x-0.5" />
            </div>
            <h3 className="font-bold text-slate-500 uppercase tracking-widest text-xs mb-2">Espacio Reservado</h3>
            <p className="text-slate-400 text-sm">Próximamente: Mega animación en bucle del dispositivo recibiendo alertas en tiempo real.</p>
          </div>

          <Link 
            href="/waitlistform"
            className="mt-8 text-kavox-accent font-bold text-sm tracking-wider uppercase flex items-center gap-1 hover:text-teal-700 transition-colors"
          >
            Únete a la Waitlist <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </section>
    </div>
  );
}