// artifacts/radar-proptech/app/(auth)/signup/page.tsx
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SignUpPage(props: { searchParams: { message: string } }) {
  const searchParams = await props.searchParams;
  const message = searchParams.message;

  const signUp = async (formData: FormData) => {
    "use server";
    const origin = (await headers()).get("origin");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const agencyName = formData.get("agencyName") as string;
    const fullName = formData.get("fullName") as string;

    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/callback`,
        data: {
          agency_name: agencyName,
          full_name: fullName, // Guardamos el nombre del CEO en los metadatos
        },
      },
    });

    if (error) {
      return redirect("/signup?message=" + error.message);
    }
    return redirect("/verify-email");
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Crear Agencia</h1>
        <p className="text-gray-500 mt-2">Empieza tu trial de 3 días en KAVOX</p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center">
          {message}
        </div>
      )}

      <form action={signUp} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
            Tu Nombre (Administrador)
          </label>
          <input
            id="fullName" name="fullName" type="text" required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kavox-accent focus:border-transparent outline-none"
            placeholder="Ej. Rubén García"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="agencyName">
            Nombre de la Inmobiliaria
          </label>
          <input
            id="agencyName" name="agencyName" type="text" required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kavox-accent focus:border-transparent outline-none"
            placeholder="Ej. Fincas Madrid"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
            Correo Electrónico Profesional
          </label>
          <input
            id="email" name="email" type="email" required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kavox-accent focus:border-transparent outline-none"
            placeholder="gerencia@agencia.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password" name="password" type="password" required minLength={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kavox-accent focus:border-transparent outline-none"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-kavox-body text-white font-semibold py-3 rounded-lg hover:bg-black transition-colors mt-2"
        >
          Registrar Agencia
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta? <a href="/login" className="text-kavox-accent font-semibold hover:underline">Inicia sesión</a>
      </div>
    </div>
  );
}