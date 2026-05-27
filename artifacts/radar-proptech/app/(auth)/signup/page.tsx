// artifacts/radar-proptech/app/(auth)/signup/page.tsx

import { headers } from "next/headers"; // ¡¡AÑADE ESTE IMPORT!!
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SignUpPage(props: { searchParams: { message: string } }) {
  const searchParams = await props.searchParams;
  const message = searchParams.message;

  const signUp = async (formData: FormData) => {
    "use server";

    // Obtenemos la URL base de la petición (ej: https://prop-tech-radar.vercel.app)
    const origin = (await headers()).get("origin"); // <--- ¡¡AQUÍ ESTÁ LA CORRECCIÓN!!

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const agencyName = formData.get("agencyName") as string;

    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Le decimos a Supabase la dirección exacta de la fiesta.
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          agency_name: agencyName,
        },
      },
    });

    if (error) {
      return redirect("/signup?message=" + error.message);
    }

    return redirect("/verify-email");
  };