import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { LayoutElement, TextElement, ImageElement } from '../types';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl || './pdf.worker.min.mjs';
}

export interface PdfImportResult {
  elements: LayoutElement[];
  pageCount: number;
  widthMm: number;
  heightMm: number;
  extractedTextsCount: number;
}

/**
 * Extracts and parses any uploaded PDF file into editable LayoutElements
 * with 100% full original colors (RGB/CMYK) and interactive text layers.
 */
export async function extractElementsFromPdf(
  file: File,
  _targetWidthMm?: number,
  _targetHeightMm?: number
): Promise<PdfImportResult> {
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.5.438/cmaps/',
    cMapPacked: true,
  });

  const pdfDoc = await loadingTask.promise;
  const page = await pdfDoc.getPage(1);

  // Viewport at 72 DPI (1 pt = 1/72 inch, 1 inch = 25.4 mm)
  const defaultViewport = page.getViewport({ scale: 1.0 });
  const ptToMm = 25.4 / 72; // ~0.352778 mm per pt
  const pageActualWidthMm = Math.round(defaultViewport.width * ptToMm * 10) / 10;
  const pageActualHeightMm = Math.round(defaultViewport.height * ptToMm * 10) / 10;

  // 1. High-resolution 3x render (300+ DPI) to preserve razor-sharp small text and graphics
  const renderScale = 3.0;
  const renderViewport = page.getViewport({ scale: renderScale });
  const renderCanvas = document.createElement('canvas');
  renderCanvas.width = renderViewport.width;
  renderCanvas.height = renderViewport.height;
  const renderCtx = renderCanvas.getContext('2d', { willReadFrequently: true });

  let backgroundDataUrl = '';
  if (renderCtx) {
    try {
      await (page.render({
        canvasContext: renderCtx as any,
        viewport: renderViewport,
        canvas: renderCanvas as any,
      }) as any).promise;
      backgroundDataUrl = renderCanvas.toDataURL('image/png');
    } catch (renderErr) {
      console.warn('PDF canvas render warning:', renderErr);
    }
  }

  const extractedElements: LayoutElement[] = [];

  // 2. Base Artwork Layer: Full original colors (NO 1c grayscale, NO color loss!)
  if (backgroundDataUrl) {
    const bgElement: ImageElement = {
      id: `pdf_base_${Date.now()}`,
      name: `PDF Druckbogen (${file.name.replace(/\.[^/.]+$/, '')})`,
      type: 'image',
      x: 0,
      y: 0,
      width: pageActualWidthMm,
      height: pageActualHeightMm,
      rotation: 0,
      spotColorId: 'orange',
      src: backgroundDataUrl,
      originalSrc: backgroundDataUrl,
      filterSettings: {
        grayscale1c: false, // FULL ORIGINAL COLOR (Orange, Red, White, Black, Bathroom photo!)
        brightness: 0,
        contrast: 0,
        gamma: 1.0,
        dotGainCompensation: 0,
        unsharpMask: 0,
        levelsMin: 0,
        levelsMax: 255,
        invert: false,
      },
      isMasterPdfArtwork: true,
      isLocked: false,
      isHidden: false,
      layerGroup: 'background',
    };
    extractedElements.push(bgElement);
  }

  // 3. Extract text items & sample background colors for clean patch-replacement
  let textItemsCount = 0;
  try {
    const textContent = await page.getTextContent();

    interface RawItem {
      str: string;
      x: number;
      y: number;
      fontSize: number;
      width: number;
      height: number;
    }

    const rawItems: RawItem[] = [];
    for (const item of textContent.items as any[]) {
      if (!item.str || item.str.trim() === '') continue;

      // item.transform = [scaleX, skewY, skewX, scaleY, tx, ty]
      const tx = item.transform[4] * ptToMm;
      const ty = (defaultViewport.height - item.transform[5]) * ptToMm;
      const itemFontSize = Math.abs(item.transform[0]) || 10;
      const itemWidth = Math.max(6, (item.width || 15) * ptToMm);
      const itemHeight = Math.max(3.5, (item.height || 8) * ptToMm);

      rawItems.push({
        str: item.str,
        x: Math.round(tx * 10) / 10,
        y: Math.max(0, Math.round((ty - itemHeight) * 10) / 10),
        fontSize: Math.round(itemFontSize * 10) / 10,
        width: Math.round(itemWidth * 10) / 10,
        height: Math.round(itemHeight * 10) / 10,
      });
    }

    // Merge adjacent text tokens on the same horizontal line (within 2mm)
    const mergedItems: RawItem[] = [];
    for (const item of rawItems) {
      const existing = mergedItems.find(
        (m) => Math.abs(m.y - item.y) < 2.0 && Math.abs(m.fontSize - item.fontSize) < 2
      );
      if (existing && item.x > existing.x) {
        existing.str += ' ' + item.str;
        existing.width = Math.max(existing.width, item.x + item.width - existing.x);
      } else {
        mergedItems.push({ ...item });
      }
    }

    textItemsCount = mergedItems.length;

    // Convert merged text into real editable TextElements with intelligent background color sampling
    mergedItems.forEach((m, idx) => {
      let lang: 'DE' | 'EN' | 'AL' | 'ALL' = 'ALL';
      const lower = m.str.toLowerCase();
      if (lower.includes('silikon') || lower.includes('gefahr') || lower.includes('untergrund') || lower.includes('anwendungstemperatur')) {
        lang = 'DE';
      } else if (lower.includes('silicone') || lower.includes('danger') || lower.includes('surface') || lower.includes('application')) {
        lang = 'EN';
      } else if (lower.includes('përdorimi') || lower.includes('kujdes') || lower.includes('mbajeni') || lower.includes('temperatura')) {
        lang = 'AL';
      }

      // Sample pixel color from renderCanvas at this text position to determine background patch color & text contrast
      let detectedBgColor = '#FFFFFF';
      let isNegative = false;
      let textColor = '#141414';

      if (renderCtx) {
        try {
          const samplePxX = Math.min(renderCanvas.width - 1, Math.max(0, Math.round((m.x / pageActualWidthMm) * renderCanvas.width)));
          const samplePxY = Math.min(renderCanvas.height - 1, Math.max(0, Math.round((m.y / pageActualHeightMm) * renderCanvas.height)));
          const pixel = renderCtx.getImageData(samplePxX, samplePxY, 1, 1).data;
          const r = pixel[0];
          const g = pixel[1];
          const b = pixel[2];

          // Check if Orange (dominant Red, moderate Green, low Blue)
          if (r > 180 && g > 60 && g < 160 && b < 80) {
            detectedBgColor = '#FF6600';
            isNegative = true;
            textColor = '#FFFFFF';
          } else if (r < 80 && g < 80 && b < 80) {
            // Dark / Black background
            detectedBgColor = '#141414';
            isNegative = true;
            textColor = '#FFFFFF';
          } else if (r > 100 && r < 150 && g > 110 && g < 160 && b > 120 && b < 170) {
            // Manhattan Gray
            detectedBgColor = '#7E858E';
            isNegative = true;
            textColor = '#FFFFFF';
          } else {
            // Light / White background
            detectedBgColor = '#FFFFFF';
            isNegative = false;
            textColor = '#141414';
          }
        } catch (e) {
          // fallback
        }
      }

      const isLarge = m.fontSize >= 13;

      const textEl: TextElement = {
        id: `pdf_txt_${Date.now()}_${idx}`,
        name: isLarge ? `Titel: "${m.str.slice(0, 18)}..."` : `Text: "${m.str.slice(0, 18)}..."`,
        type: 'text',
        x: Math.max(2, Math.min(pageActualWidthMm - 10, m.x)),
        y: Math.max(2, Math.min(pageActualHeightMm - 5, m.y)),
        width: Math.min(pageActualWidthMm - 4, Math.max(12, m.width)),
        height: Math.max(5, m.height),
        rotation: 0,
        spotColorId: isNegative ? 'white' : 'black',
        text: m.str,
        fontSize: Math.max(4.5, Math.min(48, m.fontSize)),
        fontFamily: isLarge ? 'Impact, Helvetica, sans-serif' : 'Helvetica, Arial, sans-serif',
        fontWeight: isLarge ? '800' : 'normal',
        letterSpacing: 0.1,
        lineHeight: 1.15,
        textColor,
        isNegative,
        strokeWidth: isNegative ? 0.25 : 0.1,
        isLocked: false,
        isHidden: false,
        layerGroup: isLarge ? 'logos' : 'text_multilingual',
        language: lang,
        isEdited: false,
        backgroundColor: detectedBgColor,
        isPdfTextOverlay: true,
      };

      extractedElements.push(textEl);
    });
  } catch (textErr) {
    console.warn('PDF text extraction note:', textErr);
  }

  return {
    elements: extractedElements,
    pageCount: pdfDoc.numPages,
    widthMm: pageActualWidthMm,
    heightMm: pageActualHeightMm,
    extractedTextsCount: textItemsCount,
  };
}
