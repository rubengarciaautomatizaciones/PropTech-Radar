// artifacts/radar-proptech/proxy.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // ----- LA CORRECCIÓN ESTÁ AQUÍ -----
              // La petición (request) solo necesita el nombre y el valor.
              request.cookies.set(name, value)
              // La respuesta (response) necesita todo para enviarlo al navegador.
              supabaseResponse.cookies.set(name, value, options)
            })
          } catch (e) {
            // Ignorar errores
          }
        },
      },
    }
  )

  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /callback (LA RUTA DE AUTENTICACIÓN)
     * - api (RUTAS PÚBLICAS PARA WEBHOOKS DE STRIPE, TELEGRAM, ETC)
     */
    '/((?!_next/static|_next/image|favicon.ico|callback|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}