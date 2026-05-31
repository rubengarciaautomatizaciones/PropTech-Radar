// artifacts/radar-proptech/app/(marketing)/page.tsx
"use client";

import { useState, useTransition } from "react";
import { joinWaitlist } from "./actions/waitlist";
import { Zap, FileText, ShieldAlert, Cpu, Database, ChevronRight, CheckCircle2, Linkedin } from "lucide-react";

export default function PriestleyWaitlistLanding() {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    agencia: "",
    email: "",
    telefono: "",
    zona: "",
    q_situacion: "",
    q_objetivo: "",
    q_obstaculo: "",
    q_presupuesto: "",
    q_abierta: ""
  });

  const handleUpdate = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step === 1 && (!formData.nombre || !formData.agencia || !formData.email || !formData.telefono || !formData.zona)) {
      setErrorMsg("Por favor, completa todos los datos de contacto para continuar.");
      return;
    }
    setErrorMsg("");
    setStep(prev => prev + 1);
  };

  const submitForm = () => {
    startTransition(async () => {
      const result = await joinWaitlist(formData);
      if (result.error) {
        setErrorMsg(result.error);
        setStep(1); 
      } else {
        setStep(7); 
      }
    });
  };

  return (
    <div className="w-full">
      {/* SECCIÓN 1: HOOK & VALUE PROP (LA LANDING) */}
      {step === 0 && (
        <div className="animate-in fade-in duration-500">
          <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center md:text-left flex flex-col items-center md:items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-kavox-accent/10 text-kavox-accent text-sm font-semibold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kavox-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-kavox-accent"></span>
              </span>
              Abriendo Beta Privada (Solo 50 Plazas)
            </div>

            <h1 className="font-heading font-medium text-4xl md:text-6xl text-kavox-body leading-[1.1] tracking-tight max-w-4xl">
              El radar sub-segundo que va a jubilar a tu CRM actual.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-kavox-muted max-w-3xl leading-relaxed">
              KAVOX es la infraestructura táctica que detecta inmuebles de particulares en la Golden Hour, cruza la Lista Robinson, y te envía la alerta al móvil. Conviértete en la primera llamada de tu código postal.
            </p>

            <button 
              onClick={() => setStep(1)}
              className="mt-10 bg-kavox-accent hover:bg-teal-800 text-white font-medium text-lg px-8 py-4 rounded-md transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              Solicitar acceso a la Beta <ChevronRight className="w-5 h-5" />
            </button>
            <p className="mt-3 text-sm text-kavox-muted">Bloquea tu precio de 99€/mes de por vida. Sin tarjeta hoy.</p>
          </section>

          {/* CREDIBILIDAD: EL ÁNGULO DEL "OUTSIDER TÉCNICO" */}
          <section className="py-16 bg-white border-y border-gray-100">
            <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl text-kavox-body mb-6">
                  Ingeniería de datos por encima de la tradición inmobiliaria.
                </h2>
                <p className="text-kavox-muted leading-relaxed mb-4">
                  El sector inmobiliario no tiene un problema de escasez de pisos, tiene un problema de <strong>tecnología obsoleta</strong>.
                </p>
                <p className="text-kavox-muted leading-relaxed">
                  Tras más de 6 años emprendiendo y 2 años diseñando sistemas de Inteligencia Artificial para empresas, hemos construido KAVOX. No somos una agencia intentando hacer software; somos ingenieros tácticos creando la ventaja tecnológica definitiva para que domines tu zona.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-kavox-surface p-6 rounded-xl border border-gray-100 text-center">
                  <Cpu className="w-8 h-8 text-kavox-accent mx-auto mb-3" />
                  <div className="font-heading font-bold text-2xl text-kavox-body mb-1">Sub-Seg.</div>
                  <div className="text-xs text-kavox-muted uppercase tracking-wider">Latencia Media</div>
                </div>
                <div className="bg-kavox-surface p-6 rounded-xl border border-gray-100 text-center">
                  <Database className="w-8 h-8 text-kavox-accent mx-auto mb-3" />
                  <div className="font-heading font-bold text-2xl text-kavox-body mb-1">100%</div>
                  <div className="text-xs text-kavox-muted uppercase tracking-wider">Anti-Datadome</div>
                </div>
              </div>
            </div>
          </section>

          {/* TUS 3 VENTAJAS INJUSTAS */}
          <section className="py-20 bg-kavox-surface">
            <div className="max-w-5xl mx-auto px-6">
              <h2 className="font-heading font-medium text-2xl md:text-3xl text-kavox-body mb-12 text-center md:text-left">
                Tus 3 ventajas injustas.
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                  <Zap className="w-6 h-6 text-kavox-accent mb-6" />
                  <h3 className="font-heading font-medium text-xl text-kavox-body mb-4">Velocidad Táctica</h3>
                  <p className="text-kavox-muted leading-relaxed">Tu competencia actualiza la pestaña a mano. KAVOX te avisa al móvil en milisegundos evadiendo bloqueos en tiempo real.</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                  <FileText className="w-6 h-6 text-kavox-accent mb-6" />
                  <h3 className="font-heading font-medium text-xl text-kavox-body mb-4">One-Click CMA</h3>
                  <p className="text-kavox-muted leading-relaxed">Genera un estudio de mercado durante el tono de llamada. Pasa de puerta fría a auditoría incontestable en 3 segundos.</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                  <ShieldAlert className="w-6 h-6 text-kavox-accent mb-6" />
                  <h3 className="font-heading font-medium text-xl text-kavox-body mb-4">Escudo LOPD</h3>
                  <p className="text-kavox-muted leading-relaxed">Filtro automático de la Lista Robinson. Prospecta con agresividad comercial, pero con total inmunidad legal.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* SECCIONES 1 AL 6: EL FUNNEL PRIESTLEY */}
      {step > 0 && step < 7 && (
        <div className="min-h-[80vh] flex items-center justify-center px-4 bg-kavox-surface animate-in fade-in zoom-in-95 duration-300 py-10">
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl relative overflow-hidden">
            {/* Barra de progreso */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
              <div 
                className="h-full bg-kavox-accent transition-all duration-500 ease-out"
                style={{ width: `${(step / 6) * 100}%` }}
              ></div>
            </div>

            <div className="mb-8 mt-2 text-sm font-semibold text-kavox-accent uppercase tracking-wider">
              Paso {step} de 6
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 text-kavox-alert rounded-lg text-sm font-medium">
                {errorMsg}
              </div>
            )}

            {/* PASO 1 ACTUALIZADO: DATOS DE CONTACTO COMPLETOS */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="font-heading text-2xl text-kavox-body">¿A dónde enviamos tu acceso a la Beta?</h2>
                <p className="text-kavox-muted text-sm">El acceso incluye tu precio fundador bloqueado y un vídeo demo confidencial enseñando el sistema.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-kavox-body mb-1">Nombre Completo</label>
                    <input 
                      type="text" 
                      value={formData.nombre}
                      onChange={(e) => handleUpdate("nombre", e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-3 outline-none focus:ring-2 focus:ring-kavox-accent"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-kavox-body mb-1">Inmobiliaria</label>
                    <input 
                      type="text" 
                      value={formData.agencia}
                      onChange={(e) => handleUpdate("agencia", e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-3 outline-none focus:ring-2 focus:ring-kavox-accent"
                      placeholder="Nombre de tu agencia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-kavox-body mb-1">Email Profesional</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => handleUpdate("email", e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-3 outline-none focus:ring-2 focus:ring-kavox-accent"
                      placeholder="gerencia@agencia.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-kavox-body mb-1">Teléfono Móvil</label>
                    <input 
                      type="tel" 
                      value={formData.telefono}
                      onChange={(e) => handleUpdate("telefono", e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-3 outline-none focus:ring-2 focus:ring-kavox-accent"
                      placeholder="+34 600 000 000"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-kavox-body mb-1">¿Qué código postal/zona quieres monopolizar?</label>
                    <input 
                      type="text" 
                      value={formData.zona}
                      onChange={(e) => handleUpdate("zona", e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-3 outline-none focus:ring-2 focus:ring-kavox-accent"
                      placeholder="Ej. Madrid Centro, Sarrià, 46001..."
                    />
                  </div>
                </div>

                <button onClick={nextStep} className="w-full bg-kavox-body text-white p-4 rounded-md font-medium hover:bg-black transition-colors mt-2">
                  Siguiente Pregunta
                </button>
              </div>
            )}

            {/* PASO 2: SITUACIÓN ACTUAL */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="font-heading text-2xl text-kavox-body">Actualmente, ¿cómo captas particulares?</h2>
                <div className="space-y-3">
                  {[
                    "A: Rastreo manual (refrescando portales constantemente).",
                    "B: Uso un CRM (Inmovilla, Betterplace) pero llega tarde.",
                    "C: Solo referidos y acciones de calle (puerta fría)."
                  ].map((option) => (
                    <button 
                      key={option}
                      onClick={() => { handleUpdate("q_situacion", option); nextStep(); }}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-kavox-accent hover:bg-kavox-accent/5 transition-colors text-kavox-muted"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 3: OBJETIVO */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-heading text-2xl text-kavox-body">¿Cuál es tu objetivo principal al incorporar KAVOX?</h2>
                <div className="space-y-3">
                  {[
                    "A: Robar el 'First-to-Call' (ser siempre el primero en llamar).",
                    "B: Evitar multas LOPD / cruzar Lista Robinson automáticamente.",
                    "C: Automatizar las alertas al móvil de todo mi equipo comercial."
                  ].map((option) => (
                    <button 
                      key={option}
                      onClick={() => { handleUpdate("q_objetivo", option); nextStep(); }}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-kavox-accent hover:bg-kavox-accent/5 transition-colors text-kavox-muted"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 4: OBSTÁCULOS */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="font-heading text-2xl text-kavox-body">¿Qué es lo que más te frustra de las herramientas actuales?</h2>
                <div className="space-y-3">
                  {[
                    "A: Me bloquean la IP o las alertas llegan con horas de retraso.",
                    "B: Son muy caras para el poco valor directo que me aportan.",
                    "C: Son complejas; mis agentes no las usan y acaban quemados."
                  ].map((option) => (
                    <button 
                      key={option}
                      onClick={() => { handleUpdate("q_obstaculo", option); nextStep(); }}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-kavox-accent hover:bg-kavox-accent/5 transition-colors text-kavox-muted"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 5: PRESUPUESTO / COMPROMISO */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="font-heading text-2xl text-kavox-body">El filtro de compromiso</h2>
                <p className="text-kavox-muted text-sm">El Radar KAVOX tiene un precio oficial de 199€/mes. <strong>Para las 50 agencias de la Beta, el precio queda bloqueado a 99€/mes de por vida.</strong></p>
                <div className="space-y-3 mt-4">
                  {[
                    "A: Sí, estoy dispuesto a invertir 99€/m si domino mi zona.",
                    "B: Quizás, primero necesito ver el vídeo demostrativo.",
                    "C: No, 99€/mes se sale de mi presupuesto operativo actual."
                  ].map((option) => (
                    <button 
                      key={option}
                      onClick={() => { handleUpdate("q_presupuesto", option); nextStep(); }}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-kavox-accent hover:bg-kavox-accent/5 transition-colors text-kavox-muted"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 6: FINAL (ABIERTA) */}
            {step === 6 && (
              <div className="space-y-6">
                <h2 className="font-heading text-2xl text-kavox-body">Último paso. ¿Hay algo más que debamos saber?</h2>
                <p className="text-kavox-muted text-sm">Seleccionamos a mano a las 50 agencias. Cuéntanos por qué deberías tener exclusividad en tu zona.</p>

                <textarea 
                  value={formData.q_abierta}
                  onChange={(e) => handleUpdate("q_abierta", e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md p-3 outline-none focus:ring-2 focus:ring-kavox-accent resize-none"
                  placeholder="Ej. Tengo un equipo de 5 comerciales muy agresivos y necesitamos volumen de leads..."
                ></textarea>

                <div className="flex justify-between items-center gap-4 mt-2">
                  <button onClick={() => setStep(5)} className="text-kavox-muted hover:text-kavox-body text-sm underline underline-offset-4">
                    Atrás
                  </button>
                  <button 
                    onClick={submitForm}
                    disabled={isPending}
                    className="flex-1 bg-kavox-accent text-white p-4 rounded-md font-medium hover:bg-teal-800 transition-colors disabled:opacity-70 flex justify-center items-center"
                  >
                    {isPending ? "Procesando solicitud..." : "Finalizar y Solicitar Acceso"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECCIÓN 7: THANK YOU PAGE */}
      {step === 7 && (
        <div className="min-h-[80vh] flex items-center justify-center px-4 bg-kavox-surface animate-in zoom-in-95 duration-500 py-10">
          <div className="bg-white p-10 md:p-14 rounded-2xl shadow-xl border border-kavox-success/20 w-full max-w-xl text-center">
            <CheckCircle2 className="w-20 h-20 text-kavox-success mx-auto mb-6" />
            <h2 className="font-heading text-3xl text-kavox-body mb-4">Solicitud Recibida, {formData.nombre}</h2>
            <p className="text-kavox-muted text-lg mb-8 leading-relaxed">
              Enhorabuena, estás oficialmente en la lista de espera para dominar <strong>{formData.zona}</strong> con <strong>{formData.agencia}</strong>.<br/><br/>
              Analizaremos tus respuestas y te enviaremos el vídeo confidencial de la demo a <strong>{formData.email}</strong> en las próximas horas.
            </p>

            <div className="bg-kavox-surface p-6 rounded-xl border border-gray-100 mb-8">
              <h3 className="font-semibold text-kavox-body mb-2">Siguiente Paso Recomendado:</h3>
              <p className="text-sm text-kavox-muted mb-4">Conecta directamente con el fundador en LinkedIn para tener prioridad en el proceso de selección de la Beta.</p>

              <a 
                href="https://www.linkedin.com/in/tu-perfil-aqui" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full bg-[#0A66C2] text-white p-3 rounded-md font-medium hover:bg-[#004182] transition-colors"
              >
                <Linkedin className="w-5 h-5" /> Conectar en LinkedIn
              </a>
            </div>

            <button onClick={() => setStep(0)} className="text-sm text-kavox-muted hover:text-kavox-body underline underline-offset-4">
              Volver a la página principal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}