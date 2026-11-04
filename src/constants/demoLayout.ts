import { LayoutElement } from '../types';

// High-resolution realistic bathroom shower scene SVG
export const BATHROOM_SHOWER_IMAGE_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="900" viewBox="0 0 800 900">
  <defs>
    <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#32353b"/>
      <stop offset="60%" stop-color="#212328"/>
      <stop offset="100%" stop-color="#141518"/>
    </linearGradient>
    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a8e0f5" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#5fa9ca" stop-opacity="0.12"/>
    </linearGradient>
    <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#d6dadf"/>
      <stop offset="100%" stop-color="#7a828e"/>
    </linearGradient>
    <linearGradient id="trayGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e8ecf2"/>
      <stop offset="60%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#c4cad4"/>
    </linearGradient>
    <pattern id="tileGrid" width="60" height="60" patternUnits="userSpaceOnUse">
      <rect width="60" height="60" fill="#2d3036" stroke="#1c1d22" stroke-width="1.8"/>
    </pattern>
  </defs>

  <!-- Wall Tiles Background -->
  <rect width="800" height="900" fill="url(#wallGrad)"/>
  <rect x="40" y="30" width="720" height="620" fill="url(#tileGrid)"/>

  <!-- Shower Tray Base -->
  <polygon points="120,640 680,640 640,790 160,790" fill="url(#trayGrad)" stroke="#a2aab8" stroke-width="2"/>
  <rect x="140" y="635" width="520" height="15" rx="5" fill="#ffffff" stroke="#c0c7d2" stroke-width="1"/>

  <!-- Glass Shower Enclosure Cabin -->
  <polygon points="160,100 480,140 480,650 160,640" fill="url(#glassGrad)" stroke="#9fd2eb" stroke-width="3"/>
  <polygon points="480,140 660,110 660,640 480,650" fill="url(#glassGrad)" stroke="#9fd2eb" stroke-width="3"/>

  <!-- Chrome Frame Profiles & Handle -->
  <line x1="160" y1="100" x2="160" y2="640" stroke="url(#chromeGrad)" stroke-width="8"/>
  <line x1="480" y1="140" x2="480" y2="650" stroke="url(#chromeGrad)" stroke-width="10"/>
  <line x1="660" y1="110" x2="660" y2="640" stroke="url(#chromeGrad)" stroke-width="8"/>
  <rect x="440" y="360" width="12" height="90" rx="4" fill="url(#chromeGrad)" stroke="#555" stroke-width="1"/>

  <!-- Rain Shower Arm & Head -->
  <path d="M 280,40 L 280,130 L 360,130 L 360,170" fill="none" stroke="url(#chromeGrad)" stroke-width="12" stroke-linecap="round"/>
  <ellipse cx="360" cy="180" rx="50" ry="14" fill="url(#chromeGrad)" stroke="#444" stroke-width="1.5"/>

  <!-- Washbasin & Mirror on Side -->
  <rect x="680" y="240" width="110" height="240" rx="4" fill="#1f2229" stroke="#b0b8c4" stroke-width="6"/>
  <polygon points="670,490 790,490 780,560 680,560" fill="#ffffff" stroke="#cbd2dc" stroke-width="2"/>
  <path d="M 730,440 L 730,470 L 740,470" fill="none" stroke="url(#chromeGrad)" stroke-width="8" stroke-linecap="round"/>

  <!-- Highlighted RED Silicone Joint Lines (Prepress Spot Color Red) -->
  <!-- Joint 1: Tray Floor Edge -->
  <line x1="130" y1="642" x2="670" y2="642" stroke="#e11d48" stroke-width="6" stroke-linecap="round"/>
  <!-- Joint 2: Wall Vertical Joint Left -->
  <line x1="160" y1="100" x2="160" y2="640" stroke="#e11d48" stroke-width="5" stroke-linecap="round"/>
  <!-- Joint 3: Wall Vertical Joint Center -->
  <line x1="480" y1="140" x2="480" y2="650" stroke="#e11d48" stroke-width="5" stroke-linecap="round"/>
  <!-- Joint 4: Wall Vertical Joint Right -->
  <line x1="660" y1="110" x2="660" y2="640" stroke="#e11d48" stroke-width="5" stroke-linecap="round"/>
</svg>
`)}`;

export const GHS07_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <polygon points="50,4 96,50 50,96 4,50" fill="#ffffff" stroke="#e11d48" stroke-width="8" stroke-linejoin="round"/>
  <path d="M 46,24 L 54,24 L 52,60 L 48,60 Z" fill="#141414"/>
  <circle cx="50" cy="74" r="5" fill="#141414"/>
</svg>`;

export const CE_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 70">
  <path d="M 45,10 C 20,10 10,25 10,35 C 10,45 20,60 45,60" fill="none" stroke="#141414" stroke-width="9" stroke-linecap="round"/>
  <path d="M 95,10 C 70,10 60,25 60,35 C 60,45 70,60 95,60" fill="none" stroke="#141414" stroke-width="9" stroke-linecap="round"/>
  <line x1="60" y1="35" x2="84" y2="35" stroke="#141414" stroke-width="8" stroke-linecap="round"/>
</svg>`;

