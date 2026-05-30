"use client";

import { useState, useTransition } from "react";
import { addRadarUpfrontCharge, updateRadarName, deleteRadar } from "./actions";
import { PlusCircle, Target, Pencil, Trash2, Check, X, ShieldAlert } from "lucide-react";

type Radar = {
  id: string;
  nombre_rastreo: string;
  url_idealista: string;
};

export default function ManageRadars({ initialRadars }: { initialRadars: Radar[] }) {
  // Estado para añadir
  const [nombreRastreo, setNombreRastreo] = useState("");
  const [idealistaUrl, setIdealistaUrl] = useState("");

  // Estado para editar
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

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
      const result = await updateRadarName(id, editName);
      if (result?.error) setMessage({ text: result.error, type: "error" });
      else setEditingId(null);
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
          {initialRadars.map((radar) => (
            <li key={radar.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex-1 space-y-1">

                {/* Modo Edición vs Modo Vista */}
                {editingId === radar.id ? (
                  <div className="flex items-center gap-2">
                    <input 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={() => handleSaveEdit(radar.id)} className="text-green-600 hover:text-green-800 p-1"><Check className="w-5 h-5"/></button>
                    <button onClick={() => setEditingId(null)} className="text-red-600 hover:text-red-800 p-1"><X className="w-5 h-5"/></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{radar.nombre_rastreo}</span>
                    <button 
                      onClick={() => { setEditingId(radar.id); setEditName(radar.nombre_rastreo); }}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar nombre"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* URL Solo Lectura */}
                <div className="text-xs text-gray-500 truncate max-w-md bg-gray-100 px-2 py-1 rounded inline-block" title={radar.url_idealista}>
                  {radar.url_idealista}
                </div>
              </div>

              {/* Acciones */}
              <div>
                <button 
                  onClick={() => handleDelete(radar.id)}
                  disabled={isPending || initialRadars.length === 1}
                  className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-30 disabled:hover:bg-transparent"
                  title={initialRadars.length === 1 ? "No puedes borrar tu único radar" : "Eliminar Radar"}
                >
                  <Trash2 className="w-4 h-4" /> <span className="hidden md:inline">Eliminar</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* FORMULARIO PARA AÑADIR NUEVO */}
      <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-gray-300">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Añadir Nueva Zona (Radar)</h2>
        </div>

        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 mb-6 flex items-start gap-3 text-sm text-blue-800">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <p>
            Al añadir un nuevo radar, se cargará el importe a tu tarjeta guardada y tu cuota mensual se actualizará automáticamente. 
            <strong> Por seguridad anti-spam, la URL de Idealista no podrá editarse una vez creada.</strong>
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