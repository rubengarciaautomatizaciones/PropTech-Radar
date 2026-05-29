// artifacts/radar-proptech/app/api/cron/scraper/route.ts
import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const maxDuration = 60; 

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const providedToken = url.searchParams.get("token");

    if (providedToken !== process.env.CRON_SECRET) {
      console.error("Acceso denegado al Cron. Token incorrecto.");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Buscamos todas las URLs de rastreo ACTIVAS
    const { data: configs, error } = await supabaseAdmin
      .from('configuracion_rastreo')
      .select('url_idealista')
      .eq('activa', true);

    if (error || !configs || configs.length === 0) {
      return NextResponse.json({ message: "No hay URLs activas para rastrear" });
    }

    const uniqueUrls = [...new Set(configs.map(c => c.url_idealista))];
    const propertyUrls = uniqueUrls.map(url => ({ url }));

    const apifyToken = process.env.APIFY_API_TOKEN;
    const actorId = "dz_omar~idealista-scraper-api";

    // ¡FUEGO! Disparamos el Actor en Apify (El webhook saltará automáticamente desde Apify)
    const apifyResponse = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${apifyToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Property_urls: propertyUrls,
        desiredResults: 30, // Extraemos 30 para maximizar probabilidades de pescar particulares
      })
    });

    if (!apifyResponse.ok) {
        throw new Error(`Error en Apify: ${apifyResponse.statusText}`);
    }

    const runData = await apifyResponse.json();

    return NextResponse.json({ success: true, runId: runData.data.id, urlsProcesadas: uniqueUrls.length });

  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error en Cron:", errMessage);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}