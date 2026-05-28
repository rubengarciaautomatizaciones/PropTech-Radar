// artifacts/radar-proptech/app/api/webhooks/telegram/route.ts
import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Usamos el cliente ADMIN fuera de la función POST para que pueda reutilizarse si el servidor está "caliente"
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Si no es un mensaje de texto normal, devolvemos OK inmediatamente y lo ignoramos
    if (!body.message || !body.message.text) {
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    const chatId = body.message.chat.id;
    const text = body.message.text as string;

    // Telegram envía "/start ID_DEL_USUARIO"
    if (text.startsWith('/start ')) {
      const userId = text.split(' ')[1];

      // --- LA MAGIA: PROCESAR EN SEGUNDO PLANO ---
      // No usamos 'await' aquí abajo. Lanzamos la promesa y dejamos que se ejecute en el servidor
      // mientras nosotros le devolvemos inmediatamente el "200 OK" a Telegram para que no reintente.

      processTelegramLink(userId, chatId).catch(console.error);
    }

    // Le decimos "Mensaje recibido, gracias" a Telegram AL INSTANTE.
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Error crítico en Webhook de Telegram:", error);
    // Incluso si hay un error, a veces es mejor devolver 200 a Telegram para que deje de intentarlo,
    // pero lo dejamos en 500 para poder depurar en Vercel si hace falta.
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Extraemos la lógica pesada (Base de datos y Fetch a Telegram) a una función separada
async function processTelegramLink(userId: string, chatId: number) {
  console.log(`Procesando vinculación de Telegram para usuario: ${userId}, Chat: ${chatId}`);

  // 1. Actualizamos la tabla de usuarios
  const { error } = await supabaseAdmin
    .from('usuarios')
    .update({ telegram_chat_id: chatId.toString() })
    .eq('id_usuario', userId);

  if (error) {
    throw new Error(`Error al guardar telegram_chat_id en DB: ${error.message}`);
  }

  console.log("DB Actualizada. Enviando mensaje de confirmación...");

  // 2. Le respondemos por Telegram para confirmar
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: "✅ ¡Conexión exitosa! Tu cuenta de Radar PropTech está vinculada.\n\nA partir de ahora, cuando el rastreador detecte un nuevo piso, te lo enviaré por aquí instantáneamente. ¡Prepárate para ser el primero en llamar!"
    })
  });

  if (!response.ok) {
     throw new Error(`Error de la API de Telegram: ${response.statusText}`);
  }

  console.log("Mensaje de confirmación enviado con éxito.");
}