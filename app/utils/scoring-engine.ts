// =============================================================================
// SCORING ENGINE — The Sentient Home
// =============================================================================
//
// CHANGE LOG (this version):
//
//   1. CHOICE MAP — string responses (primary_strain, q_state) are now
//      parsed into a separate choiceMap. Previously swallowed silently
//      by the numeric-only responseMap filter.
//
//   2. PRIMARY_STRAIN PRE-WEIGHTING (Step 3a) — self-reported strain
//      applies additive boosts to relevant domain weights before scale
//      responses are scored. Represents transient state; kept modest (≤+0.08)
//      so it can be overridden if scale responses disagree.
//
//   3. NEURO_LENS WEIGHTS (Step 3b) — unchanged in direction but now
//      applied AFTER primary_strain boosts, so neurological trait and
//      current state stack correctly rather than competing.
//
//   4. THRESHOLD REBALANCING (Step 4) — replaced the q14*20, q22*20,
//      q23*20 scaling hack with proper 0–100 normalisation and explicit
//      fractional weights. Eliminates single-item equality with full domains.
//
//   5. BLEND LOGIC (Step 6) — neuro_lens now modulates the derived
//      sensoryProfile when threshold scores fall within an ambiguous zone
//      (differential ≤ BLEND_AMBIGUITY_THRESHOLD). Outside that zone the
//      derived pattern governs unconditionally. blendApplied flag returned.
//
//   6. ENERGY_TAX MODIFIER (Step 9) — gentle ±0.08 modifier on the final
//      composite, centred at 50%. Reflects the user's self-reported
//      environmental management burden as a baseline load signal.
//
//   7. EXTENDED RETURN — energyTaxBaseline, primaryStrain, blendApplied,
//      thresholdDifferential added for tracking and UI transparency.
//
// =============================================================================

// ==============================
// 1. DOMAIN CONFIGURATION
// ==============================

const DOMAIN_MAX = {
  cii: 25,  // q5–q9
  ali: 25,  // q10–q14
  pli: 25,  // q15–q19
  stl: 35,  // q20–q26
  rci: 35   // q27–q33
}

const BASE_WEIGHTS = {
  cii: 1.3,
  ali: 1.4,
  pli: 1.0,
  stl: 1.1,
  rci: 1.5
}

const INTERACTION_THRESHOLD = 60
const MAX_INTERACTION_AMPLIFIER = 0.12

// Threshold differential below which neuro_lens tiebreaks the pattern.
// At ≤20 points the two candidate scores are too close to resolve from
// scale responses alone — neurotype becomes the deciding signal.
const BLEND_AMBIGUITY_THRESHOLD = 20

// Maximum energy_tax modifier: ±0.08 (8 points at 0% or 100% energy_tax).
// Centred at 50% (neutral). Kept deliberately gentle so Part 0 self-report
// sensitises the score without dominating it.
const ENERGY_TAX_SCALE = 625  // (100-50)/0.08 = 625

// ==============================
// 2. TYPES
// ==============================

export type NeuroLens =
  | 'adhd'
  | 'autism'
  | 'hsp'
  | 'dyslexia'
  | 'spd'
  | 'neurotypical'

export type SensoryThreshold = 'low' | 'high'
export type RegulationStyle  = 'active' | 'passive'
export type SensoryPattern   =
  | 'sensitive'
  | 'avoider'
  | 'low_registration'
  | 'seeker'

export interface DomainScores {
  cii: number
  ali: number
  pli: number
  stl: number
  rci: number
}

export interface InteractionFlags {
  restorativeDeficit:       boolean
  sensoryHypervigilance:    boolean
  cognitiveStrain:          boolean
}

export interface SensoryProfile {
  threshold:            SensoryThreshold
  regulation:           RegulationStyle
  pattern:              SensoryPattern
  // Blend metadata
  blendApplied:         boolean  // true when neuro_lens tiebreak was used
  thresholdDifferential: number  // absolute score gap (0–100); low = ambiguous
}

export interface NeuroLoadResult {
  rawIndices:           DomainScores
  percentIndices:       DomainScores
  weightedIndices:      DomainScores
  finalNeuroLoad:       number
  systemState:          string
  interactionFlags:     InteractionFlags
  priorityDomains:      { id: keyof DomainScores; score: number }[]
  recoveryModifier:     'protective' | 'compounding' | 'neutral'
  sensoryProfile:       SensoryProfile
  // Part 0 outputs — stored for tracking and modifier application
  energyTaxBaseline:    number   // raw 0–100 slider value
  primaryStrain:        string   // raw choice string
}