export const RECYCLE_HDPE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g fill="none" stroke="#141414" stroke-width="4" stroke-linejoin="round">
    <path d="M 30,22 L 70,22 L 58,40"/>
    <path d="M 75,32 L 85,75 L 65,70"/>
    <path d="M 60,82 L 20,70 L 32,55"/>
  </g>
  <text x="50" y="58" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="#141414" text-anchor="middle">02</text>
  <text x="50" y="94" font-family="Arial, sans-serif" font-weight="bold" font-size="11" fill="#141414" text-anchor="middle">PE-HD</text>
</svg>`;

export const BARCODE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 80">
  <rect width="160" height="80" fill="#ffffff"/>
  <g fill="#141414">
    <rect x="10" y="8" width="3" height="52"/>
    <rect x="16" y="8" width="2" height="52"/>
    <rect x="22" y="8" width="4" height="52"/>
    <rect x="29" y="8" width="2" height="52"/>
    <rect x="34" y="8" width="5" height="52"/>
    <rect x="42" y="8" width="2" height="52"/>
    <rect x="47" y="8" width="3" height="52"/>
    <rect x="53" y="8" width="4" height="52"/>
    <rect x="60" y="8" width="2" height="52"/>
    <rect x="65" y="8" width="5" height="52"/>
    <rect x="73" y="8" width="3" height="52"/>
    <rect x="79" y="8" width="2" height="52"/>
    <rect x="84" y="8" width="4" height="52"/>
    <rect x="91" y="8" width="2" height="52"/>
    <rect x="96" y="8" width="5" height="52"/>
    <rect x="104" y="8" width="3" height="52"/>
    <rect x="110" y="8" width="2" height="52"/>
    <rect x="115" y="8" width="4" height="52"/>
    <rect x="122" y="8" width="2" height="52"/>
    <rect x="127" y="8" width="5" height="52"/>
    <rect x="135" y="8" width="3" height="52"/>
    <rect x="142" y="8" width="2" height="52"/>
    <rect x="148" y="8" width="4" height="52"/>
  </g>
  <text x="80" y="72" font-family="Courier, monospace" font-size="11" fill="#141414" text-anchor="middle" letter-spacing="2">4 012345 678901</text>
</svg>`;

export const M_ONE_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 140">
  <!-- Stylized M with circle cutout -->
  <path d="M 15,10 L 45,10 L 80,65 L 115,10 L 145,10 L 145,85 L 118,85 L 118,45 L 88,90 L 72,90 L 42,45 L 42,85 L 15,85 Z" fill="#ffffff"/>
  <circle cx="80" cy="22" r="10" fill="#ffffff"/>
  <!-- Registered Symbol -->
  <circle cx="152" cy="12" r="6" fill="none" stroke="#ffffff" stroke-width="1.5"/>
  <text x="152" y="15" fill="#ffffff" font-size="8" font-weight="bold" font-family="sans-serif" text-anchor="middle">R</text>
  <!-- ONE bar -->
  <rect x="15" y="94" width="130" height="32" rx="4" fill="#141414" stroke="#ffffff" stroke-width="3"/>
  <text x="80" y="118" fill="#ffffff" font-family="Helvetica, Arial, sans-serif" font-weight="900" font-size="20" letter-spacing="4" text-anchor="middle">ONE</text>
</svg>`;

export const ICON_ANTIPILZ_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <rect width="80" height="80" rx="8" fill="#2b2d33" stroke="#4a4d56" stroke-width="1.5"/>
  <!-- Mushroom cap -->
  <path d="M 22,46 C 20,24 60,24 58,46 Z" fill="#e0e3e8"/>
  <circle cx="34" cy="34" r="3" fill="#666"/>
  <circle cx="46" cy="32" r="4" fill="#666"/>
  <!-- Stem -->
  <path d="M 34,46 L 34,60 L 46,60 L 46,46 Z" fill="#ffffff"/>
  <!-- Small side mushroom -->
  <path d="M 14,56 C 12,46 28,46 26,56 Z" fill="#c0c5cc"/>
  <!-- Red Strike-through circle -->
  <circle cx="40" cy="42" r="28" fill="none" stroke="#e11d48" stroke-width="4.5"/>
  <line x1="20" y1="22" x2="60" y2="62" stroke="#e11d48" stroke-width="4.5"/>
</svg>`;

export const ICON_KUECHE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <rect width="80" height="80" rx="8" fill="#2b2d33" stroke="#4a4d56" stroke-width="1.5"/>
  <!-- Kitchen counter & sink perspective -->
  <polygon points="12,48 42,32 72,32 50,66 12,66" fill="#40444f"/>
  <rect x="20" y="38" width="24" height="18" fill="#e2e6eb" stroke="#a0a8b4" stroke-width="1.5"/>
  <!-- Red silicone joint lines -->
  <line x1="12" y1="48" x2="42" y2="32" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
  <line x1="42" y1="32" x2="72" y2="32" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
  <!-- Faucet -->
  <path d="M 32,32 L 32,22 C 32,18 38,18 38,22" fill="none" stroke="#ffffff" stroke-width="2.5"/>
