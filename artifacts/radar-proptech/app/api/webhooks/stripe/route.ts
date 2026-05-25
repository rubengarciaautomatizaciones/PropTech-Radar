import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Aquí validaremos la firma criptográfica de Stripe
    console.log("Webhook de Stripe recibido");
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
}
