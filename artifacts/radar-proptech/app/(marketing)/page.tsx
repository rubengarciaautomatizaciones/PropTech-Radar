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
      // formData aquí es el objeto fuertemente tipado que espera TypeScript
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
      {/* HERO SECTION */}
      <section className="pt-24 pb-20 px-6 max-w-5xl mx-auto text-center md:text-left flex flex-col items-center md:items-start">
        <h1 className="font-heading font-medium text-4xl md:text-6xl text-kavox-body leading-[1.1] tracking-tight max-w-4xl">
          El radar sub-segundo que va a jubilar a tu CRM actual.
        </h1>
        <p className="mt-8 text-lg md:text-xl text-kavox-muted max-w-3xl leading-relaxed">
          KAVOX es la infraestructura táctica que detecta inmuebles de particulares en la Golden Hour, cruza la Lista Robinson, y te envía la alerta al móvil junto con una Valoración Automática (CMA). Conviértete en la primera llamada y en la máxima autoridad.
        </p>
      </section>

      {/* TUS 3 VENTAJAS INJUSTAS (FEATURES) */}
      <section className="py-20 bg-kavox-surface">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-heading font-medium text-2xl md:text-3xl text-kavox-body mb-12">
            Tus 3 ventajas injustas.
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-kavox-surface flex items-center justify-center rounded-lg mb-6">
                <Zap className="w-6 h-6 text-kavox-accent" />
              </div>
              <h3 className="font-heading font-medium text-xl text-kavox-body mb-4">Velocidad Anti-Datadome</h3>
              <p className="text-kavox-muted leading-relaxed">
                Tu competencia actualiza la pestaña. Nosotros te avisamos en milisegundos a través de una arquitectura que evade bloqueos en tiempo real.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-kavox-surface flex items-center justify-center rounded-lg mb-6">
                <FileText className="w-6 h-6 text-kavox-accent" />
              </div>
              <h3 className="font-heading font-medium text-xl text-kavox-body mb-4">One-Click CMA</h3>
              <p className="text-kavox-muted leading-relaxed">
                Durante el tono de llamada, KAVOX genera un estudio de mercado real del piso. Pasas de hacer puerta fría a hacer una auditoría incontestable.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-kavox-surface flex items-center justify-center rounded-lg mb-6">
                <ShieldAlert className="w-6 h-6 text-kavox-accent" />
              </div>
              <h3 className="font-heading font-medium text-xl text-kavox-body mb-4">Escudo LOPD</h3>
              <p className="text-kavox-muted leading-relaxed">
                Rastreo y cruce automático con la Lista Robinson. Prospecta con agresividad comercial, pero con total inmunidad legal ante auditorías.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CAJA DE ESCASEZ Y CAPTURA */}
      <section className="py-24 px-6 max-w-3xl mx-auto">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
          {/* Acento superior decorativo */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-kavox-accent"></div>

          <h2 className="font-heading font-medium text-2xl text-kavox-body mb-4">
            Abriremos la beta cerrada exclusivamente para 50 agencias en España.
          </h2>
          <p className="text-kavox-muted mb-8 leading-relaxed">
            Únete a la Waitlist hoy y asegura tu monopolio de zona por <strong className="text-kavox-body font-semibold">99€/mes de por vida</strong> (Agentes ilimitados. 1 Zona/Ciudad). Precio oficial post-lanzamiento: 199€/mes.
          </p>

          {status?.success ? (
            <div className="bg-kavox-success/10 border border-kavox-success/20 text-kavox-success p-6 rounded-lg text-center font-medium">
              Asegurado. Estás en la lista. Te contactaremos 48h antes de abrir las plazas en tu zona.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {status?.error && (
                <div className="text-kavox-alert text-sm font-medium p-3 bg-red-50 rounded-md">
                  {status.error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-kavox-body">Email profesional</label>
                  <input 
                    id="email"
                    name="email"
                    type="email" 
                    required 
                    className="w-full bg-kavox-surface border border-gray-200 px-4 py-3 rounded-md outline-none focus:border-kavox-accent focus:ring-1 focus:ring-kavox-accent transition-all text-kavox-body"
                    placeholder="gerencia@agencia.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="zona" className="text-sm font-medium text-kavox-body">¿Qué zona quieres monopolizar?</label>
                  <input 
                    id="zona"
                    name="zona"
                    type="text" 
                    required 
                    className="w-full bg-kavox-surface border border-gray-200 px-4 py-3 rounded-md outline-none focus:border-kavox-accent focus:ring-1 focus:ring-kavox-accent transition-all text-kavox-body"
                    placeholder="Ej. Madrid Centro, Sarrià..."
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-kavox-accent hover:bg-teal-800 text-white font-medium text-lg py-4 rounded-md transition-colors mt-4 disabled:opacity-70 flex justify-center items-center"
              >
                {isPending ? "Asegurando plaza..." : "Bloquear mi plaza a 99€"}
              </button>

              <p className="text-center text-xs text-kavox-muted mt-4">
                No se requiere tarjeta de crédito hoy. Te avisaremos 48h antes de abrir las plazas de tu zona.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}