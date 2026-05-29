// artifacts/radar-proptech/app/api/webhooks/apify/route.ts
import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const maxDuration = 60; 
export const runtime = 'nodejs'; 

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const trackerId = url.searchParams.get("tracker_id"); // OBTENEMOS EL ID EXACTO

    if (!trackerId) {
      return NextResponse.json({ error: "No tracker_id provided" }, { status: 400 });
    }

    const body = await request.json();
    const datasetId = body.resource?.defaultDatasetId;

    if (!datasetId) {
      return NextResponse.json({ error: "No dataset ID" }, { status: 400 });
    }

    const apifyToken = process.env.APIFY_API_TOKEN;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Obtenemos los datos del rastreador específico
    const { data: rastreador, error: trackerError } = await supabaseAdmin
      .from('configuracion_rastreo')
      .select('id_agencia, telegram_chat_id, nombre_rastreo')
      .eq('id', trackerId)
      .single();

    if (trackerError || !rastreador) {
      return NextResponse.json({ error: "Tracker not found in DB" }, { status: 404 });
    }

    // 2. Descargamos el nuevo formato de JSON de Apify
    const datasetResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`);
    if (!datasetResponse.ok) {
       return NextResponse.json({ error: "Failed to fetch Apify dataset" }, { status: 500 });
    }

    const propiedades = await datasetResponse.json();

    let nuevosLeads = 0;
    let descartadosInmobiliaria = 0;

    for (const prop of propiedades) {
      // 3. EL ESCUDO ANTICOMPETENCIA (Adaptado al nuevo JSON)
      const userType = prop.contactInfo?.userType; 

      // En el nuevo json, 'private' es particular, 'professional' es inmobiliaria
      if (userType !== "private") {
        descartadosInmobiliaria++;
        continue; 
      }

      const idAnuncio = String(prop.adid);

      const { data: existe } = await supabaseAdmin
        .from('propiedades_rastreadas')
        .select('id_anuncio')
        .eq('id_anuncio', idAnuncio)
        .eq('id_agencia', rastreador.id_agencia)
        .single();

      if (!existe) {
        // 4. GUARDAR EN CRM (Adaptado a las nuevas variables)
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

        if (insertError) continue;

        // 5. ENVIAR A TELEGRAM
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

    return NextResponse.json({ success: true, leadsEnviados: nuevosLeads, descartados: descartadosInmobiliaria });

  } catch (error: unknown) {
    console.error("Error en Webhook Apify:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}