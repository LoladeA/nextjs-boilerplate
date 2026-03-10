// =============================================================================
// NEURO MAPPER — The Sentient Home
// =============================================================================
//
// CHANGE LOG:
//   getProfileDisplayName() — converts a DashboardProfile key into the
//     display title used in the assessment report subtitle.
//     Fixes: "How your home interacts with your None sensory profile."
//
//   getProfileMetadata() — updated to accept the full NeuroLoadResult
//     and extract integrationPattern + profileDescriptor from
//     integrationProfile. Previously only accepted SensoryProfile.
//
//   ProfileMetadata — extended with integrationPattern and profileDescriptor.
//
//   mapEngineToDashboard() — logic unchanged.
// =============================================================================

import {
  SensoryProfile    as EngineProfile,
  IntegrationPattern,
  IntegrationProfile,
  NeuroLoadResult
} from '@/app/utils/scoring-engine'

import { SENSORY_DOSSIERS } from '@/app/data/sensory-dossiers'

// ==============================
// TYPES
// ==============================

export type DashboardProfile = 'anchor' | 'seeker' | 'sensor'

export interface ProfileMetadata {
  profile:               DashboardProfile
  displayName:           string            // e.g., "The Sensor"
  archetype:             string            // e.g., "The Filter"
  // Sensory profile blend metadata
  blendApplied:          boolean
  thresholdDifferential: number
  // Integration profile
  integrationPattern:    IntegrationPattern
  integrationIndex:      number            // 0–100
  profileDescriptor:     string            // plain-language six-profile description
}

// ==============================
// ENGINE → DASHBOARD PROFILE MAP
// ==============================

export function mapEngineToDashboard(engineProfile: EngineProfile): DashboardProfile {
  const { threshold, pattern } = engineProfile

  // THE SENSOR — low neurological threshold.
  // Includes 'sensitive' (passive) and 'avoider' (active).
  if (threshold === 'low') {
    return 'sensor'
  }

  // THE SEEKER — high threshold + active regulation.
  if (pattern === 'seeker') {
    return 'seeker'
  }

  // THE ANCHOR — high threshold + passive regulation.
  return 'anchor'
}

// ==============================
// DISPLAY NAME HELPER
// ==============================
//
// USE THIS for any UI text that names the profile in a sentence.
// Do NOT use the raw neuro_lens DB value — it will display "None",
// "HSP", "ADHD" etc. which are neurotype labels, not profile names.

export function getProfileDisplayName(profile: DashboardProfile): string {
  return SENSORY_DOSSIERS[profile]?.title ?? 'Your Sensory Profile'
}

// ==============================
// FULL METADATA HELPER
// ==============================
//
// Accepts the complete NeuroLoadResult so it can extract both
// sensoryProfile and integrationProfile in a single call.
// Use in the assessment report header and profile badge tooltip.
//
// Note: blendApplied and thresholdDifferential are correctly
// read from engineResult.sensoryProfile — they are NOT top-level
// fields on the engine return object.

export function getProfileMetadata(engineResult: NeuroLoadResult): ProfileMetadata {
  const { sensoryProfile, integrationProfile } = engineResult

  const profile = mapEngineToDashboard(sensoryProfile)
  const dossier = SENSORY_DOSSIERS[profile]

  return {
    profile,
    displayName:           dossier?.title    ?? 'Your Sensory Profile',
    archetype:             dossier?.archetype ?? '',
    // Correctly scoped from sensoryProfile
    blendApplied:          sensoryProfile.blendApplied          ?? false,
    thresholdDifferential: sensoryProfile.thresholdDifferential ?? 100,
    // Integration profile
    integrationPattern:    integrationProfile.integrationPattern,
    integrationIndex:      integrationProfile.integrationIndex,
    profileDescriptor:     integrationProfile.profileDescriptor
  }
}
