"use client";

import { useState, useTransition } from "react";
import { updateScrapingConfig } from "./actions";
import { PlusCircle, Target } from "lucide-react";

export default function ManageRadars() {
  const [nombreRastreo, setNombreRastreo] = useState("");
  const [idealistaUrl, setIdealistaUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAddRadar = () => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("nombreRastreo", nombreRastreo);
      formData.append("idealistaUrl", idealistaUrl);

      const result = await updateScrapingConfig(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.success);
        setNombreRastreo("");
        setIdealistaUrl("");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración de Radares</h1>
        <p className="text-gray-500 mt-1">Añade nuevas zonas de rastreo para expandir tu captación.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Añadir Nuevo Radar</h2>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Identificativo</label>
            <input 
              type="text"
              value={nombreRastreo}
              onChange={(e) => setNombreRastreo(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" 
              placeholder="Ej: Áticos Barcelona" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de Idealista a rastrear</label>
            <input 
              type="url"
              value={idealistaUrl}
              onChange={(e) => setIdealistaUrl(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" 
              placeholder="https://www.idealista.com/..." 
            />
            <p className="text-xs text-gray-400 mt-1">Haz la búsqueda en Idealista, aplica los filtros que desees y pega aquí la URL final del navegador.</p>
          </div>

          <button 
            onClick={handleAddRadar}
            disabled={isPending || !nombreRastreo.trim() || !idealistaUrl.trim()}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? "Añadiendo..." : (
              <>
                <PlusCircle className="w-5 h-5" />
                Añadir Radar a mi Cuenta
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}