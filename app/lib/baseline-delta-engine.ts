// =============================================================================
// BASELINE DELTA ENGINE — The Sentient Home
// FILE: app/lib/baseline-delta-engine.ts
// =============================================================================
//
// CHANGE LOG (this version):
//
//   SELF-DELTA FIELDS REMOVED
//   The update assessment no longer collects per-domain self-report deltas
//   (cii_delta_self, ali_delta_self, pli_delta_self, stl_delta_self,
//   rci_delta_self). These required the user to remember and compare their
//   previous state, which introduced memory bias and reduced accuracy.
//
//   The delta is now computed entirely from the two snapshot objects.
//   Domain outcomes are resolved from the computed direction and life context
//   alone. The subjective_alignment_score remains as a global trajectory
//   signal — it operates at the whole-system level, not per-domain.
//
//   Removed from calculateBaselineDelta deltaFields parameter:
//     - cii_delta_self, ali_delta_self, pli_delta_self, stl_delta_self,
//       rci_delta_self
//
//   Removed from DomainDeltaResult:
//     - self_delta (no longer meaningful without per-domain self-report)
//
//   resolveDomainOutcome simplified:
//     - selfDirection parameter removed
//     - outcome resolved from computed direction + lifeContextFlag only
//
//   Everything else unchanged:
//     - Integration pattern tracking (both axes)
//     - overall_progress classification
//     - NudgeConfig and shouldShowNudge
//     - All narrative copy
//
// =============================================================================

import type { DomainScores, NeuroLoadResult } from './scoring-engine'

export interface DomainDelta {
  cii: number; ali: number; pli: number; stl: number; rci: number
}

export type DeltaDirection = 'improved' | 'worsened' | 'stable'

export type DomainNarrativeOutcome =
  | 'confirmed_improvement'
  | 'partial_improvement'
  | 'external_pressure'
  | 'intervention_insufficient'
  | 'stable_maintained'
  | 'stable_unresolved'

export interface DomainDeltaResult {
  domain:    keyof DomainScores
  delta:     number
  direction: DeltaDirection
  outcome:   DomainNarrativeOutcome
  narrative: string
}

export interface BaselineDeltaResult {
  baseline_id:                string
  update_id:                  string
  domain_results:             DomainDeltaResult[]
  load_delta:                 number
  load_direction:             DeltaDirection
  energy_tax_delta:           number
  system_state_change:        string
  system_state_shifted:       boolean
  // THRESHOLD AXIS — sensor / seeker / anchor
  sensory_pattern_change:     boolean
  // INTEGRATION AXIS — integrative / mixed / accumulative (tracked separately)
  integration_pattern_change: boolean
  integration_pattern_shift:  string | null
  subjective_score:           number
  subjective_direction:       DeltaDirection
  subjective_matches_data:    boolean
  overall_progress:           ProgressClassification
  priority_attention:         (keyof DomainScores)[]
  context_flags: {
    env_change_sleep:    string[]
    env_change_day:      string[]
    life_context_change: string[]
    strain_shift:        boolean
  }
}

export type ProgressClassification =
  | 'clear_progress'
  | 'data_progress'
  | 'felt_progress'
  | 'stable'
  | 'under_external_pressure'
  | 'needs_attention'

const MEANINGFUL_LOAD_DELTA = 10
const STABLE_BAND           = 5

const INTEGRATION_SEVERITY: Record<string, number> = {
  integrative: 0, mixed: 1, accumulative: 2
}

