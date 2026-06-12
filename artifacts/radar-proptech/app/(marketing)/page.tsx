// artifacts/radar-proptech/app/(marketing)/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, SignalHigh } from "lucide-react";
import { subscribeEmail } from "./actions/subscribe";
import { CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  // SSR FIX: Evitamos que Next.js se congele al intentar renderizar fechas en servidor vs cliente.
  const [time, setTime] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await subscribeEmail(formData);
    setIsSuccess(true);
    setIsSubmitting(false);
  };

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Separamos horas y minutos para poder centrar los dos puntos (:)
  const hours = time ? time.getHours().toString().padStart(2, '0') : "09";
  const minutes = time ? time.getMinutes().toString().padStart(2, '0') : "41";
  const dateStr = time ? time.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }) : "martes, 24 de octubre";

  return (
    // AÑADIDO: overflow-hidden para matar el scroll fantasma
    <div className="w-full h-full flex items-center overflow-hidden">
      <section className="w-full max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center py-10 lg:py-0">

        {/* COLUMNA IZQUIERDA: Copy */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kavox-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-kavox-accent"></span>
            </span>
            Beta Privada: 50 Plazas
          </div>

          <h1 className="font-heading font-bold text-5xl lg:text-6xl text-slate-900 leading-[1.05] tracking-tight mb-6">
            Cierra más exclusivas llegando antes que tu competencia.
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed max-w-lg mb-10">
            El primero que llama, se lleva el cliente.<br />
            Deja de perder captaciones por llegar horas tarde.<br />
            KAVOX intercepta los anuncios de particulares al momento en el que son publicados y te avisa al móvil. Mientras otros actualizan Idealista, tú ya estás al teléfono.
          </p>

          {/* NUEVO FORMULARIO DE CAPTACIÓN INLINE */}
          <div className="w-full max-w-md">
            {isSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in zoom-in duration-500">
                <CheckCircle2 className="w-5 h-5 text-kavox-success shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-green-900">¡Casi listo!</h3>
                  <p className="text-sm text-green-800 mt-1 leading-relaxed">
                    Revisa tu bandeja de entrada (y la carpeta de spam). Haz clic en el enlace que te acabamos de enviar para confirmar tu acceso.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative flex items-center w-full shadow-xl rounded-xl overflow-hidden group focus-within:ring-2 focus-within:ring-kavox-accent transition-all">
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="tu@correo.com" 
                  className="w-full py-4 pl-5 pr-[140px] text-slate-900 outline-none text-sm font-medium placeholder:text-gray-400"
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-1.5 top-1.5 bottom-1.5 bg-slate-900 hover:bg-black text-white px-6 rounded-lg text-sm font-bold tracking-wide transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isSubmitting ? "Enviando..." : "Unirme"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Réplica iOS Figma */}
        <div className="w-full flex flex-col items-center justify-center animate-in fade-in duration-1000 delay-300 lg:translate-y-[25px]">

          {/* ========================================================= */}
          {/* CONTROLES DE TAMAÑO (Cambia estos números para probar)    */}
          {/* ========================================================= */}
          <div 
            className="w-full flex justify-center origin-center max-lg:[transform:scale(var(--scale-mobile))] lg:[transform:scale(var(--scale-pc))]"
            style={{ 
              "--scale-mobile": "0.85", /* Tamaño en MÓVIL */
              "--scale-pc": "0.75"      /* Tamaño en ORDENADOR */
            } as React.CSSProperties}
          >
            {/* Wrapper sin el efecto hover:-translate-y-4 */}
            <div className="relative z-10 transition-transform duration-700">

              {/* CHASSIS DEL IPHONE */}
              <div className="relative w-[320px] h-[690px] bg-black rounded-[3.5rem] p-[4px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border-[2px] border-gray-700/50 ring-4 ring-slate-900 antialiased [transform:translateZ(0)] backface-hidden" style={{ fontFamily: 'var(--font-inter), sans-serif', WebkitFontSmoothing: 'antialiased' }}>

                {/* PANTALLA CONTENEDORA */}
                <div className="w-full h-full bg-[#111] rounded-[3rem] overflow-hidden relative isolate">

                  {/* DYNAMIC ISLAND (z-50: Nunca se desenfoca) */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[100px] h-[30px] bg-black rounded-full z-50 flex items-center justify-between px-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#06092E] border-[1.5px] border-[#1C1932] shadow-inner relative">
                        <div className="absolute top-[2px] left-[3px] w-[2px] h-[2px] bg-[#686D95] rounded-full blur-[1px]"></div>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10 shadow-inner"></div>
                  </div>

                  {/* STATUS BAR iOS (z-30: Queda por debajo del desenfoque) */}
                  <div className="absolute top-0 inset-x-0 h-14 px-6 flex justify-between items-center text-white z-30">
                    <span className="text-[14px] font-semibold tracking-tight">
                      {time ? `${hours}:${minutes}` : "09:41"}
                    </span>

                    <div className="flex items-center gap-1.5 opacity-90 mt-0.5">

                      {/* Señal Movil iOS */}
                      <div className="flex items-end gap-[1.5px] h-3">
                        <div className="w-[2.5px] h-[4px] bg-white rounded-sm"></div>
                        <div className="w-[2.5px] h-[6px] bg-white rounded-sm"></div>
                        <div className="w-[2.5px] h-[8px] bg-white rounded-sm"></div>
                        <div className="w-[2.5px] h-[10px] bg-white rounded-sm"></div>
                      </div>

                      {/* 5G Centrado */}
                      <span className="text-[11px] font-bold leading-none translate-y-[1px]">5G</span>

                      {/* Batería iOS */}
                      <div className="flex items-center ml-0.5">
                        <div className="relative w-[24px] h-[12px] border-[1px] border-white/40 rounded-[3px] p-[1.5px] flex items-center">
                          <div className="w-[85%] h-full bg-white rounded-[1.5px]"></div>
                        </div>
                        <div className="w-[1.5px] h-[4px] bg-white/40 rounded-r-sm ml-[1px]"></div>
                      </div>
                    </div>
                  </div>

                  {/* FONDO DE PANTALLA: Degradado Oscuro */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#4A4A4A] to-[#0A0A0A]"></div>

                  {/* RELOJ Y BOTONES (z-20: Queda por debajo del desenfoque) */}
                  <div className="absolute inset-0 z-20 animate-lock-fade origin-center">
                    <div className="absolute top-20 inset-x-0 flex flex-col items-center text-white">
                      <span className="text-[13px] font-medium tracking-wide capitalize opacity-100">
                        {time ? dateStr : "martes, 24 de octubre"}
                      </span>
                      {/* Reloj con ":" centrado matemáticamente */}
                      <span className="text-[80px] font-medium tracking-tight text-white flex items-center justify-center" style={{ lineHeight: "1.1" }}>
                        {hours}<span className="relative -top-[6px] mx-[2px]">:</span>{minutes}
                      </span>
                    </div>

                    {/* Botones inferiores LINTERNA Y CÁMARA (Figma) */}
                    <div className="absolute bottom-12 inset-x-9 flex justify-between text-white">
                      <div className="w-[48.4px] h-[48.4px] rounded-full bg-[rgba(255,255,255,0.10)] backdrop-blur-[35.2px] flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M7 2h10v3l-3 4v11a2 2 0 01-2 2h-4a2 2 0 01-2-2v-11l-3-4v-3z"/></svg>
                      </div>
                      <div className="w-[48.4px] h-[48.4px] rounded-full bg-[rgba(255,255,255,0.10)] backdrop-blur-[35.2px] flex items-center justify-center">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h3l1-2h8l1 2h3a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2zm8 11a5 5 0 100-10 5 5 0 000 10z"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* BACKGROUND DIM (z-40: Desenfoca todo lo de abajo, pero no la isla ni la noti) */}
                  <div className="absolute inset-0 bg-black/15 backdrop-blur-[15px] z-40 animate-bg-dim pointer-events-none"></div>

                  {/* =========================================
                      LA NOTIFICACIÓN EN LA PARTE INFERIOR (z-50)
                      ========================================= */}
                  <div className="absolute bottom-[120px] left-3 right-3 z-50 animate-notify-enter">

                    {/* Contenedor Físico (Añadido textRendering y translateZ para forzar nitidez) */}
                    <div 
                      className="w-full overflow-hidden flex flex-col animate-notify-expand shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-white/10 rounded-[22px] origin-bottom relative antialiased [transform:translateZ(0)] backface-hidden"
                      style={{ textRendering: 'optimizeLegibility' }}
                    >

                      {/* --- VISTA 1: COLAPSADA --- */}
                      <div className="absolute inset-0 p-3 flex items-center gap-3 animate-content-fade-out antialiased [transform:translateZ(0)] backface-hidden">
                        <img src="/icon.png" alt="KAVOX" className="w-9 h-9 rounded-lg object-cover shadow-sm bg-white border border-gray-200" />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[13px] font-bold text-black tracking-wide">KAVOX</span>
                            <span className="text-[12px] text-gray-500 font-medium">ahora</span>
                          </div>
                          <p className="text-[14px] font-medium text-black leading-tight mt-0.5">NUEVO LEAD en Madrid</p>
                        </div>
                      </div>

                      {/* --- VISTA 2: EXPANDIDA (Texto Natural) --- */}
                      <div className="absolute inset-0 p-4 flex flex-col animate-content-fade-in text-black antialiased [transform:translateZ(0)] backface-hidden">

                        <div className="flex items-center gap-2 mb-2">
                          <img src="/icon.png" alt="KAVOX" className="w-6 h-6 rounded border border-gray-200 shadow-sm" />
                          <span className="text-[12px] font-bold uppercase tracking-widest text-gray-500">Alerta Radar</span>
                        </div>

                        {/* Texto Natural y Creíble */}
                        <div className="flex-1 mt-1">
                          <p className="text-[14px] text-black leading-relaxed">
                            <strong>Zona:</strong> Madrid Centro<br/>
                            <strong>Inmueble:</strong> Ático exterior reformado<br/>
                            <strong>Tamaño:</strong> 120 m² - 3 Hab. / 2 Baños<br/>
                            <strong>Precio:</strong> 650.000 €
                          </p>
                        </div>

                        {/* CTA LLAMAR */}
                        <button className="w-full bg-[#008799] text-white py-3.5 rounded-[14px] font-bold mt-auto text-[15px] tracking-wide active:scale-95 transition-transform flex items-center justify-center">
                          LLAMAR
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Home Indicator iOS */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[100px] h-[5px] bg-white rounded-full z-50"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-kavox-accent font-bold text-[11px] tracking-widest uppercase opacity-80 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kavox-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-kavox-accent"></span>
            </span>
            Simulación iOS en Tiempo Real
          </div>
        </div>

      </section>
    </div>
  );
}