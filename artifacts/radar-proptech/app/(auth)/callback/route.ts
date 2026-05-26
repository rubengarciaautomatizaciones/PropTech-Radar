// artifacts/radar-proptech/app/auth/callback/route.ts

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Esta es una ruta GET, ya que el usuario llega haciendo clic en un enlace.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 'next' es una buena práctica para redirigir al usuario a donde quería ir.
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )

    // Usamos el código para obtener una sesión de usuario válida
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Si todo va bien, redirigimos al usuario al dashboard (o a 'next')
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Si hay un error o no hay código, lo mandamos a una página de error
  console.error('Error exchanging code for session or code not found');
  return NextResponse.redirect(`${origin}/auth/auth-code-error`) // Es buena idea crear esta página de error
}