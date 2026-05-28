// artifacts/radar-proptech/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { redirect, useRouter } from "next/navigation";
import { Send, Smartphone, X, MapPin } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TrackerData = {
  id: string;
  nombre_rastreo: string;
  telegram_chat_id: string | null;
  activa: boolean;
};

export default function DashboardPage() {
  const [rol, setRol] = useState<string | null>(null);
  const [trackers, setTrackers] = useState<TrackerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estado para el modal
  const [selectedTrackerId, setSelectedTrackerId] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: userData } = await supabase
        .from("usuarios")
        .select("id_agencia, rol")
        .eq("id_usuario", user.id)
        .single();

      if (userData) {
        setRol(userData.rol);

        if (!userData.id_agencia && userData.rol !== 'admin') {
          router.push("/dashboard/config");
        } else if (userData.id_agencia) {
          // Cargamos todos los rastreadores de esta agencia
          const { data: trackersData } = await supabase
            .from("configuracion_rastreo")
            .select("id, nombre_rastreo, telegram_chat_id, activa")
            .eq("id_agencia", userData.id_agencia);

          if (trackersData) setTrackers(trackersData);
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, [router, supabase]);

  if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando tu imperio...</div>;

  const telegramBotUsername = "RadarPropTech_bot"; 
  // El enlace dinámico depende del rastreador que hayamos seleccionado
  const telegramLink = `https://t.me/${telegramBotUsername}?start=${selectedTrackerId}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel Principal</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona tus radares de captación.</p>
        </div>
        {rol === 'admin' && (
            <div className="text-xs font-bold uppercase text-yellow-500 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full">
              MODO DIOS
            </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Tus Zonas Activas</h2>

        {trackers.length === 0 ? (
           <p className="text-gray-500 text-sm">No tienes ningún radar configurado aún.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {trackers.map((tracker) => (
              <div key={tracker.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${tracker.telegram_chat_id ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{tracker.nombre_rastreo}</h3>
                    <p className="text-sm text-gray-500">
                      {tracker.telegram_chat_id 
                        ? "Recibiendo alertas en Telegram."
                        : "Falta conectar el grupo de Telegram."}
                    </p>
                  </div>
                </div>

                {!tracker.telegram_chat_id ? (
                  <button 
                    onClick={() => setSelectedTrackerId(tracker.id)}
                    className="bg-[#0088cc] hover:bg-[#0077b3] text-white px-5 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Smartphone className="w-4 h-4" />
                    Conectar Grupo
                  </button>
                ) : (
                  <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    Conectado
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL PARA EL CÓDIGO QR --- */}
      {selectedTrackerId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative flex flex-col p-6 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedTrackerId(null)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6 mt-2">
              <h2 className="text-xl font-bold text-slate-900">Conecta tu Grupo</h2>
              <p className="text-gray-500 mt-2 text-sm">Escanea este código para vincular un chat de Telegram a esta zona específica.</p>
            </div>

            <div className="flex flex-col items-center space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <QRCodeSVG value={telegramLink} size={200} level={"H"} includeMargin={true} />
              </div>

              <div className="space-y-3 w-full px-2">
                <p className="text-sm font-medium flex gap-3 items-center text-slate-700">
                  <span className="bg-[#0088cc] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">1</span> 
                  Abre la cámara o lector QR de tu móvil.
                </p>
                <p className="text-sm font-medium flex gap-3 items-center text-slate-700">
                  <span className="bg-[#0088cc] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">2</span> 
                  Si quieres alertas para el equipo, añade el bot a un grupo y pega ahí el enlace.
                </p>
                <p className="text-sm font-medium flex gap-3 items-center text-slate-700">
                  <span className="bg-[#0088cc] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">3</span> 
                  Pulsa el botón <b className="text-slate-900">"INICIAR"</b>.
                </p>
              </div>

              <button 
                onClick={() => window.location.reload()}
                className="w-full mt-2 bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
              >
                Ya lo he conectado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}