// artifacts/radar-proptech/app/api/cron/scraper/route.ts
import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const maxDuration = 60; 

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const providedToken = url.searchParams.get("token");

    if (providedToken !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Buscamos TODOS los rastreadores activos de todas las agencias
    const { data: trackers, error } = await supabaseAdmin
      .from('configuracion_rastreo')
      .select('id, id_agencia, url_idealista')
      .eq('activa', true)
      .not('telegram_chat_id', 'is', null);

    if (error || !trackers || trackers.length === 0) {
      return NextResponse.json({ message: "No hay rastreadores activos válidos" });
    }

    const apifyToken = process.env.APIFY_API_TOKEN;
    const actorId = "memo23~idealista-scraper"; // NUEVO ACTOR
    const host = request.headers.get('host') || "prop-tech-radar.vercel.app";

    let runsStarted = 0;

    // 2. Disparamos una ejecución independiente por cada rastreador
    for (const tracker of trackers) {
      const apifyResponse = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${apifyToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startUrls: [tracker.url_idealista],
          maxItems: 30,
          maxConcurrency: 1,
          splitByPrice: false,
          monitoringMode: false,
          proxy: {
              useApifyProxy: true,
              apifyProxyGroups: ["RESIDENTIAL"]
          }
        })
      });

      if (apifyResponse.ok) {
        const runData = await apifyResponse.json();
        const runId = runData.data.id;

        // 3. Pegamos el Webhook dinámico con el ID exacto del rastreador
        const webhookUrl = `https://${host}/api/webhooks/apify?tracker_id=${tracker.id}`;

        await fetch(`https://api.apify.com/v2/acts/${actorId}/runs/${runId}/webhooks?token=${apifyToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventTypes: ["ACTOR.RUN.SUCCEEDED"],
                requestUrl: webhookUrl
            })
        });
        runsStarted++;
      }
    }

    return NextResponse.json({ success: true, runsStarted });

  } catch (error: any) {
    console.error("Error en Cron:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}