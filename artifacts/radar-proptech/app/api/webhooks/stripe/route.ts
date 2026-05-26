import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Al leer el body, usamos la variable 'request' y ESLint deja de dar error.
    // Además, necesitaremos este body más adelante para la firma de Stripe.
    const body = await request.text(); 

    console.log("Webhook de Stripe recibido. Tamaño del body:", body.length);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: unknown) {
    // Cambiamos 'any' por 'unknown' por seguridad, y verificamos si es una instancia de Error
    const errorMessage = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }
}