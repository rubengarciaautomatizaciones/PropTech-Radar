import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Autenticación
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Verificamos la agencia
  const { data: userData } = await supabase
    .from("usuarios")
    .select("id_agencia")
    .eq("id_usuario", user.id)
    .single();

  if (!userData?.id_agencia) {
    redirect("/dashboard/config"); // Si no tiene agencia, al Wizard
  }

  // 3. Simulación de datos (hasta que conectemos la DB real)
  const stats = { totalLeads: 14, nuevosHoy: 3, alertasActivas: 1 };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel Principal</h1>
          <p className="text-gray-500 text-sm mt-1">Bienvenido a tu radar de captación.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full font-medium text-sm border border-green-200">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Rastreador Activo
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 className="text-gray-500 text-sm font-medium">Leads Totales</h3>
          <p className="text-4xl font-extrabold text-slate-900 mt-2">{stats.totalLeads}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 className="text-gray-500 text-sm font-medium">Nuevos Hoy</h3>
          <p className="text-4xl font-extrabold text-blue-600 mt-2">+{stats.nuevosHoy}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 className="text-gray-500 text-sm font-medium">Alertas Activas</h3>
          <p className="text-4xl font-extrabold text-slate-900 mt-2">{stats.alertasActivas}</p>
        </div>
      </div>

      {/* CRM Básico - Tabla de Leads */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-slate-900">Últimos Anuncios Detectados</h2>
        </div>
        <div className="p-12 text-center text-gray-500">
          <div className="text-5xl mb-4 opacity-50">📡</div>
          <p className="text-lg font-medium text-slate-700">Buscando propiedades nuevas...</p>
          <p className="text-sm mt-2 max-w-md mx-auto">Tu bot está analizando Idealista. Los nuevos leads aparecerán aquí automáticamente en cuanto se publiquen.</p>
        </div>
      </div>
    </div>
  );
}