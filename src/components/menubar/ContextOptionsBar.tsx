import React from 'react';
import {
  LayoutElement,
  SpotColor,
  SpotColorId,
  TextElement,
  ImageElement,
  ShapeElement,
  CartridgeConfig,
  PrepressSettings,
} from '../../types';
import {
  Type,
  ImageIcon,
  Square,
  Minus,
  Sparkles,
  Layers,
  Wand2,
  UploadCloud,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Sliders,
} from 'lucide-react';

interface ContextOptionsBarProps {
  selectedElement: LayoutElement | null;
  onUpdateElement: (updated: LayoutElement) => void;
  spotColors: SpotColor[];
  cartridge: CartridgeConfig;
  settings: PrepressSettings;
  onUpdateSettings: (settings: PrepressSettings) => void;
  onReplaceImageClick: () => void;
}

export const ContextOptionsBar: React.FC<ContextOptionsBarProps> = ({
  selectedElement,
  onUpdateElement,
  spotColors,
  cartridge,
  settings,
  onUpdateSettings,
  onReplaceImageClick,
}) => {
  const isText = selectedElement?.type === 'text';
  const isImage = selectedElement?.type === 'image';
  const isShape = selectedElement?.type === 'rect' || selectedElement?.type === 'line' || selectedElement?.type === 'table';

  return (
    <div className="h-10 bg-[#141518] border-b border-[#26282e] px-3 flex items-center justify-between text-xs text-zinc-300 select-none overflow-x-auto gap-4 font-sans">
      {/* Left: Context-specific Controls */}
      <div className="flex items-center gap-3">
        {/* TEXT CONTROLS */}
        {isText && (
          <>
            <div className="flex items-center gap-1.5 text-orange-400 font-semibold border-r border-[#2a2d34] pr-3">
              <Type className="w-4 h-4" />
              <span>TEXT</span>
            </div>

            {/* Font Family */}
            <select
              value={(selectedElement as TextElement).fontFamily}
              onChange={(e) =>
                onUpdateElement({ ...selectedElement, fontFamily: e.target.value } as TextElement)
              }
              className="bg-[#202228] border border-[#343844] text-white rounded px-2 py-1 text-xs"
            >
              <option value="Helvetica, Arial, sans-serif">Helvetica / Arial</option>
              <option value="Impact, sans-serif">Impact (Bold Brand)</option>
              <option value="Courier, monospace">Courier (Norm/Code)</option>
              <option value="Georgia, serif">Georgia</option>
            </select>

            {/* Font Size */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-zinc-400">Größe:</span>
              <input
                type="number"
                step="0.5"
                min="3"
                max="72"
                value={(selectedElement as TextElement).fontSize}
                onChange={(e) =>
                  onUpdateElement({
                    ...selectedElement,
                    fontSize: parseFloat(e.target.value) || 6,
                  } as TextElement)
                }
                className="w-14 bg-[#202228] border border-[#343844] text-white rounded px-1.5 py-0.5 text-xs text-center"
              />
              <span className="text-zinc-500 text-[10px]">pt</span>
            </div>

            {/* Negative Text Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer bg-[#1c1d22] px-2 py-1 rounded border border-[#2e323b] hover:bg-[#252830]">
              <input
                type="checkbox"
                checked={(selectedElement as TextElement).isNegative}
                onChange={(e) =>
                  onUpdateElement({
                    ...selectedElement,
                    isNegative: e.target.checked,
                  } as TextElement)
                }
                className="accent-orange-500 w-3.5 h-3.5"
              />
              <span className="text-[11px] text-zinc-200">Negativschrift</span>
            </label>

            {/* Prepress Stroke Boost */}
            <div className="flex items-center gap-1.5 bg-[#1c1d22] px-2 py-0.5 rounded border border-[#2e323b]">
              <Wand2 className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[11px] text-zinc-400">Stroke Boost:</span>
              <span className="font-mono text-orange-400 text-xs">
                {((selectedElement as TextElement).strokeWidth || 0).toFixed(2)} pt
              </span>
              <button
                onClick={() =>
                  onUpdateElement({
                    ...selectedElement,
                    strokeWidth: Math.round(((selectedElement as TextElement).strokeWidth + 0.1) * 10) / 10,
                  } as TextElement)
                }
                className="px-1.5 py-0.2 bg-zinc-700 hover:bg-zinc-600 rounded text-[10px] text-white"
                title="Kontur um 0.1pt verstärken"
              >
                +
              </button>
            </div>
          </>
        )}

        {/* IMAGE CONTROLS */}
        {isImage && (
          <>
            <div className="flex items-center gap-1.5 text-orange-400 font-semibold border-r border-[#2a2d34] pr-3">
              <ImageIcon className="w-4 h-4" />
              <span>BILD</span>
            </div>

            {/* 1c Grayscale Switch */}
            <button
              onClick={() => {
                const img = selectedElement as ImageElement;
                onUpdateElement({
                  ...img,
                  filterSettings: {
                    ...img.filterSettings,
                    grayscale1c: !img.filterSettings.grayscale1c,
                  },
                });
              }}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
                (selectedElement as ImageElement).filterSettings.grayscale1c
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>1c-Unbunt/Grau</span>
            </button>

            {/* Dot Gain Curve */}
            <div className="flex items-center gap-2 bg-[#1c1d22] px-2.5 py-1 rounded border border-[#2e323b]">
              <span className="text-[11px] text-zinc-400">Dot-Gain:</span>
              <input
                type="range"
                min="0"
                max="30"
                value={(selectedElement as ImageElement).filterSettings.dotGainCompensation}
                onChange={(e) => {
                  const img = selectedElement as ImageElement;
                  onUpdateElement({
                    ...img,
                    filterSettings: {
                      ...img.filterSettings,
                      dotGainCompensation: parseInt(e.target.value, 10),
                    },
                  });
                }}
                className="w-20 accent-orange-500"
              />
              <span className="font-mono text-orange-400 text-xs">
                {(selectedElement as ImageElement).filterSettings.dotGainCompensation}%
              </span>
            </div>

            {/* Smart Image Swap Button */}
            <button
              onClick={onReplaceImageClick}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#252830] hover:bg-[#313540] border border-[#3b404d] text-zinc-200 transition text-xs"
            >
              <UploadCloud className="w-3.5 h-3.5 text-orange-400" />
              <span>Bild ersetzen (Swap)</span>
            </button>
          </>
        )}

        {/* SHAPE CONTROLS */}
        {isShape && (
          <>
            <div className="flex items-center gap-1.5 text-orange-400 font-semibold border-r border-[#2a2d34] pr-3">
              <Square className="w-4 h-4" />
              <span>FORM / LINIE</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-zinc-400">Kontur:</span>
              <input
                type="number"
                step="0.2"
                min="0"
                max="10"
                value={(selectedElement as ShapeElement).strokeWidth || 0}
                onChange={(e) =>
                  onUpdateElement({
                    ...selectedElement,
                    strokeWidth: parseFloat(e.target.value) || 0,
                  } as ShapeElement)
                }
                className="w-14 bg-[#202228] border border-[#343844] text-white rounded px-1.5 py-0.5 text-xs text-center font-mono"
              />
              <span className="text-zinc-500 text-[10px]">pt</span>
            </div>
          </>
        )}

        {/* DEFAULT / NO SELECTION CONTROLS */}
        {!selectedElement && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Druckbogen:</span>
              <strong className="text-zinc-200">{cartridge.name}</strong>
              <span className="text-zinc-500 font-mono">
                ({cartridge.printableWidthMm} × {cartridge.printableHeightMm} mm)
              </span>
            </div>

            <div className="h-4 w-[1px] bg-[#2a2d34]" />

            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Siebauszug:</span>
              <select
                value={settings.activeColorView}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, activeColorView: e.target.value as any })
                }
                className="bg-[#202228] border border-[#343844] text-orange-400 font-medium rounded px-2 py-0.5 text-xs"
              >
                <option value="composite">Gesamtdruck (Composite)</option>
                <option value="plate_white">Sieb 1: Deckweiß (Choke)</option>
                <option value="plate_black">Sieb 2: Tiefschwarz 1c</option>
                <option value="plate_orange">Sieb 3: M ONE Orange</option>
                <option value="plate_manhattan">Sieb 4: Manhattan Grau</option>
                <option value="plate_red">Sieb 5: Fugen-Rot</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* Right: Quick Spot Color Picker for Selected Element */}
      {selectedElement && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-400">Druck-Kanal:</span>
          <select
            value={selectedElement.spotColorId}
            onChange={(e) =>
              onUpdateElement({
                ...selectedElement,
                spotColorId: e.target.value as SpotColorId,
              })
            }
            className="bg-[#202228] border border-[#343844] text-white font-medium rounded px-2 py-1 text-xs"
          >
            {spotColors.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