const getDeltaDirection = (delta: number, threshold = STABLE_BAND): DeltaDirection => {
  if (delta < -threshold) return 'improved'
  if (delta >  threshold) return 'worsened'
  return 'stable'
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBJECTIVE DIRECTION
// Operates at the whole-system level only. 1–2 = worsened, 4–5 = improved.
// ─────────────────────────────────────────────────────────────────────────────
const getSubjectiveDirection = (score: number): DeltaDirection => {
  if (score >= 4) return 'improved'
  if (score <= 2) return 'worsened'
  return 'stable'
}

const hasLifeContextChange = (flags: string[]): boolean =>
  flags.length > 0 && !flags.includes('Nothing significant')

const getIntegrationPatternShift = (
  baseline: string | undefined,
  update:   string | undefined
): string | null => {
  if (!baseline || !update || baseline === update) return null
  const label = (p: string) => p.charAt(0).toUpperCase() + p.slice(1)
  return `${label(baseline)} → ${label(update)}`
}

const integrationPatternWorsened = (
  baseline: string | undefined,
  update:   string | undefined
): boolean => {
  if (!baseline || !update || baseline === update) return false
  return (INTEGRATION_SEVERITY[update] ?? 0) > (INTEGRATION_SEVERITY[baseline] ?? 0)
}

const DOMAIN_LABELS: Record<keyof DomainScores, string> = {
  cii: 'Sleep & Energy Rhythm',
  ali: 'Nervous System Activation',
  pli: 'Spatial Clarity',
  stl: 'Sensory Environment',
  rci: 'Recovery Capacity'
}

const buildDomainNarrative = (
  domain:       keyof DomainScores,
  outcome:      DomainNarrativeOutcome,
  delta:        number,
  contextFlags: string[]
): string => {
  const label       = DOMAIN_LABELS[domain]
  const improvement = Math.abs(Math.round(delta))
  switch (outcome) {
    case 'confirmed_improvement':
      return `${label} has measurably improved. The changes you made are working: keep it up!`
    case 'partial_improvement':
      return `${label} shows a quantitative shift of ${improvement} points. This is common in the early stages when the nervous system often lags behind environmental changes by several weeks.`
    case 'external_pressure':
      return `The friction level for ${label} has increased, but your context flags suggest that this is being driven by ${contextFlags.join(', ').toLowerCase()} rather than an environmental failure. Hold on to the changes you have made.`
    case 'intervention_insufficient':
      return `${label} remains elevated. The current environmental changes have not resolved the source of friction in this domain. A targeted intervention is recommended.`
    case 'stable_maintained':
      return `${label} is holding steady. If this domain was already low-friction at baseline, this would be a positive outcome. If it was elevated, then stability indicates that the intervention has not yet reached this area.`
    case 'stable_unresolved':
      return `${label} scores are stable but the friction in this area has not been resolved. This is worth noting for your next session.`
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN OUTCOME RESOLUTION
//
// Self-direction removed — outcomes are now resolved from the computed
// delta direction and life context flag alone. The subjective score
// operates at the whole-system level and does not map per-domain.
// ─────────────────────────────────────────────────────────────────────────────
const resolveDomainOutcome = (
  direction:       DeltaDirection,
  lifeContextFlag: boolean
): DomainNarrativeOutcome => {
  if (direction === 'improved')                  return 'confirmed_improvement'
  if (direction === 'worsened' && lifeContextFlag) return 'external_pressure'
  if (direction === 'worsened' && !lifeContextFlag) return 'intervention_insufficient'
  if (direction === 'stable')                    return 'stable_maintained'
  return 'stable_unresolved'
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export const calculateBaselineDelta = (
  baselineResult: NeuroLoadResult,
  updateResult:   NeuroLoadResult,
  baselineId:     string,
  updateId:       string,
  deltaFields: {
    // Per-domain self-deltas removed — computed from snapshots directly
    subjective_alignment_score: number
    env_change_sleep:           string[]
    env_change_day:             string[]
    life_context_change:        string[]
  }
): BaselineDeltaResult => {

  const lifeContextFlag = hasLifeContextChange(deltaFields.life_context_change)

  // ── Domain results ──────────────────────────────────────────────────────
  const domainResults: DomainDeltaResult[] = (
    Object.keys(baselineResult.percentIndices) as (keyof DomainScores)[]
  ).map(domain => {
    const delta     = updateResult.percentIndices[domain] - baselineResult.percentIndices[domain]
    const direction = getDeltaDirection(delta)
    const outcome   = resolveDomainOutcome(direction, lifeContextFlag)
    const narrative = buildDomainNarrative(domain, outcome, delta, deltaFields.life_context_change)
    return { domain, delta: Math.round(delta), direction, outcome, narrative }
  })

  // ── Load delta ──────────────────────────────────────────────────────────
  const loadDelta      = updateResult.finalNeuroLoad - baselineResult.finalNeuroLoad
  const loadDirection  = getDeltaDirection(loadDelta, MEANINGFUL_LOAD_DELTA)
  const energyTaxDelta = updateResult.energyTaxBaseline - baselineResult.energyTaxBaseline

  // ── System state ────────────────────────────────────────────────────────
  const systemStateChanged = updateResult.systemState !== baselineResult.systemState
  const systemStateChange  = `${baselineResult.systemState} → ${updateResult.systemState}`

  // ── Threshold axis — sensor / seeker / anchor ───────────────────────────
  const sensoryPatternChange =
    updateResult.sensoryProfile.pattern !== baselineResult.sensoryProfile.pattern

  // ── Integration axis ────────────────────────────────────────────────────
  const baselineIntPattern = baselineResult.integrationProfile?.integrationPattern
  const updateIntPattern   = updateResult.integrationProfile?.integrationPattern

  const integrationPatternChange = !!baselineIntPattern && !!updateIntPattern &&
    baselineIntPattern !== updateIntPattern

  const integrationPatternShift = getIntegrationPatternShift(baselineIntPattern, updateIntPattern)
  const intPatternWorsened      = integrationPatternWorsened(baselineIntPattern, updateIntPattern)

  // ── Subjective score — whole-system signal ──────────────────────────────
  const subjectiveScore     = deltaFields.subjective_alignment_score
  const subjectiveDirection = getSubjectiveDirection(subjectiveScore)

  const subjectiveMatchesData = (
    (loadDirection === 'improved' && subjectiveDirection === 'improved') ||
    (loadDirection === 'worsened' && subjectiveDirection === 'worsened') ||
    (loadDirection === 'stable'   && subjectiveDirection === 'stable')
  )

  // ── Overall progress classification ─────────────────────────────────────
  // Integration worsening downgrades 'clear_progress' → 'data_progress':
  // a load improvement is not a clear win if accumulation has increased.
  let overall: ProgressClassification
  if (loadDirection === 'improved' && subjectiveMatchesData && !intPatternWorsened) {
    overall = 'clear_progress'
  } else if (loadDirection === 'improved' && (!subjectiveMatchesData || intPatternWorsened)) {
    overall = 'data_progress'
  } else if (loadDirection !== 'improved' && subjectiveDirection === 'improved') {
    overall = 'felt_progress'
  } else if (Math.abs(loadDelta) <= STABLE_BAND) {
    overall = 'stable'
  } else if (loadDirection === 'worsened' && lifeContextFlag) {
    overall = 'under_external_pressure'
  } else {
    overall = 'needs_attention'
  }

  // ── Priority domains ────────────────────────────────────────────────────
  const priorityAttention = domainResults
    .filter(r =>
      r.direction === 'worsened' ||
      r.outcome   === 'intervention_insufficient' ||
      updateResult.percentIndices[r.domain] > 60
    )
    .map(r => r.domain)

  const strainShift = baselineResult.primaryStrain !== updateResult.primaryStrain

  return {
    baseline_id:                baselineId,
    update_id:                  updateId,
    domain_results:             domainResults,
    load_delta:                 Math.round(loadDelta),
    load_direction:             loadDirection,
    energy_tax_delta:           Math.round(energyTaxDelta),
    system_state_change:        systemStateChange,
    system_state_shifted:       systemStateChanged,
    sensory_pattern_change:     sensoryPatternChange,
    integration_pattern_change: integrationPatternChange,
    integration_pattern_shift:  integrationPatternShift,
    subjective_score:           subjectiveScore,
    subjective_direction:       subjectiveDirection,
    subjective_matches_data:    subjectiveMatchesData,
    overall_progress:           overall,
    priority_attention:         priorityAttention,
    context_flags: {
      env_change_sleep:    deltaFields.env_change_sleep,
      env_change_day:      deltaFields.env_change_day,
      life_context_change: deltaFields.life_context_change,
      strain_shift:        strainShift
    }
  }
}

// =============================================================================
// NUDGE SYSTEM
// =============================================================================

export interface NudgeConfig {
  show:         boolean
  level:        'soft' | 'present' | 'none'
  days_elapsed: number
  label:        string
  sublabel:     string
}

export const shouldShowNudge = (
  baselineCreatedAt:   string | null,
  lastUpdateCreatedAt: string | null,
  todayOverride?:      Date
): NudgeConfig => {

  if (!baselineCreatedAt) {
    return { show: false, level: 'none', days_elapsed: 0, label: '', sublabel: '' }
  }

  const today      = todayOverride ?? new Date()
  const lastUpdate = lastUpdateCreatedAt ? new Date(lastUpdateCreatedAt) : null
  const baseline   = new Date(baselineCreatedAt)

  const referenceDate = lastUpdate ?? baseline
  const daysElapsed   = Math.floor(
    (today.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysElapsed < 14) {
    return { show: false, level: 'none', days_elapsed: daysElapsed, label: '', sublabel: '' }
  }

  if (daysElapsed <= 20) {
    return {
      show:     true,
      level:    'soft',
      days_elapsed: daysElapsed,
      label:    'It has been two weeks. Your home has been working.',
      sublabel: 'Ready to see what shifted? The check-in takes 3–4 minutes.'
    }
  }

  return {
    show:     true,
    level:    'present',
    days_elapsed: daysElapsed,
    label:    `${daysElapsed} days since your last check-in.`,
    sublabel: 'Your progress data is waiting. It only takes 3–4 minutes.'
  }
}
