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

    const apifyToken = process.env.APIFY_API_TOKEN;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let propiedades: any[] = [];

    // --- INICIO HACK DE PRUEBA ---
    console.log("Inyectando Lead falso de prueba...");
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
    // --- FIN HACK DE PRUEBA ---

    const { data: configs, error: configError } = await supabaseAdmin
      .from('configuracion_rastreo')
      .select('id_agencia, url_idealista, telegram_chat_id, nombre_rastreo')
      .eq('activa', true)
      .not('telegram_chat_id', 'is', null);

    if (configError) {
      console.error("[DB ERROR] Fallo al cargar configuraciones:", configError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!configs || configs.length === 0) {
      console.log("No hay configuraciones activas o con telegram_chat_id asignado.");
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
        const { data: existe, error: existeError } = await supabaseAdmin
          .from('propiedades_rastreadas')
          .select('id_anuncio')
          .eq('id_anuncio', prop.propertyCode)
          .eq('id_agencia', rastreador.id_agencia)
          .single();

        if (existeError && existeError.code !== 'PGRST116') { // PGRST116 es "No rows found", lo cual es normal si es nuevo
          console.error(`[DB ERROR] Verificando existencia de ${prop.propertyCode}:`, existeError);
        }

        if (!existe) {
          // 1. INSERCIÓN CONTROLADA
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
            console.error(`[DB INSERT ERROR] Lead ${prop.propertyCode} para agencia ${rastreador.id_agencia}:`, insertError);
            continue; // Si falla la DB, no enviamos Telegram para evitar desincronización
          }

          const precioFormateado = (prop.priceInfo?.price?.amount || prop.price || 0).toLocaleString('es-ES');
          const mensaje = `🚨 *NUEVO LEAD PARTICULAR* 🚨\n\n` +
                          `📍 *Rastreador:* ${rastreador.nombre_rastreo}\n` +
                          `🏠 *Inmueble:* ${prop.suggestedTexts?.title || 'No especificado'}\n` +
                          `💰 *Precio:* ${precioFormateado} €\n` +
                          `📞 *Teléfono:* ${prop.contactInfo?.phone1?.phoneNumber || 'Oculto'}\n` +
                          `👤 *Anunciante:* ${prop.contactInfo?.contactName || 'Particular'}\n\n` +
                          `🔗 [Ver Anuncio y Llamar](${prop.url})`;

          // 2. PETICIÓN A TELEGRAM CONTROLADA
          if (!botToken) {
             console.error("[ENV ERROR] TELEGRAM_BOT_TOKEN no está definido.");
          } else {
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
               const errorText = await telegramRes.text();
               console.error(`[TELEGRAM ERROR] Chat ID ${rastreador.telegram_chat_id}:`, errorText);
             }
          }

          nuevosLeads++;
          await new Promise(r => setTimeout(r, 200)); 
        }
      }
    }

    return NextResponse.json({ success: true, leadsEnviados: nuevosLeads, descartados: descartadosInmobiliaria });

  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error crítico en Webhook Apify:", errMessage);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}