// artifacts/radar-proptech/app/api/webhooks/telegram/route.ts
import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const runtime = 'edge';

function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.message || !body.message.text) {
      return NextResponse.json({ status: "ignored" });
    }

    const chatId = body.message.chat.id;
    const text = body.message.text as string;

    // Telegram envía "/start ID_DEL_RASTREADOR" (nuestra nueva arquitectura)
    if (text.startsWith('/start ')) {
      const trackerId = text.split(' ')[1];
      const supabaseAdmin = getSupabaseAdmin();

      // Actualizamos la tabla de CONFIGURACION_RASTREO con el chat de Telegram
      const { error } = await supabaseAdmin
        .from('configuracion_rastreo')
        .update({ telegram_chat_id: chatId.toString() })
        .eq('id', trackerId);

      if (error) {
        console.error("Error DB:", error);
        return NextResponse.json({ success: false }); 
      }

      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: "✅ ¡Rastreador vinculado con éxito!\n\nEste chat empezará a recibir alertas de propiedades inmediatamente."
        })
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error en Webhook:", error);
    return NextResponse.json({ success: false });
  }
}