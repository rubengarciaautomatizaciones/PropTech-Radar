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
  const debugLog: string[] = []; // <-- EL CHIVATO

  try {
    const apifyToken = process.env.APIFY_API_TOKEN;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let propiedades: any[] = [];
    propiedades.push({
      propertyCode: `TEST_${Date.now()}`,
      sourceUrl: "https://www.idealista.com/venta-viviendas/aguilas-murcia/?ordenado-por=fecha-publicacion-desc",
      url: "https://www.idealista.com/inmueble/TEST_PARTICULAR/",
      price: 150000,
      priceInfo: { price: { amount: 150000 } },
      propertyType: "flat",
      suggestedTexts: { title: "CHOLLO: Piso Particular en la Playa (PRUEBA)" },
      thumbnail: "https://img3.idealista.com/blur/WEB_DETAIL_TOP_PLAN/0/id.pro.es.image.master/7d/5d/c9/123456789.jpg",
      contactInfo: {
        userType: "private",
        contactName: "Rubén (Propietario Directo)",
        phone1: { phoneNumber: "600 123 456" }
      }
    });

    debugLog.push(`Lead falso generado con propertyCode: ${propiedades[0].propertyCode}`);

    const { data: configs, error: configError } = await supabaseAdmin
      .from('configuracion_rastreo')
      .select('id_agencia, url_idealista, telegram_chat_id, nombre_rastreo')
      .eq('activa', true)
      .not('telegram_chat_id', 'is', null);

    if (configError) {
      debugLog.push(`[DB ERROR] Error cargando configs: ${configError.message}`);
      return NextResponse.json({ error: "Database error", debugLog }, { status: 500 });
    }

    debugLog.push(`Rastreadores activos encontrados: ${configs?.length || 0}`);

    if (!configs || configs.length === 0) {
      return NextResponse.json({ success: true, message: "No hay configuraciones activas.", debugLog });
    }

    let nuevosLeads = 0;
    let descartadosInmobiliaria = 0;

    for (const prop of propiedades) {
      const sourceUrlNorm = normalizeUrl(prop.sourceUrl);
      debugLog.push(`URL normalizada del lead: ${sourceUrlNorm}`);

      const rastreadoresInteresados = configs.filter(c => {
        const urlDbNorm = normalizeUrl(c.url_idealista);
        const isMatch = urlDbNorm === sourceUrlNorm;
        if (!isMatch) debugLog.push(`NO MATCH con DB: ${urlDbNorm}`);
        return isMatch;
      });

      debugLog.push(`Agencias interesadas en este lead: ${rastreadoresInteresados.length}`);

      for (const rastreador of rastreadoresInteresados) {
        const { data: existe } = await supabaseAdmin
          .from('propiedades_rastreadas')
          .select('id_anuncio')
          .eq('id_anuncio', prop.propertyCode)
          .eq('id_agencia', rastreador.id_agencia)
          .single();

        if (existe) {
           debugLog.push(`El lead ya existe para la agencia ${rastreador.id_agencia}`);
        } else {
           debugLog.push(`Intentando insertar en propiedades_rastreadas...`);

           const { error: insertError } = await supabaseAdmin.from('propiedades_rastreadas').insert({
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

           if (insertError) {
             debugLog.push(`❌ [ERROR CRÍTICO SUPABASE]: ${JSON.stringify(insertError)}`);
             continue; // Cortamos aquí para no enviar Telegram
           }

           debugLog.push(`✅ DB Insert OK`);

           // Intentamos enviar a Telegram solo si la DB funcionó
           if (!botToken) {
             debugLog.push(`❌ [ENV ERROR] Falta TELEGRAM_BOT_TOKEN`);
           } else {
             const precioFormateado = (prop.priceInfo?.price?.amount || prop.price || 0).toLocaleString('es-ES');
             const mensaje = `🚨 *NUEVO LEAD PARTICULAR* 🚨\n\n` +
                             `📍 *Rastreador:* ${rastreador.nombre_rastreo}\n` +
                             `🏠 *Inmueble:* ${prop.suggestedTexts?.title || 'No especificado'}\n` +
                             `💰 *Precio:* ${precioFormateado} €\n` +
                             `📞 *Teléfono:* ${prop.contactInfo?.phone1?.phoneNumber || 'Oculto'}\n` +
                             `👤 *Anunciante:* ${prop.contactInfo?.contactName || 'Particular'}\n\n` +
                             `🔗 [Ver Anuncio y Llamar](${prop.url})`;

             const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                 chat_id: rastreador.telegram_chat_id,
                 text: mensaje,
                 parse_mode: 'Markdown'
               })
             });

             if (!telegramRes.ok) {
               const errText = await telegramRes.text();
               debugLog.push(`❌ [TELEGRAM ERROR]: ${errText}`);
             } else {
               debugLog.push(`✅ Telegram OK`);
             }
           }

           nuevosLeads++;
        }
      }
    }

    // Devolvemos toda la traza al frontend/terminal
    return NextResponse.json({ success: true, leadsEnviados: nuevosLeads, descartados: descartadosInmobiliaria, debugLog });

  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    debugLog.push(`❌ [CRASH CRÍTICO]: ${errMessage}`);
    return NextResponse.json({ error: errMessage, debugLog }, { status: 500 });
  }
}