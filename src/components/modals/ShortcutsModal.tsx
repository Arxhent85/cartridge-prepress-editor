import React from 'react';
import { HelpCircle, X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'V', desc: 'Auswahl-Werkzeug aktivieren' },
    { key: 'T', desc: 'Neues Textfeld einfügen' },
    { key: 'L', desc: 'Silikonfugen-Vektorlinie (Rot) zeichnen' },
    { key: 'R', desc: 'Rechteck / Farbfläche erstellen' },
    { key: 'Ctrl + O', desc: 'Druck-PDF öffnen und in editierbare Ebenen zerlegen' },
    { key: 'Ctrl + E', desc: 'Druckfertiges PDF/X-4 exportieren' },
    { key: 'Ctrl + Z', desc: 'Letzte Aktion rückgängig machen' },
    { key: 'Ctrl + Y', desc: 'Rückgängig gemachte Aktion wiederholen' },
    { key: 'Ctrl + D', desc: 'Ausgewähltes Element duplizieren' },
    { key: 'Entf / Del', desc: 'Ausgewähltes Element löschen' },
    { key: 'Leertaste + Ziehen', desc: 'Druckbogen verschieben (Canvas Panning)' },
    { key: 'Mausrad', desc: 'Druckbogen vergrößern / verkleinern (Zoom)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#141518] border border-[#2e323b] rounded-xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1a1b20] border-b border-[#2e323b]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-orange-500" />
            <span className="font-semibold text-sm text-zinc-100">
              Tastaturkürzel & Schnellanleitung
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-2 max-h-[60vh] overflow-y-auto text-xs">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1.5 px-2.5 rounded bg-[#1b1c20] border border-[#26282e]"
            >
              <span className="text-zinc-300">{s.desc}</span>
              <kbd className="px-2 py-0.5 rounded bg-[#2b2e38] text-orange-400 font-mono text-[11px] font-bold border border-[#3b404d]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
