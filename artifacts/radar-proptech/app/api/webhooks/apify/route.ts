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

    // Para esta prueba manual, no exigimos el datasetId
    // const datasetId = body.resource?.defaultDatasetId;
    // if (!datasetId) return NextResponse.json({ error: "No dataset ID" }, { status: 400 });

    const apifyToken = process.env.APIFY_API_TOKEN;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Normalmente descargaríamos los resultados aquí, pero vamos a crear una lista vacía para la prueba
    // const datasetResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`);
    // let propiedades = await datasetResponse.json();

    let propiedades: any[] = [];

    // --- INICIO HACK DE PRUEBA ---
    console.log("Inyectando Lead falso de prueba...");
    propiedades.push({
      propertyCode: `TEST_${Date.now()}`, // ID único para que no diga que ya existe
      sourceUrl: "https://www.idealista.com/venta-viviendas/aguilas-murcia/?ordenado-por=fecha-publicacion-desc", // DEBE coincidir con la de tu Dashboard
      url: "https://www.idealista.com/inmueble/TEST_PARTICULAR/",
      price: 150000,
      priceInfo: { price: { amount: 150000 } },
      propertyType: "flat",
      suggestedTexts: { title: "CHOLLO: Piso Particular en la Playa (PRUEBA)" },
      thumbnail: "https://img3.idealista.com/blur/WEB_DETAIL_TOP_PLAN/0/id.pro.es.image.master/7d/5d/c9/123456789.jpg",
      contactInfo: {
        userType: "private", // <--- Pasa el escudo anticompetencia
        contactName: "Rubén (Propietario Directo)",
        phone1: { phoneNumber: "600 123 456" }
      }
    });
    // --- FIN HACK DE PRUEBA ---

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

      const isProfessional = prop.contactInfo?.userType === "professional";
      const hasCommercialName = !!prop.contactInfo?.commercialName;

      if (isProfessional || hasCommercialName) {
        descartadosInmobiliaria++;
        continue; 
      }

      if (!prop.sourceUrl) continue;

      const sourceUrlNorm = normalizeUrl(prop.sourceUrl);

      const rastreadoresInteresados = configs.filter(c => 
        normalizeUrl(c.url_idealista) === sourceUrlNorm
      );

      for (const rastreador of rastreadoresInteresados) {
        const { data: existe } = await supabaseAdmin
          .from('propiedades_rastreadas')
          .select('id_anuncio')
          .eq('id_anuncio', prop.propertyCode)
          .eq('id_agencia', rastreador.id_agencia)
          .single();

        if (!existe) {
          await supabaseAdmin.from('propiedades_rastreadas').insert({
            id_anuncio: prop.propertyCode,
            id_agencia: rastreador.id_agencia,
            estado: 'nuevo', 
            tipo: prop.propertyType || "Inmueble",
            titulo: prop.suggestedTexts?.title || "Nuevo Inmueble Particular",
            url: prop.url,
            precio: prop.priceInfo?.price?.amount || prop.price || 0,
            foto: prop.thumbnail || prop.multimedia?.images?.[0]?.url || "",
            telefono: prop.contactInfo?.phone1?.phoneNumber || "No disponible"
          });

          const precioFormateado = (prop.priceInfo?.price?.amount || prop.price || 0).toLocaleString('es-ES');

          const mensaje = `🚨 *NUEVO LEAD PARTICULAR* 🚨\n\n` +
                          `📍 *Rastreador:* ${rastreador.nombre_rastreo}\n` +
                          `🏠 *Inmueble:* ${prop.suggestedTexts?.title || 'No especificado'}\n` +
                          `💰 *Precio:* ${precioFormateado} €\n` +
                          `📞 *Teléfono:* ${prop.contactInfo?.phone1?.phoneNumber || 'Oculto'}\n` +
                          `👤 *Anunciante:* ${prop.contactInfo?.contactName || 'Particular'}\n\n` +
                          `🔗 [Ver Anuncio y Llamar](${prop.url})`;

          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: rastreador.telegram_chat_id,
              text: mensaje,
              parse_mode: 'Markdown'
            })
          });

          nuevosLeads++;
          await new Promise(r => setTimeout(r, 200)); 
        }
      }
    }

    return NextResponse.json({ success: true, leadsEnviados: nuevosLeads, descartados: descartadosInmobiliaria });

  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error en Webhook Apify:", errMessage);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}