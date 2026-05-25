import { createClient } from "@/utils/supabase/server";
import { Building2, ExternalLink, AlertCircle } from "lucide-react";

type PropiedadRastreada = {
  id: string | number;
  direccion?: string;
  precio?: number | string;
  tipo_propiedad?: string;
  estado?: string;
  fecha_rastreada?: string;
  url_fuente?: string;
  [key: string]: unknown;
};

function formatPrecio(precio: number | string | undefined): string {
  if (precio == null) return "—";
  const num = typeof precio === "string" ? parseFloat(precio) : precio;
  if (isNaN(num)) return String(precio);
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatFecha(fecha: string | undefined): string {
  if (!fecha) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(fecha));
}

export default async function DashboardPage(props: {
  searchParams: Promise<{ success?: string }>;
}) {
  const searchParams = await props.searchParams;
  const showPopup = searchParams.success === "config_saved";

  const supabase = await createClient();
  const { data: propiedades, error } = await supabase
    .from("propiedades_rastreadas")
    .select("*")
    .order("fecha_rastreada", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      {/* Notificación de éxito */}
      {showPopup && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium">
          ¡Configuración guardada correctamente!
        </div>
      )}

      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel Principal</h1>
          <p className="text-sm text-slate-500 mt-1">
            Propiedades rastreadas en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-sm">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-semibold text-slate-700">
            {propiedades?.length ?? 0} propiedades
          </span>
        </div>
      </div>

      {/* Error de Supabase */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>
            Error al cargar propiedades:{" "}
            <span className="font-medium">{error.message}</span>
          </span>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {!propiedades || propiedades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Building2 className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-sm font-medium">No hay propiedades rastreadas aún</p>
            <p className="text-xs mt-1">
              Configura una URL en{" "}
              <a href="/dashboard/config" className="text-indigo-600 hover:underline">
                Configuración
              </a>
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left">
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Dirección
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Precio
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Tipo
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Estado
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Fecha
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Fuente
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(propiedades as PropiedadRastreada[]).map((p) => (
                  <tr
                    key={String(p.id)}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-4 font-medium text-slate-800 max-w-xs truncate">
                      {p.direccion ?? <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-semibold tabular-nums">
                      {formatPrecio(p.precio as number | string | undefined)}
                    </td>
                    <td className="px-5 py-4">
                      {p.tipo_propiedad ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                          {String(p.tipo_propiedad)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {p.estado ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            String(p.estado).toLowerCase() === "activa"
                              ? "bg-green-50 text-green-700"
                              : String(p.estado).toLowerCase() === "vendida"
                              ? "bg-slate-100 text-slate-500"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {String(p.estado)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-500 tabular-nums">
                      {formatFecha(p.fecha_rastreada)}
                    </td>
                    <td className="px-5 py-4">
                      {p.url_fuente ? (
                        <a
                          href={String(p.url_fuente)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Ver
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
