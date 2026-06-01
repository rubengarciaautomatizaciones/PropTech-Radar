// artifacts/radar-proptech/app/api/cma/generate/route.ts
import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const maxDuration = 60; 

// EL ESCUDO: pdf-lib solo soporta WinAnsi (Latin-1). Los emojis revientan el servidor en seco.
function cleanText(text: string | null | undefined) {
  if (!text) return "";
  return text
    .replace(/€/g, 'EUR') // pdf-lib a veces no mapea bien el euro
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '') // Elimina emojis (📍, 🏠, 🤩) y caracteres raros
    .trim();
}

export async function POST(request: Request) {
  try {
    const { id_anuncio, id_agencia } = await request.json();

    if (!id_anuncio || !id_agencia) {
      return NextResponse.json({ error: "Faltan parámetros id_anuncio o id_agencia" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: lead, error: leadError } = await supabaseAdmin
      .from('propiedades_rastreadas')
      .select('*')
      .eq('id_anuncio', id_anuncio)
      .eq('id_agencia', id_agencia)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: "Lead no encontrado en la Base de Datos." }, { status: 404 });
    }

    // Si ya existe el PDF, no gastamos recursos del servidor
    if (lead.pdf_cma_url) {
      return NextResponse.json({ success: true, url: lead.pdf_cma_url });
    }

    const { data: agencia } = await supabaseAdmin
      .from('agencias')
      .select('nombre_empresa')
      .eq('id_agencia', id_agencia)
      .single();

    const nombreEmpresa = cleanText(agencia?.nombre_empresa?.toUpperCase() || 'AGENCIA INMOBILIARIA');

    // CÁLCULO DE VALORACIÓN (CMA REAL)
    const { data: comparables } = await supabaseAdmin
      .from('propiedades_rastreadas')
      .select('precio, m2')
      .eq('id_agencia', id_agencia)
      .eq('tipo', lead.tipo || 'flat')
      .gt('m2', 0)
      .gt('precio', 0);

    let avgPrecioM2 = 0;
    if (comparables && comparables.length > 0) {
      const sumM2 = comparables.reduce((acc, curr) => acc + (curr.precio / curr.m2), 0);
      avgPrecioM2 = Math.round(sumM2 / comparables.length);
    } else if (lead.precio && lead.m2) {
      avgPrecioM2 = Math.round(lead.precio / lead.m2);
    }
    const valorEstimado = (lead.m2 && avgPrecioM2) ? (lead.m2 * avgPrecioM2) : 0;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); 
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const kavoxColor = rgb(0 / 255, 135 / 255, 153 / 255);
    const darkGray = rgb(0.2, 0.2, 0.2);
    const lightGray = rgb(0.95, 0.95, 0.95);

    // Cabecera
    page.drawRectangle({ x: 0, y: height - 100, width: width, height: 100, color: kavoxColor });
    page.drawText(nombreEmpresa, { x: 40, y: height - 50, size: 22, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('Dossier de Captacion & Analisis de Mercado', { x: 40, y: height - 75, size: 12, font: fontRegular, color: rgb(1, 1, 1) });

    // Título y dirección limpios de Emojis!
    const safeTitulo = cleanText(lead.titulo || 'Inmueble Captado');
    const safeDireccion = cleanText(lead.direccion || 'Ubicacion reservada');

    page.drawText(safeTitulo, { x: 40, y: height - 150, size: 16, font: fontBold, color: darkGray });
    page.drawText(`Direccion: ${safeDireccion}`, { x: 40, y: height - 175, size: 11, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });

    // Inserción Segura de Imagen con Fallback
    let imageDrawn = false;
    if (lead.foto) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); 

        const imageResponse = await fetch(lead.foto, { 
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (imageResponse.ok) {
          const imageBuffer = await imageResponse.arrayBuffer();
          let imageToEmbed;

          if (lead.foto.toLowerCase().includes('.png')) {
            imageToEmbed = await pdfDoc.embedPng(imageBuffer);
          } else {
            imageToEmbed = await pdfDoc.embedJpg(imageBuffer);
          }

          page.drawImage(imageToEmbed, { x: 40, y: height - 400, width: 250, height: 180 });
          imageDrawn = true;
        }
      } catch (e: any) {
        console.warn("Fallo imagen (WebP o error de red):", e.message);
      }
    }

    if (!imageDrawn) {
      page.drawRectangle({ x: 40, y: height - 400, width: 250, height: 180, color: lightGray });
      page.drawText("DATOS PROTEGIDOS", { x: 90, y: height - 310, size: 14, font: fontBold, color: rgb(0.6,0.6,0.6) });
      page.drawText("Imagen no compatible con PDF.", { x: 80, y: height - 330, size: 9, font: fontRegular, color: rgb(0.6,0.6,0.6) });
    }

    const startY = height - 220;
    page.drawText('Caracteristicas de la Propiedad', { x: 310, y: startY, size: 14, font: fontBold, color: kavoxColor });

    const details = [
      `Precio Publicado: ${lead.precio ? lead.precio.toLocaleString('es-ES') + ' EUR' : 'N/D'}`,
      `Superficie: ${lead.m2 ? lead.m2 + ' m2' : 'N/D'}`,
      `Habitaciones: ${lead.habitaciones || '-'}`,
      `Banos: ${lead.banos || '-'}`,
      `Planta: ${lead.planta || '-'}`,
      `Estado actual: En Comercializacion`
    ];

    details.forEach((text, i) => {
      page.drawText(`- ${cleanText(text)}`, { x: 310, y: startY - 30 - (i * 25), size: 11, font: fontRegular, color: darkGray });
    });

    // Análisis de Mercado Inferior
    page.drawRectangle({ x: 40, y: height - 600, width: width - 80, height: 140, color: lightGray });
    page.drawText('Analisis Comparativo de Mercado (CMA)', { x: 60, y: height - 490, size: 14, font: fontBold, color: kavoxColor });
    page.drawText(`Basado en ${comparables ? comparables.length : 1} testigos captados recientemente en esta zona.`, { x: 60, y: height - 510, size: 10, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });

    page.drawText('Valor Medio m2 en la zona:', { x: 60, y: height - 540, size: 12, font: fontBold, color: darkGray });
    page.drawText(`${avgPrecioM2.toLocaleString('es-ES')} EUR/m2`, { x: 60, y: height - 565, size: 20, font: fontBold, color: kavoxColor });

    if (valorEstimado > 0) {
      page.drawText('Valor Estimado del Inmueble:', { x: 310, y: height - 540, size: 12, font: fontBold, color: darkGray });
      page.drawText(`${valorEstimado.toLocaleString('es-ES')} EUR`, { x: 310, y: height - 565, size: 20, font: fontBold, color: rgb(0.86, 0.15, 0.15) }); 
    } else {
      page.drawText('Faltan datos de m2 para estimacion.', { x: 310, y: height - 565, size: 12, font: fontRegular, color: darkGray });
    }

    // Pie de Página
    page.drawRectangle({ x: 0, y: 0, width: width, height: 60, color: darkGray });
    page.drawText('Este informe es automatico. Para una tasacion oficial y plan de venta garantizado, contactanos.', { x: 60, y: 25, size: 10, font: fontRegular, color: rgb(1, 1, 1) });

    const pdfBytes = await pdfDoc.save();

    // Encapsulamos el Uint8Array en un Buffer seguro para Node.js
    const buffer = Buffer.from(pdfBytes);

    const fileName = `${id_agencia}/cma_${id_anuncio}_${Date.now()}.pdf`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('informes_cma')
      .upload(fileName, buffer, { contentType: 'application/pdf', upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: `Fallo al subir a Storage: ${uploadError.message}` }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from('informes_cma').getPublicUrl(fileName);
    const pdfUrl = publicUrlData.publicUrl;

    await supabaseAdmin.from('propiedades_rastreadas').update({ pdf_cma_url: pdfUrl }).eq('id_anuncio', id_anuncio).eq('id_agencia', id_agencia);

    return NextResponse.json({ success: true, url: pdfUrl });

  } catch (globalError: any) {
    return NextResponse.json({ error: `Excepción no controlada: ${globalError.message}` }, { status: 500 });
  }
}