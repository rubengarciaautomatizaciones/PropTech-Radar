"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Smartphone, X, MapPin, ExternalLink, Phone, FileText, Loader2, Download } from "lucide-react";
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
  m2: number | null;
  habitaciones: number | null;
  banos: number | null;
  planta: string | null;
  direccion: string | null;
  pdf_cma_url: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const [rol, setRol] = useState<string | null>(null);
  const [trackers, setTrackers] = useState<TrackerData[]>([]);
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrackerId, setSelectedTrackerId] = useState<string | null>(null);
  const [processingPdf, setProcessingPdf] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: userData } = await supabase.from("usuarios").select("id_agencia, rol").eq("id_usuario", user.id).single();

      if (userData) {
        setRol(userData.rol);
        if (!userData.id_agencia && userData.rol !== 'admin') {
          router.push("/dashboard/config");
        } else if (userData.id_agencia) {
          const { data: trackersData } = await supabase.from("configuracion_rastreo").select("id, nombre_rastreo, telegram_chat_id, activa").eq("id_agencia", userData.id_agencia);
          if (trackersData) setTrackers(trackersData);

          const { data: leadsData } = await supabase.from("propiedades_rastreadas").select("*").eq("id_agencia", userData.id_agencia).order("created_at", { ascending: false });
          if (leadsData) setLeads(leadsData as LeadData[]);
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, [router, supabase]);

  const handleStatusChange = async (leadId: string, agencyId: string, newStatus: string) => {
    setLeads(currentLeads => currentLeads.map(lead => lead.id_anuncio === leadId ? { ...lead, estado: newStatus } : lead));
    await updateLeadStatus(leadId, agencyId, newStatus);
  };

  const handleGeneratePDF = async (lead: LeadData) => {
    // Función auxiliar para forzar la descarga segura saltándose el bloqueador de popups
    const triggerDownload = (url: string) => {
      const link = document.createElement('a');
      // Supabase fuerza la descarga si le pasamos este parámetro
      const downloadUrl = url.includes('?') ? `${url}&download=` : `${url}?download=`;
      link.href = downloadUrl;
      link.setAttribute('download', `Dossier_CMA_${lead.id_anuncio}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // Si ya existe, forzamos la descarga directamente
    if (lead.pdf_cma_url) {
      triggerDownload(lead.pdf_cma_url);
      return;
    }

    setProcessingPdf(lead.id_anuncio);
    try {
      const res = await fetch("/api/cma/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_anuncio: lead.id_anuncio, id_agencia: lead.id_agencia })
      });
      const data = await res.json();

      if (data.success && data.url) {
        setLeads(current => current.map(l => l.id_anuncio === lead.id_anuncio ? { ...l, pdf_cma_url: data.url } : l));
        // Forzamos la descarga del PDF recién creado
        triggerDownload(data.url); 
      } else {
        alert("Error generando el documento.");
      }
    } catch (e) {
      console.error(e);
      alert("Error de red.");
    } finally {
      setProcessingPdf(null);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando tu imperio...</div>;

  const telegramBotUsername = "RadarPropTech_bot"; 
  const telegramLink = `https://t.me/${telegramBotUsername}?start=${selectedTrackerId}`;

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

      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel Principal</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona tus radares y tus captaciones en tiempo real.</p>
        </div>
        {rol === 'admin' && (
            <div className="text-xs font-bold uppercase text-kavox-accent bg-kavox-accent/10 border border-kavox-accent/20 px-3 py-1 rounded-full">
              ADMINISTRADOR
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
                  <div className={`p-3 rounded-full ${tracker.telegram_chat_id ? 'bg-kavox-accent/10 text-kavox-accent' : 'bg-orange-100 text-orange-600'}`}>
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{tracker.nombre_rastreo}</h3>
                    <p className="text-sm text-gray-500">
                      {tracker.telegram_chat_id ? "Enviando alertas directas a Telegram." : "Falta conectar el grupo de Telegram."}
                    </p>
                  </div>
                </div>

                {!tracker.telegram_chat_id ? (
                  <button onClick={() => setSelectedTrackerId(tracker.id)} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <Smartphone className="w-4 h-4" /> Conectar Grupo
                  </button>
                ) : (
                  <div className="bg-kavox-accent/10 text-kavox-accent border border-kavox-accent/20 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
                    <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kavox-accent opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-kavox-accent"></span></span>
                    Conectado
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Tus Leads (Particulares)</h2>

        {leads.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
            <p className="text-gray-500">El radar sigue escaneando. Aún no se han detectado particulares nuevos.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-sm text-slate-500 uppercase tracking-wider">
                    <th className="p-4 font-medium">Inmueble & Detalles</th>
                    <th className="p-4 font-medium">Contacto</th>
                    <th className="p-4 font-medium">Estado</th>
                    <th className="p-4 font-medium text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => (
                    <tr key={lead.id_anuncio} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-start gap-4">
                          {lead.foto ? (
                            <img src={lead.foto} alt="Inmueble" className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0" />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">🏠</div>
                          )}
                          <div className="flex flex-col">
                            <a href={lead.url} target="_blank" rel="noreferrer" className="font-bold text-slate-900 line-clamp-1 max-w-[300px] hover:text-kavox-accent flex items-center gap-1.5" title={lead.titulo}>
                              {lead.titulo} <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                            </a>
                            <div className="text-kavox-accent font-bold mt-1 text-sm">{lead.precio.toLocaleString('es-ES')} €</div>
                            <div className="flex gap-2 text-xs text-gray-500 mt-1 font-medium">
                              {lead.m2 && <span className="bg-gray-100 px-2 py-0.5 rounded">{lead.m2} m²</span>}
                              {lead.habitaciones && <span className="bg-gray-100 px-2 py-0.5 rounded">{lead.habitaciones} Hab.</span>}
                              {lead.planta && <span className="bg-gray-100 px-2 py-0.5 rounded">Plta. {lead.planta}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-2 text-slate-800 bg-slate-100 px-3 py-1.5 rounded-md w-fit font-bold text-sm">
                            <Phone className="w-4 h-4 text-slate-500" /> {lead.telefono}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <select 
                          value={lead.estado}
                          onChange={(e) => handleStatusChange(lead.id_anuncio, lead.id_agencia, e.target.value)}
                          className={`text-sm font-bold border rounded-full px-3 py-1.5 outline-none cursor-pointer appearance-none ${getStatusColor(lead.estado)}`}
                        >
                          <option value="nuevo">🟢 Nuevo</option>
                          <option value="contactado">🟡 Contactado</option>
                          <option value="captado">✅ Captado</option>
                          <option value="descartado">⚪ Descartado</option>
                        </select>
                      </td>
                      <td className="p-4 align-top text-center">
                        <button
                          onClick={() => handleGeneratePDF(lead)}
                          disabled={processingPdf === lead.id_anuncio}
                          className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm
                            ${lead.pdf_cma_url 
                              ? 'bg-kavox-surface border border-gray-200 text-slate-700 hover:bg-gray-100' 
                              : 'bg-kavox-accent text-white hover:bg-teal-700'
                            } disabled:opacity-70`}
                        >
                          {processingPdf === lead.id_anuncio ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                          ) : lead.pdf_cma_url ? (
                            <><Download className="w-4 h-4" /> PDF Guardado</>
                          ) : (
                            <><FileText className="w-4 h-4" /> Generar Dossier</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL TELEGRAM */}
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
                <p className="text-sm font-medium flex gap-3 items-center text-slate-700"><span className="bg-kavox-accent text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">1</span> Abre la cámara o lector QR de tu móvil.</p>
                <p className="text-sm font-medium flex gap-3 items-center text-slate-700"><span className="bg-kavox-accent text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">2</span> Añade tu bot a un grupo y pega el enlace allí para tu equipo.</p>
                <p className="text-sm font-medium flex gap-3 items-center text-slate-700"><span className="bg-kavox-accent text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">3</span> Pulsa el botón <b className="text-slate-900">"INICIAR"</b>.</p>
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