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
    // ⚠️ SEGURIDAD: Verificamos que sea Apify usando nuestra clave secreta
    const url = new URL(request.url);
    const providedSecret = url.searchParams.get("secret");
    if (providedSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

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
    if (!runResponse.ok) return NextResponse.json({ error: "Failed to fetch run details" }, { status: 500 });

    const runDetails = await runResponse.json();
    const inputStartUrls = runDetails.data?.buildOptions?.input?.startUrls || runDetails.data?.options?.input?.startUrls || [];
    let sourceUrl = inputStartUrls[0]?.url || inputStartUrls[0];

    if (!sourceUrl) {
      const kvResponse = await fetch(`https://api.apify.com/v2/key-value-stores/${runDetails.data.defaultKeyValueStoreId}/records/INPUT?token=${apifyToken}`);
      const kvData = await kvResponse.json();
      sourceUrl = kvData.startUrls?.[0]?.url || kvData.startUrls?.[0];
    }

    const normalizedSourceUrl = normalizeUrl(sourceUrl);

    const { data: configs } = await supabaseAdmin
      .from('configuracion_rastreo')
      .select('id_agencia, url_idealista, telegram_chat_id, nombre_rastreo')
      .eq('activa', true)
      .not('telegram_chat_id', 'is', null);

    const validTrackers = (configs || []).filter(c => normalizeUrl(c.url_idealista) === normalizedSourceUrl);
    if (validTrackers.length === 0) return NextResponse.json({ success: true, message: "No agencies monitoring this URL." });

    const datasetResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`);
    const propiedades = await datasetResponse.json();

    let nuevosLeads = 0;
    let descartadosInmobiliaria = 0;

    for (const prop of propiedades) {
      // Filtramos profesionales
      if (prop.contactInfo?.userType !== "private") {
        descartadosInmobiliaria++;
        continue;
      }

      const idAnuncio = String(prop.adid);

      // EXTRACCIÓN DE ALTO VALOR (Basado en el JSON de Idealista)
      const titulo = prop.basicInfo?.title || prop.suggestedTexts?.title || "Inmueble Particular";
      const urlInmueble = prop.url || prop.detailWebLink || `https://www.idealista.com/inmueble/${idAnuncio}/`;
      const precio = prop.priceInfo?.amount || prop.price || 0;
      const foto = prop.basicInfo?.thumbnail || prop.multimedia?.images?.[0]?.url || "";
      const telefono = prop.contactInfo?.phone1?.phoneNumber || "Oculto";

      const m2 = prop.basicInfo?.size || prop.moreCharacteristics?.constructedArea || null;
      const habitaciones = prop.basicInfo?.rooms || prop.moreCharacteristics?.roomNumber || null;
      const banos = prop.basicInfo?.bathrooms || prop.moreCharacteristics?.bathNumber || null;
      const planta = prop.basicInfo?.floor || prop.moreCharacteristics?.floor || "No especificada";
      const direccion = prop.basicInfo?.address || prop.ubication?.title || prop.ubication?.locationName || "Dirección privada";
      const descripcion = prop.basicInfo?.description || prop.propertyComment || "";

      for (const rastreador of validTrackers) {
        const { data: existe } = await supabaseAdmin
          .from('propiedades_rastreadas')
          .select('id_anuncio')
          .eq('id_anuncio', idAnuncio)
          .eq('id_agencia', rastreador.id_agencia)
          .single();

        if (!existe) {
          const { error: insertError } = await supabaseAdmin.from('propiedades_rastreadas').insert({
            id_anuncio: idAnuncio,
            id_agencia: rastreador.id_agencia,
            estado: 'nuevo', 
            tipo: prop.extendedPropertyType || prop.propertyType || "Inmueble",
            titulo: titulo,
            url: urlInmueble,
            precio: precio,
            foto: foto,
            telefono: telefono,
            m2: m2,
            habitaciones: habitaciones,
            banos: banos,
            planta: planta,
            direccion: direccion,
            descripcion: descripcion, // <--- AQUÍ ESTABA EL ERROR (Faltaba esta coma)
            origen_rastreo: rastreador.nombre_rastreo
          });

          if (insertError) continue;

          if (botToken && rastreador.telegram_chat_id) {
            const precioFmt = Number(precio).toLocaleString('es-ES');
            const m2Fmt = m2 ? `${m2} m²` : 'm² N/D';

            const mensaje = `🚨 *NUEVO LEAD PARTICULAR* 🚨\n\n` +
                            `📍 *Zona:* ${rastreador.nombre_rastreo}\n` +
                            `🏠 *Inmueble:* ${titulo}\n` +
                            `📐 *Tamaño:* ${m2Fmt} - ${habitaciones} Hab. / ${banos} Baños\n` +
                            `💰 *Precio:* ${precioFmt} €\n` +
                            `📞 *Teléfono:* ${telefono}\n\n` +
                            `🔗 [Ver Anuncio](${urlInmueble})`;

            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: rastreador.telegram_chat_id, text: mensaje, parse_mode: 'Markdown' })
            });
          }
          nuevosLeads++;
          await new Promise(r => setTimeout(r, 100)); // Rate limit Telegram
        }
      }
    }

    return NextResponse.json({ success: true, leadsEnviados: nuevosLeads, descartados: descartadosInmobiliaria });

  } catch (error: any) {
    console.error("Error crítico Webhook:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}