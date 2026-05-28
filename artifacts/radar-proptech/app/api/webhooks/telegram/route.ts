// artifacts/radar-proptech/app/api/webhooks/telegram/route.ts
import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// ¡¡ESTO ES LA CLAVE DE LA VELOCIDAD EXTREMA!!
// Obligamos a Vercel a ejecutar esto en la red Edge global, sin Cold Starts de Node.js
export const runtime = 'edge';

// El cliente se instancia dentro porque en Edge no se pueden tener globales con variables de entorno a veces
function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Ignorar si no es texto
    if (!body.message || !body.message.text) {
      return NextResponse.json({ status: "ignored" });
    }

    const chatId = body.message.chat.id;
    const text = body.message.text as string;

    if (text.startsWith('/start ')) {
      const userId = text.split(' ')[1];
      const supabaseAdmin = getSupabaseAdmin();

      // 1. Guardamos en la base de datos (ESPERAMOS A QUE TERMINE)
      const { error } = await supabaseAdmin
        .from('usuarios')
        .update({ telegram_chat_id: chatId.toString() })
        .eq('id_usuario', userId);

      if (error) {
        console.error("Error DB:", error);
        // Devolvemos 200 a Telegram para que deje de molestar, aunque falle la DB
        return NextResponse.json({ success: false }); 
      }

      // 2. Enviamos el mensaje a Telegram (ESPERAMOS A QUE TERMINE)
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: "✅ ¡Conexión exitosa! Tu cuenta de Radar PropTech está vinculada.\n\nA partir de ahora, cuando el rastreador detecte un nuevo piso, te lo enviaré por aquí instantáneamente."
        })
      });

      // 3. Devolvemos el OK a Telegram. 
      // Todo esto ha pasado en el Edge (milisegundos). Telegram no reintentará.
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error en Webhook:", error);
    return NextResponse.json({ success: false });
  }
}