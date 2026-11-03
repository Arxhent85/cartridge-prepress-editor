import { ImageFilterSettings } from '../types';

/**
 * High-performance Canvas/WebGL image processor for industrial prepress & screen printing
 */
export function applyPrepressFilters(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  settings: ImageFilterSettings,
  targetCanvas?: HTMLCanvasElement,
  plateHexColor?: string
): HTMLCanvasElement {
  const canvas = targetCanvas || document.createElement('canvas');
  const width = sourceImage.width || 600;
  const height = sourceImage.height || 400;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  // Draw base image
  ctx.drawImage(sourceImage, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const len = data.length;

  const {
    grayscale1c,
    brightness,
    contrast,
    gamma,
    dotGainCompensation,
    levelsMin,
    levelsMax,
    invert,
  } = settings;

  // Contrast factor
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  // Levels range
  const range = Math.max(1, levelsMax - levelsMin);
  // Dot gain curve strength (e.g. 0.20 for 20% gain)
  const dotGain = dotGainCompensation / 100;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue;

    // 1. Grayscale 1c (Unbuntaufbau for screen printing)
    if (grayscale1c) {
      // Perceptual prepress luminance
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray;
      g = gray;
      b = gray;
    }

    // 2. Levels / Tonwertspreizung
    r = Math.min(255, Math.max(0, ((r - levelsMin) * 255) / range));
    g = Math.min(255, Math.max(0, ((g - levelsMin) * 255) / range));
    b = Math.min(255, Math.max(0, ((b - levelsMin) * 255) / range));

    // 3. Brightness & Contrast
    if (brightness !== 0) {
      r += brightness;
      g += brightness;
      b += brightness;
    }
    if (contrast !== 0) {
      r = factor * (r - 128) + 128;
      g = factor * (g - 128) + 128;
      b = factor * (b - 128) + 128;
    }

    // 4. Dot-Gain Compensation (Murray-Davies curve for screen printing)
    // In screen printing, wet UV ink spreads out on HDPE, causing midtones to darken heavily.
    // We compensate by brightening midtones: f(x) = x - dotGain * 4 * x * (1 - x)
    if (dotGain > 0) {
      let normR = Math.min(1, Math.max(0, r / 255));
      let normG = Math.min(1, Math.max(0, g / 255));
      let normB = Math.min(1, Math.max(0, b / 255));

      // Inverse curve for printing positive
      normR = normR + dotGain * 4 * normR * (1 - normR);
      normG = normG + dotGain * 4 * normG * (1 - normG);
      normB = normB + dotGain * 4 * normB * (1 - normB);

      r = normR * 255;
      g = normG * 255;
      b = normB * 255;
    }

    // 5. Gamma adjustment
    if (gamma !== 1.0 && gamma > 0) {
      const invGamma = 1 / gamma;
      r = 255 * Math.pow(Math.min(1, Math.max(0, r / 255)), invGamma);
      g = 255 * Math.pow(Math.min(1, Math.max(0, g / 255)), invGamma);
      b = 255 * Math.pow(Math.min(1, Math.max(0, b / 255)), invGamma);
    }

    // 6. Invert
    if (invert) {
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    }

    // Clamp
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    // Optional: Spot color tint (e.g. for monochrome plate preview)
    if (plateHexColor && plateHexColor !== '#FFFFFF') {
      const pr = parseInt(plateHexColor.slice(1, 3), 16) / 255;
      const pg = parseInt(plateHexColor.slice(3, 5), 16) / 255;
      const pb = parseInt(plateHexColor.slice(5, 7), 16) / 255;
      const darkness = 1 - r / 255; // 0 = white, 1 = dark
      r = 255 - darkness * (255 - pr * 255);
      g = 255 - darkness * (255 - pg * 255);
      b = 255 - darkness * (255 - pb * 255);
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  // Put image data back
  ctx.putImageData(imgData, 0, 0);

  // 7. Unsharp Mask (Schärfefilter)
  if (settings.unsharpMask > 0) {
    applyUnsharpMask(ctx, width, height, settings.unsharpMask / 100);
  }

  return canvas;
}

/**
 * 3x3 convolution unsharp mask kernel
 */
function applyUnsharpMask(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number) {
  const original = ctx.getImageData(0, 0, width, height);
  const src = original.data;
  const output = ctx.createImageData(width, height);
  const dst = output.data;

  // Unsharp kernel with center boost
  const kWeight = amount * 1.5;
  const kEdge = -kWeight / 4;
  const kCenter = 1 + kWeight;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const top = ((y - 1) * width + x) * 4;
      const btm = ((y + 1) * width + x) * 4;
      const lft = (y * width + (x - 1)) * 4;
      const rgt = (y * width + (x + 1)) * 4;

      for (let c = 0; c < 3; c++) {
        const val =
          src[idx + c] * kCenter +
          (src[top + c] + src[btm + c] + src[lft + c] + src[rgt + c]) * kEdge;
        dst[idx + c] = Math.min(255, Math.max(0, val));
      }
      dst[idx + 3] = src[idx + 3]; // alpha
    }
  }

  ctx.putImageData(output, 0, 0);
}

/**
 * Simulates UV screen printing halftone raster (36 L/cm or 48 L/cm) or FM stochastic dot pattern
 */
export function applyHalftoneSimulation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mode: '36_lpcm' | '48_lpcm' | 'fm_stochastic'
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const src = imgData.data;

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = width;
  outputCanvas.height = height;
  const oCtx = outputCanvas.getContext('2d');
  if (!oCtx) return;

  oCtx.fillStyle = '#FFFFFF';
  oCtx.fillRect(0, 0, width, height);
  oCtx.fillStyle = '#141414';

  const dotSpacing = mode === '36_lpcm' ? 7 : mode === '48_lpcm' ? 5 : 3;

  if (mode === 'fm_stochastic') {
    // Stochastic / FM frequency modulated noise dithering
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const idx = (y * width + x) * 4;
        const gray = 0.299 * src[idx] + 0.587 * src[idx + 1] + 0.114 * src[idx + 2];
        const threshold = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
        const normalized = 1 - gray / 255;
        if (normalized > Math.abs(threshold)) {
          oCtx.fillRect(x, y, 2, 2);
        }
      }
    }
  } else {
    // AM round dot screen (45 degree rotation standard)
    const angle = Math.PI / 4;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    for (let y = 0; y < height; y += dotSpacing) {
      for (let x = 0; x < width; x += dotSpacing) {
        const idx = (y * width + x) * 4;
        const gray = 0.299 * src[idx] + 0.587 * src[idx + 1] + 0.114 * src[idx + 2];
        const dotDensity = 1 - gray / 255; // 0 = white, 1 = black
        if (dotDensity > 0.02) {
          const radius = (dotSpacing / 2) * Math.sqrt(dotDensity) * 1.08;
          oCtx.beginPath();
          oCtx.arc(x + dotSpacing / 2, y + dotSpacing / 2, radius, 0, Math.PI * 2);
          oCtx.fill();
        }
      }
    }
  }

  ctx.drawImage(outputCanvas, 0, 0);
}
