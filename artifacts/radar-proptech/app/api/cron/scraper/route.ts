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

    // 1. Buscamos rastreadores activos
    const { data: trackers, error } = await supabaseAdmin
      .from('configuracion_rastreo')
      .select('id, id_agencia, url_idealista')
      .eq('activa', true)
      .not('telegram_chat_id', 'is', null);

    if (error || !trackers || trackers.length === 0) {
      return NextResponse.json({ message: "No hay rastreadores activos válidos" });
    }

    // 2. Extraemos URLs únicas para no raspar la misma búsqueda 2 veces
    const uniqueUrls = [...new Set(trackers.map(c => c.url_idealista))];

    const apifyToken = process.env.APIFY_API_TOKEN;
    const actorId = "memo23~idealista-scraper";
    const runsStarted = [];

    // 3. Disparamos 1 ejecución INDEPENDIENTE por cada URL única
    for (const targetUrl of uniqueUrls) {
      const apifyResponse = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${apifyToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startUrls: [targetUrl], // <-- Solo 1 URL por run
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
        runsStarted.push(runData.data.id);
      } else {
        console.error(`Error disparando Apify para ${targetUrl}:`, apifyResponse.statusText);
      }
    }

    return NextResponse.json({ success: true, runsDisparados: runsStarted.length, runIds: runsStarted });

  } catch (error: any) {
    console.error("Error en Cron:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}