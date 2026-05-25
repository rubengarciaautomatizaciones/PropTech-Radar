import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  
  if (code) {
    // Aquí implementaremos el intercambio del código por la sesión de Supabase
    console.log("Código de autenticación recibido");
  }

  // Redirigir al dashboard de forma segura
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
