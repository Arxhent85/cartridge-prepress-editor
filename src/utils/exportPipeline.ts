import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';
import { CartridgeConfig, LayoutElement, PrepressSettings, SpotColor } from '../types';

/**
 * Generates an SVG representation of the cartridge layout with layers and prepress marks
 */
export function generateLayoutSVG(
  elements: LayoutElement[],
  cartridge: CartridgeConfig,
  spotColors: SpotColor[],
  settings: PrepressSettings,
  singlePlateId?: string
): string {
  const widthMm = cartridge.printableWidthMm + (settings.includeControlStrip ? 18 : 0);
  const heightMm = cartridge.printableHeightMm;

  // Convert mm to pixels at 72 dpi (1 mm = 2.83465 pt)
  const mmToPt = 2.83465;
  const svgWidth = widthMm * mmToPt;
  const svgHeight = heightMm * mmToPt;

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${widthMm}mm" height="${heightMm}mm">
  <defs>
    <!-- Screen printing Spot Color metadata -->
    ${spotColors
      .map(
        (sc) =>
          `<color-profile name="${sc.name}" value="${sc.hex}" pantone="${sc.pantoneName || ''}"/>`
      )
      .join('\n    ')}
  </defs>

  <!-- Background Base / Cartridge Surface -->
  <rect width="${svgWidth}" height="${svgHeight}" fill="${singlePlateId ? '#ffffff' : '#f0f2f5'}" stroke="none"/>
`;

  // Draw Elements
  for (const el of elements) {
    if (el.isHidden) continue;

    // Filter by single plate if requested
    if (singlePlateId) {
      const isNeg = 'isNegative' in el && el.isNegative;
      if (singlePlateId === 'white' && !isNeg && el.spotColorId !== 'white') {
        continue;
      } else if (singlePlateId !== 'white' && el.spotColorId !== singlePlateId) {
        continue;
      }
    }

    const x = el.x * mmToPt;
    const y = el.y * mmToPt;
    const w = el.width * mmToPt;
    const h = el.height * mmToPt;

    const spot = spotColors.find((s) => s.id === el.spotColorId);
    const colorHex = singlePlateId ? '#000000' : spot?.hex || '#141414';

    if (el.type === 'rect') {
      const fill = singlePlateId ? '#000000' : el.fillColor || colorHex;
      svgContent += `  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${(el.cornerRadius || 0) * mmToPt}" fill="${fill}" stroke="${el.strokeWidth > 0 ? (singlePlateId ? '#000000' : el.strokeColor) : 'none'}" stroke-width="${el.strokeWidth * mmToPt}"/>\n`;
    } else if (el.type === 'line') {
      if (el.points && el.points.length >= 2) {
        svgContent += `  <line x1="${el.points[0].x * mmToPt}" y1="${el.points[0].y * mmToPt}" x2="${el.points[1].x * mmToPt}" y2="${el.points[1].y * mmToPt}" stroke="${colorHex}" stroke-width="${el.strokeWidth * mmToPt}" stroke-linecap="round"/>\n`;
      }
    } else if (el.type === 'text') {
      const fontSizePt = el.fontSize * 1.33;
      const stroke = el.strokeWidth > 0 ? `stroke="${colorHex}" stroke-width="${el.strokeWidth * mmToPt * 0.3}"` : '';
      const textFill = singlePlateId ? '#000000' : el.textColor;
      svgContent += `  <text x="${x}" y="${y + fontSizePt * 0.85}" font-family="${el.fontFamily}" font-size="${fontSizePt}" font-weight="${el.fontWeight}" fill="${textFill}" letter-spacing="${el.letterSpacing}pt" ${stroke}>${escapeXml(el.text)}</text>\n`;
    } else if (el.type === 'svg') {
      svgContent += `  <g transform="translate(${x}, ${y}) scale(${w / 100}, ${h / 100})">${el.svgContent}</g>\n`;
    } else if (el.type === 'image') {
      svgContent += `  <image href="${el.src}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none"/>\n`;
    }
  }

  // Draw Color Control Strip (Farbkontrollstreifen & Passkreuze)
  if (settings.includeControlStrip) {
    const stripX = cartridge.printableWidthMm * mmToPt + 8;
    svgContent += `  <!-- Farbkontrollstreifen & Passkreuze -->\n`;
    svgContent += `  <g id="prepress-control-strip" transform="translate(${stripX}, 10)">\n`;
    svgContent += `    <text x="0" y="0" font-family="monospace" font-size="7" fill="#666">KONTROLLSTREIFEN</text>\n`;

    // Registration crosses (Passkreuze) top & bottom
    svgContent += drawPasskreuzSVG(15, 20);
    svgContent += drawPasskreuzSVG(15, svgHeight - 40);

    // Color swatches & step wedges
    spotColors.forEach((sc, idx) => {
      const sy = 45 + idx * 35;
      svgContent += `    <rect x="0" y="${sy}" width="28" height="14" fill="${sc.hex}" stroke="#333" stroke-width="0.5"/>\n`;
      svgContent += `    <rect x="0" y="${sy + 15}" width="14" height="10" fill="${sc.hex}" opacity="0.5"/>\n`;
      svgContent += `    <rect x="14" y="${sy + 15}" width="14" height="10" fill="${sc.hex}" opacity="0.25"/>\n`;
      svgContent += `    <text x="0" y="${sy + 31}" font-family="sans-serif" font-size="6" fill="#333">${sc.id.toUpperCase()}</text>\n`;
    });

    svgContent += `  </g>\n`;
  }

  svgContent += `</svg>`;
  return svgContent;
}

