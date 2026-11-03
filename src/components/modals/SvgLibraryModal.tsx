import React from 'react';
import {
  GHS07_SVG,
  CE_MARK_SVG,
  RECYCLE_HDPE_SVG,
  BARCODE_SVG,
} from '../../constants/demoLayout';
import { LayoutElement, SpotColorId } from '../../types';
import { X, Sparkles, Plus } from 'lucide-react';

interface SvgLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSvg: (svgContent: string, name: string, spotColor: SpotColorId) => void;
}

export const GHS02_FLAME_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <polygon points="50,4 96,50 50,96 4,50" fill="#ffffff" stroke="#e11d48" stroke-width="8" stroke-linejoin="round"/>
  <path d="M 50,22 C 55,30 65,38 65,52 C 65,65 55,75 45,75 C 38,75 32,68 35,58 C 36,54 40,48 42,48 C 40,55 45,62 48,62 C 50,62 52,58 52,54 C 52,42 45,35 50,22 Z" fill="#141414"/>
</svg>`;

export const SANITARY_DROP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M 50,15 C 50,15 25,50 25,65 C 25,78 36,90 50,90 C 64,90 75,78 75,65 C 75,50 50,15 50,15 Z" fill="#0284c7"/>
  <ellipse cx="40" cy="65" rx="6" ry="12" fill="#ffffff" opacity="0.6" transform="rotate(-30 40 65)"/>
</svg>`;

export const SvgLibraryModal: React.FC<SvgLibraryModalProps> = ({
  isOpen,
  onClose,
  onInsertSvg,
}) => {
  if (!isOpen) return null;

  const library = [
    {
      name: 'GHS07 Ausrufezeichen (Achtung)',
      svg: GHS07_SVG,
      color: 'red' as SpotColorId,
      category: 'Gefahrensymbole',
    },
    {
      name: 'GHS02 Flamme (Entzündbar)',
      svg: GHS02_FLAME_SVG,
      color: 'red' as SpotColorId,
      category: 'Gefahrensymbole',
    },
    {
      name: 'CE Kennzeichnung (Bauprodukte)',
      svg: CE_MARK_SVG,
      color: 'black' as SpotColorId,
      category: 'Zertifizierung',
    },
    {
      name: 'HDPE 02 Recycling Symbol',
      svg: RECYCLE_HDPE_SVG,
      color: 'black' as SpotColorId,
      category: 'Verpackung',
    },
    {
      name: 'EAN-13 Barcode Block',
      svg: BARCODE_SVG,
      color: 'black' as SpotColorId,
      category: 'Verpackung',
    },
    {
      name: 'Sanitär / Wasserfest Piktogramm',
      svg: SANITARY_DROP_SVG,
      color: 'orange' as SpotColorId,
      category: 'Anwendung',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#141518] border border-[#2e323b] rounded-xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1a1b20] border-b border-[#2e323b]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="font-semibold text-sm text-zinc-100">
              Vektor- & Piktogramm-Bibliothek für Kartuschen
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid */}
        <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-3.5 max-h-[60vh] overflow-y-auto">
          {library.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#1b1c20] hover:bg-[#23252b] border border-[#2a2d34] hover:border-orange-500/50 rounded-lg p-3 flex flex-col items-center gap-2.5 transition group cursor-pointer"
              onClick={() => {
                onInsertSvg(item.svg, item.name, item.color);
                onClose();
              }}
            >
              <div
                className="w-16 h-16 flex items-center justify-center p-1 bg-white/5 rounded"
                dangerouslySetInnerHTML={{ __html: item.svg }}
              />
              <div className="w-full text-center">
                <div className="font-medium text-xs text-zinc-200 group-hover:text-orange-400 truncate">
                  {item.name}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  Kanal: {item.color.toUpperCase()}
                </div>
              </div>
              <button className="w-full py-1 bg-[#26282e] group-hover:bg-orange-500 group-hover:text-white text-zinc-300 rounded text-[11px] font-medium flex items-center justify-center gap-1 transition">
                <Plus className="w-3 h-3" />
                <span>Einfügen</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
