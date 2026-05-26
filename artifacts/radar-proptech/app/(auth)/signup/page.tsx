import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SignUpPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams;
  const message = searchParams.message;

  const signUp = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const agencyName = formData.get("agencyName") as string;

    const supabase = await createClient();

    // Supabase creará el usuario y guardará el nombre de la agencia en los metadatos
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          agency_name: agencyName,
        },
      },
    });

    if (error) {
      return redirect("/signup?message=" + error.message);
    }

    // REDIRECCIÓN CORREGIDA: Ahora envía al usuario a la página de verificación
    return redirect("/verify-email");
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Crear Agencia</h1>
        <p className="text-gray-500 mt-2">Empieza tu trial de 3 días en Radar PropTech</p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center">
          {message}
        </div>
      )}

      <form action={signUp} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="agencyName">
            Nombre de la Inmobiliaria
          </label>
          <input
            id="agencyName"
            name="agencyName"
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            placeholder="Ej. Fincas Madrid"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
            Correo Electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Registrar Agencia
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta? <a href="/login" className="text-blue-600 font-semibold hover:underline">Inicia sesión</a>
      </div>
    </div>
  );
}