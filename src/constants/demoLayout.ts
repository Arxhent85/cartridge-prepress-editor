import { LayoutElement } from '../types';

// Crisp SVG data URI for modern bathroom shower tile scene
export const BATHROOM_SHOWER_IMAGE_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2a2d34"/>
      <stop offset="50%" stop-color="#1f2127"/>
      <stop offset="100%" stop-color="#141518"/>
    </linearGradient>
    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#99d6ea" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#5599bb" stop-opacity="0.1"/>
    </linearGradient>
    <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#c0c5cc"/>
      <stop offset="100%" stop-color="#7a828e"/>
    </linearGradient>
    <pattern id="tilePattern" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="#2d3038" stroke="#1c1d22" stroke-width="1.5"/>
    </pattern>
    <linearGradient id="tubGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e2e6eb"/>
      <stop offset="70%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#c8cdd6"/>
    </linearGradient>
  </defs>

  <!-- Background Wall Tiles -->
  <rect width="600" height="400" fill="url(#bgGrad)"/>
  <rect width="360" height="280" x="40" y="20" fill="url(#tilePattern)"/>
  <rect width="180" height="280" x="400" y="20" fill="url(#tilePattern)" opacity="0.8"/>

  <!-- Bathtub / Shower Tray Base -->
  <path d="M 30,280 L 570,280 L 550,370 L 50,370 Z" fill="url(#tubGrad)"/>
  <rect x="40" y="275" width="520" height="12" rx="4" fill="#f0f3f6" stroke="#b0b7c2" stroke-width="1"/>

  <!-- Glass Shower Partition -->
  <polygon points="340,30 380,50 380,310 340,290" fill="url(#glassGrad)" stroke="#a0c8dd" stroke-width="2"/>
  
  <!-- Modern Shower Arm & Rain Head -->
  <path d="M 160,20 L 160,70 L 220,70 L 220,95" fill="none" stroke="url(#chromeGrad)" stroke-width="8" stroke-linecap="round"/>
  <ellipse cx="220" cy="100" rx="30" ry="8" fill="url(#chromeGrad)" stroke="#555" stroke-width="1"/>
  
  <!-- Water stream droplets subtle -->
  <line x1="210" y1="110" x2="208" y2="180" stroke="#7ac5e8" stroke-width="1.5" stroke-dasharray="4,8" opacity="0.6"/>
  <line x1="220" y1="110" x2="220" y2="200" stroke="#7ac5e8" stroke-width="1.5" stroke-dasharray="4,6" opacity="0.7"/>
  <line x1="230" y1="110" x2="232" y2="190" stroke="#7ac5e8" stroke-width="1.5" stroke-dasharray="5,7" opacity="0.6"/>

  <!-- Chrome Mixer Faucet on Wall -->
  <rect x="180" y="190" width="30" height="40" rx="4" fill="url(#chromeGrad)"/>
  <line x1="175" y1="205" x2="215" y2="205" stroke="#ffffff" stroke-width="4"/>

  <!-- Existing silicone joint line groove on tub edge -->
  <line x1="42" y1="281" x2="558" y2="281" stroke="#333740" stroke-width="3"/>
  <line x1="398" y1="20" x2="398" y2="280" stroke="#333740" stroke-width="3"/>

  <!-- Text Badge inside Photo -->
  <rect x="50" y="35" width="130" height="24" rx="3" fill="#ff6600" opacity="0.9"/>
  <text x="115" y="51" fill="#ffffff" font-family="Arial, sans-serif" font-weight="bold" font-size="12" text-anchor="middle">SANITÄR-ANWENDUNG</text>
</svg>
`)}`;

export const GHS07_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <!-- GHS Red Rhombus Frame -->
  <polygon points="50,4 96,50 50,96 4,50" fill="#ffffff" stroke="#e11d48" stroke-width="8" stroke-linejoin="round"/>
  <!-- Exclamation Point -->
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

