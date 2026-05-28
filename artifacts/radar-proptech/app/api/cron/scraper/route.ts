// artifacts/radar-proptech/app/api/cron/scraper/route.ts
import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Permitimos un máximo de 60 segundos de ejecución en Vercel por si hay muchas URLs
export const maxDuration = 60; 

export async function GET(request: Request) {
  try {
    // 1. SEGURIDAD: Comprobamos que el que llama tiene nuestra contraseña secreta
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Conectamos a la base de datos como ADMIN (porque aquí no hay usuario logueado)
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Obtenemos todas las URLs de rastreo ACTIVAS
    const { data: configs, error } = await supabaseAdmin
      .from('configuracion_rastreo')
      .select('url_idealista')
      .eq('activa', true);

    if (error || !configs || configs.length === 0) {
      return NextResponse.json({ message: "No hay URLs activas para rastrear" });
    }

    // 4. Limpiamos URLs duplicadas (si dos clientes buscan lo mismo, solo pagamos a Apify 1 vez)
    const uniqueUrls = [...new Set(configs.map(c => c.url_idealista))];
    const propertyUrls = uniqueUrls.map(url => ({ url }));

    // 5. Preparamos la llamada a Apify
    const apifyToken = process.env.APIFY_API_TOKEN;
    const actorId = "dz_omar~idealista-scraper-api";

    // Le decimos a Apify a qué URL de nuestro Vercel debe enviar los resultados al terminar
    const host = request.headers.get('host');
    const webhookUrl = `https://${host}/api/webhooks/apify`;

    // 6. ¡FUEGO! Disparamos el Actor en Apify
    const apifyResponse = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${apifyToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Property_urls: propertyUrls,
        desiredResults: 30, // Tu límite de 30 resultados por URL
      })
    });

    if (!apifyResponse.ok) {
        throw new Error(`Error en Apify: ${apifyResponse.statusText}`);
    }

    const runData = await apifyResponse.json();
    const runId = runData.data.id;

    // 7. Configuramos el Webhook en Apify para que nos avise SOLO de esta ejecución
    await fetch(`https://api.apify.com/v2/acts/${actorId}/runs/${runId}/webhooks?token=${apifyToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            eventTypes: ["ACTOR.RUN.SUCCEEDED"],
            requestUrl: webhookUrl
        })
    });

    return NextResponse.json({ success: true, runId, urlsProcesadas: uniqueUrls.length });

  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error en Cron:", errMessage);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}