</svg>`;

export const ICON_BAD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <rect width="80" height="80" rx="8" fill="#2b2d33" stroke="#4a4d56" stroke-width="1.5"/>
  <!-- Bathroom toilet + washbasin -->
  <path d="M 22,34 L 32,34 L 30,58 L 22,58 Z" fill="#e0e3e8"/>
  <ellipse cx="27" cy="34" rx="8" ry="4" fill="#ffffff"/>
  <polygon points="46,38 66,38 64,56 48,56" fill="#e0e3e8"/>
  <!-- Red silicone floor joint lines -->
  <line x1="10" y1="62" x2="70" y2="62" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
  <line x1="40" y1="20" x2="40" y2="62" stroke="#e11d48" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;

export const ICON_UV_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <rect width="80" height="80" rx="8" fill="#2b2d33" stroke="#4a4d56" stroke-width="1.5"/>
  <!-- Sun -->
  <circle cx="28" cy="28" r="10" fill="#ff6600"/>
  <g stroke="#ff6600" stroke-width="2.5" stroke-linecap="round">
    <line x1="28" y1="12" x2="28" y2="6"/>
    <line x1="16" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="28" x2="6" y2="28"/>
    <line x1="16" y1="40" x2="12" y2="44"/>
    <line x1="40" y1="16" x2="44" y2="12"/>
  </g>
  <!-- UV reflection ray bouncing off surface -->
  <line x1="10" y1="62" x2="70" y2="62" stroke="#ffffff" stroke-width="3"/>
  <polyline points="35,35 50,62 66,42" fill="none" stroke="#e11d48" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="66,42 63,48 58,45" fill="#e11d48"/>
</svg>`;

/**
 * EXACT "M ONE Sanitär Silicon 280ml" Vector Reference Layout (Screenshot 2)
 * All elements are 100% vector primitives: editable, sharp, color-accurate!
 */
