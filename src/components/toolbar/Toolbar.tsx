import React, { useRef } from 'react';
import {
  MousePointer,
  Type,
  Minus,
  Square,
  Table as TableIcon,
  Image as ImageIcon,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  FolderOpen,
  FileCode,
  ShieldCheck,
  Bot,
} from 'lucide-react';

interface ToolbarProps {
  activeTool: 'select' | 'text' | 'line' | 'rect' | 'table';
  setActiveTool: (tool: 'select' | 'text' | 'line' | 'rect' | 'table') => void;
  onAddText: () => void;
  onAddJointLine: () => void;
  onAddRect: () => void;
  onAddTable: () => void;
  onUploadImage: (file: File) => void;
  onUploadSvg: (file: File) => void;
  onImportPDF: (file: File) => void;
  onExportPDF: () => void;
  onExportSVG: () => void;
  onExportSeparationPack: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onOpenMcpConsole: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  onAddText,
  onAddJointLine,
  onAddRect,
  onAddTable,
  onUploadImage,
  onUploadSvg,
  onImportPDF,
  onExportPDF,
  onExportSVG,
  onExportSeparationPack,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onOpenMcpConsole,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const svgInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadImage(file);
    e.target.value = '';
  };

  const handleSvgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadSvg(file);
    e.target.value = '';
  };

  const handlePdfFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImportPDF(file);
    e.target.value = '';
  };

  return (
    <aside className="w-14 bg-[#141518] border-r border-[#26282e] flex flex-col items-center py-3 justify-between select-none z-20">
      {/* Top Tools */}
      <div className="flex flex-col items-center gap-2">
        {/* Logo Icon */}
        <div
          className="w-9 h-9 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-bold text-white shadow-lg shadow-orange-950/40 mb-2 cursor-pointer"
          title="ACE Cartridge Prepress & Layout Web-App"
        >
          ACE
        </div>

        {/* Pointer / Selection */}
        <button
          onClick={() => setActiveTool('select')}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
            activeTool === 'select'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-[#22242a]'
          }`}
          title="Auswahl-Werkzeug (V)"
        >
          <MousePointer className="w-5 h-5" />
        </button>

        {/* Text Tool */}
        <button
          onClick={() => {
            setActiveTool('text');
            onAddText();
          }}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
            activeTool === 'text'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-[#22242a]'
          }`}
          title="Textfeld hinzufügen (T)"
        >
          <Type className="w-5 h-5" />
        </button>

        {/* Joint / Seam Line Tool */}
        <button
          onClick={() => {
            setActiveTool('line');
            onAddJointLine();
          }}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
            activeTool === 'line'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-[#22242a]'
          }`}
          title="Fugenmarkierung (Rot) / Vektorlinie (L)"
        >
          <Minus className="w-5 h-5 rotate-45" />
        </button>

        {/* Rectangle / Frame Tool */}
        <button
          onClick={() => {
            setActiveTool('rect');
            onAddRect();
          }}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
            activeTool === 'rect'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-[#22242a]'
          }`}
          title="Rahmen / Farbfläche (R)"
        >
          <Square className="w-5 h-5" />
        </button>

        {/* Table Tool */}
        <button
          onClick={() => {
            setActiveTool('table');
            onAddTable();
          }}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
            activeTool === 'table'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-[#22242a]'
          }`}
          title="Technische Datentabelle einfügen"
        >
          <TableIcon className="w-5 h-5" />
        </button>

        <div className="w-6 h-[1px] bg-[#2a2d34] my-1" />

        {/* Image Upload */}
        <button
          onClick={() => imageInputRef.current?.click()}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#22242a] transition"
          title="Produktfoto / Rendering importieren"
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageFile}
          className="hidden"
        />

        {/* SVG Upload */}
        <button
          onClick={() => svgInputRef.current?.click()}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#22242a] transition"
          title="SVG-Logo / Piktogramm importieren"
        >
          <FileCode className="w-5 h-5" />
        </button>
        <input
          ref={svgInputRef}
          type="file"
          accept=".svg"
          onChange={handleSvgFile}
          className="hidden"
        />

        {/* PDF / CorelDraw Import */}
        <button
          onClick={() => pdfInputRef.current?.click()}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#22242a] transition"
          title="PDF-Druckbogen oder CorelDraw-Export laden"
        >
          <FolderOpen className="w-5 h-5" />
        </button>
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf,.cdr,.ai"
          onChange={handlePdfFile}
          className="hidden"
        />
      </div>

      {/* Bottom Controls: MCP Bot, Zoom, Export */}
      <div className="flex flex-col items-center gap-2">
        {/* AI MCP Bridge Button */}
        <button
          onClick={onOpenMcpConsole}
          className="w-10 h-10 rounded-lg bg-indigo-950/40 border border-indigo-700/50 text-indigo-400 hover:text-white hover:bg-indigo-900 transition flex items-center justify-center shadow-lg animate-pulse"
          title="MCP-Server & KI-Fernsteuerung öffnen"
        >
          <Bot className="w-5 h-5" />
        </button>

        <div className="w-6 h-[1px] bg-[#2a2d34] my-1" />

        {/* Zoom Controls */}
        <button
          onClick={onZoomIn}
          className="w-8 h-8 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#22242a]"
          title="Vergrößern (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomReset}
          className="text-[10px] font-mono text-zinc-400 hover:text-orange-400"
          title="Zoom zurücksetzen"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={onZoomOut}
          className="w-8 h-8 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#22242a]"
          title="Verkleinern (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="w-6 h-[1px] bg-[#2a2d34] my-1" />

        {/* Production Export Button */}
        <button
          onClick={onExportPDF}
          className="w-10 h-10 rounded-lg bg-gradient-to-b from-orange-500 to-orange-600 text-white hover:brightness-110 flex items-center justify-center shadow-md transition"
          title="Druckfertiges PDF/X-4 mit Sieb-Separationen exportieren"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
