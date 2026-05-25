export default function ConfigPage() {
  return (
    <div className="max-w-2xl bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h1 className="text-2xl font-bold mb-4">Configuración de Rastreo</h1>
      <p className="text-gray-600 mb-6">Pega aquí la URL de los resultados de búsqueda de Idealista que quieres monitorizar.</p>
      
      <form action="/api/config/update" method="POST" className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">URL de Idealista</label>
          <input 
            type="url" 
            name="idealistaUrl" 
            required
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="https://www.idealista.com/..."
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Guardar Configuración
        </button>
      </form>
    </div>
  );
}
