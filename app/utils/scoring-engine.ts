// utils/scoring-engine.ts

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

// ==============================
// 2. TYPES
// ==============================

export type NeuroLens = 'adhd' | 'autism' | 'hsp' | 'neurotypical'
export type SensoryThreshold = 'low' | 'high'
export type RegulationStyle = 'active' | 'passive'
export type SensoryPattern =
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
  restorativeDeficit: boolean
  sensoryHypervigilance: boolean
  cognitiveStrain: boolean
}

export interface SensoryProfile {
  threshold: SensoryThreshold
  regulation: RegulationStyle
  pattern: SensoryPattern
}

export interface NeuroLoadResult {
  rawIndices: DomainScores
  percentIndices: DomainScores
  weightedIndices: DomainScores
  finalNeuroLoad: number
  systemState: string
  interactionFlags: InteractionFlags
  priorityDomains: { id: keyof DomainScores; score: number }[]
  recoveryModifier: 'protective' | 'compounding' | 'neutral'
  sensoryProfile: SensoryProfile
}

// ==============================
// 3. QUESTION MAPPING
// ==============================

const DOMAIN_QUESTIONS: Record<keyof DomainScores, string[]> = {
  cii: ['q5','q6','q7','q8','q9'],
  ali: ['q10','q11','q12','q13','q14'],
  pli: ['q15','q16','q17','q18','q19'],
  stl: ['q20','q21','q22','q23','q24','q25','q26'],
  rci: ['q27','q28','q29','q30','q31','q32','q33']
}

const REVERSE_SCORED = new Set(['q33'])

// ==============================
// 4. HELPERS
// ==============================

const reverseScore = (val: number) => 6 - val

const clamp = (num: number, min = 0, max = 100) =>
  Math.min(Math.max(num, min), max)

// ==============================
// 5. MAIN ENGINE
// ==============================

