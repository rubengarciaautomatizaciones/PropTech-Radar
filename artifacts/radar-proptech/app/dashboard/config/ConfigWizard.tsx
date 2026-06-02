// artifacts/radar-proptech/app/dashboard/config/ConfigWizard.tsx
"use client";

import { useState, useTransition } from "react";
import { completeOnboarding } from "./actions";

// Añadimos la prop para recibir el nombre pre-cargado
export default function ConfigWizard({ initialAgencyName = "" }: { initialAgencyName?: string }) {
  const [step, setStep] = useState(1);
  // Inicializamos el estado con la prop
  const [agencyName, setAgencyName] = useState(initialAgencyName);
  const [nombreRastreo, setNombreRastreo] = useState("");
  const [idealistaUrl, setIdealistaUrl] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleFinish = () => {
    setError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.append("agencyName", agencyName);
      formData.append("nombreRastreo", nombreRastreo);
      formData.append("idealistaUrl", idealistaUrl);

      const result = await completeOnboarding(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <div className="mb-8 flex justify-between border-b pb-4">
        <span className={step === 1 ? "text-blue-600 font-bold" : "text-gray-400"}>1. Agencia</span>
        <span className={step === 2 ? "text-blue-600 font-bold" : "text-gray-400"}>2. Búsqueda</span>
        <span className={step === 3 ? "text-blue-600 font-bold" : "text-gray-400"}>3. Activación</span>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center">{error}</div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Datos de tu Inmobiliaria</h2>
          <input 
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" 
            placeholder="Nombre de la agencia (Ej: Fincas Madrid)" 
          />
          <button 
            disabled={!agencyName.trim()}
            onClick={() => setStep(2)} 
            className="w-full bg-slate-900 text-white p-3 rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            Siguiente paso
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Configura tu Primer Radar</h2>
          <p className="text-sm text-gray-500">¿Qué zona quieres vigilar para empezar a captar?</p>

          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre para esta zona</label>
              <input 
                type="text"
                value={nombreRastreo}
                onChange={(e) => setNombreRastreo(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" 
                placeholder="Ej: Pisos Madrid Centro" 
              />
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de Idealista</label>
              <input 
                type="url"
                value={idealistaUrl}
                onChange={(e) => setIdealistaUrl(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" 
                placeholder="https://www.idealista.com/..." 
              />
              <p className="text-xs text-gray-400 mt-1">Pega el enlace con los filtros exactos aplicados en Idealista.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(1)} className="w-1/3 bg-gray-100 text-slate-700 p-3 rounded-lg font-semibold hover:bg-gray-200">Atrás</button>
            <button 
              disabled={!idealistaUrl.trim() || !nombreRastreo.trim()}
              onClick={() => setStep(3)} 
              className="w-2/3 bg-slate-900 text-white p-3 rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              Siguiente paso
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 text-center">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-slate-900">Todo listo</h2>
          <p className="text-gray-600 mb-6">Activa tu suscripción para encender tu primer radar hoy mismo. Podrás añadir más zonas desde tu panel según tu plan.</p>
          <button 
            onClick={handleFinish}
            disabled={isPending}
            className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold text-lg hover:bg-blue-700 shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:transform-none"
          >
            {isPending ? "Configurando sistema..." : "Empezar Trial de 3 Días (29€/mes)"}
          </button>
        </div>
      )}
    </div>
  );
}