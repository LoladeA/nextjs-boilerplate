// ------------------------------------------------------------
// NEURODESIGN ENGINE v2 — Premium Structured Architecture
// ------------------------------------------------------------

export const ENGINE_VERSION = "2.0.0";

export type RoomType = 'Bedroom' | 'Home Office' | 'Living Room' | 'Kitchen' | 'Other';
export type SensoryProfile = 'High Sensitivity' | 'Moderate Sensitivity' | 'Low Sensitivity';

export interface RawMetrics {
  object_density: number;          // 0.0 - 1.0
  edge_density: number;            // 0.0 - 1.0
  surface_occlusion_ratio: number; // 0.0 - 1.0
  hue_variance: number;            // 0.0 - 1.0
  light_uniformity: number;        // 0.0 - 1.0
  greenery_ratio: number;          // 0.0 - 1.0
  symmetry_score: number;          // 0.0 - 1.0
  pathway_clearance: number;       // 0.0 - 1.0
}

export interface Layer3Payload {
  engine_version: string;
  room_type: RoomType;
  scores: {
    cognitive_load: number;
    chromatic_regulation: number;
    circadian_alignment: number;
    biophilic_coherence: number;
    spatial_safety: number;
    neurodesign_alignment_index: number;
  };
  stress_triggers: string[];
}

// -----------------------------
// CONFIGURABLE DOMAIN WEIGHTS
// -----------------------------

const DOMAIN_WEIGHTS = {
  cognitive_load: 0.25,
  spatial_safety: 0.20,
  circadian_alignment: 0.20,
  chromatic_regulation: 0.20,
  biophilic_coherence: 0.15,
};

// -----------------------------
// CORE ENGINE
// -----------------------------

export function calculateNeuroDesignEngine(
  metrics: RawMetrics,
  roomType: RoomType = 'Living Room',
  sensoryProfile: SensoryProfile = 'Moderate Sensitivity'
): Layer3Payload {

  const triggers: string[] = [];

  // ---------------------------------------------------------
  // 1. COGNITIVE LOAD (Non-linear clutter penalty)
  // ---------------------------------------------------------

  const clutter_penalty =
    (metrics.edge_density * 0.35) +
    (metrics.object_density * 0.35) +
    (metrics.surface_occlusion_ratio * 0.30);

  let cognitive_load = inverseCurve(clutter_penalty);

  // Sensory modulation (proportional, not cliff-based)
  cognitive_load *= sensoryModifier(sensoryProfile, 1.1, 1.0, 0.9);

  if (roomType === 'Bedroom') {
    cognitive_load *= 0.9; // Bedrooms demand deeper cognitive restoration
  }

  if (metrics.edge_density > 0.65)
    triggers.push("High micro-edge clustering increasing visual vigilance");

  if (metrics.surface_occlusion_ratio > 0.55)
    triggers.push("Surface saturation reducing perceptual rest zones");

  // ---------------------------------------------------------
  // 2. CHROMATIC REGULATION (Variance curve)
  // ---------------------------------------------------------

  let chromatic_regulation = inverseCurve(metrics.hue_variance);

  chromatic_regulation *= sensoryModifier(sensoryProfile, 1.1, 1.0, 0.95);

  if (metrics.hue_variance > 0.6)
    triggers.push("Elevated chromatic dispersion creating attentional drift");

  // ---------------------------------------------------------
  // 3. CIRCADIAN ALIGNMENT (Uniformity amplification)
  // ---------------------------------------------------------

  let circadian_alignment = directCurve(metrics.light_uniformity);

  if (roomType === 'Home Office' && metrics.light_uniformity < 0.5) {
    circadian_alignment *= 0.85;
    triggers.push("Uneven luminance distribution impairing sustained focus");
  }

  // ---------------------------------------------------------
  // 4. BIOPHILIC COHERENCE (Weighted but perceptual)
  // ---------------------------------------------------------

  const biophilic_raw =
    (metrics.greenery_ratio * 0.65) +
    (metrics.symmetry_score * 0.35);

  let biophilic_coherence = directCurve(biophilic_raw);

  if (metrics.greenery_ratio < 0.05)
    triggers.push("Minimal biophilic signal detected");

  // ---------------------------------------------------------
  // 5. SPATIAL SAFETY (Clearance + interaction effect)
  // ---------------------------------------------------------

  let spatial_safety = directCurve(metrics.pathway_clearance);

  spatial_safety *= sensoryModifier(sensoryProfile, 1.15, 1.0, 0.95);

  if (metrics.pathway_clearance < 0.5)
    triggers.push("Circulation compression increasing subconscious guarding");

  // Interaction Effect:
  if (metrics.edge_density > 0.6 && metrics.pathway_clearance < 0.45) {
    spatial_safety *= 0.85;
    triggers.push("Clutter-pathway interaction amplifying vigilance response");
  }

  // ---------------------------------------------------------
  // CLAMP DOMAINS
  // ---------------------------------------------------------

  const scores = {
    cognitive_load: clamp(cognitive_load),
    chromatic_regulation: clamp(chromatic_regulation),
    circadian_alignment: clamp(circadian_alignment),
    biophilic_coherence: clamp(biophilic_coherence),
    spatial_safety: clamp(spatial_safety),
  };

  // ---------------------------------------------------------
  // MASTER INDEX (Weighted Composite)
  // ---------------------------------------------------------

  const neurodesign_alignment_index = clamp(
    (scores.cognitive_load * DOMAIN_WEIGHTS.cognitive_load) +
    (scores.spatial_safety * DOMAIN_WEIGHTS.spatial_safety) +
    (scores.circadian_alignment * DOMAIN_WEIGHTS.circadian_alignment) +
    (scores.chromatic_regulation * DOMAIN_WEIGHTS.chromatic_regulation) +
    (scores.biophilic_coherence * DOMAIN_WEIGHTS.biophilic_coherence)
  );

  return {
    engine_version: ENGINE_VERSION,
    room_type: roomType,
    scores: {
      ...scores,
      neurodesign_alignment_index,
    },
    stress_triggers: triggers,
  };
}

// ------------------------------------------------------------
// PERCEPTUAL CURVES
// ------------------------------------------------------------

// Inverse nonlinear curve (penalty-sensitive)
function inverseCurve(value: number): number {
  return (1 - Math.pow(value, 1.4)) * 100;
}

// Direct nonlinear curve (diminishing returns)
function directCurve(value: number): number {
  return Math.pow(value, 0.9) * 100;
}

// Sensory scaling helper
function sensoryModifier(
  profile: SensoryProfile,
  high: number,
  moderate: number,
  low: number
): number {
  if (profile === 'High Sensitivity') return high;
  if (profile === 'Low Sensitivity') return low;
  return moderate;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
