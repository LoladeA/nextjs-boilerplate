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
//   8. INTEGRATION INDEX (this version) —
//      q_int1, q_int2, q_int3 (Part 0 expansion) score into a new
//      Integration Index (0–100) representing how the nervous system
//      handles sensation once it arrives — whether it resolves
//      (integrative) or accumulates (accumulative).
//
//      The Integration Index acts as a profile modifier on the existing
//      BSFI weight system. It does not replace or override any existing
//      domain score. It reweights how scores are interpreted:
//
//        Accumulative pattern → PLI and RCI weights increase (consistency
//        and recovery become structurally non-negotiable, not periodic)
//        → ALI flagged as more serious at mid-range (system is already
//        carrying more than the score alone suggests)
//
//        Integrative pattern  → No weight change. Recovery windows work.
//        Prescriptions focus on timing and quality, not structural redesign.
//
//        Mixed pattern        → Modest PLI/RCI weight increase (0.5× the
//        accumulative boost) to acknowledge variability without overstating it.
//
//   9. PROFILE DESCRIPTOR — six plain-language profile strings derived from
//      the combination of sensoryPattern (threshold × regulation) and
//      integrationPattern. Returned as profileDescriptor for direct UI use.
//      No clinical labels are used in any descriptor string.
//
//  10. NEURO_LENS NORMALISATION PATCH — 'None / Unsure' now correctly maps
//      to 'neurotypical'. Previously only 'None' was matched; the updated
//      assessmentProtocol returns 'None / Unsure' for undiagnosed users.
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
const BLEND_AMBIGUITY_THRESHOLD = 20

// Maximum energy_tax modifier: ±0.08
const ENERGY_TAX_SCALE = 625

// Integration Index thresholds
// 0–35:  Integrative — sensation resolves with recovery
// 36–64: Mixed       — context-dependent; some environments tip accumulative
// 65–100: Accumulative — sensation layers and persists
const INTEGRATION_INTEGRATIVE_MAX  = 35
const INTEGRATION_ACCUMULATIVE_MIN = 65

// Integration pattern weight modifiers — applied additively to BASE_WEIGHTS
// after strain and neuro_lens adjustments (Step 5c).
//
// Accumulative: PLI and RCI are structurally non-negotiable for a nervous
// system that cannot quickly resolve environmental inconsistency or recover
// from accumulated load.
//
// Mixed: Half the accumulative boost — acknowledges variability without
// treating the profile as fully accumulative.
//
// Integrative: No adjustment — existing weights are calibrated for this pattern.
const INTEGRATION_WEIGHT_BOOST = {
  accumulative: { pli: 0.20, rci: 0.20 },
  mixed:        { pli: 0.10, rci: 0.10 },
  integrative:  {}
}

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

export type SensoryThreshold    = 'low' | 'high'
export type RegulationStyle     = 'active' | 'passive'
export type SensoryPattern      =
  | 'sensitive'
  | 'avoider'
  | 'low_registration'
  | 'seeker'

export type IntegrationPattern  = 'integrative' | 'mixed' | 'accumulative'

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
  // New: mid-range ALI flagged as more serious for accumulative profiles
  accumulativeALIFlag:      boolean
}

export interface SensoryProfile {
  threshold:             SensoryThreshold
  regulation:            RegulationStyle
  pattern:               SensoryPattern
  blendApplied:          boolean
  thresholdDifferential: number
}

export interface IntegrationProfile {
  integrationIndex:    number           // 0–100
  integrationPattern:  IntegrationPattern
  profileDescriptor:   string           // plain-language, no clinical labels
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
  integrationProfile:   IntegrationProfile
  // Part 0 outputs
  energyTaxBaseline:    number
  primaryStrain:        string
}

// ==============================
// 3. QUESTION MAPPING
// ==============================

const DOMAIN_QUESTIONS: Record<keyof DomainScores, string[]> = {
  cii: ['q5',  'q6',  'q7',  'q8',  'q9'],
  ali: ['q10', 'q11', 'q12', 'q13', 'q14'],
  pli: ['q15', 'q16', 'q17', 'q18', 'q19'],
  stl: ['q20', 'q21', 'q22', 'q23', 'q24', 'q25', 'q26'],
  rci: ['q27', 'q28', 'q29', 'q30', 'q31', 'q32', 'q33']
}

