// artifacts/radar-proptech/app/(auth)/callback/route.ts

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server' // <-- USAMOS NUESTRO HELPER!

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    // Creamos el cliente de la forma correcta y centralizada
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Si algo falla, redirigir a una página de error
  console.error('ERROR: Invalid code in auth callback');
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}