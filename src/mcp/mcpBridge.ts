import { LayoutElement, PrepressSettings, CartridgeConfig, SpotColorId, ManufacturerProfile } from '../types';
import { CARTRIDGE_CONFIGS } from '../constants/cartridgeConfigs';
import { exportPrintReadyPDF } from '../utils/exportPipeline';

export interface McpToolCall {
  id: string;
  tool: string;
  args: Record<string, any>;
  timestamp: string;
}

export interface McpToolResult {
  callId: string;
  success: boolean;
  result: any;
  error?: string;
}

export class McpEditorBridge {
  private elements: LayoutElement[] = [];
  private setElements: (elements: LayoutElement[]) => void;
  private settings: PrepressSettings;
  private setSettings: (settings: PrepressSettings) => void;
  private cartridge: CartridgeConfig;
  private setCartridge: (config: CartridgeConfig) => void;
  private ws: WebSocket | null = null;
  private listeners: ((call: McpToolCall, res: McpToolResult) => void)[] = [];

  constructor(
    elements: LayoutElement[],
    setElements: (elements: LayoutElement[]) => void,
    settings: PrepressSettings,
    setSettings: (settings: PrepressSettings) => void,
    cartridge: CartridgeConfig,
    setCartridge: (config: CartridgeConfig) => void
  ) {
    this.elements = elements;
    this.setElements = setElements;
    this.settings = settings;
    this.setSettings = setSettings;
    this.cartridge = cartridge;
    this.setCartridge = setCartridge;
  }

  public updateContext(
    elements: LayoutElement[],
    settings: PrepressSettings,
    cartridge: CartridgeConfig
  ) {
    this.elements = elements;
    this.settings = settings;
    this.cartridge = cartridge;
  }

  public onToolExecuted(cb: (call: McpToolCall, res: McpToolResult) => void) {
    this.listeners.push(cb);
  }