function drawPasskreuzSVG(cx: number, cy: number): string {
  return `    <g transform="translate(${cx}, ${cy})">
      <circle cx="0" cy="0" r="10" fill="none" stroke="#000000" stroke-width="0.75"/>
      <line x1="-14" y1="0" x2="14" y2="0" stroke="#000000" stroke-width="0.75"/>
      <line x1="0" y1="-14" x2="0" y2="14" stroke="#000000" stroke-width="0.75"/>
      <circle cx="0" cy="0" r="3" fill="#000000"/>
    </g>\n`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Creates a print-ready multi-page or multi-layer PDF using pdf-lib
 */
export async function exportPrintReadyPDF(
  elements: LayoutElement[],
  cartridge: CartridgeConfig,
  spotColors: SpotColor[],
  settings: PrepressSettings,
  separateSpotLayers: boolean = true
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontCourier = await pdfDoc.embedFont(StandardFonts.Courier);

  // 1 mm in PDF points = 72 / 25.4 = 2.834645
  const mmToPt = 2.834645;
  const widthPt = (cartridge.printableWidthMm + (settings.includeControlStrip ? 20 : 0)) * mmToPt;
  const heightPt = cartridge.printableHeightMm * mmToPt;

  // 1. Master Composite Page
  const compositePage = pdfDoc.addPage([widthPt, heightPt]);
  renderElementsToPDFPage(compositePage, elements, spotColors, heightPt, mmToPt, fontHelvetica, fontHelveticaBold, fontCourier, undefined, settings);

  // 2. If separateSpotLayers is enabled, add a dedicated page for each screen printing plate
  if (separateSpotLayers) {
    for (const plate of spotColors) {
      if (!plate.isSeparatedPlate) continue;
      const platePage = pdfDoc.addPage([widthPt, heightPt]);
      platePage.drawText(`DRUCKSIEB SEPARATION: ${plate.name.toUpperCase()} (${plate.pantoneName || 'SPOT'})`, {
        x: 10,
        y: heightPt - 12,
        size: 7,
        font: fontHelveticaBold,
        color: rgb(0.2, 0.2, 0.2),
      });

      renderElementsToPDFPage(
        platePage,
        elements,
        spotColors,
        heightPt,
        mmToPt,
        fontHelvetica,
        fontHelveticaBold,
        fontCourier,
        plate.id,
        settings
      );
    }
  }

  // Set PDF Metadata
  pdfDoc.setTitle(`Kartuschendruck Prepress - ${cartridge.name}`);
  pdfDoc.setSubject(`UV-Rundkörpersiebdruck Siebseparationen für ${cartridge.volume}`);
  pdfDoc.setProducer('Cartridge Prepress & Layout Web-App (Industrial Edition)');
  pdfDoc.setCreator('Ace Cartridge Prepress Engine v2.0');

  return await pdfDoc.save();
}

function renderElementsToPDFPage(
  page: PDFPage,
  elements: LayoutElement[],
  spotColors: SpotColor[],
  heightPt: number,
  mmToPt: number,
  fontRegular: any,
  fontBold: any,
  _fontMono: any,
  singlePlateId?: string,
  settings?: PrepressSettings
) {
  for (const el of elements) {
    if (el.isHidden) continue;

    // Plate separation filtering
    if (singlePlateId) {
      const isNeg = 'isNegative' in el && el.isNegative;
      if (singlePlateId === 'white') {
        if (!isNeg && el.spotColorId !== 'white') continue;
      } else if (el.spotColorId !== singlePlateId) {
        continue;
      }
    }

    const x = el.x * mmToPt;
    const w = el.width * mmToPt;
    const h = el.height * mmToPt;
    const y = heightPt - (el.y + el.height) * mmToPt;

    const spot = spotColors.find((s) => s.id === el.spotColorId);
    const color = singlePlateId
      ? rgb(0, 0, 0)
      : spot
      ? hexToRgb(spot.hex)
      : rgb(0.1, 0.1, 0.1);

    if (el.type === 'rect') {
      const fillColor = singlePlateId
        ? rgb(0, 0, 0)
        : el.fillColor
        ? hexToRgb(el.fillColor)
        : color;

      page.drawRectangle({
        x,
        y,
        width: w,
        height: h,
        color: fillColor,
        borderColor: el.strokeWidth > 0 ? (singlePlateId ? rgb(0, 0, 0) : hexToRgb(el.strokeColor)) : undefined,
        borderWidth: el.strokeWidth * mmToPt * 0.35,
      });
    } else if (el.type === 'line') {
      if (el.points && el.points.length >= 2) {
        const startX = el.points[0].x * mmToPt;
        const startY = heightPt - el.points[0].y * mmToPt;
        const endX = el.points[1].x * mmToPt;
        const endY = heightPt - el.points[1].y * mmToPt;

        page.drawLine({
          start: { x: startX, y: startY },
          end: { x: endX, y: endY },
          thickness: el.strokeWidth * mmToPt * 0.35,
          color,
        });
      }
    } else if (el.type === 'text') {
      const font = el.fontWeight === 'bold' || el.fontWeight === '800' ? fontBold : fontRegular;
      const isNeg = el.isNegative;
      const textColor = singlePlateId
        ? rgb(0, 0, 0)
        : isNeg
        ? rgb(1, 1, 1)
        : hexToRgb(el.textColor);

      const lines = el.text.split('\n');
      const fontSize = Math.max(4, el.fontSize * 0.95);
      const lineSpacing = fontSize * (el.lineHeight || 1.15);

      lines.forEach((line, idx) => {
        const textY = y + h - (idx + 1) * lineSpacing + fontSize * 0.2;
        if (textY >= 0 && textY <= heightPt) {
          page.drawText(line, {
            x,
            y: textY,
            size: fontSize,
            font,
            color: textColor,
          });
        }
      });
    }
  }

  // Draw Registration Crosses
  if (settings?.includeControlStrip) {
    const rx = page.getWidth() - 30;
    drawPdfPasskreuz(page, rx, 35);
    drawPdfPasskreuz(page, rx, heightPt - 35);
  }
}

function drawPdfPasskreuz(page: PDFPage, cx: number, cy: number) {
  const black = rgb(0, 0, 0);
  page.drawCircle({ x: cx, y: cy, size: 7, borderColor: black, borderWidth: 0.75 });
  page.drawLine({ start: { x: cx - 11, y: cy }, end: { x: cx + 11, y: cy }, thickness: 0.75, color: black });
  page.drawLine({ start: { x: cx, y: cy - 11 }, end: { x: cx, y: cy + 11 }, thickness: 0.75, color: black });
}

function hexToRgb(hex: string) {
  let cleaned = hex.replace('#', '');
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleaned, 16);
  return rgb((num >> 16) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255);
}
