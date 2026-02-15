// utils/scoring-engine.ts

// ==============================
// 1. DOMAIN CONFIGURATION
// ==============================

const DOMAIN_MAX = {
  cii: 25, // q5–q9 (5 questions)
  ali: 20, // q12–q15 (4 questions)
  pli: 25, // q16–q20 (5 questions)
  stl: 25, // q21–q25 (5 questions)
  rci: 25  // q26–q30 (5 questions)
}

const BASE_WEIGHTS = {
  cii: 1.3,
  ali: 1.4,
  pli: 1.0,
  stl: 1.1,
  rci: 1.5
}

const INTERACTION_THRESHOLD = 60 // Percent
const MAX_INTERACTION_AMPLIFIER = 0.12

// ==============================
// 2. TYPES
// ==============================

export type NeuroLens = 'adhd' | 'autism' | 'hsp' | 'neurotypical'

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

export interface NeuroLoadResult {
  rawIndices: DomainScores
  percentIndices: DomainScores
  weightedIndices: DomainScores
  finalNeuroLoad: number // 0-100
  systemState: string
  interactionFlags: InteractionFlags
  priorityDomains: { id: string; score: number }[]
  recoveryModifier: 'protective' | 'compounding' | 'neutral'
}

// ==============================
// 3. QUESTION MAPPING
// ==============================

// NOTE: Ensure these keys (q5, q12, etc.) match your Step 1-5 files exactly.
const DOMAIN_QUESTIONS: Record<keyof DomainScores, string[]> = {
  cii: ['q5', 'q6', 'q7', 'q8', 'q9'],
  ali: ['q12', 'q13', 'q14', 'q15'],
  pli: ['q16', 'q17', 'q18', 'q19', 'q20'],
  stl: ['q21', 'q22', 'q23', 'q24', 'q25'],
  rci: ['q26', 'q27', 'q28', 'q29', 'q30']
}

// Reverse-scored questions (Higher score = Better, so we flip to represent Load)
const REVERSE_SCORED = new Set(['q30'])

// ==============================
// 4. HELPERS
// ==============================

// Flip 1->5, 5->1
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

  // ---- DATA PREP ----
  // Create a map for O(1) lookups. 
  // If a question is missing, we currently default to 0 to prevent crashes,
  // but in a strict mode you might want to throw an error.
  const responseMap = new Map(
    responses?.map(r => [r.question_key, r.answer.response]) || []
  )

  const getValue = (key: string): number => {
    // Default to 1 (Lowest Load) if missing, to be safe.
    const val = responseMap.get(key) || 1 
    
    // Handle Reverse Scoring
    if (REVERSE_SCORED.has(key)) {
        return reverseScore(val)
    }
    return val
  }

  // ==============================
  // STEP 1 — RAW DOMAIN SCORES
  // ==============================

  // We manually map them to ensure type safety for DomainScores keys
  const rawIndices: DomainScores = {
    cii: DOMAIN_QUESTIONS.cii.reduce((sum, q) => sum + getValue(q), 0),
    ali: DOMAIN_QUESTIONS.ali.reduce((sum, q) => sum + getValue(q), 0),
    pli: DOMAIN_QUESTIONS.pli.reduce((sum, q) => sum + getValue(q), 0),
    stl: DOMAIN_QUESTIONS.stl.reduce((sum, q) => sum + getValue(q), 0),
    rci: DOMAIN_QUESTIONS.rci.reduce((sum, q) => sum + getValue(q), 0),
  }

  // ==============================
  // STEP 2 — NORMALISE (0–100%)
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

  // NeuroLens Adjustments
  if (neuroLens === 'adhd') {
    weights.pli *= 1.10 // +10%
  }
  if (neuroLens === 'autism') {
    weights.stl *= 1.15 // +15%
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
  // STEP 4 — INTERACTION FLAGS
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

  // Cap at 12%
  if (interactionAmplifier > MAX_INTERACTION_AMPLIFIER) {
      interactionAmplifier = MAX_INTERACTION_AMPLIFIER
  }

  // ==============================
  // STEP 5 — RECOVERY MODERATION
  // ==============================

  let recoveryModifier: 'protective' | 'compounding' | 'neutral' = 'neutral'
  let recoveryAdjustment = 0

  // 40% and 70% thresholds for Recovery (RCI)
  if (percentIndices.rci < 40) {
    recoveryModifier = 'protective'
    recoveryAdjustment = -0.05 // -5% Load
  } else if (percentIndices.rci > 70) {
    recoveryModifier = 'compounding'
    recoveryAdjustment = 0.05 // +5% Load
  }

  // ==============================
  // STEP 6 — FINAL COMPOSITE
  // ==============================

  const totalWeightedScore =
    weightedIndices.cii +
    weightedIndices.ali +
    weightedIndices.pli +
    weightedIndices.stl +
    weightedIndices.rci

  // Calculate theoretical max based on current weights
  const maxPossibleWeighted =
    100 * weights.cii +
    100 * weights.ali +
    100 * weights.pli +
    100 * weights.stl +
    100 * weights.rci

  // Base %
  const baseComposite = (totalWeightedScore / maxPossibleWeighted) * 100

  // Apply Modifiers
  let finalLoad = baseComposite * (1 + interactionAmplifier + recoveryAdjustment)

  // Clamp 0-100
  finalLoad = clamp(Math.round(finalLoad))

  // ==============================
  // STEP 7 — SYSTEM STATE
  // ==============================

  let systemState = 'Structural Friction' // Default worst case
  if (finalLoad <= 25) systemState = 'Resonant System'
  else if (finalLoad <= 40) systemState = 'Adaptive Strain'
  else if (finalLoad <= 60) systemState = 'Regulated but Taxed'
  else if (finalLoad <= 75) systemState = 'Dysregulated Pattern'

  // ==============================
  // STEP 8 — PRIORITY RANKING
  // ==============================

  // We rank based on the WEIGHTED score + Bonus for active interactions
  const rankedDomains = Object.entries(weightedIndices).map(([id, score]) => {
    let interactionBonus = 0
    // If a domain is part of an active toxic pair, bump its priority
    if (id === 'cii' && flags.restorativeDeficit) interactionBonus += 50
    if (id === 'rci' && flags.restorativeDeficit) interactionBonus += 50
    if (id === 'ali' && flags.sensoryHypervigilance) interactionBonus += 50
    if (id === 'stl' && flags.sensoryHypervigilance) interactionBonus += 50
    
    return {
        id: id,
        score: score + interactionBonus
    }
  })

  // Sort descending
  rankedDomains.sort((a, b) => b.score - a.score)

  // Return Top 2
  const priorityDomains = rankedDomains.slice(0, 2)

  return {
    rawIndices,
    percentIndices,
    weightedIndices,
    finalNeuroLoad: finalLoad,
    systemState,
    interactionFlags: flags,
    priorityDomains,
    recoveryModifier
  }
}