const REVERSE_SCORED = new Set(['q33'])

// Integration questions — all score in the same direction.
// High agreement = accumulative pattern. No reverse scoring needed.
const INTEGRATION_QUESTIONS = ['q_int1', 'q_int2', 'q_int3']

// ==============================
// 4. PRIMARY STRAIN → DOMAIN PRE-WEIGHTS
// ==============================

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

const LENS_THRESHOLD_BIAS: Partial<Record<NeuroLens, SensoryThreshold>> = {
  hsp:    'low',
  autism: 'low',
  adhd:   'high',
}

// ==============================
// 6. PROFILE DESCRIPTORS
// ==============================
//
// Six plain-language profile strings. No clinical labels.
// Keyed by `${sensoryPattern}__${integrationPattern}`.
//
// Sensory patterns:
//   sensitive        = low threshold + passive regulation
//   avoider          = low threshold + active regulation
//   low_registration = high threshold + passive regulation
//   seeker           = high threshold + active regulation
//
// Integration patterns: integrative | mixed | accumulative

const PROFILE_DESCRIPTORS: Record<string, string> = {

  // LOW THRESHOLD + INTEGRATIVE
  'sensitive__integrative':
    'You receive the world deeply, with sound, light, texture and atmosphere all landing with intensity. Your nervous system is designed to sense everything. With the right recovery conditions, it can also release and reset. Your home needs to be a genuine space for restoration, not just a quieter version of everywhere else.',

  // LOW THRESHOLD + MIXED
  'sensitive__mixed':
    'The way you experience the world depends on the day, the season, and the cumulative weight of what came before. Some environments quickly restore you. Others leave a residue that takes time to clear away. Your home needs to consistently provide a low enough load to give you a reliable baseline with genuine recovery built in, rather than assumed.',

  // LOW THRESHOLD + ACCUMULATIVE
  'sensitive__accumulative':
    'You experience the world deeply, and what you experience tends to stay with you. The effects of a difficult morning can still be present in your body by evening. Your environment is not just a backdrop; it is a constant stimulus to which your nervous system is always responding. Consistency and predictability in your surroundings are not just preferences. They are a biological requirement.',

  // LOW THRESHOLD + INTEGRATIVE (active regulation)
  'avoider__integrative':
    'You are finely attuned to your surroundings and have learnt how to shield yourself from anything that might overwhelm you. When the conditions are right, you recover well. Your home should provide a space where you don not need to constantly protect yourself, so that the energy you currently spend managing your exposure can be redirected towards enjoying it.',

  // LOW THRESHOLD + MIXED (active regulation)
  'avoider__mixed':
    'Although you are finely attuned to your environment and actively manage your exposure, the effectiveness of this management can vary. Some days, even the strategies that usually work well can feel insufficient. This is not an inconsistency on your part. It reflects a nervous system whose capacity to integrate changes with load. Your home needs to provide more protection so that you provide less.',

  // LOW THRESHOLD + ACCUMULATIVE (active regulation)
  'avoider__accumulative':
    'You are acutely aware of what is expected of you in your environment, and you work hard to manage that. However, this effort comes at a cost, and when one thing has not fully cleared before the next arrives, the management load increases. Your home needs to be a space that is already tailored to you, providing structural protection without requiring effort.',

  // HIGH THRESHOLD + INTEGRATIVE
  'low_registration__integrative':
    'Your nervous system is steady and grounding. You do not easily register environmental changes, which gives you natural resilience. However, this also means that you may not notice the slow accumulation of sensory friction until it has already impacted your mood or ability. Your home needs to provide genuine anchoring, not just familiarity.',

  // HIGH THRESHOLD + MIXED
  'low_registration__mixed':
    'Your nervous system usually processes a wide range of inputs without any visible disruption. But there are conditions [usually cumulative ones, or particular channels] where that steadiness gives way. You may not always be able to identify what caused the shift. Your home needs to provide reliable anchors for those moments, ensuring the baseline remains stable even when the load is not.',

  // HIGH THRESHOLD + ACCUMULATIVE
  'low_registration__accumulative':
    'Your threshold appears to be high, as you do not seem bothered by small things. However, this may be because your system is already under significant strain, with little capacity for new input. What looks like resilience from the outside may actually be a system that is already full. Your priority is not managing stimulation. It is reducing your fundamental load.',

  // HIGH THRESHOLD + INTEGRATIVE (active regulation — seeks stimulation, processes it)
  'seeker__integrative':
    'Your nervous system needs stimulation to feel present and focused; low stimulation leaves you feeling listless rather than calm. You are drawn to contrast and variety, and when you find the right level, you process it well and move on. Your home needs intelligent variety and enough stimulation to keep you engaged without becoming overwhelming.',

  // HIGH THRESHOLD + MIXED (active regulation)
  'seeker__mixed':
    'Your nervous system seeks contrast and stimulation in order to feel alive, but the line between activation and overstimulation shifts depending on how much you are already carrying. On a good day, the same environment that energises you can feel overwhelming when you are under pressure. Your home needs to offer genuine variety that you can adjust, rather than a fixed level of stimulation imposed on a system in flux.',

  // HIGH THRESHOLD + ACCUMULATIVE (active regulation)
  'seeker__accumulative':
    'Your nervous system seeks contrast, but struggles when it arrives unpredictably or is forced upon you. You may find yourself craving stimulation one moment, then feeling overwhelmed the next. This is not inconsistency. Your system needs to choose the contrast itself, rather than having it arrive uninvited. It is predictable, self-directed environmental change that regulates you, not more or less stimulation, but stimulation on your terms.',
}