// ==============================
// 3. QUESTION MAPPING
// ==============================

const DOMAIN_QUESTIONS: Record<keyof DomainScores, string[]> = {
  cii: ['q5', 'q6', 'q7', 'q8', 'q9'],
  ali: ['q10', 'q11', 'q12', 'q13', 'q14'],
  pli: ['q15', 'q16', 'q17', 'q18', 'q19'],
  stl: ['q20', 'q21', 'q22', 'q23', 'q24', 'q25', 'q26'],
  rci: ['q27', 'q28', 'q29', 'q30', 'q31', 'q32', 'q33']
}

const REVERSE_SCORED = new Set(['q33'])

// ==============================
// 4. PRIMARY STRAIN → DOMAIN PRE-WEIGHTS
// ==============================
//
// Additive boosts applied to BASE_WEIGHTS before neuro_lens adjustment.
// Modest (max +0.08 per domain) so scale responses can override them.
// Intentionally additive (not multiplicative) — primary_strain is a
// transient self-reported state, not a structural trait.
//
// Mapping rationale:
//   Mental overload    → PLI (spatial/cognitive clarity) + ALI (vigilance)
//   Physical tension   → ALI (stress axis is the primary physical load domain)
//   Emotional volatility → ALI (nervous system activation) + RCI (recovery)
//   Sleep disruption   → CII (circadian rhythm) + RCI (recovery deficit)
//   None of the above  → no adjustment

const STRAIN_DOMAIN_BOOST: Record<string, Partial<Record<keyof DomainScores, number>>> = {
  'Mental overload':      { pli: 0.08, ali: 0.05 },
  'Physical tension':     { ali: 0.08 },
  'Emotional volatility': { ali: 0.05, rci: 0.08 },
  'Sleep disruption':     { cii: 0.08, rci: 0.05 },
  'None of the above':    {}
}

// ==============================
// 5. NEURO_LENS → THRESHOLD BIAS
// ==============================
//
// Clinical associations used in blend tiebreaker (Step 6).
// Only applied when thresholdDifferential ≤ BLEND_AMBIGUITY_THRESHOLD.
//
// HSP:    consistently associated with lower neurological threshold
// Autism: frequently associated with lower threshold (hyper-sensitivity pattern)
// ADHD:   frequently associated with higher threshold (sensory seeking)
// SPD:    too heterogeneous for a directional bias — no assignment
// Dyslexia: sensory threshold not a primary characteristic — no assignment
// neurotypical: no bias applied

const LENS_THRESHOLD_BIAS: Partial<Record<NeuroLens, SensoryThreshold>> = {
  hsp:    'low',
  autism: 'low',
  adhd:   'high',
  // spd, dyslexia, neurotypical: intentionally unset
}

// ==============================
// 6. HELPERS
// ==============================

const reverseScore = (val: number) => 6 - val

const clamp = (num: number, min = 0, max = 100) =>
  Math.min(Math.max(num, min), max)

// Normalises a 1–5 scale response to 0–100
const normToHundred = (val: number): number => (val - 1) / 4 * 100

// ==============================
// 7. MAIN ENGINE
// ==============================

