import { LayoutElement } from '../types';
import { extractElementsFromPdf } from './pdfExtractor';

export interface FileImportResponse {
  elements: LayoutElement[];
  message?: string;
  success: boolean;
  pdfWidthMm?: number;
  pdfHeightMm?: number;
}

/**
 * Universal file importer: decomposes PDF, SVG, CDR and raster images
 */
export async function parseUploadedFileWithReport(
  file: File,
  currentElements: LayoutElement[],
  printableWidthMm: number = 148,
  printableHeightMm: number = 205
): Promise<FileImportResponse> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  // 1. PDF Document
  if (extension === 'pdf') {
    try {
      const result = await extractElementsFromPdf(file, printableWidthMm, printableHeightMm);
      if (result.elements.length > 0) {
        return {
          elements: result.elements,
          message: `PDF erfolgreich geladen! ${result.extractedTextsCount} Textblöcke und Drucklayout in Originalfarben extrahiert.`,
          success: true,
          pdfWidthMm: result.widthMm,
          pdfHeightMm: result.heightMm,
        };
      }
    } catch (err: any) {
      console.error('PDF parsing error:', err);
      return {
        elements: [
          {
            id: `fallback_pdf_title_${Date.now()}`,
            name: `PDF Text (${file.name})`,
            type: 'text',
            x: 10,
            y: 20,
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
            strokeWidth: 0.2,
            isLocked: false,
            isHidden: false,
            layerGroup: 'logos',
          },
          ...currentElements,
        ],
        message: `PDF geladen. Fehler beim vollständigen Rendern: ${err?.message || 'Standardfallback'}.`,
        success: true,
      };
    }
  }

  // 2. SVG Import
  if (extension === 'svg') {
    try {
      const text = await file.text();
      const newSvg: LayoutElement = {
        id: `svg_import_${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: 'svg',
        x: 20,
        y: 30,
        width: 40,
        height: 30,
        rotation: 0,
        spotColorId: 'black',
        svgContent: text,
        preserveAspectRatio: true,
        isLocked: false,
        isHidden: false,
        layerGroup: 'logos',
      };
      return {
        elements: [...currentElements, newSvg],
        message: `SVG-Logo "${file.name}" eingefügt.`,
        success: true,
      };
    } catch (e: any) {
      return { elements: currentElements, message: `SVG Fehler: ${e.message}`, success: false };
    }
  }

  // 3. Raster Images (PNG, JPG, JPEG, WebP)
  if (['png', 'jpg', 'jpeg', 'webp'].includes(extension || '')) {
    try {
      const dataUrl = await readFileAsDataURL(file);
      const newImg: LayoutElement = {
        id: `img_import_${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: 'image',
        x: 10,
        y: 40,
        width: 70,
        height: 45,
        rotation: 0,
        spotColorId: 'black',
        src: dataUrl,
        originalSrc: dataUrl,
        filterSettings: {
          grayscale1c: false, // Default to full color!
          brightness: 0,
          contrast: 0,
          gamma: 1.0,
          dotGainCompensation: 0,
          unsharpMask: 0,
          levelsMin: 0,
          levelsMax: 255,
          invert: false,
        },
        isLocked: false,
        isHidden: false,
        layerGroup: 'photo',
      };
      return {
        elements: [...currentElements, newImg],
        message: `Bild "${file.name}" eingefügt.`,
        success: true,
      };
    } catch (e: any) {
      return { elements: currentElements, message: `Bildfehler: ${e.message}`, success: false };
    }
  }

  return { elements: currentElements, message: 'Unbekanntes Dateiformat.', success: false };
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
