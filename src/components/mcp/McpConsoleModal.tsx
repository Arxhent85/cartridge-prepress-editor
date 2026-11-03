import React, { useState } from 'react';
import { McpEditorBridge, McpToolCall, McpToolResult } from '../../mcp/mcpBridge';
import {
  Bot,
  Play,
  Terminal,
  X,
  Code2,
  CheckCircle,
  AlertCircle,
  Copy,
  Sparkles,
} from 'lucide-react';

interface McpConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  bridge: McpEditorBridge;
  logs: { call: McpToolCall; res: McpToolResult }[];
}

export const McpConsoleModal: React.FC<McpConsoleModalProps> = ({
  isOpen,
  onClose,
  bridge,
  logs,
}) => {
  const [selectedTool, setSelectedTool] = useState<string>('update_text_element');
  const [jsonArgs, setJsonArgs] = useState<string>(
    JSON.stringify(
      {
        id: 'elem-badge-color-text',
        newText: 'FARBTON: ANTHRAZIT (Dunkelgrau)',
        strokeWidth: 0.45,
      },
      null,
      2
    )
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  if (!isOpen) return null;

  const toolPresets: Record<string, any> = {
    get_document_structure: {},
    update_text_element: {
      id: 'elem-badge-color-text',
      newText: 'FARBTON: ANTHRAZIT (Dunkelgrau)',
      strokeWidth: 0.45,
    },
    replace_and_optimize_image: {
      id: 'elem-photo-shower',
      convertTo1cGray: true,
      dotGainCompensation: 22,
    },
    insert_svg_element: {
      x: 70,
      y: 95,
      width: 25,
      height: 15,
      spotColorChannel: 'orange',
      svgContent:
        '<svg viewBox="0 0 100 60"><rect width="100" height="60" rx="10" fill="#FF6600"/><text x="50" y="38" font-size="20" font-weight="bold" fill="#FFF" text-anchor="middle">NEW LOGO</text></svg>',
    },
    draw_vector_line: {
      points: [
        { x: 20, y: 80 },
        { x: 85, y: 80 },
      ],
      strokeWidth: 3.0,
      spotColorChannel: 'red',
    },
    apply_cartridge_prepress_preset: {
      manufacturerProfile: 'fischbach-310',
    },
    export_print_ready_pdf: {
      includeControlStrip: true,
      separateSpotLayers: true,
    },
  };

  const handleSelectTool = (tool: string) => {
    setSelectedTool(tool);
    setJsonArgs(JSON.stringify(toolPresets[tool] || {}, null, 2));
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const parsed = JSON.parse(jsonArgs);
      await bridge.executeMcpTool(selectedTool, parsed);
    } catch (e: any) {
      alert(`Fehler bei der MCP-Ausführung: ${e.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const mcpConfigJson = JSON.stringify(
    {
      mcpServers: {
        'cartridge-prepress': {
          command: 'bun',
          args: ['run', 'mcp-server.ts'],
          url: 'ws://localhost:8765',
        },
      },
    },
    null,
    2
  );

  const copyConfig = () => {
    navigator.clipboard.writeText(mcpConfigJson);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#141518] border border-[#2e323b] rounded-xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1a1b20] border-b border-[#2e323b]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
                <span>Model Context Protocol (MCP) Live-Terminal</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Online & Bereit
                </span>
              </div>
              <div className="text-[11px] text-zinc-400">
                KI-Fernsteuerung für autonome Layout-Anpassungen & Siebdruck-Optimierung
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#2a2d34] overflow-hidden">
          {/* Left Column: Tool Selection & Trigger */}
          <div className="p-4 flex flex-col gap-3 overflow-y-auto">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-orange-500" />
              1. MCP Tool auswählen & ausführen
            </span>

            {/* Quick tool selector */}
            <div className="grid grid-cols-1 gap-1.5">
              {Object.keys(toolPresets).map((tool) => (
                <button
                  key={tool}
                  onClick={() => handleSelectTool(tool)}
                  className={`px-3 py-2 rounded-lg text-left text-xs font-mono transition flex items-center justify-between ${
                    selectedTool === tool
                      ? 'bg-orange-500/20 border border-orange-500 text-orange-400 font-bold'
                      : 'bg-[#1c1d22] border border-[#2a2d34] text-zinc-300 hover:bg-[#24262d]'
                  }`}
                >
                  <span>{tool}()</span>
                  <span className="text-[10px] text-zinc-500 font-sans">Klick zum Laden</span>
                </button>
              ))}
            </div>

            {/* JSON Arguments Editor */}
            <div className="flex flex-col gap-1.5 pt-2 flex-1">
              <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                <span>Tool-Parameter (JSON):</span>
                <span className="text-[10px] text-zinc-500">Editierbar</span>
              </label>
              <textarea
                value={jsonArgs}
                onChange={(e) => setJsonArgs(e.target.value)}
                rows={7}
                className="w-full bg-[#0d0e11] border border-[#2e323b] text-emerald-400 font-mono text-xs rounded-lg p-2.5 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-white font-semibold text-xs rounded-lg shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isExecuting ? 'Führe aus...' : `Tool "${selectedTool}" jetzt ausführen`}</span>
            </button>
          </div>

          {/* Right Column: Execution Log & MCP Client Config */}
          <div className="p-4 flex flex-col gap-3 overflow-hidden bg-[#111215]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-400" />
                2. Live MCP Übertragungsprotokoll
              </span>
              <button
                onClick={copyConfig}
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                title="MCP Client Konfiguration kopieren"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedConfig ? 'Kopiert!' : 'MCP Config'}</span>
              </button>
            </div>

            {/* Log Stream Window */}
            <div className="flex-1 bg-[#090a0c] border border-[#22242a] rounded-lg p-3 overflow-y-auto font-mono text-[11px] flex flex-col gap-2">
              {logs.length === 0 ? (
                <div className="text-zinc-600 flex flex-col items-center justify-center h-full text-center gap-2">
                  <Bot className="w-8 h-8 opacity-30" />
                  <span>Noch keine MCP-Tools aufgerufen. Wähle links ein Tool und klicke auf "Ausführen".</span>
                </div>
              ) : (
                logs.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-[#131418] border border-[#22252c] flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-orange-400 font-bold">
                        &gt; {item.call.tool}()
                      </span>
                      <span className="text-[10px] text-zinc-500">{item.call.timestamp}</span>
                    </div>
                    <div className="text-zinc-400 text-[10px]">
                      Args: {JSON.stringify(item.call.args)}
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 border-t border-[#1e2026] text-emerald-400">
                      {item.res.success ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">
                            Ergebnis: {JSON.stringify(item.res.result)}
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
                          <span className="text-red-400">Fehler: {item.res.error}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* MCP Info Pill */}
            <div className="p-2.5 bg-indigo-950/20 border border-indigo-900/40 rounded-lg text-[11px] text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                Kann direkt von Claude Desktop oder Antigravity Agents über den bundled{' '}
                <code className="text-white bg-indigo-900/60 px-1 py-0.5 rounded">mcp-server.ts</code>{' '}
                ferngesteuert werden.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
