// app/utils/chromatic-analyzer.ts

export type ChromaticAudit = {
  arousalScore: number // 0-100% Saturation
  circadianTag: 'Alerting' | 'Neutral' | 'Sedative'
  dominance: 'Warm (Advancing)' | 'Cool (Receding)'
  insight: string
  prescriptions: string[]
}

// Helper: RGB to HSV Conversion
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
  let totalVal = 0;
  let warmCount = 0;
  let coolCount = 0;
  const pixelCount = pixels.length / 4;

  for (let i = 0; i < pixels.length; i += 40) { // Sample every 10th pixel for speed (4 channels * 10)
    const { h, s, v } = rgbToHsv(pixels[i], pixels[i+1], pixels[i+2]);
    totalSat += s;
    totalVal += v;
    // Warm (Reds/Yellows) vs Cool (Blues/Greens)
    if (h < 0.17 || h > 0.8) warmCount++;
    else coolCount++;
  }

  // Averages (0-100 scale)
  const avgSat = Math.round((totalSat / (pixelCount / 10)) * 100);
  const avgVal = Math.round((totalVal / (pixelCount / 10)) * 100);

  // Generate Insight Logic
  let insight = "Your space is chromatically balanced.";
  let prescriptions = [];

  if (avgSat > 60) {
    insight = "High Chromatic Load Detected. This room is actively triggering your sympathetic nervous system (Fight/Flight).";
    prescriptions.push("Desaturate large surface areas (rugs, walls).");
    prescriptions.push("Move bright colors to focal points only.");
  } else if (avgSat < 20 && avgVal < 30) {
    insight = "Hypo-Arousal Signals. The lack of visual contrast may lead to stagnation or low mood.";
    prescriptions.push("Introduce 'fractal' textures or plants.");
    prescriptions.push("Add a high-contrast focal point.");
  } else {
    insight = "Restorative Chromatic Profile. This balance supports 'Soft Fascination' and recovery.";
    prescriptions.push("Maintain current light levels.");
  }

  return {
    arousalScore: avgSat,
    circadianTag: avgVal > 60 ? 'Alerting' : 'Sedative',
    dominance: warmCount > coolCount ? 'Warm (Advancing)' : 'Cool (Receding)',
    insight,
    prescriptions
  };
}
