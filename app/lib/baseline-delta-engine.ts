// =============================================================================
// BASELINE DELTA ENGINE — The Sentient Home
// =============================================================================
//
// PURPOSE:
//   Compares a completed update assessment against the stored baseline to
//   produce domain-level deltas, a narrative outcome per domain, an overall
//   progress classification, and the subjective alignment check.
//
// ALSO EXPORTS:
//   shouldShowNudge()   — passive dashboard check, no CRON required
//   UpdateNudgeBanner   — React component, renders conditionally on dashboard load
//
// STORAGE SCHEMA (additions required on assessments table):
//   assessment_type        varchar  'baseline' | 'update'
//   compared_to            uuid     references assessments.id (update records only)
//   cii_delta_self         int      1–5 comparative self-report
//   ali_delta_self         int      1–5
//   pli_delta_self         int      1–5
//   stl_delta_self         int      1–5
//   rci_delta_self         int      1–5
//   subjective_alignment_score int  1–5
//   env_change_sleep       text[]
//   env_change_day         text[]
//   life_context_change    text[]
//   strain_shift           boolean
//
// =============================================================================

import type { DomainScores, NeuroLoadResult } from './scoring-engine'

// ==============================
// TYPES
// ==============================

export interface DomainDelta {
  cii: number
  ali: number
  pli: number
  stl: number
  rci: number
}

// Direction: negative = improved (less friction), positive = worsened
export type DeltaDirection = 'improved' | 'worsened' | 'stable'

export type DomainNarrativeOutcome =
  | 'confirmed_improvement'     // quantitative improved + self reports better
  | 'partial_improvement'       // quantitative improved + self neutral/worse
  | 'external_pressure'         // quantitative worsened + life context change present
  | 'intervention_insufficient' // quantitative worsened + no life context change
  | 'stable_maintained'         // quantitative stable + self neutral or better
  | 'stable_unresolved'         // quantitative stable + self reports worse

export interface DomainDeltaResult {
  domain:       keyof DomainScores
  delta:        number             // update percentIndex - baseline percentIndex
  direction:    DeltaDirection
  self_delta:   number             // 1–5 comparative self-report (3 = neutral)
  outcome:      DomainNarrativeOutcome
  narrative:    string             // human-readable synthesis sentence
}

export interface BaselineDeltaResult {
  baseline_id:            string
  update_id:              string
  domain_results:         DomainDeltaResult[]
  load_delta:             number                // update finalNeuroLoad - baseline finalNeuroLoad
  load_direction:         DeltaDirection
  energy_tax_delta:       number
  system_state_change:    string               // e.g. 'Structural Friction → Regulated but Taxed'
  system_state_shifted:   boolean
  sensory_pattern_change: boolean
  subjective_score:       number               // 1–5
  subjective_direction:   DeltaDirection
  subjective_matches_data: boolean
  overall_progress:       ProgressClassification
  priority_attention:     (keyof DomainScores)[]  // domains still needing work
  context_flags: {
    env_change_sleep:     string[]
    env_change_day:       string[]
    life_context_change:  string[]
    strain_shift:         boolean
  }
}

export type ProgressClassification =
  | 'clear_progress'          // load improved ≥10 + subjective matches
  | 'data_progress'           // load improved ≥10 + subjective does not match
  | 'felt_progress'           // load stable/worsened + subjective improved
  | 'stable'                  // both stable within ±5
  | 'under_external_pressure' // worsened + life context flags present
  | 'needs_attention'         // worsened, no external explanation

// ==============================
// THRESHOLDS
// ==============================

const MEANINGFUL_LOAD_DELTA     = 10   // points — minimum shift considered meaningful
const STABLE_BAND               = 5    // ±5 points considered stable, not worsened
const MEANINGFUL_DOMAIN_DELTA   = 8    // per-domain threshold for flagging change
const SELF_DELTA_IMPROVED       = 4    // ≥4 = user reports improvement
const SELF_DELTA_WORSENED       = 2    // ≤2 = user reports worsening

// ==============================
// HELPERS
// ==============================

const getDeltaDirection = (delta: number, threshold = STABLE_BAND): DeltaDirection => {
  // Negative delta = less friction = improved
  if (delta < -threshold) return 'improved'
  if (delta >  threshold) return 'worsened'
  return 'stable'
}

const getSelfDirection = (selfScore: number): DeltaDirection => {
  if (selfScore >= SELF_DELTA_IMPROVED) return 'improved'
  if (selfScore <= SELF_DELTA_WORSENED) return 'worsened'
  return 'stable'
}

const hasLifeContextChange = (flags: string[]): boolean =>
  flags.length > 0 && !flags.includes('Nothing significant')

