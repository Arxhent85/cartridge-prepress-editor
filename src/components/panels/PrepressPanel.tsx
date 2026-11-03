import React from 'react';
import {
  CartridgeConfig,
  LayoutElement,
  ManufacturerProfile,
  PreflightIssue,
  PrepressSettings,
  SpotColor,
  SpotColorId,
} from '../../types';
import { CARTRIDGE_CONFIGS } from '../../constants/cartridgeConfigs';
import {
  ShieldAlert,
  CheckCircle,
  Eye,
  SlidersHorizontal,
  Wand2,
  Layers,
  Settings,
  CircleDot,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface PrepressPanelProps {
  settings: PrepressSettings;
  onUpdateSettings: (settings: PrepressSettings) => void;
  spotColors: SpotColor[];
  onUpdateSpotColors: (colors: SpotColor[]) => void;
  cartridge: CartridgeConfig;
  onSelectCartridge: (config: CartridgeConfig) => void;
  preflightIssues: PreflightIssue[];
  onAutoFixPreflight: (issue: PreflightIssue) => void;
  onBoostNegativeTexts: () => void;
  onConvertTo1cAll: () => void;
}

export const PrepressPanel: React.FC<PrepressPanelProps> = ({
  settings,
  onUpdateSettings,
  spotColors,
  onUpdateSpotColors,
  cartridge,
  onSelectCartridge,
  preflightIssues,
  onAutoFixPreflight,
  onBoostNegativeTexts,
  onConvertTo1cAll,
}) => {
  const handleManufacturerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const profile = e.target.value as ManufacturerProfile;
    const config = CARTRIDGE_CONFIGS[profile];
    if (config) {
      onSelectCartridge(config);
      onUpdateSettings({
        ...settings,
        manufacturerProfile: profile,
      });
    }
  };

  const errorCount = preflightIssues.filter((i) => i.severity === 'error').length;
  const warningCount = preflightIssues.filter((i) => i.severity === 'warning').length;

  return (
    <div className="flex flex-col gap-4 text-xs text-zinc-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#2a2d34]">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-orange-500" />
          <span className="font-semibold text-zinc-100 uppercase tracking-wide">
            Kartuschen-Prepress (Siebdruck)
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono">
          HDPE UV-Runddruck
        </span>
      </div>

      {/* Manufacturer Preset */}
      <div className="bg-[#1b1c20] p-3 rounded border border-[#2a2d34] flex flex-col gap-2">
        <label className="text-zinc-200 font-medium">Hersteller-Druckprofil</label>
        <select
          value={settings.manufacturerProfile}
          onChange={handleManufacturerChange}
          className="w-full bg-[#26282e] border border-[#3e424d] text-white rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-500"
        >
          <option value="fischbach-310">Fischbach E 310 (310 ml)</option>
          <option value="gfv-310">GFV Verschlüsse & Kartuschen (310 ml)</option>
          <option value="universal-280">Universal Euro-Kartusche (280 ml)</option>
        </select>
        <div className="flex justify-between text-[11px] text-zinc-400 font-mono pt-1">
          <span>Druckfläche: {cartridge.printableWidthMm} × {cartridge.printableHeightMm} mm</span>
          <span>Naht: {cartridge.seamMarginMm} mm</span>
        </div>
      </div>

      {/* 1-Klick Automatik-Aktionen */}
      <div className="bg-[#1b1c20] p-3 rounded border border-[#2a2d34] flex flex-col gap-2.5">
        <span className="text-zinc-200 font-medium flex items-center gap-1.5">
          <Wand2 className="w-3.5 h-3.5 text-orange-400" />
          1-Klick Siebdruck-Automatik
        </span>
        <button
          onClick={onConvertTo1cAll}
          className="w-full py-1.5 px-3 bg-[#26282e] hover:bg-[#343740] border border-[#3e424d] text-white rounded flex items-center justify-between transition text-xs font-medium"
        >
          <span>CMYK zu 1c-Grau + Sonderfarben</span>
          <span className="text-[10px] text-emerald-400 font-mono">Farbstiche neutralisieren</span>
        </button>
        <button
          onClick={onBoostNegativeTexts}
          className="w-full py-1.5 px-3 bg-[#26282e] hover:bg-[#343740] border border-[#3e424d] text-white rounded flex items-center justify-between transition text-xs font-medium"
        >
          <span>Schriften-Verstärker (Stroke Boost)</span>
          <span className="text-[10px] text-orange-400 font-mono">Gegen Zulaufen (+0.3pt)</span>
        </button>
      </div>

      {/* Sonderfarben-Kanäle & Plattenauszüge */}
      <div className="bg-[#1b1c20] p-3 rounded border border-[#2a2d34] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-zinc-200 font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-orange-400" />
            Sonderfarben-Kanäle (Siebe)
          </span>
          <select
            value={settings.activeColorView}
            onChange={(e) =>
              onUpdateSettings({ ...settings, activeColorView: e.target.value as any })
            }
            className="bg-[#26282e] border border-[#3e424d] text-orange-400 font-medium rounded px-2 py-0.5 text-[11px]"
          >
            <option value="composite">Gesamt (Composite)</option>
            <option value="plate_white">Sieb 1: Deckweiß</option>
            <option value="plate_black">Sieb 2: Tiefschwarz</option>
            <option value="plate_orange">Sieb 3: M ONE Orange</option>
            <option value="plate_manhattan">Sieb 4: Manhattan Grau</option>
            <option value="plate_red">Sieb 5: Fugen-Rot</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          {spotColors.map((sc) => (
            <div
              key={sc.id}
              className={`flex items-center justify-between px-2 py-1.5 rounded border ${
                settings.activeColorView === `plate_${sc.id}`
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-[#2d3038] bg-[#22242a]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  style={{ backgroundColor: sc.hex }}
                  className="w-3.5 h-3.5 rounded border border-zinc-600 inline-block"
                />
                <span className="font-medium text-zinc-200">{sc.name}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                <span>{sc.pantoneName || sc.hex}</span>
                <button
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      activeColorView:
                        settings.activeColorView === `plate_${sc.id}`
                          ? 'composite'
                          : (`plate_${sc.id}` as any),
                    })
                  }
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    settings.activeColorView === `plate_${sc.id}`
                      ? 'bg-orange-600 text-white'
                      : 'hover:bg-zinc-700 text-zinc-400'
                  }`}
                  title="Siebauszug einzeln ansehen"
                >
                  <Eye className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trapping & Unterlegweiß Choke */}
      <div className="bg-[#1b1c20] p-3 rounded border border-[#2a2d34] flex flex-col gap-3">
        <span className="text-zinc-200 font-medium flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
          Trapping & Choke (Überfüllung)
        </span>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="text-zinc-400">Überfüllung (Trapping):</span>
            <span className="font-mono text-orange-400 font-medium">
              {settings.trappingWidthPt.toFixed(2)} pt
            </span>
          </div>
          <input
            type="range"
            min="0.25"
            max="1.0"
            step="0.05"
            value={settings.trappingWidthPt}
            onChange={(e) =>
              onUpdateSettings({ ...settings, trappingWidthPt: parseFloat(e.target.value) })
            }
            className="w-full accent-orange-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="text-zinc-400">Unterlegweiß-Einzug (Choke):</span>
            <span className="font-mono text-emerald-400 font-medium">
              {settings.whiteUnderlayChokeMm.toFixed(2)} mm
            </span>
          </div>
          <input
            type="range"
            min="0.10"
            max="0.30"
            step="0.01"
            value={settings.whiteUnderlayChokeMm}
            onChange={(e) =>
              onUpdateSettings({ ...settings, whiteUnderlayChokeMm: parseFloat(e.target.value) })
            }
            className="w-full accent-orange-500"
          />
          <span className="text-[10px] text-zinc-500">
            Empfohlen: 0.15 mm gegen weiße Blitzer bei Rundlauf-Schwankungen
          </span>
        </div>
      </div>

      {/* Raster-Simulator */}
      <div className="bg-[#1b1c20] p-3 rounded border border-[#2a2d34] flex flex-col gap-2">
        <span className="text-zinc-200 font-medium flex items-center gap-1.5">
          <CircleDot className="w-3.5 h-3.5 text-orange-400" />
          Raster-Simulator (Siebdruck-Gewebe)
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onUpdateSettings({ ...settings, halftoneMode: 'none' })}
            className={`py-1.5 px-2 rounded border text-[11px] font-medium transition ${
              settings.halftoneMode === 'none'
                ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                : 'bg-[#26282e] border-zinc-700 text-zinc-300'
            }`}
          >
            Glatt (Vektor)
          </button>
          <button
            onClick={() => onUpdateSettings({ ...settings, halftoneMode: '36_lpcm' })}
            className={`py-1.5 px-2 rounded border text-[11px] font-medium transition ${
              settings.halftoneMode === '36_lpcm'
                ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                : 'bg-[#26282e] border-zinc-700 text-zinc-300'
            }`}
          >
            36 L/cm Raster
          </button>
          <button
            onClick={() => onUpdateSettings({ ...settings, halftoneMode: '48_lpcm' })}
            className={`py-1.5 px-2 rounded border text-[11px] font-medium transition ${
              settings.halftoneMode === '48_lpcm'
                ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                : 'bg-[#26282e] border-zinc-700 text-zinc-300'
            }`}
          >
            48 L/cm Feinraster
          </button>
          <button
            onClick={() => onUpdateSettings({ ...settings, halftoneMode: 'fm_stochastic' })}
            className={`py-1.5 px-2 rounded border text-[11px] font-medium transition ${
              settings.halftoneMode === 'fm_stochastic'
                ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                : 'bg-[#26282e] border-zinc-700 text-zinc-300'
            }`}
          >
            FM-Stochastisch
          </button>
        </div>
      </div>

      {/* Farbkontrollstreifen Switch */}
      <div className="bg-[#1b1c20] p-3 rounded border border-[#2a2d34] flex items-center justify-between">
        <div>
          <div className="font-medium text-zinc-200">Farbkontrollstreifen</div>
          <div className="text-[10px] text-zinc-400">Passkreuze, Schnitt- & Messkeile am Rand</div>
        </div>
        <button
          onClick={() =>
            onUpdateSettings({ ...settings, includeControlStrip: !settings.includeControlStrip })
          }
          className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
            settings.includeControlStrip ? 'bg-orange-500 justify-end' : 'bg-zinc-700 justify-start'
          }`}
        >
          <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md" />
        </button>
      </div>

      {/* Preflight Check Box */}
      <div className="bg-[#1b1c20] p-3 rounded border border-[#2a2d34] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-medium text-zinc-200">
            <ShieldAlert className="w-4 h-4 text-orange-500" />
            <span>Preflight-Prüfung</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            {errorCount > 0 ? (
              <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">
                {errorCount} Fehler
              </span>
            ) : warningCount > 0 ? (
              <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-bold">
                {warningCount} Warnungen
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Druckfertig
              </span>
            )}
          </div>
        </div>

        {preflightIssues.length === 0 ? (
          <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 text-[11px] flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Alle Kleinschriften, Konturen und Sonderfarben entsprechen den Siebdruck-Kriterien!</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            {preflightIssues.map((issue) => (
              <div
                key={issue.id}
                className={`p-2 rounded border text-[11px] flex flex-col gap-1 ${
                  issue.severity === 'error'
                    ? 'bg-red-950/20 border-red-800/50 text-red-200'
                    : issue.severity === 'warning'
                    ? 'bg-amber-950/20 border-amber-800/50 text-amber-200'
                    : 'bg-blue-950/20 border-blue-800/50 text-blue-200'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    {issue.title}
                  </span>
                  {issue.autoFixAvailable && (
                    <button
                      onClick={() => onAutoFixPreflight(issue)}
                      className="px-2 py-0.5 rounded bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold shrink-0 shadow"
                    >
                      Auto-Fix
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 leading-tight">{issue.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
