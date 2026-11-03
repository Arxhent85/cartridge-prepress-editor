import React from 'react';
import {
  ImageElement,
  SpotColor,
  SpotColorId,
  LayoutElement,
} from '../../types';
import {
  Sliders,
  Sparkles,
  Contrast,
  Sun,
  Activity,
  Layers,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';

interface ImageEditPanelProps {
  element: ImageElement;
  onUpdateElement: (updated: ImageElement) => void;
  spotColors: SpotColor[];
}

export const ImageEditPanel: React.FC<ImageEditPanelProps> = ({
  element,
  onUpdateElement,
  spotColors,
}) => {
  const { filterSettings } = element;

  const updateFilters = (changes: Partial<typeof filterSettings>) => {
    onUpdateElement({
      ...element,
      filterSettings: {
        ...filterSettings,
        ...changes,
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUpdateElement({
          ...element,
          src: dataUrl,
          originalSrc: dataUrl,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-4 text-xs text-zinc-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#2a2d34]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-orange-500" />
          <span className="font-semibold text-zinc-100 uppercase tracking-wide">
            GIMP-Bildwerkzeuge
          </span>
        </div>
        <span className="text-[10px] text-zinc-400 font-mono">ID: {element.id}</span>
      </div>

      {/* Smart Image Swap */}
      <div className="bg-[#1b1c20] p-3 rounded border border-[#2a2d34] flex flex-col gap-2">
        <label className="text-zinc-200 font-medium flex items-center justify-between">
          <span>Smart-Image-Swap</span>
          <span className="text-[10px] text-orange-400 font-normal">Masken & Filter bleiben erhalten</span>
        </label>
        <div className="flex items-center gap-2">
          <label className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[#26282e] hover:bg-[#32353d] text-white rounded cursor-pointer transition border border-dashed border-zinc-600">
            <UploadCloud className="w-4 h-4 text-orange-400" />
            <span>Neues Produktfoto wählen...</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 1-Click CMYK to 1c Grayscale */}
      <div className="bg-[#1b1c20] p-3 rounded border border-[#2a2d34] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="font-medium text-zinc-200">1c-Unbunt/Graustufen</span>
          <button
            onClick={() => updateFilters({ grayscale1c: !filterSettings.grayscale1c })}
            className={`px-3 py-1 rounded font-semibold text-xs transition flex items-center gap-1.5 ${
              filterSettings.grayscale1c
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            {filterSettings.grayscale1c ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Aktiviert (1c)
              </>
            ) : (
              'Auf 1c umstellen'
            )}
          </button>
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Verhindert Sepia-/Gelbstiche im Rundsiebdruck durch Konvertierung in einen stabilen
          1c-Schwarz/Grau-Kanal über Deckweiß.
        </p>
      </div>

      {/* Tonwertzuwachs-Kompensation (Dot-Gain-Kurve) */}
      <div className="bg-[#1b1c20] p-3 rounded border border-[#2a2d34] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-zinc-200 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-orange-400" />
            Dot-Gain-Kompensation
          </span>
          <span className="font-mono text-orange-400 font-bold">
            {filterSettings.dotGainCompensation}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="30"
          value={filterSettings.dotGainCompensation}
          onChange={(e) =>
            updateFilters({ dotGainCompensation: parseInt(e.target.value, 10) })
          }
          className="w-full accent-orange-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
          <span>0% (Offset)</span>
          <span className="text-emerald-400">18–22% (HDPE Siebdruck)</span>
          <span>30%</span>
        </div>
      </div>

      {/* Tonwertspreizung (Levels) */}
      <div className="bg-[#1b1c20] p-3 rounded border border-[#2a2d34] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-zinc-200 flex items-center gap-1.5">
            <Contrast className="w-3.5 h-3.5 text-orange-400" />
            Tonwertspreizung (Levels)
          </span>
          <span className="font-mono text-zinc-400">
            {filterSettings.levelsMin} – {filterSettings.levelsMax}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-zinc-400">Schwarzpunkt (Lichter):</span>
            <input
              type="range"
              min="0"
              max="100"
              value={filterSettings.levelsMin}
              onChange={(e) => updateFilters({ levelsMin: parseInt(e.target.value, 10) })}
              className="w-full accent-orange-500"
            />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400">Weißpunkt (Schatten):</span>
            <input
              type="range"
              min="150"
              max="255"
              value={filterSettings.levelsMax}
              onChange={(e) => updateFilters({ levelsMax: parseInt(e.target.value, 10) })}
              className="w-full accent-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Schärfefilter (Unsharp Mask) & Helligkeit/Kontrast */}
      <div className="bg-[#1b1c20] p-3 rounded border border-[#2a2d34] flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span className="text-zinc-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              Unsharp Mask (Schärfefilter)
            </span>
            <span className="font-mono text-orange-400">{filterSettings.unsharpMask}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={filterSettings.unsharpMask}
            onChange={(e) => updateFilters({ unsharpMask: parseInt(e.target.value, 10) })}
            className="w-full accent-orange-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span className="text-zinc-200 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-zinc-400" />
              Helligkeit
            </span>
            <span className="font-mono text-zinc-400">{filterSettings.brightness}</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={filterSettings.brightness}
            onChange={(e) => updateFilters({ brightness: parseInt(e.target.value, 10) })}
            className="w-full accent-orange-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span className="text-zinc-200 flex items-center gap-1.5">
              <Contrast className="w-3.5 h-3.5 text-zinc-400" />
              Kontrast
            </span>
            <span className="font-mono text-zinc-400">{filterSettings.contrast}</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={filterSettings.contrast}
            onChange={(e) => updateFilters({ contrast: parseInt(e.target.value, 10) })}
            className="w-full accent-orange-500"
          />
        </div>
      </div>
    </div>
  );
};
