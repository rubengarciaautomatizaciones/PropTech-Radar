// artifacts/radar-proptech/app/dashboard/config/ManageRadars.tsx
"use client";

import { useState, useTransition } from "react";
import { addRadarUpfrontCharge, updateRadar, deleteRadar } from "./actions"; // <--- CAMBIO IMPORTANTE AQUÍ
import { PlusCircle, Target, Pencil, Trash2, Check, X, ShieldAlert, Link as LinkIcon, Info } from "lucide-react";

type Radar = {
  id: string;
  nombre_rastreo: string;
  url_idealista: string;
  historial_cambios_url?: string[];
};

export default function ManageRadars({ initialRadars }: { initialRadars: Radar[] }) {
  const [nombreRastreo, setNombreRastreo] = useState("");
  const [idealistaUrl, setIdealistaUrl] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const [message, setMessage] = useState<{ text: string, type: "error" | "success" } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAddRadar = () => {
    setMessage(null);
    if (!confirm("Al añadir un radar, se cargará automáticamente la cuota proporcional en tu tarjeta guardada. Si estás en periodo de prueba, este finalizará y comenzará tu facturación. ¿Aceptar?")) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("nombreRastreo", nombreRastreo);
      formData.append("idealistaUrl", idealistaUrl);

      const result = await addRadarUpfrontCharge(formData);
      if (result?.error) setMessage({ text: result.error, type: "error" });
      else if (result?.success) {
        setMessage({ text: result.success, type: "success" });
        setNombreRastreo("");
        setIdealistaUrl("");
      }
    });
  };

  const handleSaveEdit = (id: string) => {
    startTransition(async () => {
      const result = await updateRadar(id, editName, editUrl);
      if (result?.error) setMessage({ text: result.error, type: "error" });
      else {
        setMessage({ text: "Radar actualizado correctamente.", type: "success" });
        setEditingId(null);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este radar? Esta acción reducirá tu cuota mensual de Stripe, pero el radar se perderá para siempre.")) return;

    startTransition(async () => {
      const result = await deleteRadar(id);
      if (result?.error) setMessage({ text: result.error, type: "error" });
      else if (result?.success) setMessage({ text: result.success, type: "success" });
    });
  };

  // Función para calcular cuántos cambios le quedan al usuario (30 días rodantes)
  const getRemainingChanges = (history?: string[]) => {
    if (!history) return 3;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentChanges = history.filter(d => new Date(d) > thirtyDaysAgo).length;
    return Math.max(0, 3 - recentChanges);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mis Radares Activos</h1>
        <p className="text-gray-500 mt-1">Gestiona tus zonas de captación. Cada radar adicional tiene un coste de suscripción.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
          {message.text}
        </div>
      )}

      {/* LISTA DE RADARES ACTUALES */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {initialRadars.map((radar) => {
            const isEditing = editingId === radar.id;
            const remainingChanges = getRemainingChanges(radar.historial_cambios_url);

            return (
              <li key={radar.id} className="p-5 flex flex-col hover:bg-slate-50 transition-colors gap-4">

                {isEditing ? (
                  // MODO EDICIÓN
                  <div className="w-full space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-slate-900 text-lg">Modo Edición</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveEdit(radar.id)} disabled={isPending} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 hover:bg-green-700 disabled:opacity-50"><Check className="w-4 h-4"/> Guardar</button>
                        <button onClick={() => setEditingId(null)} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 hover:bg-gray-300"><X className="w-4 h-4"/> Cancelar</button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nombre del Radar</label>
                        <input 
                          value={editName} 
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-semibold text-gray-500 uppercase">URL de Rastreo</label>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${remainingChanges > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                            {remainingChanges} cambios disponibles
                          </span>
                        </div>
                        <input 
                          value={editUrl} 
                          onChange={(e) => setEditUrl(e.target.value)}
                          disabled={remainingChanges === 0 && editUrl !== radar.url_idealista}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                        />
                        {remainingChanges === 0 && editUrl !== radar.url_idealista && (
                          <p className="text-xs text-red-500 mt-1">Has alcanzado el límite de 3 cambios en los últimos 30 días.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // MODO VISTA
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
                    <div className="flex-1 space-y-2 w-full min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 text-lg">{radar.nombre_rastreo}</span>
                        <button 
                          onClick={() => { setEditingId(radar.id); setEditName(radar.nombre_rastreo); setEditUrl(radar.url_idealista); }}
                          className="text-gray-400 hover:text-blue-600 transition-colors bg-gray-100 p-1.5 rounded-md"
                          title="Editar radar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg truncate w-full" title={radar.url_idealista}>
                        <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{radar.url_idealista}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDelete(radar.id)}
                      disabled={isPending || initialRadars.length === 1}
                      className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-30 disabled:hover:bg-transparent shrink-0"
                      title={initialRadars.length === 1 ? "No puedes borrar tu único radar" : "Eliminar Radar"}
                    >
                      <Trash2 className="w-4 h-4" /> <span className="hidden md:inline">Eliminar</span>
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* FORMULARIO PARA AÑADIR NUEVO */}
      <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-gray-300">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Añadir Nueva Zona (Radar)</h2>
        </div>

        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 mb-6 flex items-start gap-3 text-sm text-blue-800">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <p>
            Al añadir un nuevo radar, se cargará el importe a tu tarjeta guardada. Por seguridad, <strong>la URL de los radares solo puede modificarse un máximo de 3 veces cada 30 días</strong>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (Ej: Áticos Madrid)</label>
            <input 
              type="text"
              value={nombreRastreo}
              onChange={(e) => setNombreRastreo(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de Idealista (Filtros aplicados)</label>
            <input 
              type="url"
              value={idealistaUrl}
              onChange={(e) => setIdealistaUrl(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" 
            />
          </div>
        </div>

        <button 
          onClick={handleAddRadar}
          disabled={isPending || !nombreRastreo.trim() || !idealistaUrl.trim()}
          className="w-full bg-slate-900 text-white p-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isPending ? "Procesando pago y configurando..." : (
            <>
              <PlusCircle className="w-5 h-5" />
              Pagar y Añadir Radar
            </>
          )}
        </button>
      </div>
    </div>
  );
}