import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  CartridgeConfig,
  LayoutElement,
  PreflightIssue,
  PrepressSettings,
  SpotColor,
  TextElement,
  ImageElement,
  ManufacturerProfile,
} from './types';
import { CARTRIDGE_CONFIGS, DEFAULT_SPOT_COLORS } from './constants/cartridgeConfigs';
import { DEFAULT_ELEMENTS } from './constants/demoLayout';
import { AppMenuBar } from './components/menubar/AppMenuBar';
import { ContextOptionsBar } from './components/menubar/ContextOptionsBar';
import { Toolbar } from './components/toolbar/Toolbar';
import { HybridCanvas } from './components/canvas/HybridCanvas';
import { Cartridge3DView } from './components/preview3d/Cartridge3DView';
import { PrepressPanel } from './components/panels/PrepressPanel';
import { LayersPanel } from './components/panels/LayersPanel';
import { ImageEditPanel } from './components/panels/ImageEditPanel';
import { ElementInspector } from './components/panels/ElementInspector';
import { McpConsoleModal } from './components/mcp/McpConsoleModal';
import { SvgLibraryModal } from './components/modals/SvgLibraryModal';
import { ExportModal } from './components/modals/ExportModal';
import { ShortcutsModal } from './components/modals/ShortcutsModal';
import { McpEditorBridge, McpToolCall, McpToolResult } from './mcp/mcpBridge';
import { runCartridgePreflightCheck } from './utils/preflightCheck';
import { parseUploadedFile } from './utils/importPipeline';
import {
  Layers,
  Sliders,
  Sparkles,
  Download,
  Bot,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';

export function App() {
  // 1. Core State
  const [elements, setElements] = useState<LayoutElement[]>(DEFAULT_ELEMENTS);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'line' | 'rect' | 'table'>('select');
  const [cartridge, setCartridge] = useState<CartridgeConfig>(CARTRIDGE_CONFIGS['fischbach-310']);
  const [spotColors, setSpotColors] = useState<SpotColor[]>(DEFAULT_SPOT_COLORS);
  const [zoom, setZoom] = useState<number>(1.0);
  const [activeRightTab, setActiveRightTab] = useState<'prepress' | 'layers' | 'inspector' | 'gimp'>('prepress');
  const [is3dVisible, setIs3dVisible] = useState(true);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<LayoutElement[][]>([DEFAULT_ELEMENTS]);
  const [historyIndex, setHistoryIndex] = useState(0);

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

  // Hidden File Inputs
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const svgInputRef = useRef<HTMLInputElement>(null);

  // Modals
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
  const [isSvgLibraryOpen, setIsSvgLibraryOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // MCP Logs & Bridge
  const [mcpLogs, setMcpLogs] = useState<{ call: McpToolCall; res: McpToolResult }[]>([]);
  const bridgeRef = useRef<McpEditorBridge | null>(null);

  // Push new state to history
  const updateElementsWithHistory = (newElements: LayoutElement[]) => {
    setElements(newElements);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setElements(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setElements(next);
    }
  };

  if (!bridgeRef.current) {
    bridgeRef.current = new McpEditorBridge(
      elements,
      updateElementsWithHistory,
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
    }
  }, [selectedElementId]);

  // Preflight Issues
  const preflightIssues = useMemo(
    () => runCartridgePreflightCheck(elements, cartridge, settings),
    [elements, cartridge, settings]
  );

  const handleCanvasUpdated = () => {
    setCanvasUpdateTrigger((v) => v + 1);
  };

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+O, Ctrl+E, Ctrl+D, Del)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        pdfInputRef.current?.click();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsExportModalOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicateSelected();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          e.preventDefault();
          handleDeleteSelected();
        }
      } else if (e.key.toLowerCase() === 'v') {
        setActiveTool('select');
      } else if (e.key.toLowerCase() === 't') {
        handleAddText();
      } else if (e.key.toLowerCase() === 'l') {
        handleAddJointLine();
      } else if (e.key.toLowerCase() === 'r') {
        handleAddRect();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, selectedElementId, elements]);

  // Duplicate Selected Element
  const handleDuplicateSelected = () => {
    if (!selectedElement) return;
    const dup: LayoutElement = {
      ...selectedElement,
      id: `${selectedElement.type}_${Date.now()}`,
      name: `${selectedElement.name} (Kopie)`,
      x: selectedElement.x + 5,
      y: selectedElement.y + 5,
    };
    updateElementsWithHistory([...elements, dup]);
    setSelectedElementId(dup.id);
  };

  // Delete Selected Element
  const handleDeleteSelected = () => {
    if (!selectedElementId) return;
    updateElementsWithHistory(elements.filter((e) => e.id !== selectedElementId));
    setSelectedElementId(null);
  };

  // Boost Negative Texts
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
    updateElementsWithHistory(updated);
  };

  // Convert all photos to 1c Grayscale
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
    updateElementsWithHistory(updated);
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
    updateElementsWithHistory(updated);
  };

  // Add Tools
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
    updateElementsWithHistory([...elements, newText]);
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
    updateElementsWithHistory([...elements, newLine]);
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
    updateElementsWithHistory([...elements, newRect]);
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
    updateElementsWithHistory([...elements, newTable]);
    setSelectedElementId(newTable.id);
    setActiveRightTab('inspector');
  };

  // File Upload Handlers (PDF, Image, SVG)
  const handleUploadFile = async (file: File) => {
    const updated = await parseUploadedFile(
      file,
      elements,
      cartridge.printableWidthMm,
      cartridge.printableHeightMm
    );
    updateElementsWithHistory(updated);
  };

  const handleResetTemplate = () => {
    if (confirm('Möchtest du das Layout auf das Demo-Template "M ONE Sanitär Silicon" zurücksetzen?')) {
      updateElementsWithHistory(DEFAULT_ELEMENTS);
      setSelectedElementId(null);
    }
  };

  const handleNewLayout = () => {
    if (confirm('Neues leeres Kartuschenlayout anlegen?')) {
      updateElementsWithHistory([]);
      setSelectedElementId(null);
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-[#0f1012] text-zinc-100 overflow-hidden font-sans">
      {/* 1. TOP MENU BAR (VectorCraft style) */}
      <AppMenuBar
        onNew={handleNewLayout}
        onOpenPdf={() => pdfInputRef.current?.click()}
        onImportSvg={() => svgInputRef.current?.click()}
        onImportImage={() => imageInputRef.current?.click()}
        onResetDemo={handleResetTemplate}
        onExportPdf={() => setIsExportModalOpen(true)}
        onExportSvg={() => setIsExportModalOpen(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onDuplicateSelected={handleDuplicateSelected}
        onDeleteSelected={handleDeleteSelected}
        hasSelection={!!selectedElementId}
        onBoostTexts={handleBoostNegativeTexts}
        onConvert1cAll={handleConvertTo1cAll}
        onSelectManufacturer={(profile) => {
          const cfg = CARTRIDGE_CONFIGS[profile];
          if (cfg) {
            setCartridge(cfg);
            setSettings({ ...settings, manufacturerProfile: profile });
          }
        }}
        currentProfile={settings.manufacturerProfile}
        onSelectPlateView={(view) => setSettings({ ...settings, activeColorView: view })}
        currentPlateView={settings.activeColorView}
        onZoomIn={() => setZoom((z) => Math.min(3.5, z + 0.15))}
        onZoomOut={() => setZoom((z) => Math.max(0.35, z - 0.15))}
        onZoomReset={() => setZoom(1.0)}
        onZoomFit={() => setZoom(0.85)}
        onOpenMcp={() => setIsMcpModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onToggle3D={() => setIs3dVisible(!is3dVisible)}
        is3dVisible={is3dVisible}
      />

      {/* 2. CONTEXTUAL OPTIONS BAR */}
      <ContextOptionsBar
        selectedElement={selectedElement}
        onUpdateElement={(updated) =>
          updateElementsWithHistory(elements.map((e) => (e.id === updated.id ? updated : e)))
        }
        spotColors={spotColors}
        cartridge={cartridge}
        settings={settings}
        onUpdateSettings={setSettings}
        onReplaceImageClick={() => imageInputRef.current?.click()}
      />

      {/* Hidden Global File Inputs */}
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf,.cdr"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUploadFile(f);
          e.target.value = '';
        }}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUploadFile(f);
          e.target.value = '';
        }}
        className="hidden"
      />
      <input
        ref={svgInputRef}
        type="file"
        accept=".svg"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUploadFile(f);
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* 3. MAIN WORKSPACE (Toolbar, Hybrid Canvas, Sidebar) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Professional Toolbar */}
        <Toolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          onAddText={handleAddText}
          onAddJointLine={handleAddJointLine}
          onAddRect={handleAddRect}
          onAddTable={handleAddTable}
          onUploadImage={(f) => handleUploadFile(f)}
          onUploadSvg={(f) => handleUploadFile(f)}
          onImportPDF={(f) => handleUploadFile(f)}
          onExportPDF={() => setIsExportModalOpen(true)}
          onExportSVG={() => setIsExportModalOpen(true)}
          onExportSeparationPack={() => setIsExportModalOpen(true)}
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(3.5, z + 0.15))}
          onZoomOut={() => setZoom((z) => Math.max(0.35, z - 0.15))}
          onZoomReset={() => setZoom(1.0)}
          onOpenMcpConsole={() => setIsMcpModalOpen(true)}
        />

        {/* Center Canvas */}
        <main className="flex-1 h-full relative overflow-hidden bg-[#0d0e11] flex flex-col">
          <HybridCanvas
            elements={elements}
            onElementsChange={updateElementsWithHistory}
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

        {/* Right Dockable Sidebar */}
        <aside className="w-84 bg-[#16171b] border-l border-[#26282e] flex flex-col justify-between overflow-hidden z-20">
          {/* Top Segmented Tabs */}
          <div className="flex items-center border-b border-[#26282e] bg-[#141518]">
            <button
              onClick={() => setActiveRightTab('prepress')}
              className={`flex-1 py-2 text-xs font-medium text-center transition border-b-2 flex items-center justify-center gap-1 ${
                activeRightTab === 'prepress'
                  ? 'border-orange-500 text-orange-400 bg-[#1c1d22]'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Prepress</span>
            </button>

            <button
              onClick={() => setActiveRightTab('layers')}
              className={`flex-1 py-2 text-xs font-medium text-center transition border-b-2 flex items-center justify-center gap-1 ${
                activeRightTab === 'layers'
                  ? 'border-orange-500 text-orange-400 bg-[#1c1d22]'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ebenen</span>
            </button>

            <button
              onClick={() => setActiveRightTab('inspector')}
              className={`flex-1 py-2 text-xs font-medium text-center transition border-b-2 flex items-center justify-center gap-1 ${
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
                className={`flex-1 py-2 text-xs font-medium text-center transition border-b-2 flex items-center justify-center gap-1 ${
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

          {/* Middle: Tab Content */}
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

            {activeRightTab === 'layers' && (
              <LayersPanel
                elements={elements}
                onElementsChange={updateElementsWithHistory}
                selectedElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
              />
            )}

            {activeRightTab === 'inspector' && selectedElement && (
              <ElementInspector
                element={selectedElement}
                onUpdateElement={(updated) =>
                  updateElementsWithHistory(elements.map((e) => (e.id === updated.id ? updated : e)))
                }
                onDeleteElement={(id) => {
                  updateElementsWithHistory(elements.filter((e) => e.id !== id));
                  setSelectedElementId(null);
                }}
                spotColors={spotColors}
              />
            )}

            {activeRightTab === 'inspector' && !selectedElement && (
              <div className="text-zinc-500 text-center py-12 flex flex-col items-center gap-2">
                <Sliders className="w-8 h-8 opacity-30" />
                <span className="text-xs">
                  Klicke auf ein Element im Kartuschendruckbogen oder in der Ebenen-Liste, um Schrift, Farben oder Maße anzupassen.
                </span>
              </div>
            )}

            {activeRightTab === 'gimp' && selectedElement?.type === 'image' && (
              <ImageEditPanel
                element={selectedElement as ImageElement}
                onUpdateElement={(updated) =>
                  updateElementsWithHistory(elements.map((e) => (e.id === updated.id ? updated : e)))
                }
                spotColors={spotColors}
              />
            )}
          </div>

          {/* Bottom Card: Live 3D Cartridge Preview (collapsible) */}
          {is3dVisible && (
            <div className="p-2 border-t border-[#26282e] bg-[#121316]">
              <Cartridge3DView
                layoutCanvasRef={canvasRef}
                cartridge={cartridge}
                updateTrigger={canvasUpdateTrigger}
              />
            </div>
          )}
        </aside>
      </div>

      {/* 4. MODALS */}
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
          updateElementsWithHistory([...elements, newSvg]);
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

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

export default App;
