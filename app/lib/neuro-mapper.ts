// =============================================================================
// NEURO MAPPER — The Sentient Home
// =============================================================================
//
// CHANGE LOG:
//   getProfileDisplayName() — new helper that converts a DashboardProfile key
//     into the display title used in the assessment report subtitle.
//     Fixes: "How your home interacts with your None sensory profile."
//     The raw neuro_lens DB value ("None", "HSP", etc.) was being passed directly
//     to the subtitle instead of the derived profile title.
//
//   getProfileMetadata() — new helper that returns the full dossier object
//     plus blend metadata for UI transparency (blend badge, tooltip, etc.)
//
//   mapEngineToDashboard() — logic unchanged. Import updated to include
//     new engine fields (blendApplied, thresholdDifferential).
// =============================================================================

import { SensoryProfile as EngineProfile } from '@/app/utils/scoring-engine'
import { SENSORY_DOSSIERS } from '@/app/data/sensory-dossiers'

// ==============================
// TYPES
// ==============================

export type DashboardProfile = 'anchor' | 'seeker' | 'sensor'

export interface ProfileMetadata {
  profile:              DashboardProfile
  displayName:          string    // e.g., "The Sensor" — for report subtitle
  archetype:            string    // e.g., "The Filter" — for badge/chip
  blendApplied:         boolean   // true when neuro_lens tiebreak was used
  thresholdDifferential: number   // 0–100 gap; low = ambiguous derivation
}

// ==============================
// ENGINE → DASHBOARD PROFILE MAP
// ==============================
//
// Logic is unchanged. Maps derived engine pattern to one of three
// dashboard archetypes. All low-threshold patterns → sensor.
// High-threshold patterns split on regulation style.

export function mapEngineToDashboard(engineProfile: EngineProfile): DashboardProfile {
  const { threshold, pattern } = engineProfile

  // THE SENSOR — low neurological threshold.
  // Includes 'sensitive' (passive) and 'avoider' (active).
  // Both indicate a system that is receiving too much input.
  if (threshold === 'low') {
    return 'sensor'
  }

  // THE SEEKER — high threshold + active regulation.
  // System requires input. Active management is stimulus-seeking.
  if (pattern === 'seeker') {
    return 'seeker'
  }

  // THE ANCHOR — high threshold + passive regulation.
  // Tolerates wide environmental range without apparent distress.
  // Falls through from low_registration pattern.
  return 'anchor'
}

// ==============================
// DISPLAY NAME HELPER
// ==============================
//
// Converts a DashboardProfile key to the human-readable title
// stored in SENSORY_DOSSIERS.
//
// USE THIS for any UI text that names the profile in a sentence.
// Do NOT use the raw neuro_lens DB value — it will display "None",
// "HSP", "ADHD" etc. which are neurotype labels, not profile names.
//
// ✅ Correct:  "How your home interacts with your The Sensor profile."
//             → trim "How your home interacts with your {displayName}."
// ❌ Wrong:    "How your home interacts with your None sensory profile."

export function getProfileDisplayName(profile: DashboardProfile): string {
  return SENSORY_DOSSIERS[profile]?.title ?? 'Your Sensory Profile'
}

// ==============================
// FULL METADATA HELPER
// ==============================
//
// Returns profile display data plus blend transparency metadata.
// Use in the assessment report header and profile badge tooltip.

export function getProfileMetadata(engineProfile: EngineProfile): ProfileMetadata {
  const profile    = mapEngineToDashboard(engineProfile)
  const dossier    = SENSORY_DOSSIERS[profile]

  return {
    profile,
    displayName:           dossier?.title    ?? 'Your Sensory Profile',
    archetype:             dossier?.archetype ?? '',
    blendApplied:          engineProfile.blendApplied         ?? false,
    thresholdDifferential: engineProfile.thresholdDifferential ?? 100
  }
}