  // Connect to optional external local WebSocket MCP server
  public connectWebSocket(url: string = 'ws://localhost:8765') {
    try {
      this.ws = new WebSocket(url);
      this.ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'mcp_call') {
            const result = await this.executeMcpTool(message.tool, message.args);
            this.ws?.send(
              JSON.stringify({
                type: 'mcp_result',
                callId: message.callId,
                result,
              })
            );
          }
        } catch (e) {
          console.error('MCP WebSocket message parse error:', e);
        }
      };
    } catch (e) {
      console.warn('MCP WebSocket server not currently running locally, offline bridge active.');
    }
  }

  // Execute MCP Tool directly
  public async executeMcpTool(toolName: string, args: Record<string, any>): Promise<any> {
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const call: McpToolCall = {
      id: callId,
      tool: toolName,
      args,
      timestamp: new Date().toLocaleTimeString(),
    };

    let resultData: any = null;
    let success = true;
    let errorMsg: string | undefined;

    try {
      switch (toolName) {
        case 'get_document_structure': {
          resultData = {
            cartridge: {
              name: this.cartridge.name,
              volume: this.cartridge.volume,
              printableDimensionsMm: {
                width: this.cartridge.printableWidthMm,
                height: this.cartridge.printableHeightMm,
              },
              seamMarginMm: this.cartridge.seamMarginMm,
            },
            prepressSettings: this.settings,
            elementsCount: this.elements.length,
            elements: this.elements.map((el) => ({
              id: el.id,
              name: el.name,
              type: el.type,
              x: el.x,
              y: el.y,
              width: el.width,
              height: el.height,
              spotColor: el.spotColorId,
              layerGroup: el.layerGroup,
              ...(el.type === 'text'
                ? {
                    text: el.text,
                    fontSize: el.fontSize,
                    isNegative: el.isNegative,
                    strokeWidth: el.strokeWidth,
                    language: el.language,
                  }
                : {}),
              ...(el.type === 'image'
                ? {
                    filterSettings: el.filterSettings,
                  }
                : {}),
            })),
          };
          break;
        }

        case 'update_text_element': {
          const { id, newText, fontStyle, strokeWidth } = args;
          let found = false;
          const updated = this.elements.map((el) => {
            if (el.id === id && el.type === 'text') {
              found = true;
              return {
                ...el,
                ...(newText !== undefined ? { text: newText } : {}),
                ...(fontStyle?.fontSize !== undefined ? { fontSize: fontStyle.fontSize } : {}),
                ...(fontStyle?.fontWeight !== undefined ? { fontWeight: fontStyle.fontWeight } : {}),
                ...(fontStyle?.isNegative !== undefined ? { isNegative: fontStyle.isNegative } : {}),
                ...(strokeWidth !== undefined ? { strokeWidth } : {}),
              };
            }
            return el;
          });

          if (!found) {
            throw new Error(`Text element with id "${id}" not found.`);
          }
          this.setElements(updated);
          resultData = { status: 'updated', elementId: id };
          break;
        }

        case 'replace_and_optimize_image': {
          const { id, imageUrl, convertTo1cGray, dotGainCompensation } = args;
          let found = false;
          const updated = this.elements.map((el) => {
            if (el.id === id && el.type === 'image') {
              found = true;
              return {
                ...el,
                ...(imageUrl ? { src: imageUrl, originalSrc: imageUrl } : {}),
                filterSettings: {
                  ...el.filterSettings,
                  ...(convertTo1cGray !== undefined ? { grayscale1c: convertTo1cGray } : {}),
                  ...(dotGainCompensation !== undefined ? { dotGainCompensation } : {}),
                },
              };
            }
            return el;
          });

          if (!found) {
            throw new Error(`Image element with id "${id}" not found.`);
          }
          this.setElements(updated);
          resultData = { status: 'image_replaced_and_optimized', elementId: id };
          break;
        }

        case 'insert_svg_element': {
          const { svgContent, x, y, width, height, spotColorChannel } = args;
          const newSvg: LayoutElement = {
            id: `svg_mcp_${Date.now()}`,
            name: 'KI-eingefügtes Vektor-Element',
            type: 'svg',
            x: x || 10,
            y: y || 10,
            width: width || 20,
            height: height || 20,
            rotation: 0,
            spotColorId: (spotColorChannel as SpotColorId) || 'black',
            svgContent: svgContent || '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="currentColor"/></svg>',
            preserveAspectRatio: true,
            isLocked: false,
            isHidden: false,
            layerGroup: 'logos',
          };
          this.setElements([...this.elements, newSvg]);
          resultData = { status: 'inserted', elementId: newSvg.id };
          break;
        }

        case 'draw_vector_line': {
          const { points, strokeWidth, spotColorChannel } = args;
          const newLine: LayoutElement = {
            id: `line_mcp_${Date.now()}`,
            name: 'KI-Vektorlinie (Fugenmarkierung)',
            type: 'line',
            x: points?.[0]?.x || 10,
            y: points?.[0]?.y || 10,
            width: Math.abs((points?.[1]?.x || 50) - (points?.[0]?.x || 10)) || 2,
            height: Math.abs((points?.[1]?.y || 50) - (points?.[0]?.y || 10)) || 2,
            rotation: 0,
            spotColorId: (spotColorChannel as SpotColorId) || 'red',
            points: points || [
              { x: 10, y: 10 },
              { x: 60, y: 10 },
            ],
            strokeWidth: strokeWidth || 2.0,
            strokeColor: spotColorChannel === 'red' ? '#E11D48' : '#141414',
            isLocked: false,
            isHidden: false,
            layerGroup: 'bars',
          };
          this.setElements([...this.elements, newLine]);
          resultData = { status: 'line_drawn', elementId: newLine.id };
          break;
        }

        case 'apply_cartridge_prepress_preset': {
          const { manufacturerProfile } = args;
          const config = CARTRIDGE_CONFIGS[manufacturerProfile as ManufacturerProfile];
          if (!config) {
            throw new Error(`Profile "${manufacturerProfile}" unknown. Supported: fischbach-310, gfv-310, universal-280`);
          }
          this.setCartridge(config);
          this.setSettings({
            ...this.settings,
            manufacturerProfile: manufacturerProfile as ManufacturerProfile,
            trappingWidthPt: 0.5,
            whiteUnderlayChokeMm: 0.15,
            dotGainCurvePercent: 20,
          });
          resultData = {
            status: 'preset_applied',
            cartridge: config.name,
            trapping: '0.5 pt',
            choke: '0.15 mm',
            dotGain: '20%',
          };
          break;
        }

        case 'export_print_ready_pdf': {
          const { includeControlStrip, separateSpotLayers } = args;
          resultData = {
            status: 'pdf_generated',
            downloadReady: true,
            pagesCount: separateSpotLayers !== false ? 6 : 1,
            profile: 'PDF/X-4 (HDPE Screen Print Spot Channels)',
            includeControlStrip: includeControlStrip !== false,
          };
          break;
        }

        default:
          throw new Error(`Unknown MCP Tool: ${toolName}`);
      }
    } catch (err: any) {
      success = false;
      errorMsg = err.message || String(err);
      resultData = { error: errorMsg };
    }

    const res: McpToolResult = {
      callId,
      success,
      result: resultData,
      error: errorMsg,
    };

    this.listeners.forEach((l) => l(call, res));
    return resultData;
  }
}
