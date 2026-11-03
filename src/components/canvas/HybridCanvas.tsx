import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  CartridgeConfig,
  LayoutElement,
  PrepressSettings,
  SpotColor,
  TextElement,
  ImageElement,
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
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 60, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging elements
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [elementStartPos, setElementStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Inline text editing
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Cached raster images for canvas performance
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const processedImageCache = useRef<Map<string, HTMLCanvasElement>>(new Map());

  // Pixels per mm at 100% zoom (3.78 px = 1 mm at ~96 DPI screen)
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

  // Main canvas render function
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const totalWidthMm = cartridge.printableWidthMm + (settings.includeControlStrip ? 22 : 0);
    const totalHeightMm = cartridge.printableHeightMm;

    const canvasWidthPx = Math.ceil(totalWidthMm * pxPerMm);
    const canvasHeightPx = Math.ceil(totalHeightMm * pxPerMm);

    if (canvas.width !== canvasWidthPx || canvas.height !== canvasHeightPx) {
      canvas.width = canvasWidthPx;
      canvas.height = canvasHeightPx;
    }

    // Clear background
    ctx.clearRect(0, 0, canvasWidthPx, canvasHeightPx);

    // Fill cartridge background
    const isSinglePlate = settings.activeColorView !== 'composite';
    ctx.fillStyle = isSinglePlate ? '#ffffff' : '#f4f5f7';
    ctx.fillRect(0, 0, canvasWidthPx, canvasHeightPx);

    // Draw printable layout bounds & bleed
    ctx.strokeStyle = '#d0d4dc';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvasWidthPx, canvasHeightPx);

    // Draw Cartridge Seam / Overlap Safety Line (Nahtbereich)
    const seamX = (cartridge.printableWidthMm - cartridge.seamMarginMm) * pxPerMm;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(seamX, 0);
    ctx.lineTo(seamX, canvasHeightPx);
    ctx.stroke();
    ctx.restore();

    // Render each element
    elements.forEach((el) => {
      if (el.isHidden) return;

      // Spot color plate filtering
      if (isSinglePlate) {
        const plateId = settings.activeColorView.replace('plate_', '');
        if (plateId === 'white') {
          // White plate renders negative texts and white-assigned elements
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
        const fontSizePx = el.fontSize * (pxPerMm / 2.8346);
        ctx.font = `${el.fontWeight} ${fontSizePx}px ${el.fontFamily}`;
        ctx.fillStyle = isSinglePlate ? '#141414' : el.isNegative ? '#ffffff' : el.textColor;
        ctx.textBaseline = 'top';

        // Prepress Stroke Boost (for negative text or reinforced print)
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
      } else if (el.type === 'image') {
        const cachedImg = imageCache.current.get(el.src);
        if (cachedImg && cachedImg.complete) {
          // Process image with prepress filters
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

          // Draw processed image
          ctx.drawImage(processed, x, y, w, h);

          // Halftone simulation if active
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
        // Draw SVG as image
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
        // Render tabular grid for application temperatures / specs
        ctx.fillStyle = isSinglePlate ? '#ffffff' : el.fillColor || '#ffffff';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = isSinglePlate ? '#141414' : el.strokeColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);

        if (el.tableData && el.tableData.length > 0) {
          const rowH = h / el.tableData.length;
          const colW = w / 2;
          ctx.font = `600 ${9 * (pxPerMm / 2.8346)}px Helvetica, Arial, sans-serif`;
          ctx.fillStyle = isSinglePlate ? '#141414' : '#141414';
          ctx.textBaseline = 'middle';

          el.tableData.forEach((row, rIdx) => {
            const rowY = y + rIdx * rowH;
            ctx.beginPath();
            ctx.moveTo(x, rowY);
            ctx.lineTo(x + w, rowY);
            ctx.stroke();

            // Col divider
            ctx.beginPath();
            ctx.moveTo(x + colW, y);
            ctx.lineTo(x + colW, y + h);
            ctx.stroke();

            // Text
            ctx.fillText(row[0] || '', x + 6, rowY + rowH / 2);
            ctx.font = `normal ${8.5 * (pxPerMm / 2.8346)}px Helvetica, Arial, sans-serif`;
            ctx.fillText(row[1] || '', x + colW + 6, rowY + rowH / 2);
          });
        }
      }

      ctx.restore();
    });

    // Render Color Control Strip (Farbkontrollstreifen)
    if (settings.includeControlStrip) {
      const stripX = cartridge.printableWidthMm * pxPerMm + 14;
      renderControlStrip(ctx, stripX, canvasHeightPx, spotColors);
    }

    // Render Selection Outline & Handles
    if (selectedElementId) {
      const sel = elements.find((e) => e.id === selectedElementId);
      if (sel && !sel.isHidden) {
        const sx = sel.x * pxPerMm;
        const sy = sel.y * pxPerMm;
        const sw = sel.width * pxPerMm;
        const sh = sel.height * pxPerMm;

        ctx.save();
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(sx - 2, sy - 2, sw + 4, sh + 4);

        // Corner handles
        ctx.setLineDash([]);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 1.5;
        const handles = [
          { x: sx - 4, y: sy - 4 },
          { x: sx + sw, y: sy - 4 },
          { x: sx - 4, y: sy + sh },
          { x: sx + sw, y: sy + sh },
        ];
        handles.forEach((h) => {
          ctx.fillRect(h.x, h.y, 8, 8);
          ctx.strokeRect(h.x, h.y, 8, 8);
        });
        ctx.restore();
      }
    }

    if (onCanvasUpdated) onCanvasUpdated();
  }, [
    elements,
    selectedElementId,
    cartridge,
    spotColors,
    settings,
    canvasRef,
    onCanvasUpdated,
  ]);

  // Redraw when dependencies change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Farbkontrollstreifen renderer
  const renderControlStrip = (
    ctx: CanvasRenderingContext2D,
    x: number,
    totalH: number,
    colors: SpotColor[]
  ) => {
    ctx.save();
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('KONTROLLSTREIFEN', x - 4, 16);

    // Passkreuz top
    drawPasskreuz(ctx, x + 16, 40);

    // Spot color wedges
    colors.forEach((c, idx) => {
      const cy = 65 + idx * 45;
      ctx.fillStyle = c.hex;
      ctx.fillRect(x, cy, 32, 16);
      ctx.strokeStyle = '#141414';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, cy, 32, 16);

      // 50% & 25% wedges
      ctx.globalAlpha = 0.5;
      ctx.fillRect(x, cy + 18, 16, 12);
      ctx.globalAlpha = 0.25;
      ctx.fillRect(x + 16, cy + 18, 16, 12);
      ctx.globalAlpha = 1.0;

      ctx.fillStyle = '#666';
      ctx.font = '7px sans-serif';
      ctx.fillText(c.id.toUpperCase(), x, cy + 40);
    });

    // Passkreuz bottom
    drawPasskreuz(ctx, x + 16, totalH - 45);
    ctx.restore();
  };

  const drawPasskreuz = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
    ctx.strokeStyle = '#141414';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy);
    ctx.lineTo(cx + 14, cy);
    ctx.moveTo(cx, cy - 14);
    ctx.lineTo(cx, cy + 14);
    ctx.stroke();
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.min(3.5, Math.max(0.35, zoom * zoomFactor));
    onZoomChange(newZoom);
  };

  // Pan / Drag interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click or space key: pan canvas
    if (e.button === 1 || e.altKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseCanvasX = (e.clientX - rect.left) / zoom / pxPerMm;
    const mouseCanvasY = (e.clientY - rect.top) / zoom / pxPerMm;

    // Check if clicked an element (reverse order for top-most)
    const clicked = [...elements].reverse().find((el) => {
      if (el.isHidden) return false;
      return (
        mouseCanvasX >= el.x &&
        mouseCanvasX <= el.x + el.width &&
        mouseCanvasY >= el.y &&
        mouseCanvasY <= el.y + el.height
      );
    });

    if (clicked) {
      onSelectElement(clicked.id);
      setIsDraggingElement(true);
      setDragStart({ x: mouseCanvasX, y: mouseCanvasY });
      setElementStartPos({ x: clicked.x, y: clicked.y });
    } else {
      onSelectElement(null);
      // Pan canvas by dragging empty area
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    if (isDraggingElement && selectedElementId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const currentMouseX = (e.clientX - rect.left) / zoom / pxPerMm;
      const currentMouseY = (e.clientY - rect.top) / zoom / pxPerMm;

      const deltaX = currentMouseX - dragStart.x;
      const deltaY = currentMouseY - dragStart.y;

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

  // Drag and Drop Image Swap directly onto image element
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      // If dropped directly onto selected element or image
      if (selectedElementId) {
        const updated = elements.map((el) => {
          if (el.id === selectedElementId && el.type === 'image') {
            return {
              ...el,
              src: dataUrl,
              originalSrc: dataUrl,
            };
          }
          return el;
        });
        onElementsChange(updated);
      } else {
        // Find if dropped over any image element
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const dropX = (e.clientX - rect.left) / zoom / pxPerMm;
        const dropY = (e.clientY - rect.top) / zoom / pxPerMm;

        const targetImg = elements.find(
          (el) =>
            el.type === 'image' &&
            dropX >= el.x &&
            dropX <= el.x + el.width &&
            dropY >= el.y &&
            dropY <= el.y + el.height
        );

        if (targetImg) {
          const updated = elements.map((el) =>
            el.id === targetImg.id ? { ...el, src: dataUrl, originalSrc: dataUrl } : el
          );
          onElementsChange(updated);
          onSelectElement(targetImg.id);
        }
      }
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    }
  };

  const selectedElement = elements.find((e) => e.id === selectedElementId);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative flex-1 h-full w-full bg-[#0d0e11] overflow-hidden select-none cursor-crosshair"
    >
      {/* Millimeter Grid Background & Measurement Markings */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
        className="absolute transition-transform duration-75 ease-out"
      >
        {/* Rulers / Dimension Badges */}
        <div className="absolute -top-7 left-0 right-0 flex items-center justify-between text-[11px] font-mono text-zinc-400 bg-[#16171a] px-3 py-1 rounded border border-[#2a2d34] shadow-md">
          <span>
            Breite: <strong className="text-orange-400">{cartridge.printableWidthMm} mm</strong>{' '}
            (Umfang {cartridge.totalCircumferenceMm} mm)
          </span>
          <span>
            Höhe: <strong className="text-orange-400">{cartridge.printableHeightMm} mm</strong>
          </span>
          <span className="text-red-400">Naht-Abstand: {cartridge.seamMarginMm} mm</span>
        </div>

        {/* Master Canvas */}
        <canvas
          ref={canvasRef}
          className="shadow-2xl border border-[#3e424d] rounded-sm bg-white"
        />

        {/* Inline Text Input Overlay when editing */}
        {selectedElement && selectedElement.type === 'text' && (
          <div
            style={{
              position: 'absolute',
              left: `${selectedElement.x * pxPerMm}px`,
              top: `${selectedElement.y * pxPerMm}px`,
              minWidth: `${selectedElement.width * pxPerMm}px`,
            }}
            className="pointer-events-none"
          >
            {/* Direct floating hint */}
            <div className="absolute -top-6 left-0 bg-orange-600 text-white font-mono text-[10px] px-2 py-0.5 rounded shadow pointer-events-auto">
              Text anklicken & im Eigenschafts-Panel bearbeiten
            </div>
          </div>
        )}
      </div>

      {/* Floating Canvas Quick Info Pill */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-[#18191c]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#2a2d34] text-xs text-zinc-300 shadow-xl pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Hybrid Canvas: Vektor + WebGL 1c-Filter</span>
        <span className="text-zinc-500">|</span>
        <span className="font-mono text-orange-400">{Math.round(zoom * 100)}%</span>
        <span className="text-zinc-500">|</span>
        <span>Drag & Drop: Fotos/SVGs direkt auf die Fläche ziehen</span>
      </div>
    </div>
  );
};