// ==============================
// 7. HELPERS
// ==============================

const reverseScore = (val: number) => 6 - val

const clamp = (num: number, min = 0, max = 100) =>
  Math.min(Math.max(num, min), max)

const normToHundred = (val: number): number => (val - 1) / 4 * 100

// ==============================
// 8. MAIN ENGINE
// ==============================

export const calculateNeuroLoad = (
  responses: { question_key: string; answer: { response: any } }[],
  neuroLensRaw: string = 'None'
): NeuroLoadResult => {

  // ==============================
  // STEP 0 — NORMALISE NEURO LENS
  // ==============================
  //
  // Patch: 'None / Unsure' now correctly maps to 'neurotypical'.
  // The updated assessmentProtocol returns 'None / Unsure' for undiagnosed
  // users. Previously only 'None' was matched; 'None / Unsure' fell through
  // without matching, remaining as 'neurotypical' by default — which was
  // correct in outcome but fragile. Now explicit.

  let neuroLens: NeuroLens = 'neurotypical'
  const normalizedLens = (neuroLensRaw || 'None').toLowerCase()

  if      (normalizedLens.includes('adhd'))         neuroLens = 'adhd'
  else if (normalizedLens.includes('autism'))        neuroLens = 'autism'
  else if (normalizedLens.includes('hsp'))           neuroLens = 'hsp'
  else if (normalizedLens.includes('dyslexia'))      neuroLens = 'dyslexia'
  else if (normalizedLens.includes('spd'))           neuroLens = 'spd'
  // 'none', 'none / unsure', 'unsure', or anything unrecognised → neurotypical

  if (!responses || responses.length === 0) {
    throw new Error('No assessment responses provided.')
  }

  // ==============================
  // STEP 1 — BUILD RESPONSE MAPS
  // ==============================

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

  const energyTaxRaw  = responseMap.get('energy_tax') ?? 50
  const energyTax     = clamp(energyTaxRaw, 0, 100)
  const primaryStrain = choiceMap.get('primary_strain') ?? 'None of the above'

  const getValidatedValue = (key: string): number => {
    if (!responseMap.has(key)) return 3
    const raw = responseMap.get(key)!
    if (raw < 1 || raw > 5) return 3
    return REVERSE_SCORED.has(key) ? reverseScore(raw) : raw
  }

  // ==============================
  // STEP 3 — INTEGRATION INDEX
  // ==============================
  //
  // q_int1, q_int2, q_int3 each return a 1–5 scale response.
  // Normalised to 0–100 per item, then averaged.
  // High score = accumulative pattern.
  // Missing responses default to 3 (midpoint — neutral, not accumulative).

  const integrationRaw = INTEGRATION_QUESTIONS.map(q => {
    const val = getValidatedValue(q)
    return normToHundred(val)
  })

  const integrationIndex = clamp(
    Math.round(integrationRaw.reduce((a, b) => a + b, 0) / integrationRaw.length)
  )

  const integrationPattern: IntegrationPattern =
    integrationIndex <= INTEGRATION_INTEGRATIVE_MAX  ? 'integrative' :
    integrationIndex >= INTEGRATION_ACCUMULATIVE_MIN ? 'accumulative' :
    'mixed'

  // ==============================
  // STEP 4 — RAW DOMAIN SCORES
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
  // STEP 5 — NORMALISE TO PERCENT
  // ==============================

  const percentIndices: DomainScores = {
    cii: (rawIndices.cii / DOMAIN_MAX.cii) * 100,
    ali: (rawIndices.ali / DOMAIN_MAX.ali) * 100,
    pli: (rawIndices.pli / DOMAIN_MAX.pli) * 100,
    stl: (rawIndices.stl / DOMAIN_MAX.stl) * 100,
    rci: (rawIndices.rci / DOMAIN_MAX.rci) * 100
  }

  // ==============================
  // STEP 6a — PRIMARY STRAIN PRE-WEIGHTING
  // ==============================

  const weights = { ...BASE_WEIGHTS }

  const strainBoost = STRAIN_DOMAIN_BOOST[primaryStrain] || {}
  ;(Object.keys(strainBoost) as (keyof DomainScores)[]).forEach(domain => {
    weights[domain] += strainBoost[domain] ?? 0
  })

  // ==============================
  // STEP 6b — NEURO_LENS ADAPTIVE WEIGHTS
  // ==============================

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
  // STEP 6c — INTEGRATION PATTERN WEIGHT MODIFIER
  // ==============================
  //
  // Applied after strain and neuro_lens adjustments so all three modifiers
  // stack in the correct order:
  //   transient state (primary_strain) →
  //   structural trait (neuro_lens) →
  //   integration pattern (how sensation is processed)
  //
  // Accumulative: PLI and RCI weights increase substantially.
  //   PLI: an accumulative nervous system cannot self-correct for spatial
  //   ambiguity the way an integrative one can. Predictive legibility is
  //   not a convenience — it reduces the continuous low-level processing
  //   demand that compounds load.
  //   RCI: recovery for an accumulative profile is structural. The home
  //   must do the work; recovery windows alone are insufficient.
  //
  // Mixed: half the accumulative boost. Acknowledges variability.
  //
  // Integrative: no change. Existing weights are correctly calibrated.

  const integrationBoost = INTEGRATION_WEIGHT_BOOST[integrationPattern]
  ;(Object.keys(integrationBoost) as (keyof DomainScores)[]).forEach(domain => {
    weights[domain] += (integrationBoost as any)[domain] ?? 0
  })

  // ==============================
  // STEP 7 — WEIGHTED INDICES
  // ==============================

  const weightedIndices: DomainScores = {
    cii: percentIndices.cii * weights.cii,
    ali: percentIndices.ali * weights.ali,
    pli: percentIndices.pli * weights.pli,
    stl: percentIndices.stl * weights.stl,
    rci: percentIndices.rci * weights.rci
  }

  // ==============================
  // STEP 8 — THRESHOLD INDEX
  // ==============================

  const q14 = getValidatedValue('q14')
  const q22 = getValidatedValue('q22')
  const q23 = getValidatedValue('q23')
  const q30 = getValidatedValue('q30')
  const q31 = getValidatedValue('q31')

  const q14Norm = normToHundred(q14)
  const q22Norm = normToHundred(q22)
  const q23Norm = normToHundred(q23)

  const lowThresholdScore =
    percentIndices.ali * 0.45 +
    percentIndices.stl * 0.40 +
    q14Norm            * 0.15

  const highThresholdScore =
    q22Norm                    * 0.35 +
    q23Norm                    * 0.35 +
    (100 - percentIndices.stl) * 0.30

  const derivedThreshold: SensoryThreshold =
    lowThresholdScore >= highThresholdScore ? 'low' : 'high'

  // ==============================
  // STEP 9 — REGULATION STYLE
  // ==============================

  const activeScore = (q30 + q31) / 2
  const regulation: RegulationStyle =
    activeScore >= 3.5 ? 'active' : 'passive'

  // ==============================
  // STEP 10 — BLEND LOGIC
  // ==============================

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
  // STEP 11 — SENSORY PATTERN
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
  // STEP 12 — PROFILE DESCRIPTOR
  // ==============================
  //
  // Keyed by `${pattern}__${integrationPattern}`.
  // Falls back to a generic descriptor if the key is somehow unmapped —
  // should never occur given the bounded pattern and integrationPattern
  // types, but defensive fallback is preferable to a blank UI.

  const descriptorKey = `${pattern}__${integrationPattern}`
  const profileDescriptor =
    PROFILE_DESCRIPTORS[descriptorKey] ??
    'Your home environment is creating a measurable load on your nervous system. The assessment has identified specific domains where targeted changes will have the greatest impact on how you feel day to day.'

  const integrationProfile: IntegrationProfile = {
    integrationIndex,
    integrationPattern,
    profileDescriptor
  }

  // ==============================
  // STEP 13 — INTERACTION FLAGS
  // ==============================
  //
  // accumulativeALIFlag: mid-range ALI (40–65) is flagged as more serious
  // for accumulative profiles because the system is already carrying load
  // that the score itself does not fully represent. An ALI of 50 on an
  // accumulative profile warrants the same urgency as 65+ on an integrative one.

  const flags: InteractionFlags = {
    restorativeDeficit:
      percentIndices.cii > INTERACTION_THRESHOLD &&
      percentIndices.rci > INTERACTION_THRESHOLD,

    sensoryHypervigilance:
      percentIndices.ali > INTERACTION_THRESHOLD &&
      percentIndices.stl > INTERACTION_THRESHOLD,

    cognitiveStrain:
      percentIndices.pli > INTERACTION_THRESHOLD &&
      percentIndices.ali > INTERACTION_THRESHOLD,

    accumulativeALIFlag:
      integrationPattern === 'accumulative' &&
      percentIndices.ali >= 40 &&
      percentIndices.ali <= 65
  }

  let interactionAmplifier = 0
  if (flags.restorativeDeficit)    interactionAmplifier += 0.05
  if (flags.sensoryHypervigilance) interactionAmplifier += 0.07
  if (flags.cognitiveStrain)       interactionAmplifier += 0.05
  // accumulativeALIFlag surfaces in UI and prescriptions — does not add
  // to the composite score directly, as the integration weight boost in
  // Step 6c already adjusts the weighted indices upstream.

  interactionAmplifier = Math.min(interactionAmplifier, MAX_INTERACTION_AMPLIFIER)

  // ==============================
  // STEP 14 — RECOVERY MODIFIER
  // ==============================

  let recoveryModifier: 'protective' | 'compounding' | 'neutral' = 'neutral'
  let recoveryAdjustment = 0

  if (percentIndices.rci < 40) {
    recoveryModifier   = 'protective'
    recoveryAdjustment = -0.05
  } else if (percentIndices.rci > 70) {
    recoveryModifier   = 'compounding'
    recoveryAdjustment = 0.05
  }

  // ==============================
  // STEP 15 — ENERGY TAX MODIFIER
  // ==============================

  const energyTaxModifier = (energyTax - 50) / ENERGY_TAX_SCALE

  // ==============================
  // STEP 16 — FINAL COMPOSITE
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
  // STEP 17 — SYSTEM STATE
  // ==============================

  let systemState: string

  if      (finalLoad <= 25) systemState = 'Resonant System'
  else if (finalLoad <= 40) systemState = 'Adaptive Strain'
  else if (finalLoad <= 60) systemState = 'Regulated but Taxed'
  else if (finalLoad <= 75) systemState = 'Dysregulated Pattern'
  else                      systemState = 'Structural Friction'

  // ==============================
  // STEP 18 — PRIORITY DOMAINS
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
    integrationProfile,
    energyTaxBaseline:    energyTax,
    primaryStrain
  }
}
