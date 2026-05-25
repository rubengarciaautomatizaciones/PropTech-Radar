import { updateIdealistaUrl } from "./actions";

export default function ConfigPage() {
  return (
    <div className="max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-slate-900">Configuración de Rastreo</h1>

      <form action={updateIdealistaUrl} className="space-y-6">
        <div>
          <label htmlFor="idealistaUrl" className="block text-sm font-medium text-gray-700 mb-2">
            URL de Idealista
          </label>
          <input 
            id="idealistaUrl"
            type="url" 
            name="idealistaUrl" 
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
            placeholder="https://www.idealista.com/venta-viviendas/madrid/..."
          />
          <p className="text-sm text-gray-500 mt-2">
            Pega el enlace de los resultados de búsqueda que quieres monitorizar.
          </p>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Guardar Configuración
        </button>
      </form>
    </div>
  );
}