export const M_ONE_280_ELEMENTS: LayoutElement[] = [
  // 0. Base Dark Background
  {
    id: 'base-bg-rect',
    name: 'Hintergrund Druckbogen (Anthrazit/Schwarz)',
    type: 'rect',
    x: 0,
    y: 0,
    width: 148.0,
    height: 205.0,
    rotation: 0,
    spotColorId: 'black',
    strokeWidth: 0,
    strokeColor: 'transparent',
    fillColor: '#1E2024',
    cornerRadius: 0,
    isLocked: true,
    isHidden: false,
    layerGroup: 'background',
  },

  // 1. TOP HEADER BANNER (White Strip)
  {
    id: 'hdr-white-strip',
    name: 'Kopfzeile Weißer Balken',
    type: 'rect',
    x: 0,
    y: 12.0,
    width: 148.0,
    height: 6.0,
    rotation: 0,
    spotColorId: 'white',
    strokeWidth: 0,
    strokeColor: 'transparent',
    fillColor: '#FFFFFF',
    cornerRadius: 0,
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },
  {
    id: 'hdr-repeat-text',
    name: 'Kopfzeile Wiederholungstext',
    type: 'text',
    x: 4.0,
    y: 13.5,
    width: 104.0,
    height: 4.0,
    rotation: 0,
    spotColorId: 'black',
    text: 'M ONE  TECHNOLOGIES FOR MAKER   M ONE  TECHNOLOGIES FOR MAKER   M ONE  TECHNOLOGIES FOR MAKER',
    fontSize: 4.5,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: '900',
    letterSpacing: 0.2,
    lineHeight: 1.0,
    textColor: '#141414',
    isNegative: false,
    strokeWidth: 0.1,
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },
  {
    id: 'hdr-right-text',
    name: 'Kopfzeile Rechts',
    type: 'text',
    x: 112.0,
    y: 13.5,
    width: 34.0,
    height: 4.0,
    rotation: 0,
    spotColorId: 'black',
    text: 'TECHNOLOGIES FOR MAKER',
    fontSize: 4.5,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: '900',
    letterSpacing: 0.2,
    lineHeight: 1.0,
    textColor: '#141414',
    isNegative: false,
    strokeWidth: 0.1,
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },

  // Big M ONE Corporate Logo on Top Right
  {
    id: 'hdr-m-one-logo',
    name: 'M ONE Hauptlogo',
    type: 'svg',
    x: 104.0,
    y: 4.0,
    width: 22.0,
    height: 18.0,
    rotation: 0,
    spotColorId: 'white',
    svgContent: M_ONE_LOGO_SVG,
    preserveAspectRatio: true,
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },

  // ----------------------------------------------------
  // 2. LEFT COLUMN (GERMAN / DE)
  // ----------------------------------------------------
  {
    id: 'de-badge-box',
    name: 'Sprachkürzel DE Kasten',
    type: 'rect',
    x: 4.0,
    y: 22.0,
    width: 6.0,
    height: 9.0,
    rotation: 0,
    spotColorId: 'black',
    strokeWidth: 0,
    strokeColor: 'transparent',
    fillColor: '#141414',
    cornerRadius: 0.5,
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },
  {
    id: 'de-badge-text',
    name: 'Text DE',
    type: 'text',
    x: 4.2,
    y: 23.5,
    width: 5.6,
    height: 7.0,
    rotation: 0,
    spotColorId: 'white',
    text: 'DE',
    fontSize: 10,
    fontFamily: 'Impact, Helvetica, sans-serif',
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 1.0,
    textColor: '#FFFFFF',
    isNegative: true,
    strokeWidth: 0.25,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
    language: 'DE',
  },
  {
    id: 'de-header-box',
    name: 'Header Box DE (Orange)',
    type: 'rect',
    x: 11.0,
    y: 24.5,
    width: 36.0,
    height: 5.5,
    rotation: 0,
    spotColorId: 'orange',
    strokeWidth: 0.8,
    strokeColor: '#FF6600',
    fillColor: '#FF6600',
    cornerRadius: 1.0,
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },
  {
    id: 'de-header-text',
    name: 'Header Text DE',
    type: 'text',
    x: 12.5,
    y: 25.7,
    width: 33.0,
    height: 3.5,
    rotation: 0,
    spotColorId: 'black',
    text: 'ANTIPILZ & ANTIBAKTERIELL',
    fontSize: 5.2,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'bold',
    letterSpacing: 0.3,
    lineHeight: 1.0,
    textColor: '#141414',
    isNegative: false,
    strokeWidth: 0.15,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
    language: 'DE',
  },
  {
    id: 'de-body-text',
    name: 'Rechtstext DE (Volltext)',
    type: 'text',
    x: 4.0,
    y: 32.0,
    width: 43.0,
    height: 54.0,
    rotation: 0,
    spotColorId: 'white',
    text: `M-ONE Sanitär Silicon Premium – Acetatvernetzender Dichtstoff für Sanitär, Verglasung & Fassade. Dauerhaft elastisch, schimmelresistent, UV- & witterungsbeständig. Eignung: Glas, Keramik, glasierte Oberflächen. Nicht geeignet für: PE, PP, PC, PMMA, PTFE, Neopren, Beton, Marmor, Blei, Kupfer, verzinkten Stahl. Anwendung: Untergrund muss fest, sauber, trocken, fett- & staubfrei sein. Fugenverhältnis 1:1 (min. 5mm). Glätten vor Hautbildung (innerhalb 10-12 Min.). Darf nicht in die Hände von Kindern gelangen. Gefahrenhinweise: H412 - Schädlich für Wasserorganismen, mit langfristiger Wirkung. EU-Hinweise zu spezifischen Gefahren: EUH208 - Enthält 4,5-Dichlor-2-octyl-2H-isothiazol-3-on [DCOIT] & Bis[(2-ethyl-2,5-dimethylhexanoyl)oxy](dimethyl)stannan. Kann allergische Reaktionen hervorrufen. Sicherheitshinweise - Verordnung (EG) §28, Nr. 1272/2008: P273 - Freisetzung in die Umwelt vermeiden. P501 - Inhalt/Behälter einer zugelassenen Einrichtung zur Abfallentsorgung zuführen.`,
    fontSize: 3.8,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'normal',
    letterSpacing: 0.05,
    lineHeight: 1.25,
    textColor: '#FFFFFF',
    isNegative: true,
    strokeWidth: 0.25,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
    language: 'DE',
  },
  {
    id: 'de-table',
    name: 'Temperaturtabelle DE',
    type: 'table',
    x: 4.0,
    y: 88.0,
    width: 43.0,
    height: 12.0,
    rotation: 0,
    spotColorId: 'orange',
    strokeWidth: 0.5,
    strokeColor: '#FF6600',
    fillColor: '#1E2024',
    tableRows: 3,
    tableCols: 2,
    tableData: [
      ['Anwendungstemperatur:', 'min + 5°C max + 40°C'],
      ['Temperaturbeständigkeit:', 'min -40°C max +120°C'],
      ['Lagern bei:', 'min + 5°C max + 25°C'],
    ],
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },

  // CE Mark Vertical Box (Beneath DE table)
  {
    id: 'ce-vertical-box',
    name: 'CE-Kennzeichnung Kasten',
    type: 'rect',
    x: 36.0,
    y: 104.0,
    width: 11.0,
    height: 38.0,
    rotation: 0,
    spotColorId: 'white',
    strokeWidth: 0.5,
    strokeColor: '#FFFFFF',
    fillColor: '#141414',
    cornerRadius: 0.5,
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },
  {
    id: 'ce-logo-svg',
    name: 'CE Logo',
    type: 'svg',
    x: 37.0,
    y: 128.0,
    width: 9.0,
    height: 12.0,
    rotation: 270,
    spotColorId: 'white',
    svgContent: CE_MARK_SVG,
    preserveAspectRatio: true,
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },
  {
    id: 'ce-dop-text',
    name: 'CE Kennzeichnung Text Vertikal',
    type: 'text',
    x: 41.0,
    y: 124.0,
    width: 26.0,
    height: 4.0,
    rotation: 270,
    spotColorId: 'white',
    text: 'Dop Nr.: 32091103-4004',
    fontSize: 3.5,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'bold',
    letterSpacing: 0.2,
    lineHeight: 1.0,
    textColor: '#FFFFFF',
    isNegative: true,
    strokeWidth: 0.2,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
  },
  {
    id: 'ce-standard-text',
    name: 'CE Norm Text Vertikal',
    type: 'text',
    x: 44.0,
    y: 124.0,
    width: 26.0,
    height: 4.0,
    rotation: 270,
    spotColorId: 'white',
    text: 'EN 15651-1: F-EXT-INT-CC / EN 15651-2: G-CC / EN 15651-3: S',
    fontSize: 3.2,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'bold',
    letterSpacing: 0.1,
    lineHeight: 1.0,
    textColor: '#FFFFFF',
    isNegative: true,
    strokeWidth: 0.2,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
  },

  // ----------------------------------------------------
  // 3. CENTER COLUMN (ENGLISH / EN & ALBANIAN / AL)
  // ----------------------------------------------------
  // EN Header & Box
  {
    id: 'en-badge-box',
    name: 'Sprachkürzel EN Kasten',
    type: 'rect',
    x: 49.0,
    y: 22.0,
    width: 6.0,
    height: 9.0,
    rotation: 0,
    spotColorId: 'black',
    strokeWidth: 0,
    strokeColor: 'transparent',
    fillColor: '#141414',
    cornerRadius: 0.5,
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },
  {
    id: 'en-badge-text',
    name: 'Text EN',
    type: 'text',
    x: 49.2,
    y: 23.5,
    width: 5.6,
    height: 7.0,
    rotation: 0,
    spotColorId: 'white',
    text: 'EN',
    fontSize: 10,
    fontFamily: 'Impact, Helvetica, sans-serif',
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 1.0,
    textColor: '#FFFFFF',
    isNegative: true,
    strokeWidth: 0.25,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
    language: 'EN',
  },
  {
    id: 'en-header-box',
    name: 'Header Box EN (Orange)',
    type: 'rect',
    x: 56.0,
    y: 24.5,
    width: 36.0,
    height: 5.5,
    rotation: 0,
    spotColorId: 'orange',
    strokeWidth: 0.8,
    strokeColor: '#FF6600',
    fillColor: '#FF6600',
    cornerRadius: 1.0,
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },
  {
    id: 'en-header-text',
    name: 'Header Text EN',
    type: 'text',
    x: 57.5,
    y: 25.7,
    width: 33.0,
    height: 3.5,
    rotation: 0,
    spotColorId: 'black',
    text: 'ANTIMOLD & ANTIBACTERIAL',
    fontSize: 5.2,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'bold',
    letterSpacing: 0.3,
    lineHeight: 1.0,
    textColor: '#141414',
    isNegative: false,
    strokeWidth: 0.15,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
    language: 'EN',
  },
  {
    id: 'en-body-text',
    name: 'Rechtstext EN (Volltext)',
    type: 'text',
    x: 49.0,
    y: 32.0,
    width: 43.0,
    height: 54.0,
    rotation: 0,
    spotColorId: 'white',
    text: `M-ONE Sanitary Silicon Premium – Acetoxy sealant for sanitary, glazing & facade joints. Permanently elastic, mold resistant, UV & weather resistant. Suitable for: Glass, ceramics, glazed surfaces. Not suitable for: PE, PP, PC, PMMA, PTFE, Neoprene, concrete, marble, lead, copper, galvanized steel. Application: Surface must be solid, clean, dry, free of grease & dust. Joint ratio 1:1 (min. 5mm). Smooth before skin formation (within 10-12 min). Keep out of reach of children. Hazard statements: H412 - Harmful to aquatic life with long lasting effects. EU specific hazard statements: EUH208 - Contains 4,5-Dichloro-2-octyl-2H-isothiazol-3-one [DCOIT] & Bis(2-ethyl-2,5-dimethylhexanoyloxy)oxystannane. May produce an allergic reaction. Precautionary statements - Regulation (EC) §28, No. 1272/2008: P273 - Avoid release to the environment. P501 - Dispose of contents/container to an approved waste disposal plant.`,
    fontSize: 3.8,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'normal',
    letterSpacing: 0.05,
    lineHeight: 1.25,
    textColor: '#FFFFFF',
    isNegative: true,
    strokeWidth: 0.25,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
    language: 'EN',
  },
  {
    id: 'en-table',
    name: 'Temperaturtabelle EN',
    type: 'table',
    x: 49.0,
    y: 88.0,
    width: 43.0,
    height: 12.0,
    rotation: 0,
    spotColorId: 'orange',
    strokeWidth: 0.5,
    strokeColor: '#FF6600',
    fillColor: '#1E2024',
    tableRows: 3,
    tableCols: 2,
    tableData: [
      ['Application temperature:', 'min + 5°C max + 40°C'],
      ['Resistant to temperature:', 'min -40°C max +120°C'],
      ['Store temperature:', 'min + 5°C max + 25°C'],
    ],
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },

  // AL Header & Box (Albanian)
  {
    id: 'al-badge-box',
    name: 'Sprachkürzel AL Kasten',
    type: 'rect',
    x: 49.0,
    y: 103.0,
    width: 6.0,
    height: 9.0,
    rotation: 0,
    spotColorId: 'black',
    strokeWidth: 0,
    strokeColor: 'transparent',
    fillColor: '#141414',
    cornerRadius: 0.5,
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },
  {
    id: 'al-badge-text',
    name: 'Text AL',
    type: 'text',
    x: 49.2,
    y: 104.5,
    width: 5.6,
    height: 7.0,
    rotation: 0,
    spotColorId: 'white',
    text: 'AL',
    fontSize: 10,
    fontFamily: 'Impact, Helvetica, sans-serif',
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 1.0,
    textColor: '#FFFFFF',
    isNegative: true,
    strokeWidth: 0.25,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
    language: 'AL',
  },
  {
    id: 'al-header-box',
    name: 'Header Box AL (Orange)',
    type: 'rect',
    x: 56.0,
    y: 105.5,
    width: 36.0,
    height: 5.5,
    rotation: 0,
    spotColorId: 'orange',
    strokeWidth: 0.8,
    strokeColor: '#FF6600',
    fillColor: '#FF6600',
    cornerRadius: 1.0,
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },
  {
    id: 'al-header-text',
    name: 'Header Text AL',
    type: 'text',
    x: 57.5,
    y: 106.7,
    width: 33.0,
    height: 3.5,
    rotation: 0,
    spotColorId: 'black',
    text: 'ANTIMYSHK - ANTIBAKTERIEL',
    fontSize: 5.0,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'bold',
    letterSpacing: 0.3,
    lineHeight: 1.0,
    textColor: '#141414',
    isNegative: false,
    strokeWidth: 0.15,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
    language: 'AL',
  },
  {
    id: 'al-body-text',
    name: 'Rechtstext AL (Volltext)',
    type: 'text',
    x: 49.0,
    y: 112.5,
    width: 43.0,
    height: 44.0,
    rotation: 0,
    spotColorId: 'white',
    text: `M-ONE Sanitär Silicon Premium – Silikon izolues acetik për sanitare, xhama & fasada. Elastik i përhershëm, rezistent ndaj mykut, rrezeve UV dhe motit. Përshtatshmëria: Xham, qeramikë, sipërfaqe të glazuara. Jo i përshtatshëm për: PE, PP, PC, PMMA, PTFE, Neopren, beton, mermer, plumb, bakër, çelik të galvanizuar. Përdorimi: Sipërfaqja duhet të jetë e fortë, e pastër, e thatë, pa yndyrë dhe pluhur. Raporti i fugës 1:1 (min. 5mm). Lëmoni para krijimit të cipës (brenda 10-12 min.). Mbajeni larg fëmijëve. Deklaratat e rrezikut: H412 - I dëmshëm për organizmat ujorë, me ndikim afatgjatë. Informacion specifik i BE-së për rreziqet: EUH208 - Përmban 4,5-Dichlor-2-octyl-2H-isothiazol-3-on [DCOIT] & Bis[(2-ethyl-2,5-dimethylhexanoyl)oxy](dimethyl)stannan. Mund të shkaktojë reaksion alergjik. Këshilla sigurie - Rregullorja (KE) §28, Nr. 1272/2008: P273 - Shmangni lëshimin në mjedis. P501 - Hidheni përmbajtjen/enën në një strukturë të miratuar për asgjësimin e mbetjeve.`,
    fontSize: 3.7,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'normal',
    letterSpacing: 0.05,
    lineHeight: 1.25,
    textColor: '#FFFFFF',
    isNegative: true,
    strokeWidth: 0.25,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
    language: 'AL',
  },
  {
    id: 'al-table',
    name: 'Temperaturtabelle AL',
    type: 'table',
    x: 49.0,
    y: 157.0,
    width: 43.0,
    height: 11.0,
    rotation: 0,
    spotColorId: 'orange',
    strokeWidth: 0.5,
    strokeColor: '#FF6600',
    fillColor: '#1E2024',
    tableRows: 3,
    tableCols: 2,
    tableData: [
      ['Temperatura gjatë përdorimit:', 'min + 5°C max + 40°C'],
      ['Rezistent ndaj temperaturës:', 'min -40°C max +120°C'],
      ['Të ruhet në temperaturë:', 'min + 5°C max + 25°C'],
    ],
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },

  // Manufacturer Address Box Center Bottom
  {
    id: 'mfg-address-box',
    name: 'Herstellerdaten Kasten',
    type: 'text',
    x: 49.0,
    y: 170.0,
    width: 43.0,
    height: 12.0,
    rotation: 0,
    spotColorId: 'white',
    text: `Am Kapellenberg 11 | 97246 Eibelstadt Deutschland\nVeternik Z. Industriale 10000 Prishtinë Kosovë\nwww.m-one.net | info@m-one.net`,
    fontSize: 3.0,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'normal',
    letterSpacing: 0.1,
    lineHeight: 1.2,
    textColor: '#FFFFFF',
    isNegative: true,
    strokeWidth: 0.15,
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },

  // ----------------------------------------------------
  // 4. RIGHT COLUMN (TITEL "Silicon SANITÄR PREMIUM" & PHOTO)
  // ----------------------------------------------------
  // White Container Box at top right
  {
    id: 'prod-title-card-bg',
    name: 'Titel-Container Weiß',
    type: 'rect',
    x: 95.0,
    y: 22.0,
    width: 49.0,
    height: 38.0,
    rotation: 0,
    spotColorId: 'white',
    strokeWidth: 0,
    strokeColor: 'transparent',
    fillColor: '#FFFFFF',
    cornerRadius: 2.0,
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },
  {
    id: 'prod-title-silicon',
    name: 'Titel "Silicon"',
    type: 'text',
    x: 97.0,
    y: 23.0,
    width: 45.0,
    height: 18.0,
    rotation: 0,
    spotColorId: 'black',
    text: 'Silicon',
    fontSize: 27,
    fontFamily: 'Impact, Helvetica, sans-serif',
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 1.0,
    textColor: '#141414',
    isNegative: false,
    strokeWidth: 0.3,
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },
  {
    id: 'prod-title-sanitaer',
    name: 'Titel "SANITÄR"',
    type: 'text',
    x: 123.0,
    y: 24.5,
    width: 20.0,
    height: 4.5,
    rotation: 0,
    spotColorId: 'orange',
    text: 'SANITÄR',
    fontSize: 5.5,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: '900',
    letterSpacing: 0.8,
    lineHeight: 1.0,
    textColor: '#FF6600',
    isNegative: false,
    strokeWidth: 0.2,
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },
  // Solid Orange Box "PREMIUM"
  {
    id: 'prod-title-premium-box',
    name: 'Balken "PREMIUM" (Orange)',
    type: 'rect',
    x: 95.0,
    y: 43.5,
    width: 49.0,
    height: 9.0,
    rotation: 0,
    spotColorId: 'orange',
    strokeWidth: 0,
    strokeColor: 'transparent',
    fillColor: '#FF6600',
    cornerRadius: 0,
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },
  {
    id: 'prod-title-premium-text',
    name: 'Text "PREMIUM"',
    type: 'text',
    x: 98.0,
    y: 45.0,
    width: 43.0,
    height: 6.0,
    rotation: 0,
    spotColorId: 'white',
    text: 'PREMIUM',
    fontSize: 12.0,
    fontFamily: 'Impact, Helvetica, sans-serif',
    fontWeight: '900',
    letterSpacing: 4.0,
    lineHeight: 1.0,
    textColor: '#FFFFFF',
    isNegative: true,
    strokeWidth: 0.4,
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },

  // 3D Shower Cabin Photo Graphic (GIMP / Filterable photo element)
  {
    id: 'shower-photo-main',
    name: 'Fotomotiv Duschkabine (Smart-Swap Foto)',
    type: 'image',
    x: 95.0,
    y: 54.0,
    width: 49.0,
    height: 68.0,
    rotation: 0,
    spotColorId: 'black',
    src: BATHROOM_SHOWER_IMAGE_DATA_URI,
    originalSrc: BATHROOM_SHOWER_IMAGE_DATA_URI,
    filterSettings: {
      grayscale1c: false, // Full color by default, 1-click toggleable to 1c
      brightness: 0,
      contrast: 5,
      gamma: 1.0,
      dotGainCompensation: 0,
      unsharpMask: 0.8,
      levelsMin: 5,
      levelsMax: 245,
      invert: false,
    },
    isLocked: false,
    isHidden: false,
    layerGroup: 'images',
  },

  // Made in Germany Ribbon Badge
  {
    id: 'badge-made-in-germany',
    name: 'Badge "MADE IN GERMANY"',
    type: 'text',
    x: 96.0,
    y: 56.0,
    width: 24.0,
    height: 6.0,
    rotation: 0,
    spotColorId: 'black',
    text: 'MADE IN\nGERMANY',
    fontSize: 3.8,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: '900',
    letterSpacing: 0.3,
    lineHeight: 1.05,
    textColor: '#141414',
    isNegative: false,
    strokeWidth: 0.15,
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },

  // Color Swatch Box: Manhattan & 280ml
  {
    id: 'swatch-box-manhattan-gray',
    name: 'Farbtonfeld Manhatten Grau',
    type: 'rect',
    x: 95.0,
    y: 125.0,
    width: 14.0,
    height: 6.5,
    rotation: 0,
    spotColorId: 'manhattan',
    strokeWidth: 0.6,
    strokeColor: '#FFFFFF',
    fillColor: '#7E858E', // Authentic Manhattan Gray
    cornerRadius: 1.5,
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },
  {
    id: 'swatch-box-name',
    name: 'Farbname Kasten Manhatten',
    type: 'rect',
    x: 110.0,
    y: 125.0,
    width: 22.0,
    height: 6.5,
    rotation: 0,
    spotColorId: 'black',
    strokeWidth: 0.6,
    strokeColor: '#FFFFFF',
    fillColor: '#141414',
    cornerRadius: 0.5,
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },
  {
    id: 'swatch-text-manhattan',
    name: 'Text "Manhatten"',
    type: 'text',
    x: 111.5,
    y: 126.5,
    width: 19.0,
    height: 4.0,
    rotation: 0,
    spotColorId: 'white',
    text: 'Manhatten',
    fontSize: 6.5,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: '900',
    letterSpacing: 0.3,
    lineHeight: 1.0,
    textColor: '#FFFFFF',
    isNegative: true,
    strokeWidth: 0.2,
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },
  {
    id: 'swatch-box-volume',
    name: 'Füllmenge Kasten 280ml',
    type: 'rect',
    x: 133.0,
    y: 125.0,
    width: 11.0,
    height: 6.5,
    rotation: 0,
    spotColorId: 'white',
    strokeWidth: 0.6,
    strokeColor: '#FFFFFF',
    fillColor: '#FFFFFF',
    cornerRadius: 0.5,
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },
  {
    id: 'swatch-text-volume',
    name: 'Text "280ml"',
    type: 'text',
    x: 134.0,
    y: 126.5,
    width: 9.0,
    height: 4.0,
    rotation: 0,
    spotColorId: 'black',
    text: '280ml',
    fontSize: 6.5,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: '900',
    letterSpacing: 0.2,
    lineHeight: 1.0,
    textColor: '#141414',
    isNegative: false,
    strokeWidth: 0.2,
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },

  // ----------------------------------------------------
  // 5. FOOTER BAR & 4 PICTOGRAM ICONS
  // ----------------------------------------------------
  {
    id: 'footer-bar-strip',
    name: 'Fußzeile Balken',
    type: 'rect',
    x: 4.0,
    y: 135.0,
    width: 140.0,
    height: 6.0,
    rotation: 0,
    spotColorId: 'black',
    strokeWidth: 0.6,
    strokeColor: '#FFFFFF',
    fillColor: '#141414',
    cornerRadius: 0.5,
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },
  {
    id: 'footer-repeat-text',
    name: 'Fußzeile Text',
    type: 'text',
    x: 6.0,
    y: 136.5,
    width: 136.0,
    height: 4.0,
    rotation: 0,
    spotColorId: 'white',
    text: 'M ONE   TECHNOLOGIES FOR MAKER                 M ONE   TECHNOLOGIES FOR MAKER',
    fontSize: 4.5,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: '900',
    letterSpacing: 0.4,
    lineHeight: 1.0,
    textColor: '#FFFFFF',
    isNegative: true,
    strokeWidth: 0.2,
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },

  // 4 Icon Cards with Multilingual Labels
  // Card 1: Anti-Pilz
  {
    id: 'card-1-icon',
    name: 'Icon Anti-Pilz',
    type: 'svg',
    x: 5.0,
    y: 144.0,
    width: 14.0,
    height: 14.0,
    rotation: 0,
    spotColorId: 'white',
    svgContent: ICON_ANTIPILZ_SVG,
    preserveAspectRatio: true,
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },
  {
    id: 'card-1-labels',
    name: 'Text Anti-Pilz (3 Sprachen)',
    type: 'text',
    x: 20.0,
    y: 145.5,
    width: 17.0,
    height: 12.0,
    rotation: 0,
    spotColorId: 'white',
    text: 'ANTI PILZ - ANTIBAKTERIELL\nANTIMOLD - ANTIBACTERIAL\nANTIMYK - ANTIBAKTERIAL',
    fontSize: 2.8,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'bold',
    letterSpacing: 0.1,
    lineHeight: 1.4,
    textColor: '#FFFFFF',
    isNegative: true,
    strokeWidth: 0.15,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
  },

  // Card 2: Küche
  {
    id: 'card-2-icon',
    name: 'Icon Küche',
    type: 'svg',
    x: 39.0,
    y: 144.0,
    width: 14.0,
    height: 14.0,
    rotation: 0,
    spotColorId: 'white',
    svgContent: ICON_KUECHE_SVG,
    preserveAspectRatio: true,
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },
  {
    id: 'card-2-labels',
    name: 'Text Küche (3 Sprachen)',
    type: 'text',
    x: 54.0,
    y: 145.5,
    width: 17.0,
    height: 12.0,
    rotation: 0,
    spotColorId: 'white',
    text: 'FÜR KÜCHE\nFOR KITCHEN\nPËR KUZHINË',
    fontSize: 2.8,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'bold',
    letterSpacing: 0.1,
    lineHeight: 1.4,
    textColor: '#FFFFFF',
    isNegative: true,
    strokeWidth: 0.15,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
  },

  // Card 3: Bad
  {
    id: 'card-3-icon',
    name: 'Icon Bad',
    type: 'svg',
    x: 74.0,
    y: 144.0,
    width: 14.0,
    height: 14.0,
    rotation: 0,
    spotColorId: 'white',
    svgContent: ICON_BAD_SVG,
    preserveAspectRatio: true,
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },
  {
    id: 'card-3-labels',
    name: 'Text Bad (3 Sprachen)',
    type: 'text',
    x: 89.0,
    y: 145.5,
    width: 17.0,
    height: 12.0,
    rotation: 0,
    spotColorId: 'white',
    text: 'FÜR BAD\nFOR BATHROOM\nPËR BANJO',
    fontSize: 2.8,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'bold',
    letterSpacing: 0.1,
    lineHeight: 1.4,
    textColor: '#FFFFFF',
    isNegative: true,
    strokeWidth: 0.15,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
  },

  // Card 4: UV-Beständig
  {
    id: 'card-4-icon',
    name: 'Icon UV-Beständig',
    type: 'svg',
    x: 108.0,
    y: 144.0,
    width: 14.0,
    height: 14.0,
    rotation: 0,
    spotColorId: 'white',
    svgContent: ICON_UV_SVG,
    preserveAspectRatio: true,
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },
  {
    id: 'card-4-labels',
    name: 'Text UV-Beständig (3 Sprachen)',
    type: 'text',
    x: 123.0,
    y: 145.5,
    width: 20.0,
    height: 12.0,
    rotation: 0,
    spotColorId: 'white',
    text: 'UV - BESTÄNDIG\nUV - RESISTANT\nUV - REZISTENT',
    fontSize: 2.8,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'bold',
    letterSpacing: 0.1,
    lineHeight: 1.4,
    textColor: '#FFFFFF',
    isNegative: true,
    strokeWidth: 0.15,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
  },
];

export const DEFAULT_ELEMENTS: LayoutElement[] = M_ONE_280_ELEMENTS;
