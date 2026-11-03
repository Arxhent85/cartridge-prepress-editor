import { CartridgeConfig, LayoutElement, PreflightIssue, PrepressSettings } from '../types';

/**
 * Preflight Analyzer for UV Cylindrical Screen Printing on HDPE Cartridges
 */
export function runCartridgePreflightCheck(
  elements: LayoutElement[],
  cartridge: CartridgeConfig,
  settings: PrepressSettings
): PreflightIssue[] {
  const issues: PreflightIssue[] = [];

  for (const el of elements) {
    if (el.isHidden) continue;

    // 1. Text Checks: Negative text risk of filling in (Zulaufen im Siebdruck)
    if (el.type === 'text') {
      if (el.isNegative) {
        // Negative text on dark/colored background
        const effectiveStroke = el.strokeWidth || 0;
        if (el.fontSize < 6.5 && effectiveStroke < 0.25) {
          issues.push({
            id: `preflight-neg-text-${el.id}`,
            severity: 'error',
            title: `Negativschrift droht zuzulaufen: "${el.text.slice(0, 22)}..."`,
            description: `Schriftgröße ${el.fontSize}pt mit Konturstärke ${effectiveStroke}pt ist im Siebdruck auf HDPE gefährdet. Durch UV-Farbauftrag schließen sich Binnenräume (z.B. bei 'e', 'a', 'o').`,
            elementId: el.id,
            suggestedFix: 'Schriftstärke um 0.35pt verstärken (Stroke Boosting) oder Schriftgröße auf min. 7pt anheben.',
            autoFixAvailable: true,
          });
        }
      } else if (el.fontSize < 4.8) {
        issues.push({
          id: `preflight-small-text-${el.id}`,
          severity: 'warning',
          title: `Sehr kleine Positivschrift: "${el.text.slice(0, 20)}..."`,
          description: `Schriftgröße ${el.fontSize}pt liegt unter der empfohlenen Mindestgröße von 5pt für Siebdruck-Gewebe 120-34.`,
          elementId: el.id,
          suggestedFix: 'Schriftgröße auf mindestens 5.0pt vergrößern.',
          autoFixAvailable: true,
        });
      }
    }

    // 2. Vector Stroke / Hairline Checks
    if (el.type === 'line' || el.type === 'rect') {
      if (el.strokeWidth > 0 && el.strokeWidth < 0.4) {
        issues.push({
          id: `preflight-hairline-${el.id}`,
          severity: 'warning',
          title: `Haarlinie gefährdet: ${el.name}`,
          description: `Linienstärke von ${el.strokeWidth}pt unterschreitet die Siebdruck-Mindestlinienstärke von 0.5pt. Die Linie kann auf dem Sieb abreißen.`,
          elementId: el.id,
          suggestedFix: 'Linienstärke auf mindestens 0.5pt (0.18 mm) erhöhen.',
          autoFixAvailable: true,
        });
      }
    }

    // 3. Image 1c & Dot Gain Check
    if (el.type === 'image') {
      if (!el.filterSettings.grayscale1c) {
        issues.push({
          id: `preflight-cmyk-image-${el.id}`,
          severity: 'error',
          title: `Bild nicht auf 1c-Unbunt/Graustufen umgestellt: ${el.name}`,
          description: `Vierfarbige CMYK-Bilder neigen im Rundkörpersiebdruck zu unkontrollierbarem Farbstich (z.B. Sepia/Grün). Es wird ein 1c-Graustufenaufbau über Deckweiß empfohlen.`,
          elementId: el.id,
          suggestedFix: '1-Klick Farbraum-Umschaltung zu 1c-Graustufen aktivieren.',
          autoFixAvailable: true,
        });
      }

      if (el.filterSettings.dotGainCompensation < 15) {
        issues.push({
          id: `preflight-dotgain-${el.id}`,
          severity: 'warning',
          title: `Tonwertzuwachs-Kompensation zu niedrig (${el.filterSettings.dotGainCompensation}%)`,
          description: `HDPE-Kartuschen haben einen hohen Punktzuwachs von 18–22%. Ohne Kompensation versumpfen die Mitteltöne.`,
          elementId: el.id,
          suggestedFix: 'Punktzuwachs-Regler auf 20% einstellen.',
          autoFixAvailable: true,
        });
      }
    }

    // 4. Cartridge Seam / Bleed margin check
    const rightEdge = el.x + el.width;
    const maxPrintable = cartridge.printableWidthMm;
    if (rightEdge > maxPrintable - cartridge.seamMarginMm && el.layerGroup !== 'background') {
      issues.push({
        id: `preflight-seam-margin-${el.id}`,
        severity: 'info',
        title: `Element ragt in Naht-Sicherheitsbereich: ${el.name}`,
        description: `Das Element endet bei ${rightEdge.toFixed(1)} mm und ist näher als ${cartridge.seamMarginMm} mm an der Schweißnaht/Überlappung.`,
        elementId: el.id,
        suggestedFix: `Element nach links verschieben (x <= ${(maxPrintable - cartridge.seamMarginMm - el.width).toFixed(1)} mm).`,
        autoFixAvailable: true,
      });
    }
  }

  // 5. White Underlay Check
  if (settings.whiteUnderlayChokeMm < 0.12) {
    issues.push({
      id: 'preflight-white-choke',
      severity: 'warning',
      title: 'Unterlegweiß Choke (Einzug) zu gering',
      description: `Aktueller Einzug ${settings.whiteUnderlayChokeMm}mm. Bei Passungenauigkeiten im Rundsiebdruck können weiße Blitzer an Farbkanten sichtbar werden.`,
      suggestedFix: 'Unterlegweiß-Choke auf mindestens 0.15mm einstellen.',
      autoFixAvailable: true,
    });
  }

  return issues;
}
