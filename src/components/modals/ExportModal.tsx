import React, { useState } from 'react';
import {
  CartridgeConfig,
  LayoutElement,
  PrepressSettings,
  SpotColor,
} from '../../types';
import { exportPrintReadyPDF, generateLayoutSVG } from '../../utils/exportPipeline';
import {
  Download,
  FileCheck,
  Layers,
  FileCode,
  X,
  CheckCircle,
  Loader2,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: LayoutElement[];
  cartridge: CartridgeConfig;
  spotColors: SpotColor[];
  settings: PrepressSettings;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  elements,
  cartridge,
  spotColors,
  settings,
}) => {
  const [includeControlStrip, setIncludeControlStrip] = useState(true);
  const [separateSpotPlates, setSeparateSpotPlates] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Download PDF
  const handleDownloadPDF = async () => {
    setIsExporting(true);
    setExportSuccess(null);
    try {
      const pdfBytes = await exportPrintReadyPDF(
        elements,
        cartridge,
        spotColors,
        { ...settings, includeControlStrip },
        separateSpotPlates
      );

      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Kartusche_${cartridge.name.replace(/\s+/g, '_')}_Druckvorstufe.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setExportSuccess('Druckfertiges PDF erfolgreich heruntergeladen!');
    } catch (err: any) {
      alert(`Fehler beim PDF-Export: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Download SVG
  const handleDownloadSVG = () => {
    const svgStr = generateLayoutSVG(elements, cartridge, spotColors, {
      ...settings,
      includeControlStrip,
    });
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Kartusche_${cartridge.name.replace(/\s+/g, '_')}_Vektor.svg`;
    a.click();
    URL.revokeObjectURL(url);
    setExportSuccess('Vektor-SVG erfolgreich heruntergeladen!');
  };

  // Download Single Screen Separation Plate
  const handleDownloadSinglePlate = (plateId: string, plateName: string) => {
    const svgStr = generateLayoutSVG(
      elements,
      cartridge,
      spotColors,
      { ...settings, includeControlStrip },
      plateId
    );
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Siebplatte_${plateId.toUpperCase()}_${plateName.replace(/\s+/g, '_')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    setExportSuccess(`Siebplatte "${plateName}" heruntergeladen!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#141518] border border-[#2e323b] rounded-xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1a1b20] border-b border-[#2e323b]">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-orange-500" />
            <span className="font-semibold text-sm text-zinc-100">
              Produktionsreifer Export (Druckvorstufe)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4 text-xs text-zinc-300">
          {/* Options */}
          <div className="bg-[#1b1c20] p-3.5 rounded-lg border border-[#2a2d34] flex flex-col gap-2.5">
            <span className="font-medium text-zinc-200">Export-Optionen</span>
            <div className="flex items-center justify-between">
              <span>Passkreuze & Farbkontrollstreifen einbetten:</span>
              <input
                type="checkbox"
                checked={includeControlStrip}
                onChange={(e) => setIncludeControlStrip(e.target.checked)}
                className="accent-orange-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Dedizierte Einzelseiten pro Drucksieb (Spot-Plates):</span>
              <input
                type="checkbox"
                checked={separateSpotPlates}
                onChange={(e) => setSeparateSpotPlates(e.target.checked)}
                className="accent-orange-500 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          {/* Primary Action: PDF Export */}
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-white rounded-lg font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Erzeuge Mehrkanal-Druck-PDF...</span>
              </>
            ) : (
              <>
                <FileCheck className="w-5 h-5" />
                <span>PDF/X-4 Druck-PDF herunterladen</span>
              </>
            )}
          </button>

          {/* Secondary Action: SVG Export */}
          <button
            onClick={handleDownloadSVG}
            className="w-full py-2.5 bg-[#26282e] hover:bg-[#32353d] border border-[#3e424d] text-zinc-200 rounded-lg font-medium flex items-center justify-center gap-2 transition"
          >
            <FileCode className="w-4 h-4 text-orange-400" />
            <span>Vektor-SVG mit Druckprofilen exportieren</span>
          </button>

          {/* Single Plates Download */}
          <div className="pt-2 flex flex-col gap-2">
            <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-orange-400" />
              Einzelseparations-Paket (Direktes Sieb-Rendering):
            </span>
            <div className="grid grid-cols-2 gap-2">
              {spotColors.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => handleDownloadSinglePlate(sc.id, sc.name)}
                  className="py-1.5 px-2 bg-[#1c1d22] hover:bg-[#252830] border border-[#2a2d34] rounded text-left flex items-center justify-between text-[11px] transition"
                >
                  <span className="truncate">{sc.name}</span>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sc.hex }} />
                </button>
              ))}
            </div>
          </div>

          {exportSuccess && (
            <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-800 text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{exportSuccess}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
