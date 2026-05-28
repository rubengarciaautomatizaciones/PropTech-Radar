// artifacts/radar-proptech/app/(auth)/actions/login.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Si hay un error, redirigimos de vuelta al login con un mensaje de error
    return redirect(`/login?message=Error: ${error.message}`);
  }

  // Si el login es exitoso, redirigimos al dashboard
  return redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/login");
}