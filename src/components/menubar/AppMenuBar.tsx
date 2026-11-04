import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  FolderOpen,
  Download,
  RotateCcw,
  RotateCw,
  Copy,
  Trash2,
  CheckSquare,
  Layers,
  Wand2,
  Eye,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Bot,
  HelpCircle,
  Sparkles,
  ChevronDown,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { ManufacturerProfile } from '../../types';

interface AppMenuBarProps {
  onNew: () => void;
  onOpenPdf: () => void;
  onImportSvg: () => void;
  onImportImage: () => void;
  onResetDemo: () => void;
  onExportPdf: () => void;
  onExportSvg: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onDuplicateSelected: () => void;
  onDeleteSelected: () => void;
  hasSelection: boolean;
  onBoostTexts: () => void;
  onConvert1cAll: () => void;
  onSelectManufacturer: (profile: ManufacturerProfile) => void;
  currentProfile: ManufacturerProfile;
  onSelectPlateView: (view: any) => void;
  currentPlateView: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onZoomFit: () => void;
  onOpenMcp: () => void;
  onOpenShortcuts: () => void;
  onToggle3D: () => void;
  is3dVisible: boolean;
}

export const AppMenuBar: React.FC<AppMenuBarProps> = ({
  onNew,
  onOpenPdf,
  onImportSvg,
  onImportImage,
  onResetDemo,
  onExportPdf,
  onExportSvg,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onDuplicateSelected,
  onDeleteSelected,
  hasSelection,
  onBoostTexts,
  onConvert1cAll,
  onSelectManufacturer,
  currentProfile,
  onSelectPlateView,
  currentPlateView,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomFit,
  onOpenMcp,
  onOpenShortcuts,
  onToggle3D,
  is3dVisible,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener('mousedown', handleOutside);
    return () => window.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleMenuClick = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleMenuHover = (menu: string) => {
    if (openMenu !== null) {
      setOpenMenu(menu);
    }
  };

  const closeMenu = () => setOpenMenu(null);

  return (
    <div
      ref={menuBarRef}
      className="h-8 bg-[#18191d] border-b border-[#26282e] flex items-center px-2 select-none text-[12px] text-zinc-300 z-50 font-sans"
    >
      {/* Brand Icon */}
      <div className="flex items-center gap-1.5 px-2 py-0.5 mr-2 rounded hover:bg-white/5 cursor-pointer text-orange-400 font-bold tracking-wider">
        <span className="w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-500/80" />
        <span>ACE PREPRESS</span>
      </div>

      {/* Menus */}
      <div className="flex items-center gap-0.5">
        {/* 1. DATEI / FILE */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('file')}
            onMouseEnter={() => handleMenuHover('file')}
            className={`px-2.5 py-1 rounded transition text-zinc-300 hover:text-white ${
              openMenu === 'file' ? 'bg-[#2b2e38] text-white' : 'hover:bg-[#22242a]'
            }`}
          >
            Datei
          </button>
          {openMenu === 'file' && (
            <div className="absolute top-full left-0 mt-0.5 w-56 bg-[#1b1c21] border border-[#2e323b] rounded-md shadow-2xl py-1 z-50 text-[12px] flex flex-col">
              <button
                onClick={() => {
                  onNew();
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between"
              >
                <span>Neues Layout anlegen</span>
                <span className="text-[10px] opacity-60">Ctrl+N</span>
              </button>
              <button
                onClick={() => {
                  onOpenPdf();
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between font-medium text-orange-400 hover:text-white"
              >
                <span>Druck-PDF öffnen & zerlegen...</span>
                <span className="text-[10px] opacity-60">Ctrl+O</span>
              </button>
              <button
                onClick={() => {
                  onImportImage();
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between"
              >
                <span>Produktfoto importieren...</span>
              </button>
              <button
                onClick={() => {
                  onImportSvg();
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between"
              >
                <span>SVG-Logo / Vektor laden...</span>
              </button>
              <button
                onClick={() => {
                  onResetDemo();
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between text-zinc-300"
              >
                <span>M ONE 280ml (Original-Vorlage)</span>
                <span className="text-[10px] text-orange-400 font-mono">280ml</span>
              </button>
              <div className="h-[1px] bg-[#2a2d34] my-1" />
              <button
                onClick={() => {
                  onExportPdf();
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between font-semibold text-emerald-400 hover:text-white"
              >
                <span>PDF/X-4 Druck-PDF exportieren...</span>
                <span className="text-[10px] opacity-60">Ctrl+E</span>
              </button>
              <button
                onClick={() => {
                  onExportSvg();
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between"
              >
                <span>Vektor-SVG exportieren...</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. BEARBEITEN / EDIT */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('edit')}
            onMouseEnter={() => handleMenuHover('edit')}
            className={`px-2.5 py-1 rounded transition text-zinc-300 hover:text-white ${
              openMenu === 'edit' ? 'bg-[#2b2e38] text-white' : 'hover:bg-[#22242a]'
            }`}
          >
            Bearbeiten
          </button>
          {openMenu === 'edit' && (
            <div className="absolute top-full left-0 mt-0.5 w-52 bg-[#1b1c21] border border-[#2e323b] rounded-md shadow-2xl py-1 z-50 text-[12px] flex flex-col">
              <button
                onClick={() => {
                  onUndo();
                  closeMenu();
                }}
                disabled={!canUndo}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between disabled:opacity-40"
              >
                <span>Rückgängig</span>
                <span className="text-[10px] opacity-60">Ctrl+Z</span>
              </button>
              <button
                onClick={() => {
                  onRedo();
                  closeMenu();
                }}
                disabled={!canRedo}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between disabled:opacity-40"
              >
                <span>Wiederholen</span>
                <span className="text-[10px] opacity-60">Ctrl+Y</span>
              </button>
              <div className="h-[1px] bg-[#2a2d34] my-1" />
              <button
                onClick={() => {
                  onDuplicateSelected();
                  closeMenu();
                }}
                disabled={!hasSelection}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between disabled:opacity-40"
              >
                <span>Duplizieren</span>
                <span className="text-[10px] opacity-60">Ctrl+D</span>
              </button>
              <button
                onClick={() => {
                  onDeleteSelected();
                  closeMenu();
                }}
                disabled={!hasSelection}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between disabled:opacity-40 text-red-400 hover:text-white"
              >
                <span>Löschen</span>
                <span className="text-[10px] opacity-60">Entf</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. OBJEKT / OBJECT */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('object')}
            onMouseEnter={() => handleMenuHover('object')}
            className={`px-2.5 py-1 rounded transition text-zinc-300 hover:text-white ${
              openMenu === 'object' ? 'bg-[#2b2e38] text-white' : 'hover:bg-[#22242a]'
            }`}
          >
            Objekt
          </button>
          {openMenu === 'object' && (
            <div className="absolute top-full left-0 mt-0.5 w-60 bg-[#1b1c21] border border-[#2e323b] rounded-md shadow-2xl py-1 z-50 text-[12px] flex flex-col">
              <button
                onClick={() => {
                  onBoostTexts();
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between text-orange-400 hover:text-white"
              >
                <span>1-Klick Negativtext-Booster</span>
                <span className="text-[10px] opacity-60">+0.35pt</span>
              </button>
              <button
                onClick={() => {
                  onConvert1cAll();
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between"
              >
                <span>Bilder in 1c-Unbunt/Grau wandeln</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. PREPRESS / DRUCKVORSTUFE */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('prepress')}
            onMouseEnter={() => handleMenuHover('prepress')}
            className={`px-2.5 py-1 rounded transition text-zinc-300 hover:text-white ${
              openMenu === 'prepress' ? 'bg-[#2b2e38] text-white' : 'hover:bg-[#22242a]'
            }`}
          >
            Prepress
          </button>
          {openMenu === 'prepress' && (
            <div className="absolute top-full left-0 mt-0.5 w-64 bg-[#1b1c21] border border-[#2e323b] rounded-md shadow-2xl py-1 z-50 text-[12px] flex flex-col">
              <div className="px-3 py-1 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                Kartuschen-Druckprofil
              </div>
              <button
                onClick={() => {
                  onSelectManufacturer('fischbach-310');
                  closeMenu();
                }}
                className={`px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between ${
                  currentProfile === 'fischbach-310' ? 'text-orange-400 font-semibold' : ''
                }`}
              >
                <span>Fischbach E 310 (310 ml)</span>
                {currentProfile === 'fischbach-310' && <span>✓</span>}
              </button>
              <button
                onClick={() => {
                  onSelectManufacturer('gfv-310');
                  closeMenu();
                }}
                className={`px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between ${
                  currentProfile === 'gfv-310' ? 'text-orange-400 font-semibold' : ''
                }`}
              >
                <span>GFV Verschlüsse 310 ml</span>
                {currentProfile === 'gfv-310' && <span>✓</span>}
              </button>
              <button
                onClick={() => {
                  onSelectManufacturer('universal-280');
                  closeMenu();
                }}
                className={`px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between ${
                  currentProfile === 'universal-280' ? 'text-orange-400 font-semibold' : ''
                }`}
              >
                <span>Universal Euro-Kartusche 280 ml</span>
                {currentProfile === 'universal-280' && <span>✓</span>}
              </button>

              <div className="h-[1px] bg-[#2a2d34] my-1" />

              <div className="px-3 py-1 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                Siebauszug-Vorschau
              </div>
              <button
                onClick={() => {
                  onSelectPlateView('composite');
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between"
              >
                <span>Gesamtdruck (Composite)</span>
                {currentPlateView === 'composite' && <span>✓</span>}
              </button>
              <button
                onClick={() => {
                  onSelectPlateView('plate_white');
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between"
              >
                <span>Sieb 1: Deckweiß (Choke)</span>
                {currentPlateView === 'plate_white' && <span>✓</span>}
              </button>
              <button
                onClick={() => {
                  onSelectPlateView('plate_black');
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between"
              >
                <span>Sieb 2: Tiefschwarz 1c</span>
                {currentPlateView === 'plate_black' && <span>✓</span>}
              </button>
              <button
                onClick={() => {
                  onSelectPlateView('plate_orange');
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between"
              >
                <span>Sieb 3: M ONE Orange</span>
                {currentPlateView === 'plate_orange' && <span>✓</span>}
              </button>
              <button
                onClick={() => {
                  onSelectPlateView('plate_manhattan');
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between"
              >
                <span>Sieb 4: Manhattan Silbergrau</span>
                {currentPlateView === 'plate_manhattan' && <span>✓</span>}
              </button>
              <button
                onClick={() => {
                  onSelectPlateView('plate_red');
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between"
              >
                <span>Sieb 5: Fugen-Rot</span>
                {currentPlateView === 'plate_red' && <span>✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* 5. ANSICHT / VIEW */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('view')}
            onMouseEnter={() => handleMenuHover('view')}
            className={`px-2.5 py-1 rounded transition text-zinc-300 hover:text-white ${
              openMenu === 'view' ? 'bg-[#2b2e38] text-white' : 'hover:bg-[#22242a]'
            }`}
          >
            Ansicht
          </button>
          {openMenu === 'view' && (
            <div className="absolute top-full left-0 mt-0.5 w-52 bg-[#1b1c21] border border-[#2e323b] rounded-md shadow-2xl py-1 z-50 text-[12px] flex flex-col">
              <button
                onClick={() => {
                  onZoomIn();
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between"
              >
                <span>Vergrößern</span>
                <span className="text-[10px] opacity-60">Ctrl +</span>
              </button>
              <button
                onClick={() => {
                  onZoomOut();
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between"
              >
                <span>Verkleinern</span>
                <span className="text-[10px] opacity-60">Ctrl -</span>
              </button>
              <button
                onClick={() => {
                  onZoomReset();
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between"
              >
                <span>100% Originalgröße</span>
                <span className="text-[10px] opacity-60">Ctrl 1</span>
              </button>
              <button
                onClick={() => {
                  onZoomFit();
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between"
              >
                <span>An Fenster anpassen</span>
                <span className="text-[10px] opacity-60">Ctrl 0</span>
              </button>
              <div className="h-[1px] bg-[#2a2d34] my-1" />
              <button
                onClick={() => {
                  onToggle3D();
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between"
              >
                <span>3D-Kartuschenvorschau</span>
                <span>{is3dVisible ? '✓' : ''}</span>
              </button>
            </div>
          )}
        </div>

        {/* 6. MCP & KI */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('mcp')}
            onMouseEnter={() => handleMenuHover('mcp')}
            className={`px-2.5 py-1 rounded transition text-indigo-400 hover:text-white ${
              openMenu === 'mcp' ? 'bg-indigo-900/40 text-white' : 'hover:bg-[#22242a]'
            }`}
          >
            KI & MCP
          </button>
          {openMenu === 'mcp' && (
            <div className="absolute top-full left-0 mt-0.5 w-60 bg-[#1b1c21] border border-[#2e323b] rounded-md shadow-2xl py-1 z-50 text-[12px] flex flex-col">
              <button
                onClick={() => {
                  onOpenMcp();
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-indigo-600 hover:text-white flex items-center justify-between font-semibold text-indigo-400 hover:text-white"
              >
                <span>MCP Live-Terminal öffnen</span>
                <Bot className="w-3.5 h-3.5" />
              </button>
              <div className="px-3 py-1.5 text-[11px] text-zinc-500">
                Steuerung über Claude Desktop oder Antigravity Agents via Stdio & WebSocket (Port 8765)
              </div>
            </div>
          )}
        </div>

        {/* 7. HILFE */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('help')}
            onMouseEnter={() => handleMenuHover('help')}
            className={`px-2.5 py-1 rounded transition text-zinc-300 hover:text-white ${
              openMenu === 'help' ? 'bg-[#2b2e38] text-white' : 'hover:bg-[#22242a]'
            }`}
          >
            Hilfe
          </button>
          {openMenu === 'help' && (
            <div className="absolute top-full left-0 mt-0.5 w-52 bg-[#1b1c21] border border-[#2e323b] rounded-md shadow-2xl py-1 z-50 text-[12px] flex flex-col">
              <button
                onClick={() => {
                  onOpenShortcuts();
                  closeMenu();
                }}
                className="px-3 py-1.5 text-left hover:bg-orange-500 hover:text-white flex items-center justify-between"
              >
                <span>Tastaturkürzel</span>
              </button>
              <div className="px-3 py-2 text-[10px] text-zinc-500 border-t border-[#2a2d34]">
                ACE Cartridge Prepress v2.0
                <br />
                HDPE Siebdruck & Vector Suite
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Top Info / Status Pill */}
      <div className="ml-auto flex items-center gap-3 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1.5 font-mono text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>MCP: Aktiv (Port 8765)</span>
        </span>
        <span className="text-zinc-600">|</span>
        <span className="text-orange-400 font-semibold">{currentProfile.toUpperCase()}</span>
      </div>
    </div>
  );
};
