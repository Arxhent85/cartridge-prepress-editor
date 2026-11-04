import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  CartridgeConfig,
  LayoutElement,
  PrepressSettings,
  SpotColor,
  TextElement,
} from '../../types';
import { applyPrepressFilters, applyHalftoneSimulation } from '../../utils/imageProcessing';

interface HybridCanvasProps {
  elements: LayoutElement[];
  onElementsChange: (elements: LayoutElement[]) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  cartridge: CartridgeConfig;
  spotColors: SpotColor[];
  settings: PrepressSettings;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onCanvasUpdated?: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onDropFile?: (file: File) => void;
}

export const HybridCanvas: React.FC<HybridCanvasProps> = ({
  elements,
  onElementsChange,
  selectedElementId,
  onSelectElement,
  cartridge,
  spotColors,
  settings,
  canvasRef,
  onCanvasUpdated,
  zoom,
  onZoomChange,
  onDropFile,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 50, y: 35 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Element interaction states
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [elementStartPos, setElementStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Inline In-Canvas Text Editing on Double-Click
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [inlineEditText, setInlineEditText] = useState<string>('');

  // Cached raster images for canvas performance
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const processedImageCache = useRef<Map<string, HTMLCanvasElement>>(new Map());

  // Base Pixels per mm (3.7795 px = 1 mm at 96 DPI)
  const pxPerMm = 3.7795;

  // Pre-load images
  useEffect(() => {
    elements.forEach((el) => {
      if (el.type === 'image' && !imageCache.current.has(el.src)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = el.src;
        img.onload = () => {
          imageCache.current.set(el.src, img);
          renderCanvas();
        };
      }
    });
  }, [elements]);

  // Main canvas render function with True Screen-Pitch High-DPI (Retina / 4K Crispness at any zoom!)
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const totalWidthMm = cartridge.printableWidthMm + (settings.includeControlStrip ? 22 : 0);
    const totalHeightMm = cartridge.printableHeightMm;

    // Display CSS pixels scaled by zoom
    const cssWidthPx = Math.ceil(totalWidthMm * pxPerMm * zoom);
    const cssHeightPx = Math.ceil(totalHeightMm * pxPerMm * zoom);

    // Native device pixel ratio for 100% crisp vector display (no blur on 4K/Retina)
    const dpr = Math.max(2, window.devicePixelRatio || 2);
    const bufferWidthPx = Math.ceil(cssWidthPx * dpr);
    const bufferHeightPx = Math.ceil(cssHeightPx * dpr);

    if (canvas.width !== bufferWidthPx || canvas.height !== bufferHeightPx) {
      canvas.width = bufferWidthPx;
      canvas.height = bufferHeightPx;
    }

    canvas.style.width = cssWidthPx + 'px';
    canvas.style.height = cssHeightPx + 'px';

    ctx.save();
    // Scale context directly by (zoom * dpr) so coordinates remain clean millimeter-based!
    ctx.scale(zoom * dpr, zoom * dpr);

    const displayWidthPx = Math.ceil(totalWidthMm * pxPerMm);
    const displayHeightPx = Math.ceil(totalHeightMm * pxPerMm);

    // Fill cartridge background
    const isSinglePlate = settings.activeColorView !== 'composite';
    ctx.fillStyle = isSinglePlate ? '#ffffff' : '#141518';
    ctx.fillRect(0, 0, displayWidthPx, displayHeightPx);

    // Draw printable layout bounds & bleed
    ctx.strokeStyle = '#383d46';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, displayWidthPx, displayHeightPx);

    // Draw Cartridge Seam / Overlap Safety Line (Nahtbereich)
    const seamX = (cartridge.printableWidthMm - cartridge.seamMarginMm) * pxPerMm;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(seamX, 0);
    ctx.lineTo(seamX, displayHeightPx);
    ctx.stroke();
    ctx.restore();

    // Render each element
    elements.forEach((el) => {
      if (el.isHidden) return;

      // Spot color plate filtering
      if (isSinglePlate) {
        const plateId = settings.activeColorView.replace('plate_', '');
        if (plateId === 'white') {
          if (!('isNegative' in el && el.isNegative) && el.spotColorId !== 'white') return;
        } else if (el.spotColorId !== plateId) {
          return;
        }
      }

      const x = el.x * pxPerMm;
      const y = el.y * pxPerMm;
      const w = el.width * pxPerMm;
      const h = el.height * pxPerMm;

      const spot = spotColors.find((s) => s.id === el.spotColorId);
      const colorHex = isSinglePlate ? '#141414' : spot?.hex || '#141414';

      ctx.save();
      // Rotation
      if (el.rotation !== 0) {
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate((el.rotation * Math.PI) / 180);
        ctx.translate(-(x + w / 2), -(y + h / 2));
      }

      if (el.type === 'rect') {
        const fillColor = isSinglePlate ? '#141414' : el.fillColor || colorHex;
        ctx.fillStyle = fillColor;
        if (el.cornerRadius && el.cornerRadius > 0) {
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, el.cornerRadius * pxPerMm);
          ctx.fill();
          if (el.strokeWidth > 0) {
            ctx.strokeStyle = isSinglePlate ? '#141414' : el.strokeColor;
            ctx.lineWidth = el.strokeWidth * pxPerMm * 0.35;
            ctx.stroke();
          }
        } else {
          ctx.fillRect(x, y, w, h);
          if (el.strokeWidth > 0) {
            ctx.strokeStyle = isSinglePlate ? '#141414' : el.strokeColor;
            ctx.lineWidth = el.strokeWidth * pxPerMm * 0.35;
            ctx.strokeRect(x, y, w, h);
          }
        }
      } else if (el.type === 'line') {
        if (el.points && el.points.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(el.points[0].x * pxPerMm, el.points[0].y * pxPerMm);
          ctx.lineTo(el.points[1].x * pxPerMm, el.points[1].y * pxPerMm);
          ctx.strokeStyle = colorHex;
          ctx.lineWidth = Math.max(1, el.strokeWidth * pxPerMm * 0.35);
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      } else if (el.type === 'text') {
        // PREVENT DOUBLE-TEXT ON IMPORTED PDFS:
        // If this text is an unedited PDF overlay, the base PDF page ALREADY has the original vector text drawn!
        // We only render text if it is NOT a PDF overlay OR if the user has edited it!
        const isPdfOverlayUnedited = el.isPdfTextOverlay && !el.isEdited;

        if (!isPdfOverlayUnedited) {
          // If edited PDF overlay, clean the background patch to hide the original text underneath!
          if (el.isPdfTextOverlay && el.isEdited && el.backgroundColor) {
            ctx.fillStyle = el.backgroundColor;
            ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
          }

          // High-precision vector text rendering
          const fontSizePx = el.fontSize * (pxPerMm / 2.8346);
          ctx.font = `${el.fontWeight} ${fontSizePx}px ${el.fontFamily}`;
          ctx.fillStyle = isSinglePlate ? '#141414' : el.isNegative ? '#ffffff' : el.textColor;
          ctx.textBaseline = 'top';

          // Prepress Stroke Boost
          if (el.strokeWidth > 0) {
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = el.strokeWidth * pxPerMm * 0.35;
            ctx.strokeText(el.text, x, y);
          }

          const lines = el.text.split('\n');
          const lineHeightPx = fontSizePx * (el.lineHeight || 1.15);
          lines.forEach((line, idx) => {
            ctx.fillText(line, x, y + idx * lineHeightPx);
          });
        }
      } else if (el.type === 'image') {
        const cachedImg = imageCache.current.get(el.src);
        if (cachedImg && cachedImg.complete) {
          const cacheKey = `${el.id}_${JSON.stringify(el.filterSettings)}_${settings.activeColorView}`;
          let processed = processedImageCache.current.get(cacheKey);

          if (!processed) {
            processed = applyPrepressFilters(
              cachedImg,
              el.filterSettings,
              undefined,
              isSinglePlate ? '#141414' : undefined
            );
            processedImageCache.current.set(cacheKey, processed);
          }

          ctx.drawImage(processed, x, y, w, h);

          if (settings.halftoneMode !== 'none') {
            const hCanvas = document.createElement('canvas');
            hCanvas.width = w;
            hCanvas.height = h;
            const hCtx = hCanvas.getContext('2d');
            if (hCtx) {
              hCtx.drawImage(processed, 0, 0, w, h);
              applyHalftoneSimulation(hCtx, Math.round(w), Math.round(h), settings.halftoneMode);
              ctx.drawImage(hCanvas, x, y, w, h);
            }
          }
        }
      } else if (el.type === 'svg') {
        const svgKey = `svg_${el.id}`;
        let svgImg = imageCache.current.get(svgKey);
        if (!svgImg) {
          svgImg = new Image();
          svgImg.src = `data:image/svg+xml;utf8,${encodeURIComponent(el.svgContent)}`;
          svgImg.onload = () => {
            imageCache.current.set(svgKey, svgImg!);
            renderCanvas();
          };
        } else if (svgImg.complete) {
          ctx.drawImage(svgImg, x, y, w, h);
        }
      } else if (el.type === 'table') {
        ctx.fillStyle = isSinglePlate ? '#ffffff' : el.fillColor || '#1E2024';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = isSinglePlate ? '#141414' : el.strokeColor;
        ctx.lineWidth = Math.max(1, el.strokeWidth * pxPerMm * 0.35);
        ctx.strokeRect(x, y, w, h);

        if (el.tableData && el.tableData.length > 0) {
          const rowH = h / el.tableData.length;
          const colW = w * 0.52;
          ctx.font = `bold ${8.5 * (pxPerMm / 2.8346)}px Helvetica, Arial, sans-serif`;
          ctx.fillStyle = isSinglePlate ? '#141414' : '#FFFFFF';
          ctx.textBaseline = 'middle';

          el.tableData.forEach((row, rIdx) => {
            const rowY = y + rIdx * rowH;
            ctx.beginPath();
            ctx.moveTo(x, rowY);
            ctx.lineTo(x + w, rowY);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x + colW, y);
            ctx.lineTo(x + colW, y + h);
            ctx.stroke();

            ctx.fillText(row[0] || '', x + 4, rowY + rowH / 2);
            ctx.font = `normal ${8.0 * (pxPerMm / 2.8346)}px Helvetica, Arial, sans-serif`;
            ctx.fillText(row[1] || '', x + colW + 4, rowY + rowH / 2);
          });
        }
      }

      ctx.restore();
    });

    // Render Color Control Strip
    if (settings.includeControlStrip) {
      const stripX = cartridge.printableWidthMm * pxPerMm + 14;
      renderControlStrip(ctx, stripX, displayHeightPx, spotColors);
    }

    // Hover Highlight (Subtle dashed outline)
    if (hoveredElementId && hoveredElementId !== selectedElementId) {
      const hov = elements.find((e) => e.id === hoveredElementId);
      if (hov && !hov.isHidden) {
        const hx = hov.x * pxPerMm;
        const hy = hov.y * pxPerMm;
        const hw = hov.width * pxPerMm;
        const hh = hov.height * pxPerMm;

        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 2]);
        ctx.strokeRect(hx - 1, hy - 1, hw + 2, hh + 2);
        ctx.restore();
      }
    }

    // Selected Element Bounding Box & 8 Transformation Handles
    if (selectedElementId) {
      const sel = elements.find((e) => e.id === selectedElementId);
      if (sel && !sel.isHidden) {
        const sx = sel.x * pxPerMm;
        const sy = sel.y * pxPerMm;
        const sw = sel.width * pxPerMm;
        const sh = sel.height * pxPerMm;

        ctx.save();
        // Selection Box
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(sx - 2, sy - 2, sw + 4, sh + 4);

        // 8 Handles
        ctx.setLineDash([]);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 1.5;
        const handleSize = 6;
        const handles = [
          { x: sx - 3, y: sy - 3 },
          { x: sx + sw / 2 - 3, y: sy - 3 },
          { x: sx + sw - 3, y: sy - 3 },
          { x: sx - 3, y: sy + sh / 2 - 3 },
          { x: sx + sw - 3, y: sy + sh / 2 - 3 },
          { x: sx - 3, y: sy + sh - 3 },
          { x: sx + sw / 2 - 3, y: sy + sh - 3 },
          { x: sx + sw - 3, y: sy + sh - 3 },
        ];
        handles.forEach((h) => {
          ctx.fillRect(h.x, h.y, handleSize, handleSize);
          ctx.strokeRect(h.x, h.y, handleSize, handleSize);
        });

        // Top Rotation Pin
        ctx.beginPath();
        ctx.moveTo(sx + sw / 2, sy - 2);
        ctx.lineTo(sx + sw / 2, sy - 14);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sx + sw / 2, sy - 16, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }
    }

    ctx.restore(); // Restore dpr & zoom scale

    if (onCanvasUpdated) onCanvasUpdated();
  }, [
    elements,
    selectedElementId,
    hoveredElementId,
    cartridge,
    spotColors,
    settings,
    canvasRef,
    zoom,
    onCanvasUpdated,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const renderControlStrip = (
    ctx: CanvasRenderingContext2D,
    x: number,
    _totalH: number,
    colors: SpotColor[]
  ) => {
    ctx.save();
    ctx.fillStyle = '#8e96a4';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('KONTROLLSTREIFEN', x - 4, 16);

    drawPasskreuz(ctx, x + 16, 38);

    colors.forEach((c, idx) => {
      const cy = 60 + idx * 42;
      ctx.fillStyle = c.hex;
      ctx.fillRect(x, cy, 32, 14);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, cy, 32, 14);

      ctx.globalAlpha = 0.5;
      ctx.fillRect(x, cy + 16, 16, 10);
      ctx.globalAlpha = 0.25;
      ctx.fillRect(x + 16, cy + 16, 16, 10);
      ctx.globalAlpha = 1.0;

      ctx.fillStyle = '#a0aab8';
      ctx.font = '7px sans-serif';
      ctx.fillText(c.id.toUpperCase(), x, cy + 36);
    });
    ctx.restore();
  };

  const drawPasskreuz = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy);
    ctx.lineTo(cx + 14, cy);
    ctx.moveTo(cx, cy - 14);
    ctx.lineTo(cx + 14, cy);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(4.0, Math.max(0.3, zoom * zoomFactor));
    onZoomChange(newZoom);
  };

  // Helper to convert client mouse coordinate into document millimeter position
  const getCanvasMouseMm = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const mmX = (e.clientX - rect.left) / zoom / pxPerMm;
    const mmY = (e.clientY - rect.top) / zoom / pxPerMm;
    return { x: mmX, y: mmY };
  };

  // Element hit-testing (prioritizing foreground elements)
  const findElementAtPosition = (mmX: number, mmY: number): LayoutElement | undefined => {
    // Pass 1: Foreground elements (texts, shapes, SVGs, tables, photos)
    let hit = [...elements].reverse().find((el) => {
      if (el.isHidden || el.isLocked) return false;
      // Skip background artwork if it covers the whole document
      if (el.layerGroup === 'background' && el.width >= cartridge.printableWidthMm * 0.8) return false;
      return (
        mmX >= el.x - 1.0 &&
        mmX <= el.x + el.width + 1.0 &&
        mmY >= el.y - 1.0 &&
        mmY <= el.y + el.height + 1.0
      );
    });

    // Pass 2: Background elements if no foreground element was hit
    if (!hit) {
      hit = [...elements].reverse().find((el) => {
        if (el.isHidden || el.isLocked) return false;
        return (
          mmX >= el.x &&
          mmX <= el.x + el.width &&
          mmY >= el.y &&
          mmY <= el.y + el.height
        );
      });
    }

    return hit;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (editingTextId) return; // Ignore while typing inline

    if (e.button === 1 || e.altKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const { x: mouseMmX, y: mouseMmY } = getCanvasMouseMm(e);
    const clicked = findElementAtPosition(mouseMmX, mouseMmY);

    if (clicked) {
      onSelectElement(clicked.id);
      setIsDraggingElement(true);
      setDragStart({ x: mouseMmX, y: mouseMmY });
      setElementStartPos({ x: clicked.x, y: clicked.y });
    } else {
      onSelectElement(null);
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    const { x: mouseMmX, y: mouseMmY } = getCanvasMouseMm(e);

    // Update hover highlight
    if (!isDraggingElement) {
      const hovered = findElementAtPosition(mouseMmX, mouseMmY);
      setHoveredElementId(hovered?.id || null);
    }

    if (isDraggingElement && selectedElementId) {
      const deltaX = mouseMmX - dragStart.x;
      const deltaY = mouseMmY - dragStart.y;

      const updated = elements.map((el) => {
        if (el.id === selectedElementId && !el.isLocked) {
          return {
            ...el,
            x: Math.round((elementStartPos.x + deltaX) * 10) / 10,
            y: Math.round((elementStartPos.y + deltaY) * 10) / 10,
          };
        }
        return el;
      });
      onElementsChange(updated);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingElement(false);
  };

  // Double-Click on text element to activate inline text editing
  const handleDoubleClick = (e: React.MouseEvent) => {
    const { x: mouseMmX, y: mouseMmY } = getCanvasMouseMm(e);
    const clicked = findElementAtPosition(mouseMmX, mouseMmY);
    if (clicked && clicked.type === 'text') {
      setEditingTextId(clicked.id);
      setInlineEditText((clicked as TextElement).text);
    }
  };

  const handleSaveInlineText = () => {
    if (!editingTextId) return;
    const updated = elements.map((el) => {
      if (el.id === editingTextId && el.type === 'text') {
        return {
          ...el,
          text: inlineEditText,
          isEdited: true, // Flags that this text was modified, triggering background patch and clean vector redraw!
        };
      }
      return el;
    });
    onElementsChange(updated);
    setEditingTextId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    if (onDropFile) {
      onDropFile(files[0]);
    }
  };

  const selectedElement = elements.find((e) => e.id === selectedElementId);
  const editingElement = elements.find((e) => e.id === editingTextId) as TextElement | undefined;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative flex-1 h-full w-full bg-[#0a0b0e] overflow-hidden select-none cursor-crosshair"
    >
      {/* Dynamic Panned Canvas Container (Canvas itself handles high-DPI scaling) */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: '0 0',
        }}
        className="absolute transition-transform duration-75 ease-out shadow-2xl"
      >
        <canvas
          ref={canvasRef}
          className="border border-[#2a2c34] rounded shadow-[0_12px_40px_rgba(0,0,0,0.8)]"
        />

        {/* In-Canvas Inline Textarea Overlay when Double-Clicking Text */}
        {editingElement && (
          <div
            style={{
              position: 'absolute',
              left: `${editingElement.x * pxPerMm * zoom - 2}px`,
              top: `${editingElement.y * pxPerMm * zoom - 2}px`,
              width: `${Math.max(120, editingElement.width * pxPerMm * zoom + 12)}px`,
              minHeight: `${Math.max(30, editingElement.height * pxPerMm * zoom + 8)}px`,
              zIndex: 100,
            }}
            className="p-1 bg-[#181a20] border-2 border-[#ff6600] rounded shadow-2xl flex flex-col gap-1.5"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <textarea
              autoFocus
              value={inlineEditText}
              onChange={(e) => setInlineEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleSaveInlineText();
                } else if (e.key === 'Escape') {
                  setEditingTextId(null);
                }
              }}
              className="w-full bg-[#101216] text-white text-xs font-mono p-1.5 rounded border border-[#333] resize-y outline-none focus:border-[#ff6600]"
              rows={Math.min(8, Math.max(2, inlineEditText.split('\n').length))}
            />
            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span>Strg+Enter zum Speichern • Esc zum Abbrechen</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditingTextId(null)}
                  className="px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600 text-white"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSaveInlineText}
                  className="px-2 py-0.5 rounded bg-[#ff6600] hover:bg-[#e05a00] text-white font-bold"
                >
                  Übernehmen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick HUD overlay in bottom-left */}
      <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-[#16181f]/90 backdrop-blur border border-[#2b2e38] px-3.5 py-1.5 rounded-lg text-xs text-gray-300 pointer-events-none shadow-xl">
        <span className="font-mono text-[#ff6600] font-bold">
          {Math.round(zoom * 100)}%
        </span>
        <span className="w-px h-3 bg-gray-700" />
        <span>
          {cartridge.printableWidthMm} × {cartridge.printableHeightMm} mm
        </span>
        {selectedElement && (
          <>
            <span className="w-px h-3 bg-gray-700" />
            <span className="text-white font-medium truncate max-w-[200px]">
              {selectedElement.name}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
