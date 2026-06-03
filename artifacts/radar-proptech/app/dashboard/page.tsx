// artifacts/radar-proptech/app/dashboard/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Smartphone, X, ExternalLink, Loader2, TrendingUp, Wallet, Crosshair, Calendar, ArrowUpDown, ArrowUp, ArrowDown, CheckCircle2, Copy } from "lucide-react";
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
  origen_rastreo: string | null; // <--- NUEVO CAMPO AÑADIDO
  created_at: string;
};

type SortConfig = { key: 'created_at' | 'precio'; dir: 'asc' | 'desc' };

export default function DashboardPage() {
  const [rol, setRol] = useState<string | null>(null);
  const [trackers, setTrackers] = useState<TrackerData[]>([]);
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Telegram
  const [selectedTrackerId, setSelectedTrackerId] = useState<string | null>(null);
  const [copiedCommand, setCopiedCommand] = useState(false);

  const [processingPdf, setProcessingPdf] = useState<string | null>(null);

  // Vistas CRM
  const [activeTab, setActiveTab] = useState<string>('todos');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', dir: 'desc' });

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
    const triggerDownload = (url: string) => {
      const link = document.createElement('a');
      const downloadUrl = url.includes('?') ? `${url}&download=` : `${url}?download=`;
      link.href = downloadUrl;
      link.setAttribute('download', `Dossier_CMA_${lead.id_anuncio}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    if (lead.pdf_cma_url) return triggerDownload(lead.pdf_cma_url);

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
        triggerDownload(data.url); 
      } else alert("Error generando el documento.");
    } catch (e) {
      alert("Error de red.");
    } finally {
      setProcessingPdf(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  // --- LÓGICA DE ORDENACIÓN Y FILTRADO ---
  const handleSort = (key: 'created_at' | 'precio') => {
    setSortConfig(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc'
    }));
  };

  const SortIcon = ({ columnKey }: { columnKey: 'created_at' | 'precio' }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 inline-block ml-1 opacity-40 hover:opacity-100" />;
    return sortConfig.dir === 'asc' 
      ? <ArrowUp className="w-3 h-3 inline-block ml-1 text-kavox-accent" /> 
      : <ArrowDown className="w-3 h-3 inline-block ml-1 text-kavox-accent" />;
  };

  const filteredAndSortedLeads = useMemo(() => {
    let result = [...leads];
    if (activeTab !== 'todos') result = result.filter(l => l.estado === activeTab);

    return result.sort((a, b) => {
      if (sortConfig.key === 'precio') {
        return sortConfig.dir === 'asc' ? (a.precio || 0) - (b.precio || 0) : (b.precio || 0) - (a.precio || 0);
      } else {
        const dA = new Date(a.created_at).getTime();
        const dB = new Date(b.created_at).getTime();
        return sortConfig.dir === 'asc' ? dA - dB : dB - dA;
      }
    });
  }, [leads, activeTab, sortConfig]);

  // --- KPIs (MÉTRICAS) ---
  const kpis = useMemo(() => {
    const total = leads.length;
    const captados = leads.filter(l => l.estado === 'captado').length;
    const rate = total > 0 ? Math.round((captados / total) * 100) : 0;
    const pipeline = leads.filter(l => l.estado === 'nuevo' || l.estado === 'contactado').reduce((acc, l) => acc + (l.precio || 0), 0);
    const todayStr = new Date().toDateString();
    const hoy = leads.filter(l => new Date(l.created_at).toDateString() === todayStr).length;

    return { total, rate, pipeline, hoy };
  }, [leads]);

  const currencyFormatter = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

  if (isLoading) return <div className="h-full flex items-center justify-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'nuevo': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contactado': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'captado': return 'bg-green-100 text-green-800 border-green-200';
      case 'descartado': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'todos', label: 'Todos' },
    { id: 'nuevo', label: 'Nuevos' },
    { id: 'contactado', label: 'Contactados' },
    { id: 'captado', label: 'Captados' },
    { id: 'descartado', label: 'Descartados' },
  ];

  return (
    <div className="flex flex-col h-full p-6 gap-6 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">

      {/* 1. HEADER (Botones Superiores) */}
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CRM de Captación</h1>
          <p className="text-gray-500 text-sm mt-1">Intercepción en tiempo real y gestión del embudo.</p>
        </div>
        <div className="flex items-center gap-3">
          {trackers.map(t => 
            !t.telegram_chat_id ? (
             <button key={t.id} onClick={() => setSelectedTrackerId(t.id)} className="bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm">
               <Smartphone className="w-3.5 h-3.5" /> Conectar {t.nombre_rastreo}
             </button>
            ) : (
              <div key={t.id} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" /> {t.nombre_rastreo}
              </div>
            )
          )}
          {rol === 'admin' && (
            <div className="text-xs font-bold uppercase text-kavox-accent bg-kavox-accent/10 border border-kavox-accent/20 px-3 py-1.5 rounded-full ml-2">ADMINISTRADOR</div>
          )}
        </div>
      </div>

      {/* 2. TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-gray-500 mb-2"><span className="text-xs font-semibold uppercase">Total Leads</span><Crosshair className="w-4 h-4" /></div>
          <span className="text-2xl font-bold text-slate-900">{kpis.total}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-gray-500 mb-2"><span className="text-xs font-semibold uppercase">Tasa Captación</span><TrendingUp className="w-4 h-4" /></div>
          <span className="text-2xl font-bold text-slate-900">{kpis.rate}%</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-gray-500 mb-2"><span className="text-xs font-semibold uppercase">Valor Pipeline</span><Wallet className="w-4 h-4" /></div>
          <span className="text-2xl font-bold text-kavox-accent truncate">{currencyFormatter.format(kpis.pipeline)}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-gray-500 mb-2"><span className="text-xs font-semibold uppercase">Leads Hoy</span><Calendar className="w-4 h-4" /></div>
          <span className="text-2xl font-bold text-slate-900">{kpis.hoy}</span>
        </div>
      </div>

      {/* 3. PESTAÑAS (TABS) */}
      <div className="flex gap-6 border-b border-gray-200 shrink-0 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-semibold capitalize whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-kavox-accent text-kavox-body' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
          >
            {tab.label} <span className="ml-1.5 px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-500">{tab.id === 'todos' ? leads.length : leads.filter(l => l.estado === tab.id).length}</span>
          </button>
        ))}
      </div>

      {/* 4. TABLA COMPACTA CON SCROLL INDEPENDIENTE */}
      <div className="flex-1 min-h-0 bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="sticky top-0 bg-slate-50 shadow-[0_1px_0_0_#e5e7eb] z-10">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-500 w-12">Foto</th>
                <th className="px-4 py-3 font-semibold text-gray-500 max-w-[200px]">Inmueble</th>
                <th className="px-4 py-3 font-semibold text-gray-500">Radar</th>
                <th className="px-4 py-3 font-semibold text-gray-500 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('precio')}>
                  Precio <SortIcon columnKey="precio" />
                </th>
                <th className="px-4 py-3 font-semibold text-gray-500 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('created_at')}>
                  Detectado <SortIcon columnKey="created_at" />
                </th>
                <th className="px-4 py-3 font-semibold text-gray-500">Teléfono</th>
                <th className="px-4 py-3 font-semibold text-gray-500">Estado</th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAndSortedLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">No hay leads en esta vista.</td>
                </tr>
              ) : (
                filteredAndSortedLeads.map((lead) => (
                  <tr key={lead.id_anuncio} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-2">
                      {lead.foto ? (
                        <img 
                          src={`https://wsrv.nl/?url=${encodeURIComponent(lead.foto)}&w=100&h=100&fit=cover`} 
                          alt="Inmueble" 
                          className="w-10 h-10 rounded-md object-cover border border-gray-200"
                          referrerPolicy="no-referrer" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center border border-gray-200 text-lg">🏠</div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col w-[250px]">
                        <a href={lead.url} target="_blank" rel="noreferrer" className="font-bold text-slate-800 truncate hover:text-kavox-accent flex items-center gap-1" title={lead.titulo}>
                          {lead.titulo} <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
                        </a>
                        <div className="flex gap-1.5 text-[11px] text-gray-500 mt-0.5">
                          {lead.m2 && <span>{lead.m2} m² •</span>}
                          {lead.habitaciones && <span>{lead.habitaciones} Hab •</span>}
                          {lead.planta && <span>Plta. {lead.planta}</span>}
                        </div>
                      </div>
                    </td>
                    {/* NUEVA COLUMNA DE RADAR */}
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 truncate max-w-[120px]" title={lead.origen_rastreo || "General"}>
                        {lead.origen_rastreo || "General"}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-bold text-kavox-accent">{currencyFormatter.format(lead.precio || 0)}</td>
                    <td className="px-4 py-2 text-xs text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}
                    </td>
                    <td className="px-4 py-2 font-mono font-semibold text-slate-700">{lead.telefono}</td>
                    <td className="px-4 py-2">
                      <select 
                        value={lead.estado}
                        onChange={(e) => handleStatusChange(lead.id_anuncio, lead.id_agencia, e.target.value)}
                        className={`text-xs font-bold border rounded-full px-2.5 py-1 outline-none cursor-pointer appearance-none ${getStatusColor(lead.estado)}`}
                      >
                        <option value="nuevo">🟢 Nuevo</option>
                        <option value="contactado">🟡 Contactado</option>
                        <option value="captado">✅ Captado</option>
                        <option value="descartado">⚪ Descartado</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleGeneratePDF(lead)}
                        disabled={processingPdf === lead.id_anuncio}
                        className={`w-full text-xs font-semibold py-1.5 px-3 rounded-md transition-all border
                          ${lead.pdf_cma_url 
                            ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50' 
                            : 'bg-kavox-accent/10 border-kavox-accent/20 text-kavox-accent hover:bg-kavox-accent hover:text-white'
                          } disabled:opacity-50`}
                      >
                        {processingPdf === lead.id_anuncio ? "Cargando..." : lead.pdf_cma_url ? "Ver CMA" : "+ Crear CMA"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TELEGRAM OPTIMIZADO */}
      {selectedTrackerId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative flex flex-col p-8 animate-in zoom-in-95 duration-200">
            <button onClick={() => setSelectedTrackerId(null)} className="absolute top-4 right-4 text-gray-400 hover:text-slate-800"><X className="w-5 h-5" /></button>

            <div className="text-center mb-6">
              <div className="bg-kavox-accent/10 text-kavox-accent w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Activar Alertas Push</h2>
              <p className="text-gray-500 mt-1 text-sm">Conecta este radar a un grupo de Telegram en 3 sencillos pasos.</p>
            </div>

            <div className="space-y-5">
              <div className="flex gap-3 items-start">
                <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">1</span> 
                <p className="text-sm font-medium text-slate-700">Abre Telegram y crea un <strong>Nuevo Grupo</strong> exclusivo para esta zona (Ej: "Radar Madrid"). Añade a los comerciales que trabajarán estos leads.</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">2</span> 
                <p className="text-sm font-medium text-slate-700">Añade a nuestro robot a ese grupo. Búscalo como: <strong className="text-kavox-accent select-all">@KavoxAlertas_bot</strong> <br/><span className="text-xs text-gray-500">(Otórgale permisos de administrador si te lo pide).</span></p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">3</span> 
                <div className="text-sm font-medium text-slate-700 w-full">Copia este comando y envíalo como un mensaje dentro de ese grupo:

                  <div className="mt-2 bg-slate-50 border border-slate-200 p-1.5 pl-3 rounded-lg flex items-center justify-between">
                    <code className="text-xs font-mono text-slate-800 truncate">/start {selectedTrackerId}</code>
                    <button 
                      onClick={() => copyToClipboard(`/start ${selectedTrackerId}`)}
                      className="bg-white border border-gray-200 p-2 rounded-md hover:bg-gray-50 transition-colors"
                      title="Copiar Comando"
                    >
                      {copiedCommand ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                    </button>
                  </div>
                </div>
              </div>

              <button onClick={() => window.location.reload()} className="w-full mt-4 bg-kavox-body text-white py-3 rounded-lg font-semibold hover:bg-black transition-colors shadow-lg">
                Ya he enviado el comando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}