export const calculateNeuroLoad = (
  responses: { question_key: string; answer: { response: any } }[],
  neuroLensRaw: string = 'None'
): NeuroLoadResult => {

  // ==============================
  // STEP 0 — NORMALISE NEURO LENS
  // ==============================

  let neuroLens: NeuroLens = 'neurotypical'
  const normalizedLens = (neuroLensRaw || 'None').toLowerCase()

  if (normalizedLens.includes('adhd'))     neuroLens = 'adhd'
  else if (normalizedLens.includes('autism'))   neuroLens = 'autism'
  else if (normalizedLens.includes('hsp'))      neuroLens = 'hsp'
  else if (normalizedLens.includes('dyslexia')) neuroLens = 'dyslexia'
  else if (normalizedLens.includes('spd'))      neuroLens = 'spd'

  if (!responses || responses.length === 0) {
    throw new Error('No assessment responses provided.')
  }

  // ==============================
  // STEP 1 — BUILD RESPONSE MAPS
  // ==============================
  //
  // Two maps are required:
  //   responseMap — numeric scale and slider answers (q5–q33, energy_tax)
  //   choiceMap   — string choice answers (primary_strain, q_state, neuro_lens)
  //
  // Previously only responseMap existed, which meant primary_strain and
  // q_state were silently dropped with no downstream effect.

  const responseMap = new Map<string, number>()
  const choiceMap   = new Map<string, string>()

  responses.forEach(r => {
    const val = r.answer.response
    if (typeof val === 'number') {
      responseMap.set(r.question_key, val)
    } else if (typeof val === 'string') {
      choiceMap.set(r.question_key, val)
    }
  })

  // ==============================
  // STEP 2 — EXTRACT PART 0 DATA
  // ==============================

  // energy_tax: 0–100 slider, clamped for safety
  const energyTaxRaw   = responseMap.get('energy_tax') ?? 50
  const energyTax      = clamp(energyTaxRaw, 0, 100)

  // primary_strain: choice string, normalised
  const primaryStrain  = choiceMap.get('primary_strain') ?? 'None of the above'

  const getValidatedValue = (key: string): number => {
    if (!responseMap.has(key)) return 3  // neutral fallback — prevents crash
    const raw = responseMap.get(key)!
    if (raw < 1 || raw > 5) return 3
    return REVERSE_SCORED.has(key) ? reverseScore(raw) : raw
  }

  // ==============================
  // STEP 3 — RAW DOMAIN SCORES
  // ==============================

  const rawIndices = Object.keys(DOMAIN_QUESTIONS).reduce(
    (acc, domain) => {
      const questions = DOMAIN_QUESTIONS[domain as keyof DomainScores]
      acc[domain as keyof DomainScores] =
        questions.reduce((sum, q) => sum + getValidatedValue(q), 0)
      return acc
    },
    {} as DomainScores
  )

  // ==============================
  // STEP 4 — NORMALISE TO PERCENT
  // ==============================

  const percentIndices: DomainScores = {
    cii: (rawIndices.cii / DOMAIN_MAX.cii) * 100,
    ali: (rawIndices.ali / DOMAIN_MAX.ali) * 100,
    pli: (rawIndices.pli / DOMAIN_MAX.pli) * 100,
    stl: (rawIndices.stl / DOMAIN_MAX.stl) * 100,
    rci: (rawIndices.rci / DOMAIN_MAX.rci) * 100
  }

  // ==============================
  // STEP 5a — PRIMARY STRAIN PRE-WEIGHTING
  // ==============================
  //
  // Additive boost to BASE_WEIGHTS based on user's self-reported strain.
  // Applied before neuro_lens adjustment so structural trait (neuro_lens)
  // compounds on top of transient state (primary_strain).

  const weights = { ...BASE_WEIGHTS }

  const strainBoost = STRAIN_DOMAIN_BOOST[primaryStrain] || {}
  ;(Object.keys(strainBoost) as (keyof DomainScores)[]).forEach(domain => {
    weights[domain] += strainBoost[domain] ?? 0
  })

  // ==============================
  // STEP 5b — NEURO_LENS ADAPTIVE WEIGHTS
  // ==============================
  //
  // Multiplicative adjustments applied after strain pre-weighting.
  // Represents structural neurological trait — compounds on top of state.

  if (neuroLens === 'adhd' || neuroLens === 'dyslexia') {
    weights.pli *= 1.10
  }

  if (neuroLens === 'autism' || neuroLens === 'spd') {
    weights.stl *= 1.15
  }

  if (neuroLens === 'hsp') {
    weights.stl *= 1.10
    weights.rci *= 1.05
  }

  // ==============================
  // STEP 6 — WEIGHTED INDICES
  // ==============================

  const weightedIndices: DomainScores = {
    cii: percentIndices.cii * weights.cii,
    ali: percentIndices.ali * weights.ali,
    pli: percentIndices.pli * weights.pli,
    stl: percentIndices.stl * weights.stl,
    rci: percentIndices.rci * weights.rci
  }

  // ==============================
  // STEP 7 — THRESHOLD INDEX (REBALANCED)
  // ==============================
  //
  // PREVIOUS FORMULA (problematic):
  //   lowThresholdScore  = (percentIndices.ali + percentIndices.stl + (q14 * 20)) / 3
  //   highThresholdScore = ((q22 * 20) + (q23 * 20) + (100 - percentIndices.stl)) / 3
  //
  //   Problem: q14*20, q22*20, q23*20 placed single items on a 0–100 scale
  //   then averaged equally with full domain scores. This gave a single
  //   question the same weight as a 5–7 question domain. Additionally,
  //   q14 is already captured in percentIndices.ali — double-counting it
  //   at full domain weight was disproportionate.
  //
  // NEW FORMULA:
  //   All components on genuine 0–100 scale.
  //   Explicit fractional weights that sum to 1.0.
  //   Single items weighted at 0.10–0.15, not 0.33.
  //
  // Note on double-counting:
  //   q14 contributes to percentIndices.ali AND appears here at 0.15 weight.
  //   q22, q23 contribute to percentIndices.stl AND appear here.
  //   This is intentional — these specific items are the highest-discriminating
  //   threshold indicators within their domains. The fractional weights (0.10–0.15)
  //   keep their additive contribution modest.

  const q14 = getValidatedValue('q14')
  const q22 = getValidatedValue('q22')
  const q23 = getValidatedValue('q23')
  const q30 = getValidatedValue('q30')
  const q31 = getValidatedValue('q31')

  const q14Norm = normToHundred(q14)
  const q22Norm = normToHundred(q22)
  const q23Norm = normToHundred(q23)

  // Low threshold: high autonomic vigilance + high sensory load + noticing tendency
  // Weights: ali (45%) + stl (40%) + q14 noticing item (15%) = 1.00
  const lowThresholdScore =
    percentIndices.ali * 0.45 +
    percentIndices.stl * 0.40 +
    q14Norm            * 0.15

  // High threshold: hypo-registration items + low sensory load
  // q22 (don't notice until very strong) + q23 (quiet = dull) are the
  // clearest hypo-registration indicators. Inverted STL captures overall
  // sensory tolerance.
  // Weights: q22 (35%) + q23 (35%) + (100 - stl) (30%) = 1.00
  const highThresholdScore =
    q22Norm                    * 0.35 +
    q23Norm                    * 0.35 +
    (100 - percentIndices.stl) * 0.30

  // Derived threshold — will be checked for blend override below
  const derivedThreshold: SensoryThreshold =
    lowThresholdScore >= highThresholdScore ? 'low' : 'high'

  // ==============================
  // STEP 8 — REGULATION STYLE
  // ==============================

  const activeScore = (q30 + q31) / 2
  const regulation: RegulationStyle =
    activeScore >= 3.5 ? 'active' : 'passive'

  // ==============================
  // STEP 9 — BLEND LOGIC
  // ==============================
  //
  // When the two threshold scores are close (differential ≤ BLEND_AMBIGUITY_THRESHOLD),
  // the derived pattern is uncertain — scale responses alone cannot reliably
  // discriminate. In this zone, neuro_lens provides the tiebreaker because
  // neurotype carries clinical weight that scale questions cannot fully capture.
  //
  // When differential > BLEND_AMBIGUITY_THRESHOLD, the derived pattern is
  // unambiguous and governs unconditionally. neuro_lens still affects weights
  // (Step 5b) but does not change the pattern classification.
  //
  // blendApplied is returned so the UI can acknowledge when the tiebreak fired.

  const thresholdDifferential = Math.abs(lowThresholdScore - highThresholdScore)
  let finalThreshold = derivedThreshold
  let blendApplied   = false

  if (thresholdDifferential <= BLEND_AMBIGUITY_THRESHOLD) {
    const lensBias = LENS_THRESHOLD_BIAS[neuroLens]
    if (lensBias) {
      finalThreshold = lensBias
      blendApplied   = true
    }
  }

  // ==============================
  // STEP 10 — SENSORY PATTERN
  // ==============================

  let pattern: SensoryPattern

  if      (finalThreshold === 'low'  && regulation === 'passive') pattern = 'sensitive'
  else if (finalThreshold === 'low'  && regulation === 'active')  pattern = 'avoider'
  else if (finalThreshold === 'high' && regulation === 'passive') pattern = 'low_registration'
  else                                                             pattern = 'seeker'

  const sensoryProfile: SensoryProfile = {
    threshold:             finalThreshold,
    regulation,
    pattern,
    blendApplied,
    thresholdDifferential: Math.round(thresholdDifferential)
  }

  // ==============================
  // STEP 11 — INTERACTION FLAGS
  // ==============================

  const flags: InteractionFlags = {
    restorativeDeficit:
      percentIndices.cii > INTERACTION_THRESHOLD &&
      percentIndices.rci > INTERACTION_THRESHOLD,

    sensoryHypervigilance:
      percentIndices.ali > INTERACTION_THRESHOLD &&
      percentIndices.stl > INTERACTION_THRESHOLD,

    cognitiveStrain:
      percentIndices.pli > INTERACTION_THRESHOLD &&
      percentIndices.ali > INTERACTION_THRESHOLD
  }

  let interactionAmplifier = 0
  if (flags.restorativeDeficit)    interactionAmplifier += 0.05
  if (flags.sensoryHypervigilance) interactionAmplifier += 0.07
  if (flags.cognitiveStrain)       interactionAmplifier += 0.05

  interactionAmplifier = Math.min(interactionAmplifier, MAX_INTERACTION_AMPLIFIER)

  // ==============================
  // STEP 12 — RECOVERY MODIFIER
  // ==============================

  let recoveryModifier: 'protective' | 'compounding' | 'neutral' = 'neutral'
  let recoveryAdjustment = 0

  if (percentIndices.rci < 40) {
    recoveryModifier  = 'protective'
    recoveryAdjustment = -0.05
  } else if (percentIndices.rci > 70) {
    recoveryModifier  = 'compounding'
    recoveryAdjustment = 0.05
  }

  // ==============================
  // STEP 13 — ENERGY TAX MODIFIER
  // ==============================
  //
  // Gentle ±0.08 modifier on the final composite.
  // Centred at energy_tax = 50 (neutral).
  //
  //   energy_tax = 0   → modifier = -0.08 (low environmental burden, reduces load)
  //   energy_tax = 50  → modifier =  0.00 (neutral baseline)
  //   energy_tax = 100 → modifier = +0.08 (high environmental burden, amplifies load)
  //
  // Kept deliberately gentle: self-reported Part 0 data sensitises the score
  // without dominating the scale-response-derived composite. At energy_tax = 100,
  // the modifier can shift the final score by up to ~8 points.

  const energyTaxModifier = (energyTax - 50) / ENERGY_TAX_SCALE

  // ==============================
  // STEP 14 — FINAL COMPOSITE
  // ==============================

  const totalWeighted =
    weightedIndices.cii +
    weightedIndices.ali +
    weightedIndices.pli +
    weightedIndices.stl +
    weightedIndices.rci

  const maxWeighted =
    100 * weights.cii +
    100 * weights.ali +
    100 * weights.pli +
    100 * weights.stl +
    100 * weights.rci

  const baseComposite = (totalWeighted / maxWeighted) * 100

  let finalLoad = baseComposite * (
    1 +
    interactionAmplifier +
    recoveryAdjustment   +
    energyTaxModifier
  )

  finalLoad = clamp(Math.round(finalLoad))

  // ==============================
  // STEP 15 — SYSTEM STATE
  // ==============================

  let systemState: string

  if      (finalLoad <= 25) systemState = 'Resonant System'
  else if (finalLoad <= 40) systemState = 'Adaptive Strain'
  else if (finalLoad <= 60) systemState = 'Regulated but Taxed'
  else if (finalLoad <= 75) systemState = 'Dysregulated Pattern'
  else                      systemState = 'Structural Friction'

  // ==============================
  // STEP 16 — PRIORITY DOMAINS
  // ==============================

  const domainImpact = Object.entries(weightedIndices).map(([id, score]) => {
    let interactionBonus = 0

    if (
      (flags.restorativeDeficit    && (id === 'cii' || id === 'rci')) ||
      (flags.sensoryHypervigilance && (id === 'ali' || id === 'stl')) ||
      (flags.cognitiveStrain       && (id === 'pli' || id === 'ali'))
    ) {
      interactionBonus = 5
    }

    return {
      id:    id as keyof DomainScores,
      score: score + interactionBonus
    }
  })

  const priorityDomains = domainImpact
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)

  // ==============================
  // RETURN
  // ==============================

  return {
    rawIndices,
    percentIndices,
    weightedIndices,
    finalNeuroLoad:       finalLoad,
    systemState,
    interactionFlags:     flags,
    priorityDomains,
    recoveryModifier,
    sensoryProfile,
    energyTaxBaseline:    energyTax,
    primaryStrain
  }
}
