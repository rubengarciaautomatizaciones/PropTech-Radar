"use client";

import { useState } from "react";
import { updateIdealistaUrl } from "./actions";

export default function ConfigWizard() {
  const [step, setStep] = useState(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración de Rastreo</h1>
        <p className="text-sm text-slate-500 mt-1">Configura tu agencia y fuente de datos</p>
      </div>

      <div className="max-w-xl bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        {/* Indicador de pasos */}
        <div className="mb-8 flex items-center justify-between">
          {["Agencia", "Rastreo", "Pago"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === i + 1
                    ? "bg-indigo-600 text-white"
                    : step > i + 1
                    ? "bg-green-500 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`text-sm font-medium ${
                  step === i + 1 ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {label}
              </span>
              {i < 2 && <span className="mx-2 text-slate-200">—</span>}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Datos de tu Inmobiliaria</h2>
            <input
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Nombre de la agencia"
            />
            <button
              onClick={() => setStep(2)}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}

        {step === 2 && (
          <form action={updateIdealistaUrl} className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">URL de Idealista</h2>
            <input
              name="idealistaUrl"
              type="url"
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="https://www.idealista.com/venta-viviendas/madrid/..."
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-slate-100 text-slate-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                Atrás
              </button>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Guardar y continuar
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Finalizar y Pagar</h2>
            <p className="text-sm text-slate-500">
              Activa tu suscripción para empezar a recibir leads de Idealista automáticamente.
            </p>
            <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
              Pagar 29€/mes — 3 días gratis
            </button>
            <button
              onClick={() => setStep(2)}
              className="w-full text-slate-400 text-sm hover:text-slate-600 transition-colors"
            >
              Volver atrás
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
