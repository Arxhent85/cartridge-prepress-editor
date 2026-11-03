import { LayoutElement } from '../types';
import { extractElementsFromPdf } from './pdfExtractor';

/**
 * Universal file importer: decomposes PDF, SVG, CDR and raster images
 */
export async function parseUploadedFile(
  file: File,
  currentElements: LayoutElement[],
  printableWidthMm: number = 148,
  printableHeightMm: number = 205
): Promise<LayoutElement[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  // 1. PDF Document: Extract real text blocks and high-res layout base
  if (extension === 'pdf') {
    try {
      const result = await extractElementsFromPdf(file, printableWidthMm, printableHeightMm);
      if (result.elements.length > 0) {
        return result.elements;
      }
    } catch (err) {
      console.error('PDF Parsing failed, falling back to basic layer import:', err);
    }
  }

  // 2. SVG Import
  if (extension === 'svg') {
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
    return [...currentElements, newSvg];
  }

  // 3. Raster Images (PNG, JPG, JPEG, WebP)
  if (['png', 'jpg', 'jpeg', 'webp'].includes(extension || '')) {
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
        grayscale1c: true,
        brightness: 0,
        contrast: 10,
        gamma: 1.1,
        dotGainCompensation: 20,
        unsharpMask: 30,
        levelsMin: 10,
        levelsMax: 245,
        invert: false,
      },
      isLocked: false,
      isHidden: false,
      layerGroup: 'photo',
    };
    return [...currentElements, newImg];
  }

  // 4. CorelDraw CDR
  if (extension === 'cdr') {
    return [
      {
        id: `cdr_title_${Date.now()}`,
        name: `CDR Vektortitel (${file.name})`,
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
        strokeWidth: 0.25,
        isLocked: false,
        isHidden: false,
        layerGroup: 'logos',
      },
      ...currentElements,
    ];
  }

  return currentElements;
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
