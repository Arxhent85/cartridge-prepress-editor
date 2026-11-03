import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  CartridgeConfig,
  LayoutElement,
  PreflightIssue,
  PrepressSettings,
  SpotColor,
  TextElement,
  ImageElement,
} from './types';
import { CARTRIDGE_CONFIGS, DEFAULT_SPOT_COLORS } from './constants/cartridgeConfigs';
import { DEFAULT_ELEMENTS } from './constants/demoLayout';
import { Toolbar } from './components/toolbar/Toolbar';
import { HybridCanvas } from './components/canvas/HybridCanvas';
import { Cartridge3DView } from './components/preview3d/Cartridge3DView';
import { PrepressPanel } from './components/panels/PrepressPanel';
import { ImageEditPanel } from './components/panels/ImageEditPanel';
import { ElementInspector } from './components/panels/ElementInspector';
import { McpConsoleModal } from './components/mcp/McpConsoleModal';
import { SvgLibraryModal } from './components/modals/SvgLibraryModal';
import { ExportModal } from './components/modals/ExportModal';
import { McpEditorBridge, McpToolCall, McpToolResult } from './mcp/mcpBridge';
import { runCartridgePreflightCheck } from './utils/preflightCheck';
import { parseUploadedFile } from './utils/importPipeline';
import {
  Sparkles,
  ShieldAlert,
  Layers,
  Sliders,
  Maximize2,
  RotateCcw,
  Download,
  Bot,
  CheckCircle2,
  Wand2,
} from 'lucide-react';

