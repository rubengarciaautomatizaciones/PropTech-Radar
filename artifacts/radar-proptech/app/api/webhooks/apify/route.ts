// artifacts/radar-proptech/app/api/webhooks/apify/route.ts
import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const maxDuration = 60; 
export const runtime = 'nodejs'; 

// Nueva función mejorada para normalizar la URL y hacer "Match"
function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete('pagina'); 
    parsed.searchParams.delete('page');
    // Forzamos a quitar la paginación para que coincida con la URL original de la agencia
    return `https://${parsed.host}${parsed.pathname}${parsed.search ? parsed.search : ''}`.replace(/\/$/, "");
  } catch (e) {
    return url.trim().replace(/\/$/, ""); 
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const datasetId = body.resource?.defaultDatasetId;

    if (!datasetId) {
      console.error("No dataset ID en el webhook");
      return NextResponse.json({ error: "No dataset ID" }, { status: 400 });
    }

    const apifyToken = process.env.APIFY_API_TOKEN;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Descargamos el JSON de Apify (El de Ricardo y los otros 29)
    const datasetResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`);
    if (!datasetResponse.ok) {
       console.error("Fallo al descargar el dataset de Apify");
       return NextResponse.json({ error: "Failed to fetch Apify dataset" }, { status: 500 });
    }
    const propiedades = await datasetResponse.json();

    // 2. Traemos todas las configuraciones de la DB
    const { data: configs } = await supabaseAdmin
      .from('configuracion_rastreo')
      .select('id_agencia, url_idealista, telegram_chat_id, nombre_rastreo')
      .eq('activa', true)
      .not('telegram_chat_id', 'is', null);

    if (!configs || configs.length === 0) {
      return NextResponse.json({ success: true, message: "No hay configuraciones activas." });
    }

    let nuevosLeads = 0;
    let descartadosInmobiliaria = 0;

    for (const prop of propiedades) {

      // 3. EL ESCUDO ANTICOMPETENCIA
      const userType = prop.contactInfo?.userType; 
      if (userType !== "private") {
        descartadosInmobiliaria++;
        continue; // Es Inmobiliaria. Lo ignoramos.
      }

      // IMPORTANTE: Este nuevo Actor a veces no devuelve la 'sourceUrl'. 
      // Si no la devuelve, le enviaremos el lead a TODAS las agencias que busquen en su provincia.
      // Pero como de momento solo estás tú (Jose), te va a llegar seguro.
      const idAnuncio = String(prop.adid);

      for (const rastreador of configs) {

        // 4. VERIFICAMOS SI YA SE LO HEMOS MANDADO
        const { data: existe } = await supabaseAdmin
          .from('propiedades_rastreadas')
          .select('id_anuncio')
          .eq('id_anuncio', idAnuncio)
          .eq('id_agencia', rastreador.id_agencia)
          .single();

        if (!existe) {

          // 5. GUARDAMOS A "RICARDO" EN TU CRM
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
            telefono: telefono
          });

          if (insertError) {
             console.error("Error insertando en BD:", insertError.message);
             continue;
          }

          // 6. ENVIAMOS A TELEGRAM
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
          await new Promise(r => setTimeout(r, 200)); // Límite de Telegram
        }
      }
    }

    return NextResponse.json({ success: true, leadsEnviados: nuevosLeads, descartados: descartadosInmobiliaria });

  } catch (error: unknown) {
    console.error("Error crítico en Webhook Apify:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}