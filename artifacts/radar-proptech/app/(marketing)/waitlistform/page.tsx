// artifacts/radar-proptech/app/(marketing)/waitlistform/page.tsx
"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { joinWaitlist } from "../actions/waitlist";
import { ArrowRight, CheckCircle2, ChevronLeft, Linkedin, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function WaitlistFormPage() {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
  const totalSteps = 10; // 5 info + 5 questions
  const inputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nombre: "", agencia: "", email: "", telefono: "", zona: "",
    q_situacion: "", q_objetivo: "", q_obstaculo: "", q_presupuesto: "", q_abierta: ""
  });

  const handleUpdate = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrorMsg("");
  };

  // Auto-focus on input when step changes
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [step]);

  // Handle Enter key for text inputs
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") nextStep();
  };

  const nextStep = () => {
    // Validaciones por paso
    if (step === 1 && !formData.nombre.trim()) return setErrorMsg("Necesitamos tu nombre para continuar.");
    if (step === 2 && !formData.agencia.trim()) return setErrorMsg("Indica el nombre de tu empresa.");
    if (step === 3 && (!formData.email.trim() || !formData.email.includes("@"))) return setErrorMsg("Introduce un email válido.");
    if (step === 4 && !formData.telefono.trim()) return setErrorMsg("El teléfono es obligatorio para las alertas.");
    if (step === 5 && !formData.zona.trim()) return setErrorMsg("Indica la zona que quieres monopolizar.");

    setErrorMsg("");
    setStep(prev => prev + 1);
  };

  const submitForm = () => {
    if (!formData.q_abierta.trim()) return setErrorMsg("Defiende tu plaza. Este campo es obligatorio.");

    startTransition(async () => {
      const result = await joinWaitlist(formData);
      if (result.error) { 
        setErrorMsg(result.error); 
      } else {
        setStep(11); // Success Step
      }
    });
  };

  // Componente reutilizable para opciones (Botones A/B/C)
  const OptionButton = ({ letter, text, field }: { letter: string, text: string, field: string }) => (
    <button 
      onClick={() => { handleUpdate(field, `${letter}) ${text}`); nextStep(); }} 
      className="w-full text-left p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-kavox-accent hover:shadow-[0_8px_30px_rgb(0,135,153,0.1)] transition-all text-slate-700 font-medium text-lg leading-relaxed flex items-start gap-4 group"
    >
      <span className="bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-md text-sm group-hover:bg-kavox-accent group-hover:text-white transition-colors">
        {letter}
      </span> 
      <span className="mt-0.5">{text}</span>
    </button>
  );

  return (
    <div className="w-full h-full flex flex-col relative bg-white">

      {/* Progress Bar Top */}
      {step < 11 && (
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
          <div className="h-full bg-kavox-accent transition-all duration-500 ease-out" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>
      )}

      {/* Back Button & Step Counter */}
      {step > 1 && step < 11 && (
        <div className="absolute top-8 left-8 flex items-center gap-6">
          <button onClick={() => setStep(p => p - 1)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-slate-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Paso {step} de {totalSteps}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full px-8 py-20 animate-in fade-in duration-300">

        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-3 animate-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5 shrink-0" /> {errorMsg}
          </div>
        )}

        {/* PASO 1: Nombre */}
        {step === 1 && (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <h2 className="font-heading font-bold text-4xl text-slate-900 mb-8">1. Identificación Táctica.<br/>¿Con quién estamos hablando?</h2>
            <input 
              ref={inputRef} type="text" value={formData.nombre} onChange={(e) => handleUpdate("nombre", e.target.value)} onKeyDown={handleKeyDown}
              className="w-full text-3xl font-medium text-slate-900 border-b-2 border-gray-200 focus:border-kavox-accent outline-none pb-4 bg-transparent transition-colors placeholder:text-gray-300" 
              placeholder="Tu nombre completo..." 
            />
            <div className="mt-8 flex items-center gap-4">
              <button onClick={nextStep} className="bg-kavox-accent text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-teal-700 transition-colors">OK <CheckCircle2 className="w-4 h-4"/></button>
              <span className="text-xs text-gray-400">pulsa <strong>Enter ↵</strong></span>
            </div>
          </div>
        )}

        {/* PASO 2: Agencia */}
        {step === 2 && (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <h2 className="font-heading font-bold text-4xl text-slate-900 mb-8">2. ¿Cuál es tu agencia o entidad de inversión?</h2>
            <input 
              ref={inputRef} type="text" value={formData.agencia} onChange={(e) => handleUpdate("agencia", e.target.value)} onKeyDown={handleKeyDown}
              className="w-full text-3xl font-medium text-slate-900 border-b-2 border-gray-200 focus:border-kavox-accent outline-none pb-4 bg-transparent transition-colors placeholder:text-gray-300" 
              placeholder="Nombre de la inmobiliaria..." 
            />
            <div className="mt-8 flex items-center gap-4">
              <button onClick={nextStep} className="bg-kavox-accent text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-teal-700 transition-colors">OK <CheckCircle2 className="w-4 h-4"/></button>
              <span className="text-xs text-gray-400">pulsa <strong>Enter ↵</strong></span>
            </div>
          </div>
        )}

        {/* PASO 3: Email */}
        {step === 3 && (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <h2 className="font-heading font-bold text-4xl text-slate-900 mb-8">3. ¿A qué correo enviaremos tu acceso y la demo técnica confidencial?</h2>
            <input 
              ref={inputRef} type="email" value={formData.email} onChange={(e) => handleUpdate("email", e.target.value)} onKeyDown={handleKeyDown}
              className="w-full text-3xl font-medium text-slate-900 border-b-2 border-gray-200 focus:border-kavox-accent outline-none pb-4 bg-transparent transition-colors placeholder:text-gray-300" 
              placeholder="tu@correo.com..." 
            />
            <div className="mt-8 flex items-center gap-4">
              <button onClick={nextStep} className="bg-kavox-accent text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-teal-700 transition-colors">OK <CheckCircle2 className="w-4 h-4"/></button>
              <span className="text-xs text-gray-400">pulsa <strong>Enter ↵</strong></span>
            </div>
          </div>
        )}

        {/* PASO 4: Teléfono */}
        {step === 4 && (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <h2 className="font-heading font-bold text-4xl text-slate-900 mb-8">4. ¿Cuál es tu teléfono móvil? <br/><span className="text-xl text-gray-400 font-normal">Lo necesitamos para vincular tus alertas de Telegram.</span></h2>
            <input 
              ref={inputRef} type="tel" value={formData.telefono} onChange={(e) => handleUpdate("telefono", e.target.value)} onKeyDown={handleKeyDown}
              className="w-full text-3xl font-medium text-slate-900 border-b-2 border-gray-200 focus:border-kavox-accent outline-none pb-4 bg-transparent transition-colors placeholder:text-gray-300" 
              placeholder="+34 600 000 000..." 
            />
            <div className="mt-8 flex items-center gap-4">
              <button onClick={nextStep} className="bg-kavox-accent text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-teal-700 transition-colors">OK <CheckCircle2 className="w-4 h-4"/></button>
              <span className="text-xs text-gray-400">pulsa <strong>Enter ↵</strong></span>
            </div>
          </div>
        )}

        {/* PASO 5: Zona */}
        {step === 5 && (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <h2 className="font-heading font-bold text-4xl text-slate-900 mb-8">5. ¿Qué zona exacta quieres monopolizar?</h2>
            <input 
              ref={inputRef} type="text" value={formData.zona} onChange={(e) => handleUpdate("zona", e.target.value)} onKeyDown={handleKeyDown}
              className="w-full text-3xl font-medium text-slate-900 border-b-2 border-gray-200 focus:border-kavox-accent outline-none pb-4 bg-transparent transition-colors placeholder:text-gray-300" 
              placeholder="Ej. Madrid Centro, CP 46001..." 
            />
            <div className="mt-8 flex items-center gap-4">
              <button onClick={nextStep} className="bg-kavox-accent text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-teal-700 transition-colors">OK <CheckCircle2 className="w-4 h-4"/></button>
              <span className="text-xs text-gray-400">pulsa <strong>Enter ↵</strong></span>
            </div>
          </div>
        )}

        {/* PASO 6: Situación */}
        {step === 6 && (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-8">6. Auditoría Operativa. Sé brutalmente honesto. ¿Cómo captas a los particulares hoy?</h2>
            <div className="space-y-4">
              <OptionButton letter="A" text="Fuerza bruta. Perdiendo el tiempo refrescando los portales a mano." field="q_situacion" />
              <OptionButton letter="B" text="Software lento. Uso un CRM caro, pero cuando avisa el propietario ya está quemado." field="q_situacion" />
              <OptionButton letter="C" text="Analógico puro. Vivo de los referidos, buzoneo y la puerta fría." field="q_situacion" />
            </div>
          </div>
        )}

        {/* PASO 7: Objetivo */}
        {step === 7 && (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-8">7. Objetivo Táctico. ¿Para qué quieres encender KAVOX exactamente?</h2>
            <div className="space-y-4">
              <OptionButton letter="A" text="Ventaja desleal. Quiero robar el 'First-to-Call' de mi zona sistemáticamente." field="q_objetivo" />
              <OptionButton letter="B" text="Eficiencia extrema. Que la alerta llegue a mi bolsillo antes de encender el PC." field="q_objetivo" />
              <OptionButton letter="C" text="Volumen industrial. Necesito monopolizar los leads para alimentar a mi equipo." field="q_objetivo" />
            </div>
          </div>
        )}

        {/* PASO 8: Obstáculo */}
        {step === 8 && (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-8">8. El Cuello de Botella. ¿Qué te hace perder dinero ahora mismo?</h2>
            <div className="space-y-4">
              <OptionButton letter="A" text="Los malditos escudos antibot (Datadome). Me bloquean la IP por rastrear agresivamente." field="q_obstaculo" />
              <OptionButton letter="B" text="El ROI nulo. Pago herramientas genéricas que no me consiguen exclusivas directas." field="q_obstaculo" />
              <OptionButton letter="C" text="Fricción del software. Mis comerciales odian usar CRMs complejos y no los miran." field="q_obstaculo" />
            </div>
          </div>
        )}

        {/* PASO 9: Presupuesto / Oferta */}
        {step === 9 && (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-4">9. Valoración Estratégica</h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-8">
              Los 50 admitidos en la Beta Privada recibirán un código de <strong>descuento del 50% de por vida</strong> cuando abramos el SaaS al público.<br/><br/>
              Sabiendo que un solo piso captado antes que tu competencia te deja miles de euros... <strong>¿Cuánto pagarías mensualmente por tener el radar de tu zona en exclusiva?</strong>
            </p>
            <div className="space-y-4">
              <OptionButton letter="A" text="Pagaría más de 199€/mes sin dudarlo si cumplo el objetivo." field="q_presupuesto" />
              <OptionButton letter="B" text="Pagaría hasta 149€/mes, es mi límite operativo actual." field="q_presupuesto" />
              <OptionButton letter="C" text="Pagaría hasta 99€/mes como máximo." field="q_presupuesto" />
              <OptionButton letter="D" text="Honestamente, ahora mismo busco soluciones gratuitas o ultra low-cost." field="q_presupuesto" />
            </div>
          </div>
        )}

        {/* PASO 10: Justificación */}
        {step === 10 && (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <h2 className="font-heading font-bold text-4xl text-slate-900 mb-6">10. Último paso. Defiende tu plaza.</h2>
            <p className="text-slate-500 text-lg mb-8">Seleccionamos a mano para no saturar las zonas. ¿Por qué deberíamos darte el radar a ti y no a tu competencia directa?</p>

            <textarea 
              autoFocus
              value={formData.q_abierta} onChange={(e) => handleUpdate("q_abierta", e.target.value)}
              rows={4}
              className="w-full text-2xl font-medium text-slate-900 border-b-2 border-gray-200 focus:border-kavox-accent outline-none pb-4 bg-transparent transition-colors resize-none placeholder:text-gray-300"
              placeholder="Escribe tu justificación aquí..."
            ></textarea>

            <button 
              onClick={submitForm} 
              disabled={isPending} 
              className="mt-10 bg-slate-900 text-white px-10 py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-70 flex justify-center items-center gap-3 w-fit"
            >
              {isPending ? "Procesando..." : "Enviar Solicitud"} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* PASO 11: SUCCESS */}
        {step === 11 && (
          <div className="animate-in zoom-in-95 duration-500 text-center max-w-xl mx-auto">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-green-100">
              <CheckCircle2 className="w-12 h-12 text-kavox-success" />
            </div>

            <h2 className="font-heading font-bold text-4xl text-slate-900 mb-6">Recepción Confirmada</h2>
            <p className="text-slate-500 text-lg mb-12 leading-relaxed">
              La solicitud para operar en <strong>{formData.zona}</strong> bajo el nombre de <strong>{formData.agencia}</strong> ha sido registrada.<br/><br/>
              Nuestro equipo analizará tu perfil. Si cumples los criterios, recibirás tu acceso a la Beta y tu descuento vitalicio en <strong>{formData.email}</strong>.
            </p>

            <div className="bg-[#f8fafc] p-8 rounded-3xl border border-gray-100 mb-8 text-left relative overflow-hidden group shadow-sm">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0A66C2]"></div>
              <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-widest text-xs">Vía Rápida (Fast-Track)</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">Los solicitantes que conectan directamente con nuestro fundador en LinkedIn tienen prioridad en el proceso de auditoría de zonas.</p>

              <a href="https://www.linkedin.com/in/ruben-garcia-ia/" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-3 w-full bg-[#0A66C2] text-white p-4 rounded-xl font-bold transition-all hover:bg-[#004182] shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                <Linkedin className="w-5 h-5" /> Iniciar conexión segura
              </a>
            </div>

            <Link href="/" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">
              Volver al inicio
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}