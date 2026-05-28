// artifacts/radar-proptech/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Send, Smartphone, X, MapPin, ExternalLink, Phone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { updateLeadStatus } from "./actions";

type TrackerData = {
  id: string;
  nombre_rastreo: string;
  telegram_chat_id: string | null;
  activa: boolean;
};

type LeadData = {
  id_anuncio: string;
  id_agencia: string;
  titulo: string;
  precio: number;
  telefono: string;
  url: string;
  foto: string;
  estado: string;
  created_at: string;
};

export default function DashboardPage() {
  const [rol, setRol] = useState<string | null>(null);
  const [trackers, setTrackers] = useState<TrackerData[]>([]);
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

          // 1. Cargar Radares
          const { data: trackersData } = await supabase
            .from("configuracion_rastreo")
            .select("id, nombre_rastreo, telegram_chat_id, activa")
            .eq("id_agencia", userData.id_agencia);

          if (trackersData) setTrackers(trackersData);

          // 2. Cargar Leads (Particulares) ordenados por el más reciente
          const { data: leadsData } = await supabase
            .from("propiedades_rastreadas")
            .select("*")
            .eq("id_agencia", userData.id_agencia)
            .order("created_at", { ascending: false });

          if (leadsData) setLeads(leadsData as LeadData[]);
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, [router, supabase]);

  const handleStatusChange = async (leadId: string, agencyId: string, newStatus: string) => {
    // Actualizamos optimísticamente la UI para que sea instantáneo
    setLeads(currentLeads => 
      currentLeads.map(lead => 
        lead.id_anuncio === leadId ? { ...lead, estado: newStatus } : lead
      )
    );
    // Ejecutamos la Server Action
    await updateLeadStatus(leadId, agencyId, newStatus);
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando tu imperio...</div>;

  const telegramBotUsername = "RadarPropTech_bot"; 
  const telegramLink = `https://t.me/${telegramBotUsername}?start=${selectedTrackerId}`;

  // Función de ayuda para los colores del estado
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'nuevo': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contactado': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'captado': return 'bg-green-100 text-green-800 border-green-200';
      case 'descartado': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel Principal</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona tus radares y tus captaciones.</p>
        </div>
        {rol === 'admin' && (
            <div className="text-xs font-bold uppercase text-yellow-500 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full">
              MODO DIOS
            </div>
        )}
      </div>

      {/* SECCIÓN 1: RADARES */}
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
                      {tracker.telegram_chat_id ? "Recibiendo alertas en Telegram." : "Falta conectar el grupo de Telegram."}
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
                    <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
                    Conectado
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECCIÓN 2: CRM DE LEADS */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Tus Leads (Particulares)</h2>

        {leads.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
            <p className="text-gray-500">Aún no hemos detectado ningún particular. El radar sigue escaneando...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-sm text-slate-500 uppercase tracking-wider">
                    <th className="p-4 font-medium">Inmueble</th>
                    <th className="p-4 font-medium">Precio</th>
                    <th className="p-4 font-medium">Contacto</th>
                    <th className="p-4 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => (
                    <tr key={lead.id_anuncio} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {lead.foto ? (
                            <img src={lead.foto} alt="Piso" className="w-12 h-12 rounded object-cover border border-gray-200" />
                          ) : (
                            <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center border border-gray-200">🏠</div>
                          )}
                          <div>
                            <p className="font-medium text-slate-900 line-clamp-1 max-w-[250px]" title={lead.titulo}>{lead.titulo}</p>
                            <a href={lead.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                              Ver en portal <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-900">
                        {lead.precio.toLocaleString('es-ES')} €
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md w-fit font-medium">
                          <Phone className="w-4 h-4 text-slate-500" />
                          {lead.telefono}
                        </div>
                      </td>
                      <td className="p-4">
                        <select 
                          value={lead.estado}
                          onChange={(e) => handleStatusChange(lead.id_anuncio, lead.id_agencia, e.target.value)}
                          className={`text-sm font-medium border rounded-full px-3 py-1 outline-none cursor-pointer appearance-none ${getStatusColor(lead.estado)}`}
                        >
                          <option value="nuevo">🟢 Nuevo</option>
                          <option value="contactado">🟡 Contactado</option>
                          <option value="captado">✅ Captado</option>
                          <option value="descartado">⚪ Descartado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL NATIVO TAILWIND --- */}
      {selectedTrackerId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative flex flex-col p-6 animate-in zoom-in-95 duration-200">
            <button onClick={() => setSelectedTrackerId(null)} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"><X className="w-5 h-5" /></button>
            <div className="text-center mb-6 mt-2">
              <h2 className="text-xl font-bold text-slate-900">Conecta tu Grupo</h2>
              <p className="text-gray-500 mt-2 text-sm">Escanea este código para vincular un chat de Telegram a esta zona específica.</p>
            </div>
            <div className="flex flex-col items-center space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <QRCodeSVG value={telegramLink} size={200} level={"H"} includeMargin={true} />
              </div>
              <div className="space-y-3 w-full px-2">
                <p className="text-sm font-medium flex gap-3 items-center text-slate-700"><span className="bg-[#0088cc] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">1</span> Abre la cámara o lector QR de tu móvil.</p>
                <p className="text-sm font-medium flex gap-3 items-center text-slate-700"><span className="bg-[#0088cc] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">2</span> Añade tu bot a un grupo y pega el enlace allí para tu equipo.</p>
                <p className="text-sm font-medium flex gap-3 items-center text-slate-700"><span className="bg-[#0088cc] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">3</span> Pulsa el botón <b className="text-slate-900">"INICIAR"</b>.</p>
              </div>
              <button onClick={() => window.location.reload()} className="w-full mt-2 bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors">
                Ya lo he conectado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}