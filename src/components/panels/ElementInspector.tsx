import React from 'react';
import {
  LayoutElement,
  SpotColor,
  SpotColorId,
  TextElement,
  ShapeElement,
} from '../../types';
import {
  Type,
  Maximize,
  Palette,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Move,
  Bold,
  Italic,
  AlignLeft,
} from 'lucide-react';

interface ElementInspectorProps {
  element: LayoutElement;
  onUpdateElement: (updated: LayoutElement) => void;
  onDeleteElement: (id: string) => void;
  spotColors: SpotColor[];
}

export const ElementInspector: React.FC<ElementInspectorProps> = ({
  element,
  onUpdateElement,
  onDeleteElement,
  spotColors,
}) => {
  const updateProp = <K extends keyof LayoutElement>(key: K, value: LayoutElement[K]) => {
    onUpdateElement({
      ...element,
      [key]: value,
    });
  };

  const isText = element.type === 'text';
  const isShape = element.type === 'rect' || element.type === 'line' || element.type === 'table';

  return (
    <div className="flex flex-col gap-4 text-xs text-zinc-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#2a2d34]">
        <div className="flex items-center gap-2">
          {isText ? (
            <Type className="w-4 h-4 text-orange-500" />
          ) : (
            <Maximize className="w-4 h-4 text-orange-500" />
          )}
          <span className="font-semibold text-zinc-100 uppercase tracking-wide truncate max-w-[150px]">
            {element.name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateProp('isLocked', !element.isLocked)}
            className={`p-1 rounded ${
              element.isLocked ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-500 hover:text-white'
            }`}
            title={element.isLocked ? 'Entsperren' : 'Sperren'}
          >
            {element.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => updateProp('isHidden', !element.isHidden)}
            className={`p-1 rounded ${
              element.isHidden ? 'text-red-400 bg-red-500/10' : 'text-zinc-500 hover:text-white'
            }`}
            title={element.isHidden ? 'Einblenden' : 'Ausblenden'}
          >
            {element.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onDeleteElement(element.id)}
            className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition"
            title="Löschen"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TEXT SPECIFIC EDITING */}
      {isText && (
        <div className="bg-[#1b1c20] p-3 rounded border border-[#2a2d34] flex flex-col gap-3">
          <label className="text-zinc-200 font-medium flex items-center justify-between">
            <span>Textinhalt</span>
            {(element as TextElement).language && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-700 font-mono">
                {(element as TextElement).language}
              </span>
            )}
          </label>
          <textarea
            value={(element as TextElement).text}
            onChange={(e) => updateProp('text' as any, e.target.value)}
            rows={3}
            className="w-full bg-[#26282e] border border-[#3e424d] text-white rounded p-2 text-xs focus:outline-none focus:border-orange-500 font-sans"
          />

          {/* Typography Controls */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[10px] text-zinc-400">Schriftgröße (pt):</span>
              <input
                type="number"
                step="0.5"
                min="3"
                max="72"
                value={(element as TextElement).fontSize}
                onChange={(e) => updateProp('fontSize' as any, parseFloat(e.target.value) || 6)}
                className="w-full bg-[#26282e] border border-[#3e424d] text-white rounded px-2 py-1 text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400">Laufweite / Tracking:</span>
              <input
                type="number"
                step="0.1"
                value={(element as TextElement).letterSpacing}
                onChange={(e) => updateProp('letterSpacing' as any, parseFloat(e.target.value) || 0)}
                className="w-full bg-[#26282e] border border-[#3e424d] text-white rounded px-2 py-1 text-xs"
              />
            </div>
          </div>

          {/* Negative Text & Prepress Stroke Boost */}
          <div className="flex flex-col gap-2 pt-1 border-t border-[#2a2d34]">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">Negativschrift (auf dunklem Grund):</span>
              <input
                type="checkbox"
                checked={(element as TextElement).isNegative}
                onChange={(e) => updateProp('isNegative' as any, e.target.checked)}
                className="accent-orange-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between">
                <span className="text-[10px] text-zinc-400">Prepress Stroke Boost (Verstärkung):</span>
                <span className="font-mono text-orange-400">
                  {((element as TextElement).strokeWidth || 0).toFixed(2)} pt
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.05"
                value={(element as TextElement).strokeWidth || 0}
                onChange={(e) => updateProp('strokeWidth' as any, parseFloat(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* SHAPE SPECIFIC EDITING */}
      {isShape && (
        <div className="bg-[#1b1c20] p-3 rounded border border-[#2a2d34] flex flex-col gap-2.5">
          <span className="text-zinc-200 font-medium">Linien- & Formeigenschaften</span>
          <div>
            <div className="flex justify-between">
              <span className="text-[10px] text-zinc-400">Konturstärke:</span>
              <span className="font-mono text-orange-400">
                {(element as ShapeElement).strokeWidth || 0} pt
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="6.0"
              step="0.2"
              value={(element as ShapeElement).strokeWidth || 0}
              onChange={(e) => updateProp('strokeWidth' as any, parseFloat(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>

          {(element as ShapeElement).cornerRadius !== undefined && (
            <div>
              <span className="text-[10px] text-zinc-400">Eckenradius (mm):</span>
              <input
                type="number"
                step="0.5"
                value={(element as ShapeElement).cornerRadius || 0}
                onChange={(e) => updateProp('cornerRadius' as any, parseFloat(e.target.value) || 0)}
                className="w-full bg-[#26282e] border border-[#3e424d] text-white rounded px-2 py-1 text-xs"
              />
            </div>
          )}
        </div>
      )}

      {/* SPOT COLOR CHANNEL ASSIGNMENT */}
      <div className="bg-[#1b1c20] p-3 rounded border border-[#2a2d34] flex flex-col gap-2">
        <label className="text-zinc-200 font-medium flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-orange-400" />
          Druck-Sonderfarbkanal
        </label>
        <select
          value={element.spotColorId}
          onChange={(e) => updateProp('spotColorId', e.target.value as SpotColorId)}
          className="w-full bg-[#26282e] border border-[#3e424d] text-white rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-500"
        >
          {spotColors.map((sc) => (
            <option key={sc.id} value={sc.id}>
              {sc.name} ({sc.pantoneName || sc.hex})
            </option>
          ))}
        </select>
      </div>

      {/* DIMENSIONS & POSITION (in mm) */}
      <div className="bg-[#1b1c20] p-3 rounded border border-[#2a2d34] flex flex-col gap-2">
        <span className="text-zinc-200 font-medium flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 text-zinc-400" />
          Position & Dimensionen (mm)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-zinc-400">X-Position:</span>
            <input
              type="number"
              step="0.5"
              value={element.x}
              onChange={(e) => updateProp('x', parseFloat(e.target.value) || 0)}
              className="w-full bg-[#26282e] border border-[#3e424d] text-white rounded px-2 py-1 text-xs font-mono"
            />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400">Y-Position:</span>
            <input
              type="number"
              step="0.5"
              value={element.y}
              onChange={(e) => updateProp('y', parseFloat(e.target.value) || 0)}
              className="w-full bg-[#26282e] border border-[#3e424d] text-white rounded px-2 py-1 text-xs font-mono"
            />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400">Breite:</span>
            <input
              type="number"
              step="0.5"
              value={element.width}
              onChange={(e) => updateProp('width', parseFloat(e.target.value) || 1)}
              className="w-full bg-[#26282e] border border-[#3e424d] text-white rounded px-2 py-1 text-xs font-mono"
            />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400">Höhe:</span>
            <input
              type="number"
              step="0.5"
              value={element.height}
              onChange={(e) => updateProp('height', parseFloat(e.target.value) || 1)}
              className="w-full bg-[#26282e] border border-[#3e424d] text-white rounded px-2 py-1 text-xs font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
