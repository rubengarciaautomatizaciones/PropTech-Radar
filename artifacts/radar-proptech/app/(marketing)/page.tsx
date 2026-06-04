// artifacts/radar-proptech/app/(marketing)/page.tsx
"use client";

import { useState, useTransition } from "react";
import { joinWaitlist } from "./actions/waitlist";
import { ChevronRight, CheckCircle2, Linkedin, Radar, Zap, Lock } from "lucide-react";
import Link from "next/link";

export default function PriestleyWaitlistLanding() {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    nombre: "", agencia: "", email: "", telefono: "", zona: "",
    q_situacion: "", q_objetivo: "", q_obstaculo: "", q_presupuesto: "", q_abierta: ""
  });

  const handleUpdate = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const nextStep = () => {
    if (step === 1 && (!formData.nombre || !formData.agencia || !formData.email || !formData.telefono || !formData.zona)) {
      setErrorMsg("Requerimos todos los datos operativos para evaluar la solicitud.");
      return;
    }
    setErrorMsg("");
    setStep(prev => prev + 1);
  };

  const submitForm = () => {
    startTransition(async () => {
      const result = await joinWaitlist(formData);
      if (result.error) { setErrorMsg(result.error); setStep(1); } 
      else setStep(7);
    });
  };

  return (
    <div className="w-full bg-[#f8fafc]"> {/* Fondo gris ultra-claro Tech Minimalist */}

      {/* ========================================== */}
      {/* SECCIÓN 0: HOOK & VALUE PROP (LA LANDING) */}
      {/* ========================================== */}
      {step === 0 && (
        <div className="animate-in fade-in duration-700">
          <section className="pt-24 pb-20 px-6 max-w-4xl mx-auto text-center flex flex-col items-center">

            {/* Badge Táctico */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-kavox-body text-xs font-bold uppercase tracking-widest mb-10 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kavox-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-kavox-accent"></span>
              </span>
              Protocolo Beta: Solo 50 Plazas Disponibles
            </div>

            {/* Titular */}
            <h1 className="font-heading font-bold text-5xl md:text-6xl text-slate-900 leading-[1.1] tracking-tight mb-8">
              Mientras actualizas Idealista a mano, otro agente ya está llamando a tu exclusiva.
            </h1>

            {/* Copy Francotirador */}
            <div className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed space-y-6">
              <p>
                Sabes lo que pasa cuando un particular sube un piso. Tarda 2 minutos en recibir 20 llamadas. Inmovilla te avisa horas tarde. Betterplace no llega a tiempo. El propietario se agobia y retira el anuncio.
              </p>
              <p className="font-semibold text-slate-800 bg-slate-100 py-2 px-4 rounded-lg inline-block">
                Acabas de perder 10.000€ de honorarios por llegar 15 minutos tarde.
              </p>
              <p>
                KAVOX es una infraestructura que burla los antibots y te mete el anuncio en tu Telegram en milisegundos. Sin iniciar sesión. Sin fricción. El móvil vibra, tienes el teléfono, llamas el primero.
              </p>
            </div>

            {/* CTA */}
            <button 
              onClick={() => setStep(1)}
              className="mt-14 bg-slate-900 hover:bg-black text-white font-heading font-bold uppercase tracking-wider text-lg px-12 py-5 rounded-md transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-3"
            >
              Solicitar Admisión a la Beta <ChevronRight className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mt-5 text-xs font-bold uppercase tracking-widest text-slate-500">
              <Lock className="w-3.5 h-3.5" /> 50% de descuento de por vida para los admitidos.
            </div>

            {/* Easter Egg */}
            <div className="mt-32">
               <Link href="/pro" className="text-[10px] text-gray-300 hover:text-gray-400">Ver versión PLG (/pro)</Link>
            </div>
          </section>
        </div>
      )}

      {/* ========================================== */}
      {/* EL FUNNEL PRIESTLEY ELITISTA (PASOS 1-6) */}
      {/* ========================================== */}
      {step > 0 && step < 7 && (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="bg-white p-8 md:p-14 rounded-2xl shadow-[0_20px_60px_rgb(0,0,0,0.05)] border border-gray-100 w-full max-w-2xl relative overflow-hidden">

            {/* Barra de Progreso Minimalista */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
              <div className="h-full bg-kavox-accent transition-all duration-700 ease-in-out" style={{ width: `${(step / 6) * 100}%` }}></div>
            </div>

            <div className="mb-10 mt-2 text-xs font-bold text-kavox-accent uppercase tracking-widest flex items-center gap-2">
              <Radar className="w-4 h-4" /> Evaluación Técnica • Paso {step} de 6
            </div>

            {errorMsg && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 text-kavox-alert rounded-md text-sm font-medium flex items-center gap-2">
                {errorMsg}
              </div>
            )}

            {/* PASO 1 */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="font-heading font-bold text-3xl text-slate-900 mb-3">¿A quién le entregamos la ventaja de la zona?</h2>
                  <p className="text-slate-500 text-sm leading-relaxed">Requerimos tus datos operativos. Si pasas el filtro, recibirás la demostración técnica en este correo.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">¿Qué código postal quieres monopolizar?</label>
                    <input type="text" value={formData.zona} onChange={(e) => handleUpdate("zona", e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-slate-900 font-medium outline-none focus:bg-white focus:border-kavox-accent focus:ring-1 focus:ring-kavox-accent transition-all" placeholder="Ej. 46001, Madrid Barrio Salamanca..." />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Nombre del Solicitante</label>
                    <input type="text" value={formData.nombre} onChange={(e) => handleUpdate("nombre", e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-slate-900 font-medium outline-none focus:bg-white focus:border-kavox-accent focus:ring-1 focus:ring-kavox-accent transition-all" placeholder="Nombre completo" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Agencia Inmobiliaria</label>
                    <input type="text" value={formData.agencia} onChange={(e) => handleUpdate("agencia", e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-slate-900 font-medium outline-none focus:bg-white focus:border-kavox-accent focus:ring-1 focus:ring-kavox-accent transition-all" placeholder="Nombre de tu empresa" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Email Profesional</label>
                    <input type="email" value={formData.email} onChange={(e) => handleUpdate("email", e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-slate-900 font-medium outline-none focus:bg-white focus:border-kavox-accent focus:ring-1 focus:ring-kavox-accent transition-all" placeholder="tu@empresa.com" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Teléfono Móvil</label>
                    <input type="tel" value={formData.telefono} onChange={(e) => handleUpdate("telefono", e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-slate-900 font-medium outline-none focus:bg-white focus:border-kavox-accent focus:ring-1 focus:ring-kavox-accent transition-all" placeholder="+34 600 000 000" />
                  </div>
                </div>
                <button onClick={nextStep} className="w-full bg-kavox-accent text-white p-4 rounded-lg font-bold uppercase tracking-wider hover:bg-teal-700 transition-colors mt-6 shadow-md shadow-teal-900/10">Iniciar Evaluación</button>
              </div>
            )}

            {/* PASO 2 */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="font-heading font-bold text-3xl text-slate-900 mb-3">Auditoría Operativa</h2>
                  <p className="text-slate-500 text-sm">Sé brutalmente honesto. ¿Cómo estás captando a los particulares hoy?</p>
                </div>
                <div className="space-y-3">
                  {[
                    "A) Fuerza bruta. Perdiendo el tiempo refrescando los portales a mano.",
                    "B) Software lento. Uso un CRM caro, pero cuando avisa el propietario ya está quemado.",
                    "C) Analógico puro. Vivo de los referidos, buzoneo y la puerta fría."
                  ].map((option) => (
                    <button key={option} onClick={() => { handleUpdate("q_situacion", option); nextStep(); }} className="w-full text-left p-5 bg-white border border-gray-200 rounded-xl hover:border-kavox-accent hover:bg-teal-50/30 transition-all text-slate-700 font-medium leading-relaxed group">
                      <span className="text-kavox-accent font-bold mr-2 group-hover:text-teal-700">{option.charAt(0)}</span> {option.substring(2)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 3 */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="font-heading font-bold text-3xl text-slate-900 mb-3">Objetivo Táctico</h2>
                  <p className="text-slate-500 text-sm">¿Para qué quieres encender KAVOX exactamente?</p>
                </div>
                <div className="space-y-3">
                  {[
                    "A) Ventaja desleal. Quiero robar el 'First-to-Call' de mi zona sistemáticamente.",
                    "B) Eficiencia extrema. Que la alerta llegue a mi bolsillo antes de encender el PC.",
                    "C) Volumen industrial. Necesito monopolizar los leads para alimentar a mi equipo."
                  ].map((option) => (
                    <button key={option} onClick={() => { handleUpdate("q_objetivo", option); nextStep(); }} className="w-full text-left p-5 bg-white border border-gray-200 rounded-xl hover:border-kavox-accent hover:bg-teal-50/30 transition-all text-slate-700 font-medium leading-relaxed group">
                      <span className="text-kavox-accent font-bold mr-2 group-hover:text-teal-700">{option.charAt(0)}</span> {option.substring(2)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 4 */}
            {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="font-heading font-bold text-3xl text-slate-900 mb-3">El Cuello de Botella</h2>
                  <p className="text-slate-500 text-sm">¿Qué es lo que te hace perder dinero ahora mismo?</p>
                </div>
                <div className="space-y-3">
                  {[
                    "A) Los malditos escudos antibot (Datadome). Me bloquean la IP por rastrear agresivamente.",
                    "B) El ROI nulo. Pago herramientas genéricas que no me consiguen exclusivas directas.",
                    "C) Fricción del software. Mis comerciales odian usar CRMs complejos y no los miran."
                  ].map((option) => (
                    <button key={option} onClick={() => { handleUpdate("q_obstaculo", option); nextStep(); }} className="w-full text-left p-5 bg-white border border-gray-200 rounded-xl hover:border-kavox-accent hover:bg-teal-50/30 transition-all text-slate-700 font-medium leading-relaxed group">
                      <span className="text-kavox-accent font-bold mr-2 group-hover:text-teal-700">{option.charAt(0)}</span> {option.substring(2)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 5 (MODIFICADO - ESTUDIO DE MERCADO) */}
            {step === 5 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="font-heading font-bold text-3xl text-slate-900 mb-3">Valoración Estratégica</h2>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    KAVOX te permite llegar el primero y generar un Dossier de Mercado (CMA) en PDF en 3 segundos durante la llamada.
                    <br/><br/>
                    Sabiendo que un solo piso captado antes que tu competencia te puede dejar miles de euros de beneficio... <strong>¿Cuánto estarías dispuesto a invertir mensualmente por tener esta infraestructura trabajando para ti?</strong>
                  </p>
                </div>
                <div className="space-y-3 mt-6">
                  {[
                    "A) Pagaría más de 199€/mes sin dudarlo si cumplo el objetivo.",
                    "B) Pagaría hasta 149€/mes, es mi límite operativo actual.",
                    "C) Pagaría hasta 99€/mes como máximo.",
                    "D) Honestamente, ahora mismo busco soluciones gratuitas o ultra low-cost."
                  ].map((option) => (
                    <button key={option} onClick={() => { handleUpdate("q_presupuesto", option); nextStep(); }} className="w-full text-left p-5 bg-white border border-gray-200 rounded-xl hover:border-kavox-accent hover:bg-teal-50/30 transition-all text-slate-700 font-medium leading-relaxed group">
                      <span className="text-kavox-accent font-bold mr-2 group-hover:text-teal-700">{option.charAt(0)}</span> {option.substring(2)}
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 flex gap-2">
                   <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                   <span>Los 50 admitidos en la Beta Privada recibirán un código de <strong>descuento del 50% de por vida</strong> cuando abramos el SaaS al público.</span>
                </div>
              </div>
            )}

            {/* PASO 6 */}
            {step === 6 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="font-heading font-bold text-3xl text-slate-900 mb-3">Último paso. Defiende tu plaza.</h2>
                  <p className="text-slate-500 text-sm">Seleccionamos las solicitudes a mano para no saturar las zonas. ¿Por qué deberíamos darte el radar a ti y no a la agencia de enfrente?</p>
                </div>

                <textarea 
                  value={formData.q_abierta} onChange={(e) => handleUpdate("q_abierta", e.target.value)}
                  rows={5}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-5 outline-none focus:bg-white focus:border-kavox-accent focus:ring-1 focus:ring-kavox-accent transition-all resize-none text-slate-900 font-medium"
                  placeholder="Sé directo y conciso..."
                ></textarea>

                <div className="flex justify-between items-center gap-4 pt-4 border-t border-gray-100">
                  <button onClick={() => setStep(5)} className="text-slate-400 hover:text-slate-800 text-xs font-bold uppercase tracking-widest transition-colors">
                    Volver
                  </button>
                  <button onClick={submitForm} disabled={isPending} className="bg-slate-900 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex justify-center items-center">
                    {isPending ? "Procesando..." : "Enviar Solicitud"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SECCIÓN 7: SUCCESS (EL FAST-TRACK) */}
      {/* ========================================== */}
      {step === 7 && (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 animate-in zoom-in-95 duration-500">
          <div className="bg-white p-10 md:p-14 rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.06)] border border-gray-100 w-full max-w-xl text-center relative overflow-hidden">

            <div className="absolute top-0 inset-x-0 h-2 bg-kavox-success"></div>

            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-10 h-10 text-kavox-success" />
            </div>

            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-4">Recepción Confirmada</h2>
            <p className="text-slate-500 text-base mb-10 leading-relaxed">
              La solicitud para operar en <strong>{formData.zona}</strong> bajo el nombre de <strong>{formData.agencia}</strong> ha sido registrada en nuestros servidores.<br/><br/>
              Nuestro equipo analizará tu perfil. Si cumples los criterios operativos, recibirás el briefing en vídeo y tu acceso a la Beta en <strong>{formData.email}</strong>.
            </p>

            <div className="bg-[#f8fafc] p-8 rounded-2xl border border-gray-100 mb-8 text-left relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#0A66C2]"></div>
              <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-widest text-xs">Vía Rápida (Fast-Track)</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">Los solicitantes que conectan directamente con nuestro fundador en LinkedIn tienen prioridad en el proceso de auditoría de zonas.</p>

              <a href="https://www.linkedin.com/in/ruben-garcia-ia/" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-3 w-full bg-[#0A66C2] text-white p-4 rounded-xl font-bold transition-all hover:bg-[#004182] hover:shadow-lg hover:-translate-y-0.5">
                <Linkedin className="w-5 h-5" /> Iniciar conexión segura
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}