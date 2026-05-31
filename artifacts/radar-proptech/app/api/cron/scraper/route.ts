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

    // 1. Buscamos rastreadores activos (Añadimos la lectura del contador de errores)
    const { data: trackers, error } = await supabaseAdmin
      .from('configuracion_rastreo')
      .select('id, id_agencia, url_idealista, nombre_rastreo, errores_consecutivos')
      .eq('activa', true)
      .not('telegram_chat_id', 'is', null);

    if (error || !trackers || trackers.length === 0) {
      return NextResponse.json({ message: "No hay rastreadores activos válidos" });
    }

    const apifyToken = process.env.APIFY_API_TOKEN;
    const actorId = "memo23~idealista-scraper";
    const runsStarted = [];

    // 2. Disparamos 1 ejecución INDEPENDIENTE por cada radar
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
        runsStarted.push(runData.data.id);

        // Si funcionó bien y tenía errores previos, lo reseteamos a 0
        if (tracker.errores_consecutivos > 0) {
          await supabaseAdmin.from('configuracion_rastreo').update({ errores_consecutivos: 0 }).eq('id', tracker.id);
        }

      } else {
        console.error(`Error disparando Apify para ${tracker.url_idealista}:`, apifyResponse.statusText);

        // Sumamos 1 al contador de errores
        const nuevosErrores = (tracker.errores_consecutivos || 0) + 1;
        await supabaseAdmin.from('configuracion_rastreo').update({ errores_consecutivos: nuevosErrores }).eq('id', tracker.id);

        // Si llega a 3 fallos consecutivos, mandamos el email de emergencia
        if (nuevosErrores === 3) {
          const resendKey = process.env.RESEND_API_KEY;
          if (resendKey) {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: 'onboarding@resend.dev', // Dominio de prueba gratuito de Resend
                to: 'rubengn20052@gmail.com', // Tu correo
                subject: `🚨 ALERTA CRÍTICA SAAS: Radar Caído (${tracker.nombre_rastreo})`,
                html: `
                  <h2>El radar ha fallado 3 veces consecutivas.</h2>
                  <p><strong>Radar:</strong> ${tracker.nombre_rastreo}</p>
                  <p><strong>ID Agencia:</strong> ${tracker.id_agencia}</p>
                  <p><strong>URL Rastreando:</strong> <a href="${tracker.url_idealista}">${tracker.url_idealista}</a></p>
                  <p>Por favor, entra a la consola de Apify para verificar si la cuenta está bloqueada o sin créditos.</p>
                `
              })
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, runsDisparados: runsStarted.length, runIds: runsStarted });

  } catch (error: any) {
    console.error("Error en Cron:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}