export const calculateNeuroLoad = (
  responses: { question_key: string; answer: { response: number } }[],
  neuroLens: NeuroLens = 'neurotypical'
): NeuroLoadResult => {

  if (!responses || responses.length === 0) {
    throw new Error('No assessment responses provided.')
  }

  const responseMap = new Map(
    responses.map(r => [r.question_key, r.answer.response])
  )

  const getValidatedValue = (key: string): number => {
    if (!responseMap.has(key)) {
      throw new Error(`Missing response for required question: ${key}`)
    }

    const raw = responseMap.get(key)!

    if (raw < 1 || raw > 5) {
      throw new Error(`Invalid response value for ${key}`)
    }

    return REVERSE_SCORED.has(key) ? reverseScore(raw) : raw
  }

  // ==============================
  // STEP 1 — RAW DOMAIN SCORES
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
  // STEP 2 — NORMALISE
  // ==============================

  const percentIndices: DomainScores = {
    cii: (rawIndices.cii / DOMAIN_MAX.cii) * 100,
    ali: (rawIndices.ali / DOMAIN_MAX.ali) * 100,
    pli: (rawIndices.pli / DOMAIN_MAX.pli) * 100,
    stl: (rawIndices.stl / DOMAIN_MAX.stl) * 100,
    rci: (rawIndices.rci / DOMAIN_MAX.rci) * 100
  }

  // ==============================
  // STEP 3 — ADAPTIVE WEIGHTS
  // ==============================

  const weights = { ...BASE_WEIGHTS }

  if (neuroLens === 'adhd') {
    weights.pli *= 1.10
  }

  if (neuroLens === 'autism') {
    weights.stl *= 1.15
  }

  if (neuroLens === 'hsp') {
    weights.stl *= 1.10
    weights.rci *= 1.05
  }

  const weightedIndices: DomainScores = {
    cii: percentIndices.cii * weights.cii,
    ali: percentIndices.ali * weights.ali,
    pli: percentIndices.pli * weights.pli,
    stl: percentIndices.stl * weights.stl,
    rci: percentIndices.rci * weights.rci
  }

  // ==============================
  // STEP 4 — THRESHOLD INDEX
  // ==============================

  const q14 = getValidatedValue('q14')
  const q22 = getValidatedValue('q22')
  const q23 = getValidatedValue('q23')
  const q30 = getValidatedValue('q30')
  const q31 = getValidatedValue('q31')

  const lowThresholdScore =
    (percentIndices.ali + percentIndices.stl + (q14 * 20)) / 3

  const highThresholdScore =
    ((q22 * 20) + (q23 * 20) + (100 - percentIndices.stl)) / 3

  const threshold: SensoryThreshold =
    lowThresholdScore >= highThresholdScore ? 'low' : 'high'

  // ==============================
  // STEP 5 — REGULATION STYLE
  // ==============================

  const activeScore = (q30 + q31) / 2

  const regulation: RegulationStyle =
    activeScore >= 3.5 ? 'active' : 'passive'

  // ==============================
  // STEP 6 — SENSORY PATTERN
  // ==============================

  let pattern: SensoryPattern

  if (threshold === 'low' && regulation === 'passive')
    pattern = 'sensitive'
  else if (threshold === 'low' && regulation === 'active')
    pattern = 'avoider'
  else if (threshold === 'high' && regulation === 'passive')
    pattern = 'low_registration'
  else
    pattern = 'seeker'

  const sensoryProfile: SensoryProfile = {
    threshold,
    regulation,
    pattern
  }

  // ==============================
  // STEP 7 — INTERACTION FLAGS
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

  if (flags.restorativeDeficit) interactionAmplifier += 0.05
  if (flags.sensoryHypervigilance) interactionAmplifier += 0.07
  if (flags.cognitiveStrain) interactionAmplifier += 0.05

  interactionAmplifier = Math.min(
    interactionAmplifier,
    MAX_INTERACTION_AMPLIFIER
  )

  // ==============================
  // STEP 8 — RECOVERY MODERATION
  // ==============================

  let recoveryModifier: 'protective' | 'compounding' | 'neutral' = 'neutral'
  let recoveryAdjustment = 0

  if (percentIndices.rci < 40) {
    recoveryModifier = 'protective'
    recoveryAdjustment = -0.05
  } else if (percentIndices.rci > 70) {
    recoveryModifier = 'compounding'
    recoveryAdjustment = 0.05
  }

  // ==============================
  // STEP 9 — FINAL COMPOSITE
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

  let baseComposite = (totalWeighted / maxWeighted) * 100

  let finalLoad =
    baseComposite * (1 + interactionAmplifier + recoveryAdjustment)

  finalLoad = clamp(Math.round(finalLoad))

  // ==============================
  // STEP 10 — SYSTEM STATE
  // ==============================

  let systemState: string

  if (finalLoad <= 25) {
    systemState = 'Resonant System'
  } else if (finalLoad <= 40) {
    systemState = 'Adaptive Strain'
  } else if (finalLoad <= 60) {
    systemState = 'Regulated but Taxed'
  } else if (finalLoad <= 75) {
    systemState = 'Dysregulated Pattern'
  } else {
    systemState = 'Structural Friction'
  }

  // ==============================
  // STEP 11 — PRIORITY DOMAINS
  // ==============================

  const domainImpact = Object.entries(weightedIndices).map(
    ([id, score]) => {
      let interactionBonus = 0

      if (
        (flags.restorativeDeficit && (id === 'cii' || id === 'rci')) ||
        (flags.sensoryHypervigilance && (id === 'ali' || id === 'stl')) ||
        (flags.cognitiveStrain && (id === 'pli' || id === 'ali'))
      ) {
        interactionBonus = 5
      }

      return {
        id: id as keyof DomainScores,
        score: score + interactionBonus
      }
    }
  )

  const priorityDomains = domainImpact
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)

  return {
    rawIndices,
    percentIndices,
    weightedIndices,
    finalNeuroLoad: finalLoad,
    systemState,
    interactionFlags: flags,
    priorityDomains,
    recoveryModifier,
    sensoryProfile
  }
}