// ==============================
// DOMAIN NARRATIVE MAP
// ==============================

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
  const label = DOMAIN_LABELS[domain]
  const improvement = Math.abs(Math.round(delta))

  switch (outcome) {
    case 'confirmed_improvement':
      return `${label} has measurably improved and you feel the difference. The changes you made are working — protect them.`

    case 'partial_improvement':
      return `${label} shows a quantitative shift of ${improvement} points, but your felt sense does not yet match the data. This is common in the early stages — the nervous system often lags behind environmental changes by several weeks.`

    case 'external_pressure':
      return `${label} has increased friction, but your context flags suggest this is being driven by ${contextFlags.join(', ').toLowerCase()} rather than an environmental failure. Hold the changes you have made.`

    case 'intervention_insufficient':
      return `${label} remains elevated. The current environmental changes have not addressed the friction source in this domain. A targeted intervention is recommended.`

    case 'stable_maintained':
      return `${label} is holding steady. If this domain was already low-friction at baseline, that is a positive outcome. If it was elevated, stability means the intervention has not yet reached this area.`

    case 'stable_unresolved':
      return `${label} scores are stable, but you report feeling worse in this area. This may indicate a friction source not yet captured by the assessment questions. Worth noting in your next session.`
  }
}

// ==============================
// DOMAIN OUTCOME RESOLVER
// ==============================

const resolveDomainOutcome = (
  direction:       DeltaDirection,
  selfDirection:   DeltaDirection,
  lifeContextFlag: boolean
): DomainNarrativeOutcome => {
  if (direction === 'improved' && selfDirection === 'improved')   return 'confirmed_improvement'
  if (direction === 'improved' && selfDirection !== 'improved')   return 'partial_improvement'
  if (direction === 'worsened' && lifeContextFlag)                return 'external_pressure'
  if (direction === 'worsened' && !lifeContextFlag)               return 'intervention_insufficient'
  if (direction === 'stable'   && selfDirection !== 'worsened')   return 'stable_maintained'
  return 'stable_unresolved'
}

// ==============================
// MAIN DELTA CALCULATOR
// ==============================

