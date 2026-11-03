/**
 * Standalone MCP Server for Cartridge Prepress & Layout Web App
 * Run with: bun run mcp-server.ts
 */

import { WebSocketServer, WebSocket } from 'ws';

const WS_PORT = 8765;
let activeEditorWs: WebSocket | null = null;
const pendingRequests = new Map<string, { resolve: (val: any) => void; reject: (err: any) => void }>();

// Start WebSocket server to bridge between MCP stdio client and the browser app
try {
  const wss = new WebSocketServer({ port: WS_PORT });
  console.error(`[MCP Bridge] WebSocket Server listening on ws://localhost:${WS_PORT}`);

  wss.on('connection', (ws) => {
    console.error('[MCP Bridge] Browser Editor connected!');
    activeEditorWs = ws;

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'mcp_result' && msg.callId) {
          const handler = pendingRequests.get(msg.callId);
          if (handler) {
            handler.resolve(msg.result);
            pendingRequests.delete(msg.callId);
          }
        }
      } catch (err) {
        console.error('[MCP Bridge] Error parsing editor response:', err);
      }
    });

    ws.on('close', () => {
      console.error('[MCP Bridge] Browser Editor disconnected.');
      if (activeEditorWs === ws) activeEditorWs = null;
    });
  });
} catch (e) {
  console.error('[MCP Bridge] Note:', e);
}

// Helper to relay MCP tool calls to the browser editor
async function callBrowserEditor(tool: string, args: Record<string, any>): Promise<any> {
  if (!activeEditorWs || activeEditorWs.readyState !== WebSocket.OPEN) {
    // If no browser is currently connected, return simulated response
    return {
      status: 'simulated_offline',
      message: 'Browser editor not connected on port 8765. Tool call queued.',
      tool,
      args,
    };
  }

  const callId = `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  return new Promise((resolve, reject) => {
    pendingRequests.set(callId, { resolve, reject });
    activeEditorWs!.send(
      JSON.stringify({
        type: 'mcp_call',
        callId,
        tool,
        args,
      })
    );

    // Timeout after 8 seconds
    setTimeout(() => {
      if (pendingRequests.has(callId)) {
        pendingRequests.delete(callId);
        resolve({ status: 'timeout', message: 'Editor response timed out' });
      }
    }, 8000);
  });
}

// MCP Stdio Protocol Handling
process.stdin.setEncoding('utf8');
let buffer = '';

process.stdin.on('data', async (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    try {
      const request = JSON.parse(trimmed);
      const response = await handleMcpRequest(request);
      if (response) {
        process.stdout.write(JSON.stringify(response) + '\n');
      }
    } catch (err) {
      console.error('[MCP Stdio Error]', err);
    }
  }
});

async function handleMcpRequest(req: any) {
  const { id, method, params } = req;

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: {
          name: 'cartridge-prepress-mcp',
          version: '1.0.0',
        },
      },
    };
  }

  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: [
          {
            name: 'get_document_structure',
            description: 'Gibt alle Textblöcke, Bilder, Farbkanäle und Preflight-Warnungen des aktuell geladenen Kartuschenlayouts zurück.',
            inputSchema: { type: 'object', properties: {} },
          },
          {
            name: 'update_text_element',
            description: 'Ändert Textinhalte (z. B. Rechtschreibfehler, Farbnamen wie Manhattan -> Anthrazit) oder Schriftdetails.',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                newText: { type: 'string' },
                fontStyle: { type: 'object' },
                strokeWidth: { type: 'number' },
              },
              required: ['id'],
            },
          },
          {
            name: 'replace_and_optimize_image',
            description: 'Tauscht ein Bild aus und wendet sofort die Siebdruck-Graustufen- und Kontrastoptimierung an.',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                imageUrl: { type: 'string' },
                convertTo1cGray: { type: 'boolean' },
                dotGainCompensation: { type: 'number' },
              },
              required: ['id'],
            },
          },
          {
            name: 'insert_svg_element',
            description: 'Platziert ein neues SVG-Logo oder Piktogramm exakt an den gewünschten Koordinaten und weist es einem Volltonkanal zu.',
            inputSchema: {
              type: 'object',
              properties: {
                svgContent: { type: 'string' },
                x: { type: 'number' },
                y: { type: 'number' },
                width: { type: 'number' },
                height: { type: 'number' },
                spotColorChannel: { type: 'string' },
              },
              required: ['svgContent', 'x', 'y'],
            },
          },
          {
            name: 'draw_vector_line',
            description: 'Zieht präzise Vektorlinien (z. B. zum Hervorheben von roten Silikonfugen direkt über dem Duschkabinen-Foto).',
            inputSchema: {
              type: 'object',
              properties: {
                points: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: { x: { type: 'number' }, y: { type: 'number' } },
                  },
                },
                strokeWidth: { type: 'number' },
                spotColorChannel: { type: 'string' },
              },
              required: ['points'],
            },
          },
          {
            name: 'apply_cartridge_prepress_preset',
            description: 'Stellt Überfüllung (Trapping), Mindestlinienstärke, Deckweiß-Unterlegung und Tonwertkurven automatisch auf das Profil des gewählten Kartuschenherstellers ein.',
            inputSchema: {
              type: 'object',
              properties: {
                manufacturerProfile: {
                  type: 'string',
                  enum: ['fischbach-310', 'gfv-310', 'universal-280'],
                },
              },
              required: ['manufacturerProfile'],
            },
          },
          {
            name: 'export_print_ready_pdf',
            description: 'Erzeugt das druckfertige PDF und gibt Status zurück.',
            inputSchema: {
              type: 'object',
              properties: {
                includeControlStrip: { type: 'boolean' },
                separateSpotLayers: { type: 'boolean' },
              },
            },
          },
        ],
      },
    };
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params;
    const res = await callBrowserEditor(name, args || {});
    return {
      jsonrpc: '2.0',
      id,
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(res, null, 2),
          },
        ],
      },
    };
  }

  return null;
}
