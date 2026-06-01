        // artifacts/radar-proptech/app/api/cma/generate/route.ts
        import { NextResponse } from 'next/server';
        import { createClient as createAdminClient } from '@supabase/supabase-js';
        import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

        export const maxDuration = 60;

        // Escudo corregido: Mantiene letras, números, acentos, ñ, y el símbolo € (\u20AC)
        function cleanText(text: string | null | undefined) {
          if (!text) return "";
          return text.replace(/[^\x20-\x7E\xA0-\xFF\u20AC]/g, '').trim();
        }

        // Función auxiliar para acortar textos largos (ej. Títulos muy largos)
        function truncate(str: string, n: number) {
          return (str.length > n) ? str.slice(0, n - 1) + '...' : str;
        }

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

            // 1. Obtener datos
            const { data: lead } = await supabaseAdmin.from('propiedades_rastreadas').select('*').eq('id_anuncio', id_anuncio).eq('id_agencia', id_agencia).single();
            if (!lead) return NextResponse.json({ error: "Lead no encontrado." }, { status: 404 });
            if (lead.pdf_cma_url) return NextResponse.json({ success: true, url: lead.pdf_cma_url });

            const { data: agencia } = await supabaseAdmin.from('agencias').select('nombre_empresa').eq('id_agencia', id_agencia).single();
            const nombreEmpresa = cleanText(agencia?.nombre_empresa?.toUpperCase() || 'AGENCIA INMOBILIARIA');

            // 2. Motor CMA
            const { data: comparables } = await supabaseAdmin.from('propiedades_rastreadas')
              .select('precio, m2').eq('id_agencia', id_agencia).eq('tipo', lead.tipo || 'flat').gt('m2', 0).gt('precio', 0);

            let avgPrecioM2 = 0;
            if (comparables && comparables.length > 0) {
              const sumM2 = comparables.reduce((acc, curr) => acc + (curr.precio / curr.m2), 0);
              avgPrecioM2 = Math.round(sumM2 / comparables.length);
            } else if (lead.precio && lead.m2) {
              avgPrecioM2 = Math.round(lead.precio / lead.m2);
            }
            const valorEstimado = (lead.m2 && avgPrecioM2) ? (lead.m2 * avgPrecioM2) : 0;

            // 3. GENERACIÓN DEL PDF PREMIUM
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([595.28, 841.89]); // A4
            const { width, height } = page.getSize();

            const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

            // Paleta de Colores KAVOX Editorial
            const brandColor = rgb(0 / 255, 135 / 255, 153 / 255); // #008799
            const brandLight = rgb(240 / 255, 249 / 255, 250 / 255); // Fondo sutil para la caja de valoración
            const textDark = rgb(30 / 255, 41 / 255, 59 / 255); // Slate 800
            const textMuted = rgb(100 / 255, 116 / 255, 139 / 255); // Slate 500
            const borderGray = rgb(0.9, 0.9, 0.9);

            // --- CABECERA ---
            page.drawRectangle({ x: 0, y: height - 110, width: width, height: 110, color: brandColor });
            page.drawText(nombreEmpresa, { x: 40, y: height - 55, size: 26, font: fontBold, color: rgb(1, 1, 1) });
            page.drawText('DOSSIER DE VALORACIÓN DE MERCADO', { x: 40, y: height - 80, size: 10, font: fontBold, color: rgb(0.8, 0.9, 0.9) });

            // --- TÍTULO INMUEBLE ---
            const tituloLimpio = truncate(cleanText(lead.titulo || 'Inmueble'), 60);
            page.drawText(tituloLimpio, { x: 40, y: height - 160, size: 18, font: fontBold, color: textDark });
            page.drawText(`📍 ${cleanText(lead.direccion || 'Ubicación reservada')}`, { x: 40, y: height - 180, size: 10, font: fontRegular, color: textMuted });

            // --- FOTO DEL INMUEBLE (Columna Izquierda) ---
            let imageDrawn = false;
            if (lead.foto) {
              try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); 
                const imageResponse = await fetch(lead.foto, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: controller.signal });
                clearTimeout(timeoutId);

                if (imageResponse.ok) {
                  const imageBuffer = await imageResponse.arrayBuffer();
                  const imageToEmbed = lead.foto.toLowerCase().includes('.png') 
                    ? await pdfDoc.embedPng(imageBuffer) 
                    : await pdfDoc.embedJpg(imageBuffer);

                  page.drawImage(imageToEmbed, { x: 40, y: height - 400, width: 250, height: 190 });
                  imageDrawn = true;
                }
              } catch (e) { /* Fallback */ }
            }

            if (!imageDrawn) {
              page.drawRectangle({ x: 40, y: height - 400, width: 250, height: 190, color: borderGray });
              page.drawText("IMAGEN PROTEGIDA", { x: 95, y: height - 300, size: 12, font: fontBold, color: textMuted });
            }

            // --- GRID DE DATOS (Columna Derecha) ---
            const rightX = 320;

            // Precio
            page.drawText('PRECIO PUBLICADO', { x: rightX, y: height - 240, size: 9, font: fontBold, color: textMuted });
            page.drawText(`${lead.precio ? lead.precio.toLocaleString('es-ES') : '--'} €`, { x: rightX, y: height - 265, size: 22, font: fontBold, color: brandColor });
            page.drawLine({ start: { x: rightX, y: height - 285 }, end: { x: width - 40, y: height - 285 }, thickness: 1, color: borderGray });

            // Fila 1: M2 y Habitaciones
            page.drawText('SUPERFICIE', { x: rightX, y: height - 310, size: 9, font: fontBold, color: textMuted });
            page.drawText(`${lead.m2 ? lead.m2 + ' m²' : '--'}`, { x: rightX, y: height - 330, size: 14, font: fontBold, color: textDark });

            page.drawText('HABITACIONES', { x: rightX + 110, y: height - 310, size: 9, font: fontBold, color: textMuted });
            page.drawText(`${lead.habitaciones || '--'}`, { x: rightX + 110, y: height - 330, size: 14, font: fontBold, color: textDark });
            page.drawLine({ start: { x: rightX, y: height - 350 }, end: { x: width - 40, y: height - 350 }, thickness: 1, color: borderGray });

            // Fila 2: Baños y Planta
            page.drawText('BAÑOS', { x: rightX, y: height - 375, size: 9, font: fontBold, color: textMuted });
            page.drawText(`${lead.banos || '--'}`, { x: rightX, y: height - 395, size: 14, font: fontBold, color: textDark });

            page.drawText('PLANTA', { x: rightX + 110, y: height - 375, size: 9, font: fontBold, color: textMuted });
            page.drawText(`${cleanText(lead.planta) || '--'}`, { x: rightX + 110, y: height - 395, size: 14, font: fontBold, color: textDark });

            // --- CAJA DE VALORACIÓN (CMA) ---
            const boxY = height - 590;
            page.drawRectangle({ x: 40, y: boxY, width: width - 80, height: 140, color: brandLight });

            page.drawText('ANÁLISIS COMPARATIVO DE MERCADO', { x: 60, y: boxY + 105, size: 14, font: fontBold, color: brandColor });
            page.drawText(`Basado en ${comparables ? comparables.length : 1} testigos captados recientemente en esta zona.`, { x: 60, y: boxY + 85, size: 10, font: fontRegular, color: textMuted });

            page.drawLine({ start: { x: 60, y: boxY + 70 }, end: { x: width - 60, y: boxY + 70 }, thickness: 1, color: rgb(0.8, 0.9, 0.9) });

            // Valores CMA
            page.drawText('Valor Medio de la Zona', { x: 60, y: boxY + 40, size: 10, font: fontBold, color: textMuted });
            page.drawText(`${avgPrecioM2.toLocaleString('es-ES')} € / m²`, { x: 60, y: boxY + 20, size: 18, font: fontBold, color: textDark });

            if (valorEstimado > 0) {
              page.drawText('Valor Estimado del Inmueble', { x: 300, y: boxY + 40, size: 10, font: fontBold, color: textMuted });
              page.drawText(`${valorEstimado.toLocaleString('es-ES')} €`, { x: 300, y: boxY + 18, size: 22, font: fontBold, color: brandColor });
            } else {
              page.drawText('Faltan datos de M² para estimación.', { x: 300, y: boxY + 20, size: 10, font: fontRegular, color: textMuted });
            }

            // --- FOOTER ---
            page.drawRectangle({ x: 0, y: 0, width: width, height: 60, color: textDark });
            page.drawText('Este informe ha sido generado de forma automática. Para una valoración técnica, contáctenos directamente.', { 
              x: 40, y: 25, size: 9, font: fontRegular, color: rgb(0.8, 0.8, 0.8) 
            });

            const pdfBytes = await pdfDoc.save();
            const buffer = Buffer.from(pdfBytes);

            // 4. SUBIDA Y GUARDADO
            const fileName = `${id_agencia}/cma_${id_anuncio}_${Date.now()}.pdf`;
            const { error: uploadError } = await supabaseAdmin.storage.from('informes_cma').upload(fileName, buffer, { contentType: 'application/pdf', upsert: true });

            if (uploadError) return NextResponse.json({ error: `Fallo al subir a Storage: ${uploadError.message}` }, { status: 500 });

            const { data: publicUrlData } = supabaseAdmin.storage.from('informes_cma').getPublicUrl(fileName);
            const pdfUrl = publicUrlData.publicUrl;

            await supabaseAdmin.from('propiedades_rastreadas').update({ pdf_cma_url: pdfUrl }).eq('id_anuncio', id_anuncio).eq('id_agencia', id_agencia);

            return NextResponse.json({ success: true, url: pdfUrl });

          } catch (globalError: any) {
            return NextResponse.json({ error: `Excepción no controlada: ${globalError.message}` }, { status: 500 });
          }
        }