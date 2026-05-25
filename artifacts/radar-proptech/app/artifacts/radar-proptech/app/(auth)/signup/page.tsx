export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-4 border rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Registro de Agencia</h1>
        <p className="text-center text-sm text-gray-600">
          Crea tu cuenta para empezar el trial de 3 días.
        </p>
        {/* Aquí irá tu formulario */}
        <form className="space-y-4">
          <input 
            type="email" 
            placeholder="tu@inmobiliaria.com" 
            className="w-full p-2 border rounded"
            required 
          />
          <button 
            type="submit" 
            className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}