export function App() {
  // 1. Core State
  const [elements, setElements] = useState<LayoutElement[]>(DEFAULT_ELEMENTS);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'line' | 'rect' | 'table'>('select');
  const [cartridge, setCartridge] = useState<CartridgeConfig>(CARTRIDGE_CONFIGS['fischbach-310']);
  const [spotColors, setSpotColors] = useState<SpotColor[]>(DEFAULT_SPOT_COLORS);
  const [zoom, setZoom] = useState<number>(1.0);
  const [activeRightTab, setActiveRightTab] = useState<'prepress' | 'inspector' | 'gimp'>('prepress');

  // Prepress Settings
  const [settings, setSettings] = useState<PrepressSettings>({
    manufacturerProfile: 'fischbach-310',
    trappingWidthPt: 0.5,
    whiteUnderlayChokeMm: 0.15,
    dotGainCurvePercent: 20,
    halftoneMode: 'none',
    activeColorView: 'composite',
    includeControlStrip: true,
    autoStrokeBoostNegativeText: false,
  });

  // Canvas ref & 3D update trigger
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasUpdateTrigger, setCanvasUpdateTrigger] = useState<number>(0);

  // Modals
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
  const [isSvgLibraryOpen, setIsSvgLibraryOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // MCP Logs & Bridge
  const [mcpLogs, setMcpLogs] = useState<{ call: McpToolCall; res: McpToolResult }[]>([]);
  const bridgeRef = useRef<McpEditorBridge | null>(null);

  if (!bridgeRef.current) {
    bridgeRef.current = new McpEditorBridge(
      elements,
      setElements,
      settings,
      setSettings,
      cartridge,
      setCartridge
    );
    bridgeRef.current.onToolExecuted((call, res) => {
      setMcpLogs((prev) => [
        { call, res },
        ...prev.slice(0, 40),
      ]);
      setCanvasUpdateTrigger((v) => v + 1);
    });
    bridgeRef.current.connectWebSocket();
  }

  // Keep bridge updated with latest state
  useEffect(() => {
    if (bridgeRef.current) {
      bridgeRef.current.updateContext(elements, settings, cartridge);
    }
  }, [elements, settings, cartridge]);

  // Selected Element
  const selectedElement = useMemo(
    () => elements.find((e) => e.id === selectedElementId) || null,
    [elements, selectedElementId]
  );

  // Automatically switch tab when image is selected
  useEffect(() => {
    if (selectedElement?.type === 'image') {
      setActiveRightTab('gimp');
    } else if (selectedElement && activeRightTab === 'gimp') {
      setActiveRightTab('inspector');
    }
  }, [selectedElementId]);

  // Preflight Issues
  const preflightIssues = useMemo(
    () => runCartridgePreflightCheck(elements, cartridge, settings),
    [elements, cartridge, settings]
  );

  // Canvas Updated Callback
  const handleCanvasUpdated = () => {
    setCanvasUpdateTrigger((v) => v + 1);
  };

  // 1-Click Action: Boost Negative Texts (+0.35pt)
  const handleBoostNegativeTexts = () => {
    const updated = elements.map((el) => {
      if (el.type === 'text' && el.isNegative) {
        return {
          ...el,
          strokeWidth: Math.max(0.35, (el.strokeWidth || 0) + 0.3),
        };
      }
      return el;
    });
    setElements(updated);
  };

  // 1-Click Action: Convert all photos to 1c Grayscale + Dot Gain
  const handleConvertTo1cAll = () => {
    const updated = elements.map((el) => {
      if (el.type === 'image') {
        return {
          ...el,
          filterSettings: {
            ...el.filterSettings,
            grayscale1c: true,
            dotGainCompensation: 20,
          },
        };
      }
      return el;
    });
    setElements(updated);
  };

  // Preflight Auto-Fix
  const handleAutoFixPreflight = (issue: PreflightIssue) => {
    if (!issue.elementId) {
      if (issue.id === 'preflight-white-choke') {
        setSettings({ ...settings, whiteUnderlayChokeMm: 0.15 });
      }
      return;
    }

    const updated = elements.map((el) => {
      if (el.id === issue.elementId) {
        if (el.type === 'text' && issue.id.includes('preflight-neg-text')) {
          return { ...el, strokeWidth: 0.4 };
        }
        if (el.type === 'text' && issue.id.includes('preflight-small-text')) {
          return { ...el, fontSize: 5.5 };
        }
        if ((el.type === 'line' || el.type === 'rect') && issue.id.includes('preflight-hairline')) {
          return { ...el, strokeWidth: 0.6 };
        }
        if (el.type === 'image' && issue.id.includes('preflight-cmyk-image')) {
          return {
            ...el,
            filterSettings: { ...el.filterSettings, grayscale1c: true },
          };
        }
        if (el.type === 'image' && issue.id.includes('preflight-dotgain')) {
          return {
            ...el,
            filterSettings: { ...el.filterSettings, dotGainCompensation: 20 },
          };
        }
      }
      return el;
    });
    setElements(updated);
  };

  // Toolbar Actions
  const handleAddText = () => {
    const newText: TextElement = {
      id: `text_${Date.now()}`,
      name: 'Neues Textfeld',
      type: 'text',
      x: 20,
      y: 40,
      width: 60,
      height: 10,
      rotation: 0,
      spotColorId: 'black',
      text: 'NEUER TEXT',
      fontSize: 10,
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontWeight: 'bold',
      letterSpacing: 0.3,
      lineHeight: 1.1,
      textColor: '#141414',
      isNegative: false,
      strokeWidth: 0.2,
      isLocked: false,
      isHidden: false,
      layerGroup: 'text_multilingual',
    };
    setElements([...elements, newText]);
    setSelectedElementId(newText.id);
    setActiveRightTab('inspector');
  };

  const handleAddJointLine = () => {
    const newLine: LayoutElement = {
      id: `joint_${Date.now()}`,
      name: 'Silikonfuge Markierung (Rot)',
      type: 'line',
      x: 15,
      y: 85,
      width: 70,
      height: 2,
      rotation: 0,
      spotColorId: 'red',
      points: [
        { x: 15, y: 85 },
        { x: 85, y: 85 },
      ],
      strokeWidth: 2.2,
      strokeColor: '#E11D48',
      isLocked: false,
      isHidden: false,
      layerGroup: 'bars',
    };
    setElements([...elements, newLine]);
    setSelectedElementId(newLine.id);
    setActiveRightTab('inspector');
  };

  const handleAddRect = () => {
    const newRect: LayoutElement = {
      id: `rect_${Date.now()}`,
      name: 'Farbfläche / Rahmen',
      type: 'rect',
      x: 10,
      y: 10,
      width: 50,
      height: 20,
      rotation: 0,
      spotColorId: 'orange',
      strokeWidth: 0,
      strokeColor: 'transparent',
      fillColor: '#FF6600',
      cornerRadius: 1.5,
      isLocked: false,
      isHidden: false,
      layerGroup: 'bars',
    };
    setElements([...elements, newRect]);
    setSelectedElementId(newRect.id);
    setActiveRightTab('inspector');
  };

  const handleAddTable = () => {
    const newTable: LayoutElement = {
      id: `table_${Date.now()}`,
      name: 'Temperaturtabelle',
      type: 'table',
      x: 10,
      y: 50,
      width: 45,
      height: 30,
      rotation: 0,
      spotColorId: 'black',
      strokeWidth: 0.5,
      strokeColor: '#141414',
      fillColor: '#ffffff',
      tableRows: 3,
      tableCols: 2,
      tableData: [
        ['Temperatur', '-40°C bis +150°C'],
        ['Hautbildung', '10–15 Min.'],
        ['Lagerung', '+5°C bis +25°C'],
      ],
      isLocked: false,
      isHidden: false,
      layerGroup: 'bars',
    };
    setElements([...elements, newTable]);
    setSelectedElementId(newTable.id);
    setActiveRightTab('inspector');
  };

  // Upload handlers
  const handleUploadImage = async (file: File) => {
    const updated = await parseUploadedFile(file, elements);
    setElements(updated);
  };

  const handleUploadSvg = async (file: File) => {
    const updated = await parseUploadedFile(file, elements);
    setElements(updated);
  };

  const handleImportPDF = async (file: File) => {
    const updated = await parseUploadedFile(file, elements);
    setElements(updated);
  };

  // Reset to Demo Template
  const handleResetTemplate = () => {
    if (confirm('Möchtest du das Layout auf das Demo-Template "M ONE Sanitär Silicon PREMIUM" zurücksetzen?')) {
      setElements(DEFAULT_ELEMENTS);
      setSelectedElementId(null);
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-[#0f1012] text-zinc-100 overflow-hidden font-sans">
      {/* 1. TOP PROFESSIONAL APP BAR */}
      <header className="h-12 bg-[#16171b] border-b border-[#26282e] px-4 flex items-center justify-between z-30 select-none">
        {/* Left: App Brand & Cartridge Spec */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-md shadow-orange-500/50" />
            <h1 className="font-bold text-sm tracking-wider uppercase text-zinc-100">
              ACE Kartuschen-Prepress
            </h1>
            <span className="text-[10px] bg-orange-500/15 text-orange-400 font-mono px-2 py-0.5 rounded border border-orange-500/30">
              UV-Siebdruck v2.0
            </span>
          </div>

          <div className="h-4 w-[1px] bg-[#2d3038]" />

          {/* Cartridge Model Badge */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-300">
            <span className="text-zinc-500">Kartusche:</span>
            <strong className="text-zinc-200">{cartridge.name}</strong>
            <span className="text-orange-400 font-mono font-semibold">({cartridge.volume})</span>
          </div>
        </div>

        {/* Center: Preflight Status Indicator */}
        <div className="flex items-center gap-2">
          {preflightIssues.filter((i) => i.severity === 'error').length > 0 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/40 border border-red-800 text-red-400 text-xs font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Preflight: {preflightIssues.filter((i) => i.severity === 'error').length} Fehler vor Druckfreigabe</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/30 border border-emerald-800/50 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Siebdruck-Preflight: Bestanden</span>
            </div>
          )}

          {/* Quick Prepress 1-Click Action */}
          <button
            onClick={handleBoostNegativeTexts}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#24262d] hover:bg-[#2e313b] text-zinc-300 hover:text-white border border-[#343844] text-xs transition"
            title="Verstärkt feine Negativschriften um 0.35pt, damit sie im Siebdruck nicht zulaufen"
          >
            <Wand2 className="w-3 h-3 text-orange-400" />
            <span>Negativtext-Booster</span>
          </button>
        </div>

        {/* Right: Actions (MCP, Template, Export) */}
        <div className="flex items-center gap-2">
          {/* MCP Bridge Button */}
          <button
            onClick={() => setIsMcpModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/50 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-medium transition shadow"
            title="MCP Live-Fernsteuerung öffnen"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>MCP-Terminal</span>
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={handleResetTemplate}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#24262d] transition"
            title="Demo-Template M ONE Sanitär Silicon zurücksetzen"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* SVG Library Button */}
          <button
            onClick={() => setIsSvgLibraryOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#22242b] hover:bg-[#2b2e38] border border-[#323642] text-zinc-300 text-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Icons & GHS</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-white font-semibold text-xs shadow-lg shadow-orange-950/40 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Druck-PDF Export</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN 3-COLUMN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* Column 1: Left Toolbar */}
        <Toolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          onAddText={handleAddText}
          onAddJointLine={handleAddJointLine}
          onAddRect={handleAddRect}
          onAddTable={handleAddTable}
          onUploadImage={handleUploadImage}
          onUploadSvg={handleUploadSvg}
          onImportPDF={handleImportPDF}
          onExportPDF={() => setIsExportModalOpen(true)}
          onExportSVG={() => setIsExportModalOpen(true)}
          onExportSeparationPack={() => setIsExportModalOpen(true)}
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(3.5, z + 0.15))}
          onZoomOut={() => setZoom((z) => Math.max(0.35, z - 0.15))}
          onZoomReset={() => setZoom(1.0)}
          onOpenMcpConsole={() => setIsMcpModalOpen(true)}
        />

        {/* Column 2: Center Hybrid Canvas (Pan & Zoom Kartuschen-Druckbogen) */}
        <main className="flex-1 h-full relative overflow-hidden bg-[#0d0e11] flex flex-col">
          <HybridCanvas
            elements={elements}
            onElementsChange={setElements}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
            cartridge={cartridge}
            spotColors={spotColors}
            settings={settings}
            canvasRef={canvasRef}
            onCanvasUpdated={handleCanvasUpdated}
            zoom={zoom}
            onZoomChange={setZoom}
          />
        </main>

        {/* Column 3: Right Inspector & 3D Cartridge Panel */}
        <aside className="w-80 bg-[#16171b] border-l border-[#26282e] flex flex-col justify-between overflow-hidden z-20">
          {/* Top Segmented Tabs */}
          <div className="flex items-center border-b border-[#26282e] bg-[#141518]">
            <button
              onClick={() => setActiveRightTab('prepress')}
              className={`flex-1 py-2.5 text-xs font-medium text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
                activeRightTab === 'prepress'
                  ? 'border-orange-500 text-orange-400 bg-[#1c1d22]'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Prepress</span>
            </button>

            <button
              onClick={() => setActiveRightTab('inspector')}
              className={`flex-1 py-2.5 text-xs font-medium text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
                activeRightTab === 'inspector'
                  ? 'border-orange-500 text-orange-400 bg-[#1c1d22]'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Element</span>
            </button>

            {selectedElement?.type === 'image' && (
              <button
                onClick={() => setActiveRightTab('gimp')}
                className={`flex-1 py-2.5 text-xs font-medium text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
                  activeRightTab === 'gimp'
                    ? 'border-orange-500 text-orange-400 bg-[#1c1d22]'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>GIMP</span>
              </button>
            )}
          </div>

          {/* Middle: Tab Content (Scrollable) */}
          <div className="flex-1 p-3 overflow-y-auto">
            {activeRightTab === 'prepress' && (
              <PrepressPanel
                settings={settings}
                onUpdateSettings={setSettings}
                spotColors={spotColors}
                onUpdateSpotColors={setSpotColors}
                cartridge={cartridge}
                onSelectCartridge={setCartridge}
                preflightIssues={preflightIssues}
                onAutoFixPreflight={handleAutoFixPreflight}
                onBoostNegativeTexts={handleBoostNegativeTexts}
                onConvertTo1cAll={handleConvertTo1cAll}
              />
            )}

            {activeRightTab === 'inspector' && selectedElement && (
              <ElementInspector
                element={selectedElement}
                onUpdateElement={(updated) =>
                  setElements(elements.map((e) => (e.id === updated.id ? updated : e)))
                }
                onDeleteElement={(id) => {
                  setElements(elements.filter((e) => e.id !== id));
                  setSelectedElementId(null);
                }}
                spotColors={spotColors}
              />
            )}

            {activeRightTab === 'inspector' && !selectedElement && (
              <div className="text-zinc-500 text-center py-10 flex flex-col items-center gap-2">
                <Sliders className="w-8 h-8 opacity-40" />
                <span className="text-xs">
                  Klicke auf ein Element im Kartuschendruckbogen, um Schrift, Farben oder Maße anzupassen.
                </span>
              </div>
            )}

            {activeRightTab === 'gimp' && selectedElement?.type === 'image' && (
              <ImageEditPanel
                element={selectedElement as ImageElement}
                onUpdateElement={(updated) =>
                  setElements(elements.map((e) => (e.id === updated.id ? updated : e)))
                }
                spotColors={spotColors}
              />
            )}
          </div>

          {/* Bottom Card: Live 3D Cartridge Preview */}
          <div className="p-2.5 border-t border-[#26282e] bg-[#121316]">
            <Cartridge3DView
              layoutCanvasRef={canvasRef}
              cartridge={cartridge}
              updateTrigger={canvasUpdateTrigger}
            />
          </div>
        </aside>
      </div>

      {/* 3. MODALS */}
      <McpConsoleModal
        isOpen={isMcpModalOpen}
        onClose={() => setIsMcpModalOpen(false)}
        bridge={bridgeRef.current!}
        logs={mcpLogs}
      />

      <SvgLibraryModal
        isOpen={isSvgLibraryOpen}
        onClose={() => setIsSvgLibraryOpen(false)}
        onInsertSvg={(svgContent, name, spotColor) => {
          const newSvg: LayoutElement = {
            id: `svg_${Date.now()}`,
            name,
            type: 'svg',
            x: 20,
            y: 30,
            width: 25,
            height: 25,
            rotation: 0,
            spotColorId: spotColor,
            svgContent,
            preserveAspectRatio: true,
            isLocked: false,
            isHidden: false,
            layerGroup: 'logos',
          };
          setElements([...elements, newSvg]);
          setSelectedElementId(newSvg.id);
        }}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        elements={elements}
        cartridge={cartridge}
        spotColors={spotColors}
        settings={settings}
      />
    </div>
  );
}

export default App;