export const calculateBaselineDelta = (
  baselineResult:   NeuroLoadResult,
  updateResult:     NeuroLoadResult,
  baselineId:       string,
  updateId:         string,
  deltaFields: {
    cii_delta_self:            number
    ali_delta_self:            number
    pli_delta_self:            number
    stl_delta_self:            number
    rci_delta_self:            number
    subjective_alignment_score: number
    env_change_sleep:          string[]
    env_change_day:            string[]
    life_context_change:       string[]
  }
): BaselineDeltaResult => {

  const lifeContextFlag = hasLifeContextChange(deltaFields.life_context_change)

  // ---- DOMAIN DELTAS ----

  const selfDeltaMap: Record<keyof DomainScores, number> = {
    cii: deltaFields.cii_delta_self,
    ali: deltaFields.ali_delta_self,
    pli: deltaFields.pli_delta_self,
    stl: deltaFields.stl_delta_self,
    rci: deltaFields.rci_delta_self
  }

  const domainResults: DomainDeltaResult[] = (
    Object.keys(baselineResult.percentIndices) as (keyof DomainScores)[]
  ).map(domain => {
    const delta       = updateResult.percentIndices[domain] - baselineResult.percentIndices[domain]
    const direction   = getDeltaDirection(delta)
    const selfDelta   = selfDeltaMap[domain]
    const selfDir     = getSelfDirection(selfDelta)
    const outcome     = resolveDomainOutcome(direction, selfDir, lifeContextFlag)
    const narrative   = buildDomainNarrative(domain, outcome, delta, deltaFields.life_context_change)

    return { domain, delta: Math.round(delta), direction, self_delta: selfDelta, outcome, narrative }
  })

  // ---- LOAD DELTA ----

  const loadDelta     = updateResult.finalNeuroLoad - baselineResult.finalNeuroLoad
  const loadDirection = getDeltaDirection(loadDelta, MEANINGFUL_LOAD_DELTA)

  // ---- ENERGY TAX DELTA ----

  const energyTaxDelta = updateResult.energyTaxBaseline - baselineResult.energyTaxBaseline

  // ---- SYSTEM STATE ----

  const systemStateChanged  = updateResult.systemState !== baselineResult.systemState
  const systemStateChange   = `${baselineResult.systemState} → ${updateResult.systemState}`

  // ---- SENSORY PATTERN ----

  const sensoryPatternChange = updateResult.sensoryProfile.pattern !== baselineResult.sensoryProfile.pattern

  // ---- SUBJECTIVE ALIGNMENT ----

  const subjectiveScore     = deltaFields.subjective_alignment_score
  const subjectiveDirection = getSelfDirection(subjectiveScore)

  // Subjective matches data when both move in the same direction.
  // Negative load delta = improved; subjective ≥4 = improved → match.
  const subjectiveMatchesData = (
    (loadDirection === 'improved' && subjectiveDirection === 'improved') ||
    (loadDirection === 'worsened' && subjectiveDirection === 'worsened') ||
    (loadDirection === 'stable'   && subjectiveDirection === 'stable')
  )

  // ---- OVERALL PROGRESS CLASSIFICATION ----

  let overall: ProgressClassification

  if (loadDirection === 'improved' && subjectiveMatchesData) {
    overall = 'clear_progress'
  } else if (loadDirection === 'improved' && !subjectiveMatchesData) {
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

  // ---- PRIORITY ATTENTION DOMAINS ----
  // Domains where quantitative friction remains elevated (>60%) or worsened

  const priorityAttention = domainResults
    .filter(r =>
      r.direction === 'worsened' ||
      r.outcome === 'intervention_insufficient' ||
      updateResult.percentIndices[r.domain] > 60
    )
    .map(r => r.domain)

  // ---- STRAIN SHIFT ----

  const strainShift = baselineResult.primaryStrain !== updateResult.primaryStrain

  return {
    baseline_id:            baselineId,
    update_id:              updateId,
    domain_results:         domainResults,
    load_delta:             Math.round(loadDelta),
    load_direction:         loadDirection,
    energy_tax_delta:       Math.round(energyTaxDelta),
    system_state_change:    systemStateChange,
    system_state_shifted:   systemStateChanged,
    sensory_pattern_change: sensoryPatternChange,
    subjective_score:       subjectiveScore,
    subjective_direction:   subjectiveDirection,
    subjective_matches_data: subjectiveMatchesData,
    overall_progress:       overall,
    priority_attention:     priorityAttention,
    context_flags: {
      env_change_sleep:     deltaFields.env_change_sleep,
      env_change_day:       deltaFields.env_change_day,
      life_context_change:  deltaFields.life_context_change,
      strain_shift:         strainShift
    }
  }
}

// =============================================================================
// NUDGE SYSTEM — NO CRON REQUIRED
// =============================================================================
//
// How it works:
//   1. On every dashboard load, shouldShowNudge() queries the assessments
//      table for the user's most recent baseline and any existing updates.
//   2. If ≥14 days have passed since baseline with no update, it returns
//      a nudge config (level, days elapsed, label copy).
//   3. The React component UpdateNudgeBanner renders conditionally on the
//      dashboard — never intrusive, dismissible per session via local state.
//   4. No CRON job. No email infrastructure. No scheduled process.
//      The check costs a single lightweight Supabase query per dashboard visit.
//
// Nudge levels:
//   'soft'     14–20 days — gentle prompt, easily dismissed
//   'present'  21+ days   — slightly more prominent, still non-blocking
//
// =============================================================================

export interface NudgeConfig {
  show:         boolean
  level:        'soft' | 'present' | 'none'
  days_elapsed: number
  label:        string
  sublabel:     string
}

export const shouldShowNudge = (
  baselineCreatedAt:   string | null,   // ISO date string from assessments table
  lastUpdateCreatedAt: string | null,   // null if no update exists yet
  todayOverride?:      Date             // for testing
): NudgeConfig => {

  if (!baselineCreatedAt) {
    return { show: false, level: 'none', days_elapsed: 0, label: '', sublabel: '' }
  }

  const today     = todayOverride ?? new Date()
  const baseline  = new Date(baselineCreatedAt)
  const lastUpdate = lastUpdateCreatedAt ? new Date(lastUpdateCreatedAt) : null

  // Days since baseline (or last update if one exists)
  const referenceDate  = lastUpdate ?? baseline
  const msElapsed      = today.getTime() - referenceDate.getTime()
  const daysElapsed    = Math.floor(msElapsed / (1000 * 60 * 60 * 24))

  if (daysElapsed < 14) {
    return { show: false, level: 'none', days_elapsed: daysElapsed, label: '', sublabel: '' }
  }

  if (daysElapsed >= 14 && daysElapsed <= 20) {
    return {
      show:         true,
      level:        'soft',
      days_elapsed: daysElapsed,
      label:        'It has been two weeks. Your home has been working.',
      sublabel:     'Ready to see what shifted? The check-in takes 3–4 minutes.'
    }
  }

  // 21+ days
  return {
    show:         true,
    level:        'present',
    days_elapsed: daysElapsed,
    label:        `${daysElapsed} days since your last check-in.`,
    sublabel:     'Your progress data is waiting. It only takes 3–4 minutes.'
  }
}
