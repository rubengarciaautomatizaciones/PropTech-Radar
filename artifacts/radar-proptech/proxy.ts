// artifacts/radar-proptech/proxy.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Cambiamos el nombre de la función exportada a 'proxy'
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
              request.cookies.set(name, value)
              supabaseResponse.cookies.set(name, value, options)
            })
          } catch (e) {
            // Ignorar errores en lectura
          }
        },
      },
    }
  )

  // Autenticamos la sesión actual
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/verify-email');
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // 1. Si no hay usuario y quiere entrar al dashboard -> Al login
  if (isDashboardRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Si hay usuario y quiere entrar a rutas de auth -> Al dashboard
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Ignora archivos estáticos, imágenes, favicon y webhooks (api)
     */
    '/((?!_next/static|_next/image|favicon.ico|callback|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}