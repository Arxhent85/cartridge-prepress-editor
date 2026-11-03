# ACE Cartridge Prepress & Layout Web-App
### Industrielle Druckvorstufe für UV-Rundkörpersiebdruck auf HDPE-Kartuschen (inkl. MCP-Steuerung)

Eine moderne, browserbasierte Prepress- und Layout-Web-App für Verpackungen und Silikonkartuschen (z. B. 280 ml und 310 ml für Hersteller wie **Fischbach** und **GFV**). Die Anwendung kombiniert einen intuitiven Vektor-/PDF-Layout-Editor mit einer WebGL-gestützten Pixel-Pipeline für GIMP-Bildfilter in Echtzeit, einer 3D-Kartuschen-Vorschau (Three.js) und vollständiger Fernsteuerbarkeit über das **Model Context Protocol (MCP)**.

---

## 🌟 Highlights & Kernfunktionen

1. **Hybrid-Canvas-Engine (Vektor & WebGL 1c-Shader)**
   - Millimetergenaue Arbeitsfläche für Kartuschen-Druckbögen (z. B. Fischbach 310ml: 148 × 205 mm mit Naht-Sicherheitsrand).
   - Flüssiges Zoomen, Panning, Messlineale und Selektions-Werkzeuge.
   - Textboxen direkt anklicken und in Echtzeit editieren (Schriftgröße, Laufweite, Zeilenabstand).

2. **Spezial-Modul: Kartuschen-Prepress (Siebdruck-Automatik)**
   - **1-Klick-Farbraum-Umschalter:** Wandelt instabile Vierfarb-Bilder (CMYK) in stabile 1c-Graustufen über Deckweiß um, um Farbverschiebungen und Gelbschleier im Siebdruck zu verhindern.
   - **Sonderfarben-Kanäle (Spot Color Plates):** Deckweiß (Choke), Tiefschwarz, Marken-Orange, Manhattan Silbergrau und Sonderfarbe Fugen-Rot.
   - **Solo-Siebauszug-Vorschau:** Betrachte jedes Drucksieb einzeln oder in der Gesamtschau.
   - **Tonwertzuwachs-Kompensation (Dot-Gain-Kurve):** 15% bis 25% Schieberegler (Murray-Davies-Kurve für Siebdruck).
   - **Raster-Simulator:** Simulation von Siebdruck-Geweben (36 L/cm, 48 L/cm Feinraster, FM-Stochastisch).
   - **Automatisches Trapping & Unterlegweiß-Choke:** 0.25 pt bis 1.0 pt Überfüllung und 0.15 mm Weiß-Einzug gegen Blitzer.
   - **Preflight-Check:** Automatische Prüfung und Warnung vor zulaufenden Negativschriften inklusive 1-Klick-Schriftstärken-Verstärker (Stroke Boost).
   - **Farbkontrollstreifen:** Automatische Generierung von Passkreuzen, Schnittmarken und Messkeilen.

3. **GIMP-Bildwerkzeuge direkt auf dem Canvas**
   - Tonwertspreizung (Levels: Schwarz- und Weißpunkt).
   - Schärfefilter (Unsharp Masking via 3x3 Convolution-Kernel).
   - Helligkeit, Kontrast, Gamma und 1c-Unbuntaufbau.
   - **Smart-Image-Swap:** Bilder per Drag & Drop austauschen – Filter und Masken bleiben erhalten!

4. **3D-Echtzeit-Kartuschenvorschau (Three.js)**
   - Projiziert das 2D-Drucklayout live auf eine rotierbare 3D-HDPE-Silikonkartusche (inklusive Düse, Gewinde und Kolben).
   - Aktualisiert sich verzögerungsfrei bei jeder Änderung am Layout!

5. **Model Context Protocol (MCP) Fernsteuerung**
   - Integriertes MCP-Terminal direkt in der App zum Testen von KI-Aufrufen.
   - Standalone MCP-Server (`mcp-server.ts`) via WebSocket (`ws://localhost:8765`) und Stdio:
     - `get_document_structure()`
     - `update_text_element(id, newText, fontStyle, strokeWidth)`
     - `replace_and_optimize_image(id, imageUrl, convertTo1cGray, dotGainCompensation)`
     - `insert_svg_element(svgContent, x, y, width, height, spotColorChannel)`
     - `draw_vector_line(points, strokeWidth, spotColorChannel)`
     - `apply_cartridge_prepress_preset(manufacturerProfile)`
     - `export_print_ready_pdf(includeControlStrip, separateSpotLayers)`

6. **Produktionsreifer Export**
   - **Mehrkanaliges Druck-PDF:** PDF/X-4 kompatibel mit einzelnen Siebauszugs-Seiten (Weiß, Schwarz, Orange, Manhattan, Rot).
   - **Vektor-SVG:** Skalierbare Vektorgrafik mit Farbprofilen.
   - **Einzelseparations-Paket:** Separate Dateien für jedes Drucksieb.

---

## 🚀 Schnellstart & Lokale Entwicklung

Die App läuft blitzschnell mit **Bun** oder **Node.js**:

```bash
# Abhängigkeiten installieren
bun install

# Lokalen Entwicklungsserver starten
bun run dev

# Produktions-Build erstellen
bun run build
```

### Standalone MCP-Server starten

```bash
bun run mcp-server.ts
```

In der Claude Desktop Konfiguration (`claude_desktop_config.json`) oder in Antigravity eintragen:

```json
{
  "mcpServers": {
    "cartridge-prepress": {
      "command": "bun",
      "args": ["run", "c:/Pfad/zu/ACE PDF EDITOR/mcp-server.ts"]
    }
  }
}
```

---

## 🎨 Demo-Template: "M ONE Sanitär Silicon PREMIUM" 310ml

Die Anwendung lädt automatisch ein voll ausgestattetes Referenz-Layout für eine 310 ml Silikonkartusche:
- Marken-Header & Produktbezeichnung
- Manhattan Silbergrau Farbtonbadge & 310 ml e Füllmenge
- Eingebettetes Badezimmer-/Duschfoto mit roter Vektor-Fugenmarkierung
- Mehrsprachige Verarbeitungs- und Sicherheitstexte (DE, EN, AL)
- GHS07 Gefahrenpiktogramm, CE-Kennzeichnung (EN 15651-1 / EN 15651-3), HDPE 02 Recycling-Logo & EAN-Barcode
- Farbkontrollstreifen mit Passkreuzen und Dichtekeilen
