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
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    // Telegram envía "/start ID_DEL_RASTREADOR"
    if (text.startsWith('/start ')) {

      // 🛡️ ESCUDO ANTI-CHATS PRIVADOS
      // En Telegram, los IDs de chats privados son positivos. Los grupos son negativos.
      if (chatId > 0) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: "❌ *Error de configuración*\n\nEste comando solo funciona si lo envías dentro de un **Grupo** de Telegram, no en este chat privado.\n\nPor favor, crea un grupo, añade a este bot al grupo, y envía el comando allí.",
            parse_mode: 'Markdown'
          })
        });
        return NextResponse.json({ success: true, status: "rejected_private_chat" });
      }

      const trackerId = text.split(' ')[1];
      const supabaseAdmin = getSupabaseAdmin();

      // Actualizamos la tabla de CONFIGURACION_RASTREO con el chat de Telegram (solo grupos)
      const { error } = await supabaseAdmin
        .from('configuracion_rastreo')
        .update({ telegram_chat_id: chatId.toString() })
        .eq('id', trackerId);

      if (error) {
        console.error("Error DB:", error);
        return NextResponse.json({ success: false }); 
      }

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: "✅ *¡Radar KAVOX vinculado con éxito!*\n\nEste canal táctico empezará a recibir alertas de propiedades en tiempo real.",
          parse_mode: 'Markdown'
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