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

    // 1. Obtenemos los datos del Inmueble y de la Agencia
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

    // Si ya existe un PDF, simplemente devolvemos la URL para no gastar recursos
    if (lead.pdf_cma_url) {
      return NextResponse.json({ success: true, url: lead.pdf_cma_url });
    }

    // 2. CREACIÓN DEL PDF (Magia Serverless)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // Tamaño A4 estándar
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const kavoxColor = rgb(0 / 255, 135 / 255, 153 / 255); // #008799
    const textColor = rgb(0.2, 0.2, 0.2);

    // Cabecera Corporativa
    page.drawRectangle({ x: 0, y: height - 100, width: width, height: 100, color: kavoxColor });
    page.drawText(agencia?.nombre_empresa?.toUpperCase() || 'AGENCIA INMOBILIARIA', {
      x: 50, y: height - 55, size: 24, font: fontBold, color: rgb(1, 1, 1),
    });
    page.drawText('Análisis Comparativo de Mercado (CMA)', {
      x: 50, y: height - 75, size: 12, font: fontRegular, color: rgb(1, 1, 1),
    });

    // Título Inmueble
    page.drawText(lead.titulo || 'Propiedad Captada', { x: 50, y: height - 150, size: 18, font: fontBold, color: textColor });
    page.drawText(`Dirección: ${lead.direccion || 'Ubicación reservada'}`, { x: 50, y: height - 170, size: 11, font: fontRegular, color: textColor });

    // Bloque de Valoración (Datos Duros)
    const precio = lead.precio ? `${lead.precio.toLocaleString('es-ES')} €` : 'No disponible';
    const m2 = lead.m2 ? `${lead.m2} m²` : 'N/D';
    const precioM2 = (lead.precio && lead.m2) ? `${Math.round(lead.precio / lead.m2).toLocaleString('es-ES')} €/m²` : 'N/D';

    page.drawText(`Precio de Salida: ${precio}`, { x: 50, y: height - 220, size: 14, font: fontBold, color: kavoxColor });
    page.drawText(`Superficie: ${m2}`, { x: 50, y: height - 240, size: 12, font: fontRegular, color: textColor });
    page.drawText(`Ratio €/m² actual: ${precioM2}`, { x: 50, y: height - 260, size: 12, font: fontRegular, color: textColor });

    page.drawText(`Habitaciones: ${lead.habitaciones || '-'} | Baños: ${lead.banos || '-'} | Planta: ${lead.planta || '-'}`, { x: 50, y: height - 280, size: 12, font: fontRegular, color: textColor });

    // Sección de cierre
    page.drawText("Estimación inicial generada por el radar tecnológico KAVOX.", {
      x: 50, y: 50, size: 10, font: fontRegular, color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();

    // 3. Subir a Supabase Storage
    const fileName = `${id_agencia}/cma_${id_anuncio}_${Date.now()}.pdf`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('informes_cma')
      .upload(fileName, pdfBytes, { contentType: 'application/pdf', upsert: true });

    if (uploadError) throw uploadError;

    // 4. Obtener URL pública y actualizar la BD
    const { data: publicUrlData } = supabaseAdmin.storage.from('informes_cma').getPublicUrl(fileName);
    const pdfUrl = publicUrlData.publicUrl;

    await supabaseAdmin.from('propiedades_rastreadas').update({ pdf_cma_url: pdfUrl }).eq('id_anuncio', id_anuncio).eq('id_agencia', id_agencia);

    return NextResponse.json({ success: true, url: pdfUrl });

  } catch (error: any) {
    console.error("Error generating CMA:", error);
    return NextResponse.json({ error: "Error generando el informe" }, { status: 500 });
  }
}