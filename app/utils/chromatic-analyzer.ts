// app/utils/chromatic-analyzer.ts

export type ChromaticAudit = {
  arousalScore: number // 0-100% Saturation (Emotional Intensity)
  lightScore: number   // 0-100% Luminance (Circadian Signal Strength)
  circadianTag: 'Alerting (Day)' | 'Neutral' | 'Sedative (Night)'
  dominance: 'Warm (Advancing)' | 'Cool (Receding)'
  insight: string
  prescriptions: string[]
}

function rgbToHsv(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, v };
}

export function interpretChromeData(pixels: Uint8ClampedArray): ChromaticAudit {
  let totalSat = 0;
  let totalLuminance = 0; // New Metric for Light Level
  let warmCount = 0;
  let coolCount = 0;
  
  const step = 40; 
  const pixelCount = pixels.length / 4;

  for (let i = 0; i < pixels.length; i += step) { 
    const r = pixels[i];
    const g = pixels[i+1];
    const b = pixels[i+2];
    
    // 1. Calculate HSV for Saturation/Hue
    const { h, s } = rgbToHsv(r, g, b);
    totalSat += s;

    // 2. Calculate Perceived Luminance (The Eye's "Lux Meter")
    // Formula: 0.299R + 0.587G + 0.114B (Standard weights for human vision)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    totalLuminance += luminance;

    // 3. Warm vs Cool
    if (h < 0.17 || h > 0.8) warmCount++;
    else coolCount++;
  }

  // Averages (0-100 scale)
  const samples = pixelCount / (step / 4);
  const avgSat = Math.round((totalSat / samples) * 100);
  const avgLux = Math.round((totalLuminance / samples) * 100); // This is your Light Score

  // Logic: Circadian Impact based on Light Level (Lux) AND Color
  // High Lux + Cool Color = Maximum Alertness (Day Protocol)
  // Low Lux + Warm Color = Maximum Recovery (Night Protocol)
  
  let circadianTag: ChromaticAudit['circadianTag'] = 'Neutral';
  if (avgLux > 60) circadianTag = 'Alerting (Day)';
  else if (avgLux < 30) circadianTag = 'Sedative (Night)';

  let insight = "Your space is balanced.";
  let prescriptions: string[] = [];

  // Insight Logic mixing Light + Color
  if (avgLux > 70 && avgSat > 60) {
    insight = "High Intensity Detected. Bright light combined with high saturation creates a 'High Energy' zone suitable for movement, but likely too stimulating for deep focus or rest.";
    prescriptions.push("Use dimmers to lower light intensity in the evening.");
  } else if (avgLux < 20) {
    insight = "Low Light Signal. This level triggers melatonin production. Excellent for sleep hygiene, but will inhibit cognitive performance if this is a workspace.";
    prescriptions.push("Increase ambient light if alertness is required.");
  } else if (avgSat > 50) {
    insight = "High Chromatic Load. The light levels are moderate, but the color saturation is high, triggering emotional arousal.";
    prescriptions.push("Desaturate large surfaces.");
  } else {
    insight = "Restorative Profile. Moderate light and balanced colors support the 'Soft Fascination' state.";
    prescriptions.push("Maintain this balance for recovery zones.");
  }

  return {
    arousalScore: avgSat,
    lightScore: avgLux, // 🟢 NEW: The Virtual Lux Score
    circadianTag,
    dominance: warmCount > coolCount ? 'Warm (Advancing)' : 'Cool (Receding)',
    insight,
    prescriptions
  };
}
