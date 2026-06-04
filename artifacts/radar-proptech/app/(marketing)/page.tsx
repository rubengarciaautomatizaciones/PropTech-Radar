// artifacts/radar-proptech/app/(marketing)/page.tsx
"use client";

import { useState, useTransition } from "react";
import { joinWaitlist } from "./actions/waitlist";
import { ChevronRight, CheckCircle2, Linkedin } from "lucide-react";
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
      setErrorMsg("Requerimos todos los datos de contacto para evaluar la solicitud.");
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
    <div className="w-full">
      {/* SECCIÓN 1: HOOK & VALUE PROP (LA LANDING) */}
      {step === 0 && (
        <div className="animate-in fade-in duration-700">
          <section className="pt-24 pb-20 px-6 max-w-4xl mx-auto text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-kavox-surface border border-gray-200 text-kavox-body text-xs font-bold uppercase tracking-widest mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kavox-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-kavox-accent"></span>
              </span>
              Fase Beta Privada (Acceso Restringido)
            </div>

            <h1 className="font-heading font-bold text-5xl md:text-7xl text-kavox-body leading-[1.1] tracking-tight mb-8">
              Mientras actualizas Idealista a mano, otro agente ya está llamando a tu exclusiva.
            </h1>

            <div className="text-lg md:text-xl text-kavox-muted max-w-2xl leading-relaxed space-y-6">
              <p>
                Sabes perfectamente lo que pasa cuando un particular sube un piso. Tarda minutos en recibir 20 llamadas. Inmovilla te avisa horas tarde. Betterplace no llega a tiempo. El propietario se agobia y se lo da a la competencia.
              </p>
              <p>
                Pierdes 10.000€ de honorarios por llegar 15 minutos tarde.
              </p>
              <p className="font-medium text-kavox-body">
                Hemos construido una infraestructura que burla los antibots y te mete el anuncio en tu Telegram en milisegundos. Abres Telegram, tienes el teléfono, llamas el primero.
              </p>
            </div>

            <button 
              onClick={() => setStep(1)}
              className="mt-12 bg-kavox-body hover:bg-black text-white font-heading font-semibold tracking-wide text-lg px-10 py-5 rounded-md transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-3"
            >
              Solicitar Admisión a la Beta <ChevronRight className="w-5 h-5" />
            </button>
            <p className="mt-4 text-xs font-medium uppercase tracking-widest text-kavox-muted">Bloquea tu precio fundador (99€/mes). Sin tarjeta.</p>

            {/* Huevo de pascua para ti */}
            <div className="mt-20">
               <Link href="/pro" className="text-[10px] text-gray-300 hover:text-gray-400">Ver versión PLG (/pro)</Link>
            </div>
          </section>
        </div>
      )}

      {/* EL FUNNEL PRIESTLEY ELITISTA */}
      {step > 0 && step < 7 && (
        <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white p-10 md:p-14 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 w-full max-w-2xl relative overflow-hidden">

            <div className="absolute top-0 left-0 w-full h-1 bg-kavox-surface">
              <div className="h-full bg-kavox-accent transition-all duration-500 ease-out" style={{ width: `${(step / 6) * 100}%` }}></div>
            </div>

            <div className="mb-10 mt-2 text-xs font-bold text-kavox-accent uppercase tracking-widest">
              Evaluación Técnica • Paso {step} de 6
            </div>

            {errorMsg && (
              <div className="mb-8 p-4 bg-red-50/50 border border-red-100 text-kavox-alert rounded-md text-sm font-medium">
                {errorMsg}
              </div>
            )}

            {/* PASO 1 */}
            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h2 className="font-heading font-bold text-3xl text-kavox-body mb-2">Datos de Identificación</h2>
                  <p className="text-kavox-muted text-sm leading-relaxed">¿A quién le entregaremos la ventaja táctica de la zona? Si eres admitido, te enviaremos una demostración técnica confidencial a este correo.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-kavox-body mb-2">¿Qué zona quieres monopolizar?</label>
                    <input type="text" value={formData.zona} onChange={(e) => handleUpdate("zona", e.target.value)} className="w-full border border-gray-200 bg-kavox-surface rounded-md p-4 outline-none focus:border-kavox-accent focus:ring-1 focus:ring-kavox-accent transition-all" placeholder="Ej. Código Postal 46001, Madrid Barrio Salamanca..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-kavox-body mb-2">Nombre del Solicitante</label>
                    <input type="text" value={formData.nombre} onChange={(e) => handleUpdate("nombre", e.target.value)} className="w-full border border-gray-200 bg-kavox-surface rounded-md p-4 outline-none focus:border-kavox-accent focus:ring-1 focus:ring-kavox-accent transition-all" placeholder="Nombre completo" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-kavox-body mb-2">Entidad / Agencia</label>
                    <input type="text" value={formData.agencia} onChange={(e) => handleUpdate("agencia", e.target.value)} className="w-full border border-gray-200 bg-kavox-surface rounded-md p-4 outline-none focus:border-kavox-accent focus:ring-1 focus:ring-kavox-accent transition-all" placeholder="Nombre de la inmobiliaria" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-kavox-body mb-2">Email Profesional</label>
                    <input type="email" value={formData.email} onChange={(e) => handleUpdate("email", e.target.value)} className="w-full border border-gray-200 bg-kavox-surface rounded-md p-4 outline-none focus:border-kavox-accent focus:ring-1 focus:ring-kavox-accent transition-all" placeholder="tu@empresa.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-kavox-body mb-2">Teléfono de Contacto</label>
                    <input type="tel" value={formData.telefono} onChange={(e) => handleUpdate("telefono", e.target.value)} className="w-full border border-gray-200 bg-kavox-surface rounded-md p-4 outline-none focus:border-kavox-accent focus:ring-1 focus:ring-kavox-accent transition-all" placeholder="+34 600 000 000" />
                  </div>
                </div>
                <button onClick={nextStep} className="w-full bg-kavox-accent text-white p-4 rounded-md font-bold uppercase tracking-wider hover:bg-teal-800 transition-colors mt-4">Iniciar Evaluación</button>
              </div>
            )}

            {/* PASO 2 */}
            {step === 2 && (
              <div className="space-y-8">
                <h2 className="font-heading font-bold text-3xl text-kavox-body">Auditoría Operativa</h2>
                <p className="text-kavox-muted text-sm">Sé honesto. ¿Cómo estás captando a los particulares en este momento?</p>
                <div className="space-y-3">
                  {[
                    "A: Fuerza bruta manual. Refrescamos los portales constantemente en la oficina.",
                    "B: Dependo de un CRM tradicional (Inmovilla/Betterplace) pero noto el retraso.",
                    "C: Métodos analógicos. Principalmente referidos, buzoneo o puerta fría."
                  ].map((option) => (
                    <button key={option} onClick={() => { handleUpdate("q_situacion", option); nextStep(); }} className="w-full text-left p-5 border border-gray-200 rounded-lg hover:border-kavox-accent hover:bg-kavox-surface transition-colors text-kavox-body font-medium leading-relaxed">
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 3 */}
            {step === 3 && (
              <div className="space-y-8">
                <h2 className="font-heading font-bold text-3xl text-kavox-body">Objetivo Táctico</h2>
                <p className="text-kavox-muted text-sm">¿Para qué quieres implementar KAVOX exactamente?</p>
                <div className="space-y-3">
                  {[
                    "A: Ventaja competitiva pura. Quiero robar el 'First-to-Call' de mi zona.",
                    "B: Eficiencia. Quiero que mis agentes reciban la alerta en el móvil antes de encender el PC.",
                    "C: Volumen. Necesito monopolizar los leads para alimentar a un equipo comercial grande."
                  ].map((option) => (
                    <button key={option} onClick={() => { handleUpdate("q_objetivo", option); nextStep(); }} className="w-full text-left p-5 border border-gray-200 rounded-lg hover:border-kavox-accent hover:bg-kavox-surface transition-colors text-kavox-body font-medium leading-relaxed">
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 4 */}
            {step === 4 && (
              <div className="space-y-8">
                <h2 className="font-heading font-bold text-3xl text-kavox-body">El Cuello de Botella</h2>
                <p className="text-kavox-muted text-sm">¿Qué es lo que te hace perder dinero o tiempo a día de hoy?</p>
                <div className="space-y-3">
                  {[
                    "A: Los escudos antibot (Datadome). Me bloquean la IP o las alertas me llegan horas tarde.",
                    "B: El ROI nulo. Pago herramientas carísimas que no me consiguen exclusivas directas.",
                    "C: La fricción del software. Mis comerciales no usan el CRM porque es lento y complejo."
                  ].map((option) => (
                    <button key={option} onClick={() => { handleUpdate("q_obstaculo", option); nextStep(); }} className="w-full text-left p-5 border border-gray-200 rounded-lg hover:border-kavox-accent hover:bg-kavox-surface transition-colors text-kavox-body font-medium leading-relaxed">
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 5 */}
            {step === 5 && (
              <div className="space-y-8">
                <h2 className="font-heading font-bold text-3xl text-kavox-body">El Filtro de Compromiso</h2>
                <p className="text-kavox-muted text-sm leading-relaxed">
                  KAVOX es una infraestructura de alto rendimiento que cuesta oficialmente 199€/mes por radar.
                  <br/><br/>
                  <strong>Para los 50 Beta Testers fundadores, el precio queda bloqueado en 99€/mes de por vida.</strong> Un solo piso captado paga el software durante 10 años.
                </p>
                <div className="space-y-3 mt-6">
                  {[
                    "A: Comprendido. Si la tecnología cumple lo que promete, invertir 99€/mes es irrelevante.",
                    "B: Me interesa, pero necesito ver la demostración técnica en vídeo antes de decidir.",
                    "C: Sinceramente, 99€/mes está fuera de mis márgenes operativos actuales."
                  ].map((option) => (
                    <button key={option} onClick={() => { handleUpdate("q_presupuesto", option); nextStep(); }} className="w-full text-left p-5 border border-gray-200 rounded-lg hover:border-kavox-accent hover:bg-kavox-surface transition-colors text-kavox-body font-medium leading-relaxed">
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 6 */}
            {step === 6 && (
              <div className="space-y-8">
                <h2 className="font-heading font-bold text-3xl text-kavox-body">Defiende tu plaza</h2>
                <p className="text-kavox-muted text-sm">Seleccionamos las solicitudes a mano para evitar saturar zonas. ¿Por qué deberíamos otorgarte acceso a KAVOX a ti y no a tu competencia directa?</p>

                <textarea 
                  value={formData.q_abierta} onChange={(e) => handleUpdate("q_abierta", e.target.value)}
                  rows={5}
                  className="w-full border border-gray-200 bg-kavox-surface rounded-md p-4 outline-none focus:border-kavox-accent focus:ring-1 focus:ring-kavox-accent transition-all resize-none text-kavox-body"
                  placeholder="Se conciso y directo..."
                ></textarea>

                <div className="flex justify-between items-center gap-4 pt-4">
                  <button onClick={() => setStep(5)} className="text-kavox-muted hover:text-kavox-body text-xs font-bold uppercase tracking-widest">
                    Atrás
                  </button>
                  <button onClick={submitForm} disabled={isPending} className="bg-kavox-body text-white px-8 py-4 rounded-md font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-70 flex justify-center items-center">
                    {isPending ? "Procesando..." : "Enviar Solicitud"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECCIÓN 7: SUCCESS */}
      {step === 7 && (
        <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 animate-in zoom-in-95 duration-500">
          <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 w-full max-w-xl text-center">
            <CheckCircle2 className="w-16 h-16 text-kavox-success mx-auto mb-6" />
            <h2 className="font-heading font-bold text-3xl text-kavox-body mb-4">Recepción Confirmada</h2>
            <p className="text-kavox-muted text-base mb-10 leading-relaxed">
              La solicitud para operar en <strong>{formData.zona}</strong> bajo el nombre de <strong>{formData.agencia}</strong> ha sido registrada en nuestros servidores.<br/><br/>
              Nuestro equipo técnico analizará tu perfil. Si cumples los criterios operativos, recibirás el briefing en vídeo en <strong>{formData.email}</strong>.
            </p>

            <div className="bg-kavox-surface p-8 rounded-xl border border-gray-100 mb-8 text-left">
              <h3 className="font-bold text-kavox-body mb-2 uppercase tracking-wide text-sm">Paso Opcional (Fast-Track)</h3>
              <p className="text-sm text-kavox-muted mb-6">Contacta directamente con el CEO por LinkedIn para solicitar prioridad en el proceso de auditoría.</p>

              <a href="https://www.linkedin.com/in/ruben-garcia-ia/" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-3 w-full bg-[#0A66C2] text-white p-4 rounded-md font-bold transition-colors hover:bg-[#004182]">
                <Linkedin className="w-5 h-5" /> Iniciar conexión segura
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}