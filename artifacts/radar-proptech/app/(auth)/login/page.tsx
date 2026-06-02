// artifacts/radar-proptech/app/(auth)/login/page.tsx
import { signIn } from "../actions/login";

export default async function LoginPage({ searchParams }: { searchParams: { message?: string, email?: string } }) {
  // En Next.js 15, searchParams es asíncrono
  const params = await searchParams;

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Iniciar Sesión</h1>
        <p className="text-gray-500 mt-2">Accede a tu panel de KAVOX</p>
      </div>

      {params.message && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center">
          {params.message}
        </div>
      )}

      <form action={signIn} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
            Correo Electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={params.email || ""} // <-- AQUÍ PRE-RELLENAMOS EL EMAIL
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kavox-accent focus:border-transparent outline-none"
            placeholder="tu@agencia.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kavox-accent focus:border-transparent outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-kavox-body text-white font-semibold py-3 rounded-lg hover:bg-black transition-colors"
        >
          Acceder
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        ¿No tienes cuenta? <a href="/signup" className="text-kavox-accent font-semibold hover:underline">Regístrate</a>
      </div>
    </div>
  );
}