export const DEFAULT_ELEMENTS: LayoutElement[] = [
  // 1. BRAND HEADER & ORANGE BARS
  {
    id: 'elem-orange-bar-top',
    name: 'M ONE Marken-Balken Oben',
    type: 'rect',
    x: 4.0,
    y: 6.0,
    width: 140.0,
    height: 14.0,
    rotation: 0,
    spotColorId: 'orange',
    strokeWidth: 0,
    strokeColor: 'transparent',
    fillColor: '#FF6600',
    cornerRadius: 1.5,
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },
  {
    id: 'elem-logo-text',
    name: 'Logo M ONE',
    type: 'text',
    x: 8.0,
    y: 8.5,
    width: 45.0,
    height: 9.0,
    rotation: 0,
    spotColorId: 'white',
    text: 'M ONE®',
    fontSize: 22,
    fontFamily: 'Impact, sans-serif',
    fontWeight: '800',
    letterSpacing: 0.8,
    lineHeight: 1.0,
    textColor: '#FFFFFF',
    isNegative: true,
    strokeWidth: 0.4, // prepress boosted
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },
  {
    id: 'elem-brand-tagline',
    name: 'Marken Tagline',
    type: 'text',
    x: 58.0,
    y: 11.5,
    width: 82.0,
    height: 6.0,
    rotation: 0,
    spotColorId: 'white',
    text: 'PROFESSIONAL SEALING SYSTEMS',
    fontSize: 7.5,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'bold',
    letterSpacing: 1.2,
    lineHeight: 1.0,
    textColor: '#FFFFFF',
    isNegative: true,
    strokeWidth: 0.25,
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },

  // 2. MAIN PRODUCT TITLE & SUBTITLE
  {
    id: 'elem-prod-title',
    name: 'Produktbezeichnung Haupttitel',
    type: 'text',
    x: 6.0,
    y: 24.0,
    width: 136.0,
    height: 12.0,
    rotation: 0,
    spotColorId: 'black',
    text: 'SANITÄR SILICON PREMIUM',
    fontSize: 17,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: '800',
    letterSpacing: 0.5,
    lineHeight: 1.05,
    textColor: '#141414',
    isNegative: false,
    strokeWidth: 0.2,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
    language: 'ALL',
  },
  {
    id: 'elem-prod-subtitle',
    name: 'Unterzeile & Eigenschaften',
    type: 'text',
    x: 6.0,
    y: 38.0,
    width: 136.0,
    height: 8.0,
    rotation: 0,
    spotColorId: 'black',
    text: 'Pilzhemmend ausgerüstet • Dauerelastisch • UV- & Witterungsbeständig',
    fontSize: 7.8,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: '600',
    letterSpacing: 0.2,
    lineHeight: 1.2,
    textColor: '#141414',
    isNegative: false,
    strokeWidth: 0.15,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
    language: 'DE',
  },

  // 3. COLOR & VOLUME BADGES
  {
    id: 'elem-badge-color-bg',
    name: 'Farbton Badge Box',
    type: 'rect',
    x: 6.0,
    y: 48.0,
    width: 76.0,
    height: 12.0,
    rotation: 0,
    spotColorId: 'manhattan',
    strokeWidth: 0.4,
    strokeColor: '#5a626c',
    fillColor: '#7E858E',
    cornerRadius: 2.0,
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },
  {
    id: 'elem-badge-color-text',
    name: 'Farbton Bezeichnung',
    type: 'text',
    x: 9.0,
    y: 51.5,
    width: 70.0,
    height: 6.0,
    rotation: 0,
    spotColorId: 'white',
    text: 'FARBTON: MANHATTAN (Silbergrau)',
    fontSize: 8.5,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'bold',
    letterSpacing: 0.3,
    lineHeight: 1.0,
    textColor: '#FFFFFF',
    isNegative: true,
    strokeWidth: 0.35,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
    language: 'ALL',
  },
  {
    id: 'elem-badge-volume-bg',
    name: 'Füllmenge Box',
    type: 'rect',
    x: 86.0,
    y: 48.0,
    width: 56.0,
    height: 12.0,
    rotation: 0,
    spotColorId: 'black',
    strokeWidth: 0,
    strokeColor: 'transparent',
    fillColor: '#141414',
    cornerRadius: 2.0,
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },
  {
    id: 'elem-badge-volume-text',
    name: 'Füllmenge Text',
    type: 'text',
    x: 90.0,
    y: 51.5,
    width: 48.0,
    height: 6.0,
    rotation: 0,
    spotColorId: 'white',
    text: 'INHALT: 310 ml e',
    fontSize: 9.0,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: '800',
    letterSpacing: 0.5,
    lineHeight: 1.0,
    textColor: '#FFFFFF',
    isNegative: true,
    strokeWidth: 0.4,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
    language: 'ALL',
  },

  // 4. EMBEDDED 3D APPLICATION PHOTO & JOINT HIGHLIGHT
  {
    id: 'elem-photo-shower',
    name: 'Anwendungsfoto Dusche & Bad',
    type: 'image',
    x: 6.0,
    y: 63.0,
    width: 90.0,
    height: 52.0,
    rotation: 0,
    spotColorId: 'black',
    src: BATHROOM_SHOWER_IMAGE_DATA_URI,
    originalSrc: BATHROOM_SHOWER_IMAGE_DATA_URI,
    filterSettings: {
      grayscale1c: true, // UV screen print 1c gray over white plate
      brightness: 4,
      contrast: 15,
      gamma: 1.15,
      dotGainCompensation: 20, // 20% dot gain compensation for screen print
      unsharpMask: 35,
      levelsMin: 12,
      levelsMax: 242,
      invert: false,
    },
    isLocked: false,
    isHidden: false,
    layerGroup: 'photo',
  },
  // Red silicone joint vector highlight over the shower photo
  {
    id: 'elem-joint-line-horizontal',
    name: 'Silikonfuge Markierung Wanne (Rot)',
    type: 'line',
    x: 12.0,
    y: 99.5,
    width: 78.0,
    height: 2.0,
    rotation: 0,
    spotColorId: 'red',
    points: [
      { x: 12.0, y: 99.5 },
      { x: 90.0, y: 99.5 },
    ],
    strokeWidth: 2.2, // 2.2 pt bold spot color line
    strokeColor: '#E11D48',
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },
  {
    id: 'elem-joint-line-vertical',
    name: 'Silikonfuge Wand (Rot)',
    type: 'line',
    x: 66.0,
    y: 65.0,
    width: 2.0,
    height: 35.0,
    rotation: 0,
    spotColorId: 'red',
    points: [
      { x: 66.0, y: 65.0 },
      { x: 66.0, y: 100.0 },
    ],
    strokeWidth: 2.0,
    strokeColor: '#E11D48',
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },

  // 5. TECHNICAL APPLICATION TABLE (RIGHT TO PHOTO)
  {
    id: 'elem-tech-table',
    name: 'Technische Daten Tabelle',
    type: 'table',
    x: 100.0,
    y: 63.0,
    width: 44.0,
    height: 52.0,
    rotation: 0,
    spotColorId: 'black',
    strokeWidth: 0.4,
    strokeColor: '#141414',
    fillColor: '#f7f7f8',
    tableRows: 4,
    tableCols: 2,
    tableData: [
      ['Basis', 'Alkoxy-Silikon'],
      ['Hautbildung', 'ca. 10–15 Min.'],
      ['Temperatur', '-40°C bis +150°C'],
      ['Dehnfähigkeit', 'ISO 11600 - F25LM'],
    ],
    isLocked: false,
    isHidden: false,
    layerGroup: 'bars',
  },

  // 6. MULTILINGUAL SAFETY & INSTRUCTION BLOCKS (DE / EN / AL)
  // DE Block
  {
    id: 'elem-text-de-header',
    name: 'DE Überschrift',
    type: 'text',
    x: 6.0,
    y: 119.0,
    width: 43.0,
    height: 4.5,
    rotation: 0,
    spotColorId: 'black',
    text: 'DEUTSCH (DE) • VERARBEITUNG',
    fontSize: 6.5,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'bold',
    letterSpacing: 0.2,
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
    id: 'elem-text-de-body',
    name: 'DE Beschreibung & Sicherheit',
    type: 'text',
    x: 6.0,
    y: 124.5,
    width: 43.0,
    height: 38.0,
    rotation: 0,
    spotColorId: 'black',
    text: 'Gebrauchsfertiger, einkomponentiger Silikondichtstoff für elastische Fugen in Bad, Dusche und Sanitär. Untergrund muss sauber, trocken und fettfrei sein. Vor Hautbildung mit Glättmittel abziehen. Enthält 2-Octyl-2H-isothiazol-3-on. Kann allergische Reaktionen hervorrufen. Darf nicht in die Hände von Kindern gelangen. Sicherheitsdatenblatt auf Anfrage.',
    fontSize: 5.0,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'normal',
    letterSpacing: 0.05,
    lineHeight: 1.25,
    textColor: '#141414',
    isNegative: false,
    strokeWidth: 0.12,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
    language: 'DE',
  },

  // EN Block
  {
    id: 'elem-text-en-header',
    name: 'EN Header',
    type: 'text',
    x: 52.0,
    y: 119.0,
    width: 44.0,
    height: 4.5,
    rotation: 0,
    spotColorId: 'black',
    text: 'ENGLISH (EN) • APPLICATION',
    fontSize: 6.5,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'bold',
    letterSpacing: 0.2,
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
    id: 'elem-text-en-body',
    name: 'EN Instructions & Safety',
    type: 'text',
    x: 52.0,
    y: 124.5,
    width: 44.0,
    height: 38.0,
    rotation: 0,
    spotColorId: 'black',
    text: 'Ready-to-use silicone sealant for elastic sealing in bathrooms, shower cubicles, and kitchens. Substrate must be clean, dry and grease-free. Smooth before skin formation. Contains 2-octyl-2H-isothiazol-3-one. May produce an allergic reaction. Keep out of reach of children. Safety data sheet available on request.',
    fontSize: 5.0,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'normal',
    letterSpacing: 0.05,
    lineHeight: 1.25,
    textColor: '#141414',
    isNegative: false,
    strokeWidth: 0.12,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
    language: 'EN',
  },

  // AL Block
  {
    id: 'elem-text-al-header',
    name: 'AL Titulli',
    type: 'text',
    x: 99.0,
    y: 119.0,
    width: 45.0,
    height: 4.5,
    rotation: 0,
    spotColorId: 'black',
    text: 'SHQIP (AL) • PËRDORIMI',
    fontSize: 6.5,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'bold',
    letterSpacing: 0.2,
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
    id: 'elem-text-al-body',
    name: 'AL Teksti & Siguria',
    type: 'text',
    x: 99.0,
    y: 124.5,
    width: 45.0,
    height: 38.0,
    rotation: 0,
    spotColorId: 'black',
    text: 'Silikon sanitar elastik i gatshëm për përdorim në banjo, dush kabina dhe kuzhina. Sipërfaqja duhet të jetë e pastër, e thatë dhe pa yndyrë. Lëmoni para krijimit të cipës. Përmban 2-oktil-2H-izotiazol-3-on. Mund të shkaktojë reaksion alergjik. Mbajeni larg fëmijëve. Fleta e të dhënave të sigurisë disponohet sipas kërkesës.',
    fontSize: 5.0,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'normal',
    letterSpacing: 0.05,
    lineHeight: 1.25,
    textColor: '#141414',
    isNegative: false,
    strokeWidth: 0.12,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
    language: 'AL',
  },

  // 7. GHS PICTOGRAM, CE-MARK, BARCODE & RECYCLING (BOTTOM FOOTER)
  {
    id: 'elem-ghs-icon',
    name: 'GHS07 Gefahrenpiktogramm',
    type: 'svg',
    x: 6.0,
    y: 168.0,
    width: 14.0,
    height: 14.0,
    rotation: 0,
    spotColorId: 'red',
    svgContent: GHS07_SVG,
    preserveAspectRatio: true,
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },
  {
    id: 'elem-warning-title',
    name: 'Signalwort Achtung',
    type: 'text',
    x: 22.0,
    y: 170.0,
    width: 40.0,
    height: 5.0,
    rotation: 0,
    spotColorId: 'black',
    text: 'ACHTUNG / WARNING / KUJDES',
    fontSize: 7.0,
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
    language: 'ALL',
  },
  {
    id: 'elem-warning-desc',
    name: 'H317 Warnhinweis',
    type: 'text',
    x: 22.0,
    y: 175.5,
    width: 44.0,
    height: 8.0,
    rotation: 0,
    spotColorId: 'black',
    text: 'H317: Kann allergische Hautreaktionen verursachen.\nP102: Darf nicht in die Hände von Kindern gelangen.',
    fontSize: 5.0,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'normal',
    letterSpacing: 0.05,
    lineHeight: 1.2,
    textColor: '#141414',
    isNegative: false,
    strokeWidth: 0.1,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
    language: 'ALL',
  },
  {
    id: 'elem-ce-mark',
    name: 'CE Kennzeichnung',
    type: 'svg',
    x: 69.0,
    y: 168.0,
    width: 18.0,
    height: 12.0,
    rotation: 0,
    spotColorId: 'black',
    svgContent: CE_MARK_SVG,
    preserveAspectRatio: true,
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },
  {
    id: 'elem-ce-norm',
    name: 'CE Norm Text',
    type: 'text',
    x: 69.0,
    y: 181.0,
    width: 22.0,
    height: 6.0,
    rotation: 0,
    spotColorId: 'black',
    text: 'EN 15651-1: F-EXT-INT-CC\nEN 15651-3: S (XS1)',
    fontSize: 4.8,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'bold',
    letterSpacing: 0.1,
    lineHeight: 1.2,
    textColor: '#141414',
    isNegative: false,
    strokeWidth: 0.1,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
    language: 'ALL',
  },
  {
    id: 'elem-hdpe-icon',
    name: 'HDPE 02 Recycling Symbol',
    type: 'svg',
    x: 94.0,
    y: 168.0,
    width: 12.0,
    height: 14.0,
    rotation: 0,
    spotColorId: 'black',
    svgContent: RECYCLE_HDPE_SVG,
    preserveAspectRatio: true,
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },
  {
    id: 'elem-barcode',
    name: 'EAN Barcode 310ml',
    type: 'svg',
    x: 109.0,
    y: 167.0,
    width: 35.0,
    height: 18.0,
    rotation: 0,
    spotColorId: 'black',
    svgContent: BARCODE_SVG,
    preserveAspectRatio: true,
    isLocked: false,
    isHidden: false,
    layerGroup: 'logos',
  },

  // Bottom manufacturer footer
  {
    id: 'elem-footer-mfg',
    name: 'Herstellerhinweis & Batch',
    type: 'text',
    x: 6.0,
    y: 195.0,
    width: 138.0,
    height: 6.0,
    rotation: 0,
    spotColorId: 'black',
    text: 'M ONE SEALING SOLUTIONS GMBH • INDUSTRIESTR. 12 • 40721 HILDEN • BATCH: 2026/09-310 • EXP: 18 MONATE',
    fontSize: 4.5,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: '600',
    letterSpacing: 0.3,
    lineHeight: 1.0,
    textColor: '#141414',
    isNegative: false,
    strokeWidth: 0.1,
    isLocked: false,
    isHidden: false,
    layerGroup: 'text_multilingual',
    language: 'ALL',
  },
];
