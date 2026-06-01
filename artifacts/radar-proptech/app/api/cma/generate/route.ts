// artifacts/radar-proptech/app/api/cma/generate/route.ts
import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(request: Request) {
  try {
    const { id_anuncio, id_agencia } = await request.json();

    if (!id_anuncio || !id_agencia) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Obtenemos el Lead actual y la Agencia
    const { data: lead } = await supabaseAdmin
      .from('propiedades_rastreadas')
      .select('*')
      .eq('id_anuncio', id_anuncio)
      .eq('id_agencia', id_agencia)
      .single();

    const { data: agencia } = await supabaseAdmin
      .from('agencias')
      .select('nombre_empresa')
      .eq('id_agencia', id_agencia)
      .single();

    if (!lead) return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });

    // Si ya existe el PDF, lo devolvemos para no rehacerlo
    if (lead.pdf_cma_url) {
      return NextResponse.json({ success: true, url: lead.pdf_cma_url });
    }

    // ==========================================
    // 2. EL MOTOR DE VALORACIÓN (CMA REAL)
    // ==========================================
    const { data: comparables } = await supabaseAdmin
      .from('propiedades_rastreadas')
      .select('precio, m2')
      .eq('id_agencia', id_agencia)
      .eq('tipo', lead.tipo) // Comparamos pisos con pisos, chalets con chalets
      .gt('m2', 0)
      .gt('precio', 0);

    let avgPrecioM2 = 0;
    if (comparables && comparables.length > 0) {
      const sumM2 = comparables.reduce((acc, curr) => acc + (curr.precio / curr.m2), 0);
      avgPrecioM2 = Math.round(sumM2 / comparables.length);
    } else if (lead.precio && lead.m2) {
      // Fallback: Si es su primer lead, usamos su propio ratio
      avgPrecioM2 = Math.round(lead.precio / lead.m2);
    }

    const valorEstimado = (lead.m2 && avgPrecioM2) ? (lead.m2 * avgPrecioM2) : 0;

    // ==========================================
    // 3. CONSTRUCCIÓN DEL PDF PREMIUM
    // ==========================================
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const kavoxColor = rgb(0 / 255, 135 / 255, 153 / 255); // #008799
    const darkGray = rgb(0.2, 0.2, 0.2);
    const lightGray = rgb(0.95, 0.95, 0.95);

    // --- CABECERA ---
    page.drawRectangle({ x: 0, y: height - 100, width: width, height: 100, color: kavoxColor });
    page.drawText(agencia?.nombre_empresa?.toUpperCase() || 'AGENCIA INMOBILIARIA', {
      x: 40, y: height - 50, size: 22, font: fontBold, color: rgb(1, 1, 1)
    });
    page.drawText('Dossier de Captación & Análisis de Mercado', {
      x: 40, y: height - 75, size: 12, font: fontRegular, color: rgb(1, 1, 1)
    });

    // --- TÍTULO Y DIRECCIÓN ---
    page.drawText(lead.titulo || 'Inmueble Captado', { 
      x: 40, y: height - 150, size: 16, font: fontBold, color: darkGray 
    });
    page.drawText(`📍 ${lead.direccion || 'Ubicación reservada'}`, { 
      x: 40, y: height - 175, size: 11, font: fontRegular, color: rgb(0.4, 0.4, 0.4) 
    });

    // --- FOTO DEL INMUEBLE (OPCIÓN ROBUSTA CON FALLBACK) ---
    let imageDrawn = false;
    if (lead.foto) {
      try {
        const imageResponse = await fetch(lead.foto, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const imageBuffer = await imageResponse.arrayBuffer();

        let imageToEmbed;
        // pdf-lib solo soporta JPG y PNG. Idealista a veces envía WEBP, esto protege la app.
        if (lead.foto.toLowerCase().includes('.png')) {
          imageToEmbed = await pdfDoc.embedPng(imageBuffer);
        } else {
          imageToEmbed = await pdfDoc.embedJpg(imageBuffer);
        }

        page.drawImage(imageToEmbed, {
          x: 40, y: height - 400, width: 250, height: 180,
        });
        imageDrawn = true;
      } catch (e) {
        imageDrawn = false; // Falló la descarga o el formato es incompatible
      }
    }

    if (!imageDrawn) {
      // Bloque "Datos Protegidos" (Opción 2 solicitada)
      page.drawRectangle({ x: 40, y: height - 400, width: 250, height: 180, color: lightGray });
      page.drawText("DATOS PROTEGIDOS", { x: 90, y: height - 310, size: 14, font: fontBold, color: rgb(0.6,0.6,0.6) });
      page.drawText("Imagen bloqueada por el origen", { x: 70, y: height - 330, size: 10, font: fontRegular, color: rgb(0.6,0.6,0.6) });
    }

    // --- DATOS DEL INMUEBLE (Columna Derecha) ---
    const startY = height - 220;
    page.drawText('Características de la Propiedad', { x: 310, y: startY, size: 14, font: fontBold, color: kavoxColor });

    const details = [
      `Precio Publicado: ${lead.precio ? lead.precio.toLocaleString('es-ES') + ' €' : 'N/D'}`,
      `Superficie: ${lead.m2 ? lead.m2 + ' m²' : 'N/D'}`,
      `Habitaciones: ${lead.habitaciones || '-'}`,
      `Baños: ${lead.banos || '-'}`,
      `Planta: ${lead.planta || '-'}`,
      `Estado actual: En Comercialización`
    ];

    details.forEach((text, i) => {
      page.drawText(`• ${text}`, { x: 310, y: startY - 30 - (i * 25), size: 11, font: fontRegular, color: darkGray });
    });

    // --- SECCIÓN: ANÁLISIS DE MERCADO REAL ---
    page.drawRectangle({ x: 40, y: height - 600, width: width - 80, height: 140, color: lightGray });

    page.drawText('Análisis Comparativo de Mercado (CMA)', { x: 60, y: height - 490, size: 14, font: fontBold, color: kavoxColor });

    page.drawText(`Basado en ${comparables ? comparables.length : 1} testigos captados recientemente en esta zona.`, { 
      x: 60, y: height - 510, size: 10, font: fontRegular, color: rgb(0.4, 0.4, 0.4) 
    });

    page.drawText('Valor Medio M² en la zona:', { x: 60, y: height - 540, size: 12, font: fontBold, color: darkGray });
    page.drawText(`${avgPrecioM2.toLocaleString('es-ES')} €/m²`, { x: 60, y: height - 565, size: 20, font: fontBold, color: kavoxColor });

    if (valorEstimado > 0) {
      page.drawText('Valor Estimado del Inmueble:', { x: 310, y: height - 540, size: 12, font: fontBold, color: darkGray });
      page.drawText(`${valorEstimado.toLocaleString('es-ES')} €`, { x: 310, y: height - 565, size: 20, font: fontBold, color: rgb(0.86, 0.15, 0.15) }); // Color rojo/alerta para contraste
    } else {
      page.drawText('Faltan datos de M² para estimación.', { x: 310, y: height - 565, size: 12, font: fontRegular, color: darkGray });
    }

    // --- PIE DE PÁGINA (CTA) ---
    page.drawRectangle({ x: 0, y: 0, width: width, height: 60, color: darkGray });
    page.drawText('Este informe es automático. Para una tasación oficial y un plan de venta garantizado, contáctanos.', {
      x: 60, y: 25, size: 10, font: fontRegular, color: rgb(1, 1, 1)
    });

    const pdfBytes = await pdfDoc.save();

    // ==========================================
    // 4. SUBIR A STORAGE Y GUARDAR URL
    // ==========================================
    const fileName = `${id_agencia}/cma_${id_anuncio}_${Date.now()}.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('informes_cma')
      .upload(fileName, pdfBytes, { contentType: 'application/pdf', upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabaseAdmin.storage.from('informes_cma').getPublicUrl(fileName);
    const pdfUrl = publicUrlData.publicUrl;

    await supabaseAdmin.from('propiedades_rastreadas').update({ pdf_cma_url: pdfUrl }).eq('id_anuncio', id_anuncio).eq('id_agencia', id_agencia);

    return NextResponse.json({ success: true, url: pdfUrl });

  } catch (error: any) {
    console.error("Error generating CMA:", error);
    return NextResponse.json({ error: "Error generando el informe" }, { status: 500 });
  }
}