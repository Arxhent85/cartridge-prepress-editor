import * as pdfjsLib from 'pdfjs-dist';
import { LayoutElement, TextElement, ImageElement } from '../types';

// Set up worker for browser environment
if (typeof window !== 'undefined' && 'Worker' in window) {
  // Use unpkg/cdnjs or inline fake worker for client-side bundle
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF.js worker setup note:', e);
  }
}

export interface PdfImportResult {
  elements: LayoutElement[];
  pageCount: number;
  widthMm: number;
  heightMm: number;
}

/**
 * Parses any uploaded PDF file into editable LayoutElements (Texts, Background Image, Dimensions)
 */
export async function extractElementsFromPdf(
  file: File,
  printableWidthMm: number,
  printableHeightMm: number
): Promise<PdfImportResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
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
    await (page.render({
      canvasContext: renderCtx as any,
      viewport: renderViewport,
      canvas: renderCanvas as any,
    }) as any).promise;
    backgroundDataUrl = renderCanvas.toDataURL('image/png');
  }

  // 2. Extract Text Content (Strings, Font Size, Coordinates)
  const textContent = await page.getTextContent();
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

  // Group adjacent text tokens into coherent sentences/lines
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

  // Merge items on roughly the same line (within 2mm)
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

  // Convert merged text into real editable TextElements
  mergedItems.forEach((m, idx) => {
    // Detect language or category
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
      name: isLarge ? `Titel: "${m.str.slice(0, 16)}..."` : `Textblock: "${m.str.slice(0, 16)}..."`,
      type: 'text',
      x: Math.max(4, Math.min(printableWidthMm - 30, m.x)),
      y: Math.max(4, Math.min(printableHeightMm - 10, m.y)),
      width: Math.min(printableWidthMm - 8, Math.max(30, m.width)),
      height: Math.max(6, m.height),
      rotation: 0,
      spotColorId: isLarge ? 'black' : 'black',
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

  return {
    elements: extractedElements,
    pageCount: pdfDoc.numPages,
    widthMm: pageActualWidthMm,
    heightMm: pageActualHeightMm,
  };
}
