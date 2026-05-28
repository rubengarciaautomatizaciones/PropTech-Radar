// artifacts/radar-proptech/app/api/webhooks/telegram/route.ts
import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Si no es un mensaje de texto normal, lo ignoramos para que no falle
    if (!body.message || !body.message.text) {
      return NextResponse.json({ status: "ignored" });
    }

    const chatId = body.message.chat.id;
    const text = body.message.text as string;

    // Telegram envía "/start ID_DEL_USUARIO" gracias a nuestro botón mágico
    if (text.startsWith('/start ')) {
      const userId = text.split(' ')[1]; // Sacamos el ID que viene después del espacio

      // Usamos el cliente ADMIN porque esta llamada la hace Telegram, no un usuario logueado
      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Actualizamos la tabla de usuarios con el chat_id de Telegram
      const { error } = await supabaseAdmin
        .from('usuarios')
        .update({ telegram_chat_id: chatId.toString() })
        .eq('id_usuario', userId);

      if (error) {
        console.error("Error al guardar telegram_chat_id:", error);
        return NextResponse.json({ error: "Error de Base de Datos" }, { status: 500 });
      }

      // Si todo ha ido bien, le respondemos por Telegram para confirmar
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: "✅ ¡Conexión exitosa! Tu cuenta de Radar PropTech está vinculada.\n\nA partir de ahora, cuando el rastreador detecte un nuevo piso, te lo enviaré por aquí instantáneamente. ¡Prepárate para ser el primero en llamar!"
        })
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error crítico en Webhook de Telegram:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}