// artifacts/radar-proptech/app/(marketing)/pro/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Target, Zap, FileOutput, CheckCircle2, ShieldCheck, PhoneOff, Clock, Users } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function MainLandingPage() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time ? time.getHours().toString().padStart(2, '0') : "09";
  const minutes = time ? time.getMinutes().toString().padStart(2, '0') : "41";
  const dateStr = time ? time.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }) : "martes, 24 de octubre";

  return (
    <div className="w-full animate-in fade-in duration-700">

      {/* SECCIÓN 1: HERO & ANIMATED PHONE */}
      <section className="pt-12 pb-24 lg:py-24 px-6 lg:px-8 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">

        {/* Text Side */}
        <div className="flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-6 shadow-sm">
            <span className="text-kavox-accent">⚡</span> Infraestructura B2B para Real Estate
          </div>

          <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-slate-900 leading-[1.1] tracking-tight mb-6">
            El radar sub-segundo que te pone al teléfono antes que tu competencia.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg mb-10">
            Intercepta pisos de particulares en milisegundos directamente en tu Telegram. Genera una valoración en 3 clics y cierra la exclusiva antes de que el resto actualice su CRM.
          </p>

          <div className="w-full sm:w-auto flex flex-col gap-3">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto bg-kavox-accent hover:bg-teal-700 text-white font-bold tracking-wide text-base px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Iniciar prueba de 3 días <ChevronRight className="w-5 h-5" />
            </Link>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-medium text-slate-500">
              <ShieldCheck className="w-4 h-4 text-kavox-success" />
              <span>Requiere tarjeta anti-bots. Cancela en 1 clic sin coste.</span>
            </div>
          </div>
        </div>

        {/* Visual Side (CSS Phone Animation) */}
        <div className="w-full flex flex-col items-center justify-center mb-12 lg:mb-0">
          <div 
            className="w-full flex justify-center max-lg:[zoom:var(--scale-mobile)] lg:[zoom:var(--scale-pc)]"
            style={{ 
              "--scale-mobile": "0.85", 
              "--scale-pc": "0.80"      
            } as React.CSSProperties}
          >
            <div className="relative z-10 transition-transform duration-700">
              <div className="relative w-[320px] h-[690px] bg-black rounded-[3.5rem] p-[4px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border-[2px] border-gray-700/50 ring-4 ring-slate-900" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                <div className="w-full h-full bg-[#111] rounded-[3rem] overflow-hidden relative isolate">

                  {/* DYNAMIC ISLAND */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[100px] h-[30px] bg-black rounded-full z-50 flex items-center justify-between px-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#06092E] border-[1.5px] border-[#1C1932] shadow-inner relative">
                        <div className="absolute top-[2px] left-[3px] w-[2px] h-[2px] bg-[#686D95] rounded-full blur-[1px]"></div>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10 shadow-inner"></div>
                  </div>

                  {/* STATUS BAR iOS */}
                  <div className="absolute top-0 inset-x-0 h-10 lg:h-14 px-4 lg:px-6 flex justify-between items-start pt-3 lg:items-center lg:pt-0 text-white z-30">
                    <span className="text-[14px] font-semibold tracking-tight">
                      {time ? `${hours}:${minutes}` : "09:41"}
                    </span>
                    <div className="flex items-center gap-1.5 opacity-90 mt-0.5">
                      <div className="flex items-end gap-[1.5px] h-3">
                        <div className="w-[2.5px] h-[4px] bg-white rounded-sm"></div>
                        <div className="w-[2.5px] h-[6px] bg-white rounded-sm"></div>
                        <div className="w-[2.5px] h-[8px] bg-white rounded-sm"></div>
                        <div className="w-[2.5px] h-[10px] bg-white rounded-sm"></div>
                      </div>
                      <span className="text-[11px] font-bold leading-none translate-y-[1px]">5G</span>
                      <div className="flex items-center ml-0.5">
                        <div className="relative w-[24px] h-[12px] border-[1px] border-white/40 rounded-[3px] p-[1.5px] flex items-center">
                          <div className="w-[85%] h-full bg-white rounded-[1.5px]"></div>
                        </div>
                        <div className="w-[1.5px] h-[4px] bg-white/40 rounded-r-sm ml-[1px]"></div>
                      </div>
                    </div>
                  </div>

                  {/* FONDO DE PANTALLA */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#4A4A4A] to-[#0A0A0A]"></div>

                  {/* RELOJ Y BOTONES */}
                  <div className="absolute inset-0 z-20 animate-lock-fade origin-center">
                    <div className="absolute top-20 inset-x-0 flex flex-col items-center text-white">
                      <span className="text-[13px] font-medium tracking-wide capitalize opacity-100">
                        {time ? dateStr : "martes, 24 de octubre"}
                      </span>
                      <span className="text-[80px] font-medium tracking-tight text-white flex items-center justify-center" style={{ lineHeight: "1.1" }}>
                        {hours}<span className="relative -top-[6px] mx-[2px]">:</span>{minutes}
                      </span>
                    </div>
                    <div className="absolute bottom-12 inset-x-9 flex justify-between text-white">
                      <div className="w-[48.4px] h-[48.4px] rounded-full bg-[rgba(255,255,255,0.10)] backdrop-blur-[35.2px] flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M7 2h10v3l-3 4v11a2 2 0 01-2 2h-4a2 2 0 01-2-2v-11l-3-4v-3z"/></svg>
                      </div>
                      <div className="w-[48.4px] h-[48.4px] rounded-full bg-[rgba(255,255,255,0.10)] backdrop-blur-[35.2px] flex items-center justify-center">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h3l1-2h8l1 2h3a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2zm8 11a5 5 0 100-10 5 5 0 000 10z"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* BACKGROUND DIM */}
                  <div className="absolute inset-0 bg-black/15 backdrop-blur-[15px] z-40 animate-bg-dim pointer-events-none"></div>

                  {/* NOTIFICACIÓN */}
                  <div className="absolute bottom-[135px] lg:bottom-[120px] left-3 right-3 z-50 animate-notify-enter">
                    <div className="w-full overflow-hidden flex flex-col max-lg:animate-notify-expand-mobile lg:animate-notify-expand-pc shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-white/10 rounded-[22px] origin-bottom relative">

                      {/* --- VISTA 1: COLAPSADA --- */}
                      <div className="absolute inset-0 p-2.5 lg:p-3 flex items-center gap-2 lg:gap-3 animate-content-fade-out">
                        <img src="/icon.png" alt="KAVOX" className="w-7 h-7 lg:w-9 lg:h-9 rounded-lg object-cover shadow-sm bg-white border border-gray-200" />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] lg:text-[13px] font-bold text-black tracking-wide">KAVOX</span>
                            <span className="text-[10px] lg:text-[12px] text-gray-500 font-medium">ahora</span>
                          </div>
                          <p className="text-[12px] lg:text-[14px] font-medium text-black leading-tight mt-0.5">NUEVO LEAD en Madrid</p>
                        </div>
                      </div>

                      {/* --- VISTA 2: EXPANDIDA --- */}
                      <div className="absolute inset-0 p-3 lg:p-4 flex flex-col animate-content-fade-in text-black">
                        <div className="flex items-center gap-2 mb-1 lg:mb-2">
                          <img src="/icon.png" alt="KAVOX" className="w-5 h-5 lg:w-6 lg:h-6 rounded border border-gray-200 shadow-sm" />
                          <span className="text-[10px] lg:text-[12px] font-bold uppercase tracking-widest text-gray-500">Alerta Radar</span>
                        </div>

                        <div className="flex-1 mt-0.5 lg:mt-1">
                          <p className="text-[11px] lg:text-[14px] text-black leading-relaxed">
                            <strong>Zona:</strong> Madrid Centro<br/>
                            <strong>Inmueble:</strong> Ático exterior reformado<br/>
                            <strong>Tamaño:</strong> 120 m² - 3 Hab. / 2 Baños<br/>
                            <strong>Precio:</strong> 650.000 €
                          </p>
                        </div>

                        <button className="w-full bg-[#008799] text-white py-2 lg:py-3.5 rounded-[10px] lg:rounded-[14px] font-bold mt-auto text-[13px] lg:text-[15px] tracking-wide active:scale-95 transition-transform flex items-center justify-center">
                          LLAMAR
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Home Indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[100px] h-[5px] bg-white rounded-full z-50"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* SECCIÓN 2: EL PROBLEMA (AGITACIÓN) */}
      <section id="problema" className="py-24 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-8">
            Refrescar portales a mano es de la década pasada.
          </h2>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-12">
            Los escudos anti-bot bloquean a tu equipo. Los CRMs tradicionales te avisan horas tarde. Cuando tú llamas, el propietario ya ha hablado con 5 agencias y no quiere escucharte. <strong className="text-white">El juego ha cambiado.</strong>
          </p>

          <div className="grid sm:grid-cols-3 gap-8 text-left">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <PhoneOff className="w-8 h-8 text-red-400 mb-4" />
              <h3 className="font-bold text-lg mb-2">Propietarios Quemados</h3>
              <p className="text-sm text-slate-400">Llamar el sexto significa comerte el enfado del particular que ya no quiere agencias.</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <Clock className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="font-bold text-lg mb-2">Alertas Lentas</h3>
              <p className="text-sm text-slate-400">Tu CRM actual depende de correos o integraciones lentas que tardan horas en avisarte.</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <Users className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="font-bold text-lg mb-2">Competencia Feroz</h3>
              <p className="text-sm text-slate-400">Mientras tú buscas, otra agencia de tu zona ya está de camino a firmar la exclusiva.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: MANIFIESTO (VENTAJAS INJUSTAS) */}
      <section id="infraestructura" className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-slate-900 mb-4">
              Infraestructura táctica, no otro CRM decorativo.
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              KAVOX no es para gestionar clientes, es para conseguirlos. Hemos construido el motor de intercepción más rápido del mercado.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-gray-100 hover:border-kavox-accent transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-kavox-accent" />
              </div>
              <h3 className="font-heading font-bold text-xl text-slate-900 mb-3">Velocidad Sub-Segundo</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Evadimos los bloqueos. Te entregamos el dato crudo antes de que los portales lo indexen en sus propias alertas y horas antes que la competencia.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-gray-100 hover:border-kavox-accent transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-kavox-accent" />
              </div>
              <h3 className="font-heading font-bold text-xl text-slate-900 mb-3">Fricción Cero en tu Bolsillo</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Nada de portales pesados ni contraseñas. El lead entra a tu Telegram de forma push. Tocas el número, llamas. Acción inmediata.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-gray-100 hover:border-kavox-accent transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <FileOutput className="w-7 h-7 text-kavox-accent" />
              </div>
              <h3 className="font-heading font-bold text-xl text-slate-900 mb-3">Autoridad en 1 Clic (CMA)</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Pasa de la puerta fría a la autoridad. Toca un botón en el radar y genera un Dossier de Valoración con testigos reales en 3 segundos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: CÓMO FUNCIONA */}
      <section className="py-24 bg-slate-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-slate-900 mb-16 text-center">
            Tres pasos para monopolizar tu zona.
          </h2>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Línea conectora (Solo PC) */}
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-0.5 bg-gray-200 z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white border-4 border-kavox-accent text-kavox-accent rounded-full flex items-center justify-center font-bold text-2xl mb-6 shadow-md">1</div>
              <h3 className="font-bold text-xl text-slate-900 mb-3">Fija tu objetivo</h3>
              <p className="text-slate-600 text-sm">Pega la URL exacta de la zona que quieres dominar en tu panel de control.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white border-4 border-kavox-accent text-kavox-accent rounded-full flex items-center justify-center font-bold text-2xl mb-6 shadow-md">2</div>
              <h3 className="font-bold text-xl text-slate-900 mb-3">Intercepción</h3>
              <p className="text-slate-600 text-sm">Nuestro sistema escanea 24/7. Recibes la alerta en Telegram al milisegundo.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-kavox-accent border-4 border-kavox-accent text-white rounded-full flex items-center justify-center font-bold text-2xl mb-6 shadow-md">3</div>
              <h3 className="font-bold text-xl text-slate-900 mb-3">Dispara</h3>
              <p className="text-slate-600 text-sm">Llama al propietario antes de que su teléfono empiece a comunicar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 5: PRICING */}
      <section id="precios" className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-slate-900 mb-4">La Matemática del Retorno</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Perder un piso por llegar 10 minutos tarde te cuesta 10.000€ en honorarios. KAVOX te cuesta menos de 7€ al día.
          </p>
        </div>

        <div className="bg-slate-900 text-white rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-kavox-accent rounded-full blur-[100px] opacity-30 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
            <div className="flex-1 w-full">
              <h3 className="text-2xl font-bold mb-2">Licencia Operativa</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-6xl font-heading font-bold">199€</span>
                <span className="text-slate-400 font-medium">/ mes por radar</span>
              </div>

              <ul className="space-y-4 mb-8">
                {['Trial de 3 días a coste cero.', 'Alertas instantáneas vía Telegram.', 'Generador de PDF CMA ilimitado.', 'Usuarios de equipo ilimitados.'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-kavox-accent shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full md:w-auto shrink-0">
              <Link 
                href="/signup" 
                className="w-full block text-center bg-kavox-accent text-white font-bold text-lg px-8 py-4 rounded-xl transition-all hover:bg-teal-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Activar Infraestructura
              </Link>
              <p className="text-center text-xs text-slate-400 mt-4">Cancelación instantánea desde tu panel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 6: FAQ */}
      <section id="faq" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-10 text-center">Preguntas Logísticas</h2>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b border-gray-100 py-2">
              <AccordionTrigger className="text-left font-bold text-slate-900 hover:text-kavox-accent hover:no-underline">
                ¿Me vais a cobrar de inmediato?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed pt-2 pb-4">
                No. Tienes 72 horas operativas a coste cero para cazar tu primera exclusiva. Tras ese periodo, Stripe procesará el pago automáticamente. Puedes cancelar en 1 clic antes de que eso ocurra desde tu panel de facturación.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-b border-gray-100 py-2">
              <AccordionTrigger className="text-left font-bold text-slate-900 hover:text-kavox-accent hover:no-underline">
                ¿Tengo exclusividad en mi zona?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed pt-2 pb-4">
                La tecnología rastrea sin límites geográficos. La exclusividad te la da tu velocidad. Quien coja el teléfono y llame más rápido cuando suene Telegram, se lleva el piso.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-b border-gray-100 py-2">
              <AccordionTrigger className="text-left font-bold text-slate-900 hover:text-kavox-accent hover:no-underline">
                ¿Cómo funciona el cobro por "Radar"?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed pt-2 pb-4">
                Un radar equivale a una URL de búsqueda configurada (Ej: "Pisos en el Barrio Salamanca"). Cuesta 199€/mes. Si quieres rastrear simultáneamente otra zona distinta, puedes añadir un segundo radar desde tu panel y se prorrateará automáticamente en tu factura.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* SECCIÓN 7: BOTTOM CTA */}
      <section className="py-24 bg-kavox-accent text-white text-center px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading font-bold text-4xl sm:text-5xl mb-6">Tu competencia ya está llamando.</h2>
          <p className="text-teal-100 text-lg mb-10 max-w-xl mx-auto">No dejes que se lleven la próxima exclusiva de tu zona por llegar 10 minutos tarde.</p>
          <Link 
            href="/signup" 
            className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-bold text-lg px-10 py-5 rounded-xl transition-all hover:bg-gray-50 shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            Encender mi primer radar <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}