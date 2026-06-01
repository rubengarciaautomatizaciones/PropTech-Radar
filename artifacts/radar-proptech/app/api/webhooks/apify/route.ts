// artifacts/radar-proptech/app/api/webhooks/apify/route.ts
import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const maxDuration = 60; 
export const runtime = 'nodejs';

function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete('pagina'); 
    parsed.searchParams.delete('page');
    return `https://${parsed.host}${parsed.pathname}${parsed.search ? parsed.search : ''}`.replace(/\/$/, "");
  } catch (e) {
    return url.trim().replace(/\/$/, ""); 
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const datasetId = body.resource?.defaultDatasetId;
    const runId = body.resource?.id;

    if (!datasetId || !runId) {
      return NextResponse.json({ error: "No dataset ID o Run ID" }, { status: 400 });
    }

    const apifyToken = process.env.APIFY_API_TOKEN;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const runResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`);
    if (!runResponse.ok) {
        return NextResponse.json({ error: "Failed to fetch run details" }, { status: 500 });
    }
    const runDetails = await runResponse.json();
    const inputStartUrls = runDetails.data?.buildOptions?.input?.startUrls || runDetails.data?.options?.input?.startUrls || [];

    let sourceUrl = inputStartUrls[0]?.url || inputStartUrls[0];

    if (!sourceUrl) {
      const kvResponse = await fetch(`https://api.apify.com/v2/key-value-stores/${runDetails.data.defaultKeyValueStoreId}/records/INPUT?token=${apifyToken}`);
      const kvData = await kvResponse.json();
      sourceUrl = kvData.startUrls?.[0]?.url || kvData.startUrls?.[0];
    }

    if (!sourceUrl) {
      console.error("No se pudo determinar la URL de origen para el Run:", runId);
      return NextResponse.json({ error: "Missing source URL in Run" }, { status: 400 });
    }

    const normalizedSourceUrl = normalizeUrl(sourceUrl);

    const { data: configs } = await supabaseAdmin
      .from('configuracion_rastreo')
      .select('id_agencia, url_idealista, telegram_chat_id, nombre_rastreo')
      .eq('activa', true)
      .not('telegram_chat_id', 'is', null);

    const validTrackers = (configs || []).filter(c => normalizeUrl(c.url_idealista) === normalizedSourceUrl);

    if (validTrackers.length === 0) {
      return NextResponse.json({ success: true, message: "No hay agencias rastreando esta URL actualmente." });
    }

    const datasetResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`);
    const propiedades = await datasetResponse.json();

    let nuevosLeads = 0;
    let descartadosInmobiliaria = 0;

    for (const prop of propiedades) {
      if (prop.contactInfo?.userType !== "private") {
        descartadosInmobiliaria++;
        continue;
      }

      const idAnuncio = String(prop.adid);

      for (const rastreador of validTrackers) {

        const { data: existe } = await supabaseAdmin
          .from('propiedades_rastreadas')
          .select('id_anuncio')
          .eq('id_anuncio', idAnuncio)
          .eq('id_agencia', rastreador.id_agencia)
          .single();

        if (!existe) {
          const titulo = prop.suggestedTexts?.title || "Nuevo Inmueble Particular";
          const urlInmueble = prop.basicInfo?.url || prop.detailWebLink || `https://www.idealista.com/inmueble/${idAnuncio}/`;
          const precio = prop.price || prop.priceInfo?.amount || 0;
          const foto = prop.basicInfo?.thumbnail || prop.multimedia?.images?.[0]?.url || "";
          const telefono = prop.contactInfo?.phone1?.phoneNumber || "Oculto";

          const { error: insertError } = await supabaseAdmin.from('propiedades_rastreadas').insert({
            id_anuncio: idAnuncio,
            id_agencia: rastreador.id_agencia,
            estado: 'nuevo', 
            tipo: prop.extendedPropertyType || prop.propertyType || "Inmueble",
            titulo: titulo,
            url: urlInmueble,
            precio: precio,
            foto: foto,
            telefono: telefono, // <--- LA COMA QUE FALTABA
            lista_robinson: 'PROCESANDO'
          });

          if (insertError) continue;

          if (botToken && rastreador.telegram_chat_id) {
            const precioFormateado = Number(precio).toLocaleString('es-ES');
            const nombreContacto = prop.contactInfo?.contactName || 'Particular';

            const mensaje = `🚨 *NUEVO LEAD PARTICULAR* 🚨\n\n` +
                            `📍 *Rastreador:* ${rastreador.nombre_rastreo}\n` +
                            `🏠 *Inmueble:* ${titulo}\n` +
                            `💰 *Precio:* ${precioFormateado} €\n` +
                            `📞 *Teléfono:* ${telefono}\n` +
                            `👤 *Anunciante:* ${nombreContacto}\n\n` +
                            `🔗 [Ver Anuncio y Llamar](${urlInmueble})`;

            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: rastreador.telegram_chat_id,
                text: mensaje,
                parse_mode: 'Markdown'
              })
            });
          }
          nuevosLeads++;
          await new Promise(r => setTimeout(r, 200)); 
        }
      }
    }

    return NextResponse.json({ success: true, leadsEnviados: nuevosLeads, descartados: descartadosInmobiliaria });

  } catch (error: unknown) {
    console.error("Error crítico en Webhook Apify:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}