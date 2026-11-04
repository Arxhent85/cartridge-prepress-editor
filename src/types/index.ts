export type ElementType = 'text' | 'image' | 'svg' | 'line' | 'rect' | 'table';

export type SpotColorId = 'white' | 'black' | 'orange' | 'red' | 'manhattan';

export interface SpotColor {
  id: SpotColorId;
  name: string;
  hex: string;
  pantoneName?: string;
  opacity: number;
  isSeparatedPlate: boolean;
  visible: boolean;
  isUnderlayWhite?: boolean;
}

export interface ImageFilterSettings {
  grayscale1c: boolean;
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  gamma: number; // 0.1 to 3.0
  dotGainCompensation: number; // 0 to 30 %
  unsharpMask: number; // 0 to 100 %
  levelsMin: number; // 0 to 255
  levelsMax: number; // 0 to 255
  invert: boolean;
}

export interface BaseElement {
  id: string;
  name: string;
  type: ElementType;
  x: number; // in mm
  y: number; // in mm
  width: number; // in mm
  height: number; // in mm
  rotation: number; // degrees
  spotColorId: SpotColorId;
  isLocked: boolean;
  isHidden: boolean;
  layerGroup: 'background' | 'photo' | 'bars' | 'logos' | 'text_multilingual';
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number; // in pt
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | '600' | '800';
  fontStyle?: 'normal' | 'italic';
  letterSpacing: number; // tracking in pt
  lineHeight: number;
  textColor: string;
  isNegative: boolean; // negative/reverse text on dark background
  strokeWidth: number; // in pt (for prepress stroke boosting)
  language?: 'DE' | 'EN' | 'AL' | 'ALL';
  isEdited?: boolean;
  backgroundColor?: string;
  isPdfTextOverlay?: boolean;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  originalSrc: string;
  filterSettings: ImageFilterSettings;
  maskPoints?: { x: number; y: number }[];
  isMasterPdfArtwork?: boolean;
}

export interface SvgElement extends BaseElement {
  type: 'svg';
  svgContent: string;
  preserveAspectRatio: boolean;
}

export interface ShapeElement extends BaseElement {
  type: 'line' | 'rect' | 'table';
  points?: { x: number; y: number }[]; // for lines/fugen
  strokeWidth: number; // in pt
  strokeColor: string;
  fillColor?: string;
  cornerRadius?: number;
  tableRows?: number;
  tableCols?: number;
  tableData?: string[][];
}

export type LayoutElement = TextElement | ImageElement | SvgElement | ShapeElement;

export type ManufacturerProfile = 'fischbach-310' | 'gfv-310' | 'universal-280' | 'custom-pdf';

export interface CartridgeConfig {
  manufacturer: ManufacturerProfile;
  name: string;
  volume: string;
  printableWidthMm: number;
  printableHeightMm: number;
  totalCircumferenceMm: number;
  diameterMm: number;
  totalLengthMm: number;
  bleedMm: number;
  seamMarginMm: number;
}

export interface PrepressSettings {
  manufacturerProfile: ManufacturerProfile;
  trappingWidthPt: number;
  whiteUnderlayChokeMm: number;
  dotGainCurvePercent: number;
  halftoneMode: 'none' | '36_lpcm' | '48_lpcm' | 'fm_stochastic';
  activeColorView: 'composite' | 'plate_white' | 'plate_black' | 'plate_orange' | 'plate_red' | 'plate_manhattan';
  includeControlStrip: boolean;
  autoStrokeBoostNegativeText: boolean;
}

export interface PreflightIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  elementId?: string;
  suggestedFix?: string;
  autoFixAvailable: boolean;
}
