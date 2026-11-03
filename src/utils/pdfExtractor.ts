import * as pdfjsLib from 'pdfjs-dist';
// Vite ?url import creates a local hashed asset URL that works everywhere (local & GitHub Pages)
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
 * Parses any uploaded PDF file into editable LayoutElements (Texts, Background Image, Dimensions)
 */
export async function extractElementsFromPdf(
  file: File,
  printableWidthMm: number = 148,
  printableHeightMm: number = 205
): Promise<PdfImportResult> {
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.5.438/cmaps/',
    cMapPacked: true,
  });

  const pdfDoc = await loadingTask.promise;
  const page = await pdfDoc.getPage(1);

  // Viewport at 72 DPI (1 pt = 1/72 inch)
  const defaultViewport = page.getViewport({ scale: 1.0 });
  const ptToMm = 25.4 / 72; // 0.352778 mm per pt
  const pageActualWidthMm = defaultViewport.width * ptToMm;
  const pageActualHeightMm = defaultViewport.height * ptToMm;

  // Scale factor to map PDF coordinates into Cartridge printable area
  const scaleX = printableWidthMm / Math.max(1, pageActualWidthMm);
  const scaleY = printableHeightMm / Math.max(1, pageActualHeightMm);

  // 1. Render the entire PDF page into a high-res canvas as rasterized base layer
  const renderScale = 2.0;
  const renderViewport = page.getViewport({ scale: renderScale });
  const renderCanvas = document.createElement('canvas');
  renderCanvas.width = renderViewport.width;
  renderCanvas.height = renderViewport.height;
  const renderCtx = renderCanvas.getContext('2d');

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

  // Add the rasterized PDF artwork as base background image
  if (backgroundDataUrl) {
    const bgElement: ImageElement = {
      id: `pdf_base_${Date.now()}`,
      name: `PDF Hintergrund (${file.name.replace(/\.[^/.]+$/, '')})`,
      type: 'image',
      x: 0,
      y: 0,
      width: printableWidthMm,
      height: printableHeightMm,
      rotation: 0,
      spotColorId: 'black',
      src: backgroundDataUrl,
      originalSrc: backgroundDataUrl,
      filterSettings: {
        grayscale1c: true,
        brightness: 0,
        contrast: 10,
        gamma: 1.1,
        dotGainCompensation: 20,
        unsharpMask: 20,
        levelsMin: 8,
        levelsMax: 248,
        invert: false,
      },
      isLocked: false,
      isHidden: false,
      layerGroup: 'background',
    };
    extractedElements.push(bgElement);
  }

  // 2. Extract Text Content (Strings, Font Size, Coordinates)
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
      const tx = item.transform[4] * ptToMm * scaleX;
      // PDF coordinate system has Y starting at bottom
      const ty = (defaultViewport.height - item.transform[5]) * ptToMm * scaleY;
      const itemFontSize = (Math.abs(item.transform[0]) || 10) * scaleX;
      const itemWidth = Math.max(10, (item.width || 20) * ptToMm * scaleX);
      const itemHeight = Math.max(4, (item.height || 10) * ptToMm * scaleY);

      rawItems.push({
        str: item.str,
        x: Math.round(tx * 10) / 10,
        y: Math.max(0, Math.round((ty - itemHeight) * 10) / 10),
        fontSize: Math.round(itemFontSize * 10) / 10,
        width: Math.round(itemWidth * 10) / 10,
        height: Math.round(itemHeight * 10) / 10,
      });
    }

    // Merge adjacent text tokens on the same line (within 2.5mm)
    const mergedItems: RawItem[] = [];
    for (const item of rawItems) {
      const existing = mergedItems.find(
        (m) => Math.abs(m.y - item.y) < 2.5 && Math.abs(m.fontSize - item.fontSize) < 2
      );
      if (existing && item.x > existing.x) {
        existing.str += ' ' + item.str;
        existing.width = Math.max(existing.width, item.x + item.width - existing.x);
      } else {
        mergedItems.push({ ...item });
      }
    }

    textItemsCount = mergedItems.length;

    // Convert merged text into real editable TextElements
    mergedItems.forEach((m, idx) => {
      let lang: 'DE' | 'EN' | 'AL' | 'ALL' = 'ALL';
      const lower = m.str.toLowerCase();
      if (lower.includes('silikon') || lower.includes('gefahr') || lower.includes('untergrund')) {
        lang = 'DE';
      } else if (lower.includes('silicone') || lower.includes('danger') || lower.includes('surface')) {
        lang = 'EN';
      } else if (lower.includes('përdorimi') || lower.includes('kujdes') || lower.includes('mbajeni')) {
        lang = 'AL';
      }

      const isLarge = m.fontSize >= 12;

      const textEl: TextElement = {
        id: `pdf_txt_${Date.now()}_${idx}`,
        name: isLarge ? `Titel: "${m.str.slice(0, 18)}..."` : `Textblock: "${m.str.slice(0, 18)}..."`,
        type: 'text',
        x: Math.max(4, Math.min(printableWidthMm - 30, m.x)),
        y: Math.max(4, Math.min(printableHeightMm - 10, m.y)),
        width: Math.min(printableWidthMm - 8, Math.max(30, m.width)),
        height: Math.max(6, m.height),
        rotation: 0,
        spotColorId: 'black',
        text: m.str,
        fontSize: Math.max(5, Math.min(32, m.fontSize)),
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontWeight: isLarge ? '800' : 'normal',
        letterSpacing: 0.2,
        lineHeight: 1.15,
        textColor: '#141414',
        isNegative: false,
        strokeWidth: 0.15,
        isLocked: false,
        isHidden: false,
        layerGroup: isLarge ? 'logos' : 'text_multilingual',
        language: lang,
      };

      extractedElements.push(textEl);
    });
  } catch (textErr) {
    console.warn('PDF text extraction note:', textErr);
  }

  // If no text was extracted (e.g. scanned or outlined PDF), add a sample editable text overlay
  if (extractedElements.length === 1 && extractedElements[0].type === 'image') {
    extractedElements.push({
      id: `pdf_overlay_title_${Date.now()}`,
      name: 'Editierbarer Text-Overlay',
      type: 'text',
      x: 10,
      y: 15,
      width: 120,
      height: 12,
      rotation: 0,
      spotColorId: 'black',
      text: file.name.replace(/\.[^/.]+$/, '').toUpperCase(),
      fontSize: 16,
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontWeight: '800',
      letterSpacing: 0.5,
      lineHeight: 1.0,
      textColor: '#141414',
      isNegative: false,
      strokeWidth: 0.25,
      isLocked: false,
      isHidden: false,
      layerGroup: 'logos',
    });
  }

  return {
    elements: extractedElements,
    pageCount: pdfDoc.numPages,
    widthMm: pageActualWidthMm,
    heightMm: pageActualHeightMm,
    extractedTextsCount: textItemsCount,
  };
}
