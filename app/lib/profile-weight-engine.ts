// =============================================================================
// PROFILE WEIGHT ENGINE — The Sentient Home
// app/lib/profile-weight-engine.ts
// =============================================================================
//
// Step 2 of the Room Audit improvement roadmap.
//
// PURPOSE:
//   Transforms objective domain scores (what the room is)
//   into profile-weighted scores (what the room costs this nervous system).
//
//   A room scoring 55/100 on Acoustic Safety is the same environment for
//   every user. What it costs is not. A Sensor Accumulative carries that
//   condition differently than an Anchor Integrative. This engine makes
//   that distinction calculable and communicable.
//
// OUTPUTS:
//   - weighted_domain_scores: per-domain adjusted scores (0–100)
//   - environmental_cost_score: single composite — what this room costs
//       this nervous system to regulate. 0 = maximum cost, 100 = minimum cost.
//   - projected_cost_score: same calculation with prescribed interventions
//       applied as estimated domain improvements
//   - cost_narrative: plain-language sentence for the primary UI layer
//   - projected_narrative: plain-language sentence for the accordion
//   - improvement_delta: the numerical difference (projected minus current)
//
// DESIGN PRINCIPLES:
//   - Scores live in the accordion. Human language leads in the UI.
//   - cost_narrative and projected_narrative are the primary outputs.
//   - Weighted scores never replace objective scores in the database.
//     Objective scores are stored for longitudinal comparison.
//     Weighted scores are returned in the response payload only.
//   - PRESCRIPTION_IMPACT keys will become ffe_library.prescription_type
//     in Step 3. The map is defined here now so Step 3 replaces it cleanly.
//
// =============================================================================

export type SensoryProfile     = 'sensor' | 'seeker' | 'anchor'
export type IntegrationVariant = 'integrative' | 'mixed' | 'accumulative'

export type DomainScores = {
  amygdala:       number
  prefrontal:     number
  vagal:          number
  circadian:      number
  acoustic:       number
  neuroendocrine: number
}

export type DomainWeights = {
  amygdala:       number
  prefrontal:     number
  vagal:          number
  circadian:      number
  acoustic:       number
  neuroendocrine: number
}

export type ProfileWeightResult = {
  // Accordion layer — detail
  weighted_domain_scores:   DomainScores
  environmental_cost_score: number   // 0–100, higher = lower cost to nervous system
  projected_cost_score:     number   // same after interventions applied
  improvement_delta:        number   // projected minus current
  domain_cost_labels:       Record<string, string>  // plain-language per-domain labels

  // Primary layer — human language
  cost_narrative:       string   // what this space currently costs
  projected_narrative:  string   // what it becomes after interventions
}

// =============================================================================
// SENSITIVITY MATRIX
// Per-domain multipliers representing how much more or less each domain
// costs this profile relative to a neutral baseline.
// Higher multiplier = higher cost for the same raw score.
// =============================================================================

const PROFILE_SENSITIVITY: Record<SensoryProfile, Record<keyof DomainScores, number>> = {
  sensor: {
    amygdala:       1.40,  // Highest sensitivity — contrast, unpredictability, colour load
    prefrontal:     1.20,  // Competing stimuli drain executive resources faster
    vagal:          1.00,  // Neutral — restorative cues are equally effective
    circadian:      1.15,  // Spectral disruption compounds nervous system load
    acoustic:       1.35,  // Acoustic unpredictability is a primary threat signal
    neuroendocrine: 1.25   // Composite load accumulates faster at higher sensitivity
  },
  seeker: {
    amygdala:       0.90,  // Higher amygdala threshold — less reactive to contrast
    prefrontal:     1.10,  // Still affected by competing stimuli, moderately
    vagal:          1.20,  // Under-stimulation is as costly as overload
    circadian:      0.90,  // Circadian disruption less immediately costly
    acoustic:       0.85,  // Higher acoustic tolerance
    neuroendocrine: 0.95   // Composite load builds more slowly
  },
  anchor: {
    amygdala:       0.80,  // Broadest tolerance — contrast absorbed without loading
    prefrontal:     0.90,  // Executive resources drain more slowly
    vagal:          1.00,  // Neutral
    circadian:      0.85,  // Circadian disruption absorbed more readily
    acoustic:       0.80,  // Acoustic load well-tolerated
    neuroendocrine: 0.85   // Composite load accumulates slowly
  }
}

// =============================================================================
// INTEGRATION PATTERN MODIFIER
// Applied to the composite Environmental Cost Score after domain weighting.
// Accumulative pattern means prior-day residue compounds every domain cost.
// =============================================================================

const INTEGRATION_MODIFIER: Record<IntegrationVariant, number> = {
  accumulative: 1.28,  // Carried load compounds — same room costs more over time
  mixed:        1.12,  // Variable — some days closer to accumulative
  integrative:  1.00   // Baseline — system clears between exposures
}

// =============================================================================
// PRESCRIPTION IMPACT MAP
// Estimated domain improvement per prescription type when implemented.
// Keys will become ffe_library.prescription_type in Step 3.
// Values are conservative estimates — not maximum possible improvement.
// =============================================================================

const PRESCRIPTION_IMPACT: Record<string, Partial<DomainScores>> = {
  // Acoustic interventions
  acoustic_buffering_rug: {
    acoustic: 20, amygdala: 6, neuroendocrine: 4
  },
  acoustic_buffering_curtains: {
    acoustic: 15, amygdala: 5, neuroendocrine: 3
  },
  acoustic_zoning_soft_panel: {
    acoustic: 25, amygdala: 8, neuroendocrine: 5
  },

  // Biophilic interventions
  biophilic_anchor_plant: {
    vagal: 18, amygdala: 5, neuroendocrine: 6
  },
  biophilic_anchor_natural_material: {
    vagal: 12, amygdala: 4, neuroendocrine: 3
  },
  biophilic_water_feature: {
    vagal: 20, acoustic: 8, neuroendocrine: 7
  },

  // Tactile and proprioceptive interventions
  tactile_grounding_weighted_throw: {
    vagal: 15, amygdala: 8, neuroendocrine: 6
  },
  tactile_grounding_cushions: {
    vagal: 10, amygdala: 5, neuroendocrine: 4
  },
  tactile_grounding_rug: {
    vagal: 12, acoustic: 10, amygdala: 6, neuroendocrine: 5
  },

  // Lighting interventions
  lighting_warm_spectrum: {
    circadian: 22, amygdala: 8, neuroendocrine: 7
  },
  lighting_below_eye_level: {
    circadian: 18, amygdala: 6, neuroendocrine: 5
  },
  lighting_task_lamp: {
    prefrontal: 15, circadian: 10, neuroendocrine: 4
  },
  lighting_blackout: {
    circadian: 28, neuroendocrine: 8
  },

  // Visual hierarchy interventions
  visual_hierarchy_declutter: {
    prefrontal: 22, amygdala: 12, neuroendocrine: 8
  },
  visual_hierarchy_grouping: {
    prefrontal: 15, amygdala: 8, neuroendocrine: 5
  },
  visual_contrast_reduction: {
    amygdala: 18, neuroendocrine: 6
  },

  // Chromatic interventions
  chromatic_desaturation: {
    amygdala: 20, neuroendocrine: 8
  },
  chromatic_warm_neutral: {
    amygdala: 12, vagal: 6, neuroendocrine: 5
  },

  // Spatial interventions
  spatial_containment_furniture: {
    vagal: 14, amygdala: 10, neuroendocrine: 6
  },
  spatial_containment_screen: {
    vagal: 10, amygdala: 8, acoustic: 6, neuroendocrine: 5
  },

  // Maintenance / clarity interventions
  maintenance_surface_repair: {
    prefrontal: 10, amygdala: 8, neuroendocrine: 5
  },
  maintenance_organisation: {
    prefrontal: 18, amygdala: 10, neuroendocrine: 7
  }
}

// =============================================================================
// ROOM WEIGHTS — same as scoring engine, reproduced here for independence
// =============================================================================

function getRoomWeights(roomName: string): DomainWeights {
  const r = roomName.toLowerCase()
  if (r.includes('bedroom'))
    return { amygdala: 1.5, prefrontal: 1.0, vagal: 1.5, circadian: 1.8, acoustic: 1.3, neuroendocrine: 1.2 }
  if (r.includes('office') || r.includes('workspace'))
    return { amygdala: 1.2, prefrontal: 1.8, vagal: 1.0, circadian: 1.3, acoustic: 1.5, neuroendocrine: 1.1 }
  if (r.includes('living') || r.includes('family'))
    return { amygdala: 1.3, prefrontal: 1.1, vagal: 1.4, circadian: 1.0, acoustic: 1.2, neuroendocrine: 1.0 }
  if (r.includes('kitchen'))
    return { amygdala: 1.0, prefrontal: 1.3, vagal: 0.8, circadian: 1.0, acoustic: 1.6, neuroendocrine: 1.0 }
  return { amygdala: 1.1, prefrontal: 1.0, vagal: 1.1, circadian: 0.8, acoustic: 1.0, neuroendocrine: 1.0 }
}

// =============================================================================
// COMPUTE ENVIRONMENTAL COST SCORE
// Weighted domain scores → room-type weighted composite → integration modifier
// Returns 0–100 where higher = lower cost to nervous system (better)
// =============================================================================

function computeEnvironmentalCostScore(
  weightedScores: DomainScores,
  roomWeights:    DomainWeights,
  integration:    IntegrationVariant
): number {
  const weightedSum =
    weightedScores.amygdala       * roomWeights.amygdala +
    weightedScores.prefrontal     * roomWeights.prefrontal +
    weightedScores.vagal          * roomWeights.vagal +
    weightedScores.circadian      * roomWeights.circadian +
    weightedScores.acoustic       * roomWeights.acoustic +
    weightedScores.neuroendocrine * roomWeights.neuroendocrine

  const maxPossible = 100 * (
    roomWeights.amygdala + roomWeights.prefrontal + roomWeights.vagal +
    roomWeights.circadian + roomWeights.acoustic + roomWeights.neuroendocrine
  )

  const baseScore = (weightedSum / maxPossible) * 100

  // Integration modifier reduces the score — accumulative pattern means
  // the same objective room costs more over time due to carried load.
  // Score is divided by modifier and capped — a higher modifier = lower result.
  const modifiedScore = baseScore / INTEGRATION_MODIFIER[integration]

  return Math.round(Math.max(0, Math.min(100, modifiedScore)))
}

// =============================================================================
// APPLY PROFILE SENSITIVITY TO RAW DOMAIN SCORES
// =============================================================================

function applyProfileWeighting(
  rawScores: DomainScores,
  profile:   SensoryProfile
): DomainScores {
  const sensitivity = PROFILE_SENSITIVITY[profile]

  // Each score is divided by the sensitivity multiplier.
  // Higher sensitivity = smaller adjusted score = correctly reflects higher cost.
  // Result is capped at 100.
  return {
    amygdala:       Math.round(Math.min(100, rawScores.amygdala       / sensitivity.amygdala)),
    prefrontal:     Math.round(Math.min(100, rawScores.prefrontal     / sensitivity.prefrontal)),
    vagal:          Math.round(Math.min(100, rawScores.vagal          / sensitivity.vagal)),
    circadian:      Math.round(Math.min(100, rawScores.circadian      / sensitivity.circadian)),
    acoustic:       Math.round(Math.min(100, rawScores.acoustic       / sensitivity.acoustic)),
    neuroendocrine: Math.round(Math.min(100, rawScores.neuroendocrine / sensitivity.neuroendocrine))
  }
}

// =============================================================================
// PROJECT DOMAIN SCORES AFTER PRESCRIPTIONS
// Applies estimated prescription impacts to weighted scores.
// prescriptionTypes: array of PRESCRIPTION_IMPACT keys inferred from
// the translation pass. Step 3 will pass these explicitly from the
// profile-personalised prescription engine.
// =============================================================================

function projectScoresAfterPrescriptions(
  weightedScores:    DomainScores,
  prescriptionTypes: string[]
): DomainScores {
  const projected = { ...weightedScores }

  prescriptionTypes.forEach(type => {
    const impact = PRESCRIPTION_IMPACT[type]
    if (!impact) return

    if (impact.amygdala)       projected.amygdala       = Math.min(100, projected.amygdala       + impact.amygdala)
    if (impact.prefrontal)     projected.prefrontal     = Math.min(100, projected.prefrontal     + impact.prefrontal)
    if (impact.vagal)          projected.vagal          = Math.min(100, projected.vagal          + impact.vagal)
    if (impact.circadian)      projected.circadian      = Math.min(100, projected.circadian      + impact.circadian)
    if (impact.acoustic)       projected.acoustic       = Math.min(100, projected.acoustic       + impact.acoustic)
    if (impact.neuroendocrine) projected.neuroendocrine = Math.min(100, projected.neuroendocrine + impact.neuroendocrine)
  })

  return projected
}

// =============================================================================
// DOMAIN COST LABELS
// Plain-language labels for each domain score for the accordion layer.
// These describe what the score means in lived-experience terms —
// not clinical terminology.
// =============================================================================

function getDomainCostLabel(score: number, domainKey: keyof DomainScores): string {
  const DOMAIN_LANGUAGE: Record<keyof DomainScores, { high: string; mid: string; low: string }> = {
    amygdala: {
      high: 'The visual environment is working with your nervous system.',
      mid:  'Some visual conditions are adding background load.',
      low:  'The visual environment is generating sustained alerting signals.'
    },
    prefrontal: {
      high: 'The space supports clear, uninterrupted thinking.',
      mid:  'Competing visual demands are reducing available focus.',
      low:  'The space is exhausting executive attention before the day begins.'
    },
    vagal: {
      high: 'The space has restorative qualities that support recovery.',
      mid:  'Some restorative conditions are present but incomplete.',
      low:  'The space lacks the conditions that activate rest and restoration.'
    },
    circadian: {
      high: 'Lighting supports your natural rhythm and energy cycle.',
      mid:  'Lighting is partially misaligned with your biological clock.',
      low:  'The light environment is disrupting your sleep-wake regulation.'
    },
    acoustic: {
      high: 'Sound conditions are buffered and predictable.',
      mid:  'Some acoustic unpredictability is adding low-level load.',
      low:  'The acoustic environment is maintaining background vigilance.'
    },
    neuroendocrine: {
      high: 'The cumulative environmental load is within a manageable range.',
      mid:  'Sustained exposure to current conditions will accumulate over time.',
      low:  'The combined environmental conditions are generating significant ongoing stress load.'
    }
  }

  const labels = DOMAIN_LANGUAGE[domainKey]
  if (score >= 65) return labels.high
  if (score >= 40) return labels.mid
  return labels.low
}

// =============================================================================
// COST NARRATIVE GENERATOR
// Plain-language sentence for the primary UI layer.
// No scores. No domain names. Human language only.
// =============================================================================

function buildCostNarrative(
  costScore:   number,
  profile:     SensoryProfile,
  integration: IntegrationVariant,
  roomType:    string
): string {
  const room = roomType.toLowerCase()

  const intensityPhrase =
    costScore >= 70 ? 'is working within a manageable range for your nervous system'
    : costScore >= 50 ? 'is creating a moderate level of background demand for your nervous system'
    : costScore >= 35 ? 'is generating sustained load that your nervous system is quietly absorbing'
    : 'is placing significant and ongoing demand on your nervous system'

  const profileContext =
    profile === 'sensor' && integration === 'accumulative'
      ? ' — and because your system carries rather than clears, this load compounds across each day you spend here'
    : profile === 'sensor'
      ? ' — your system processes environmental detail more intensively than most'
    : profile === 'seeker' && costScore >= 60
      ? ' — though some areas may be working against your need for adequate stimulation'
    : profile === 'seeker'
      ? ' — your system may also be receiving less stimulation than it needs to stay engaged'
    : integration === 'accumulative'
      ? ' — over time, the cumulative effect builds more than the snapshot suggests'
    : ''

  return `Your ${room} ${intensityPhrase}${profileContext}.`
}

// =============================================================================
// PROJECTED NARRATIVE GENERATOR
// Plain-language sentence describing what the space becomes.
// Lives in the accordion — written directly to the person.
// =============================================================================

function buildProjectedNarrative(
  currentScore:  number,
  projectedScore: number,
  profile:        SensoryProfile,
  roomType:       string
): string {
  const room  = roomType.toLowerCase()
  const delta = projectedScore - currentScore

  if (delta <= 0) {
    return `The interventions maintain the current environmental quality of your ${room} — holding what is already working while addressing the conditions that are not.`
  }

  const improvementPhrase =
    delta >= 25 ? 'a meaningful reduction in the environmental demand your nervous system carries in this space'
    : delta >= 15 ? 'a noticeable shift in how your nervous system experiences this space'
    : 'a modest but real improvement in the conditions this space creates for your nervous system'

  const profileOutcome =
    profile === 'sensor' && projectedScore >= 65
      ? ' Your system would have enough environmental predictability to begin using the space for genuine restoration.'
    : profile === 'sensor'
      ? ' Your system would encounter less to process and more to rest in.'
    : profile === 'seeker' && projectedScore >= 65
      ? ' The space would offer enough environmental engagement without tipping into overload.'
    : profile === 'seeker'
      ? ' The space would better support the stimulation your system needs to stay present and focused.'
    : projectedScore >= 65
      ? ' The space would function as a reliable baseline environment for sustained performance.'
    : ' The space would carry a lower ongoing load across the time you spend here.'

  return `With these changes in place, your ${room} would offer ${improvementPhrase}.${profileOutcome}`
}

// =============================================================================
// INFER PRESCRIPTION TYPES FROM PRESCRIPTION TEXT
// Step 3 will replace this with explicit prescription type keys from the
// profile-personalised prescription engine. For now, a keyword matcher
// maps GPT-4o's free-text prescriptions to PRESCRIPTION_IMPACT keys.
// This is a best-effort approximation — Step 3 makes it precise.
// =============================================================================

function inferPrescriptionTypes(prescriptions: string[]): string[] {
  const types: string[] = []

  const KEYWORD_MAP: Array<{ keywords: string[]; type: string }> = [
    { keywords: ['rug', 'carpet', 'floor covering'],          type: 'acoustic_buffering_rug' },
    { keywords: ['curtain', 'drape', 'blind', 'window'],      type: 'acoustic_buffering_curtains' },
    { keywords: ['acoustic panel', 'soft panel', 'wall panel'], type: 'acoustic_zoning_soft_panel' },
    { keywords: ['plant', 'biophilic', 'living'],             type: 'biophilic_anchor_plant' },
    { keywords: ['wood', 'stone', 'natural material', 'linen', 'rattan'], type: 'biophilic_anchor_natural_material' },
    { keywords: ['water feature', 'water'],                   type: 'biophilic_water_feature' },
    { keywords: ['weighted', 'throw', 'blanket'],             type: 'tactile_grounding_weighted_throw' },
    { keywords: ['cushion', 'pillow'],                        type: 'tactile_grounding_cushions' },
    { keywords: ['warm', 'kelvin', 'spectrum', '2700', 'amber'], type: 'lighting_warm_spectrum' },
    { keywords: ['lamp', 'task light', 'below eye'],          type: 'lighting_below_eye_level' },
    { keywords: ['blackout', 'eye mask', 'dark'],             type: 'lighting_blackout' },
    { keywords: ['declutter', 'remove', 'clear', 'reduce objects'], type: 'visual_hierarchy_declutter' },
    { keywords: ['group', 'organise', 'arrange', 'hierarchy'], type: 'visual_hierarchy_grouping' },
    { keywords: ['contrast', 'soften', 'tone'],               type: 'visual_contrast_reduction' },
    { keywords: ['saturati', 'mute', 'desaturate', 'colour'],  type: 'chromatic_desaturation' },
    { keywords: ['furniture', 'position', 'arrangement', 'back to wall'], type: 'spatial_containment_furniture' },
    { keywords: ['screen', 'partition', 'divider'],           type: 'spatial_containment_screen' },
    { keywords: ['repair', 'fix', 'surface'],                 type: 'maintenance_surface_repair' },
    { keywords: ['organis', 'tidy', 'clear surface'],         type: 'maintenance_organisation' }
  ]

  prescriptions.forEach(prescription => {
    const lower = prescription.toLowerCase()
    KEYWORD_MAP.forEach(({ keywords, type }) => {
      if (keywords.some(kw => lower.includes(kw)) && !types.includes(type)) {
        types.push(type)
      }
    })
  })

  return types
}

// =============================================================================
// MAIN EXPORT — applyProfileWeighting
// Called from the analyze route after scoreAllDomains returns.
// =============================================================================

export function applyProfileWeightEngine(
  rawDomainScores: DomainScores,
  profile:         SensoryProfile,
  integration:     IntegrationVariant,
  roomType:        string,
  prescriptions:   string[]  // free-text prescriptions from translation pass
): ProfileWeightResult {

  const roomWeights = getRoomWeights(roomType)

  // 1. Apply profile sensitivity to raw scores
  const weightedScores = applyProfileWeighting(rawDomainScores, profile)

  // 2. Compute Environmental Cost Score from weighted scores
  const environmentalCostScore = computeEnvironmentalCostScore(
    weightedScores, roomWeights, integration
  )

  // 3. Infer prescription types and project improved scores
  const prescriptionTypes  = inferPrescriptionTypes(prescriptions)
  const projectedScores    = projectScoresAfterPrescriptions(weightedScores, prescriptionTypes)
  const projectedCostScore = computeEnvironmentalCostScore(
    projectedScores, roomWeights, integration
  )

  const improvementDelta = projectedCostScore - environmentalCostScore

  // 4. Build per-domain plain-language labels for accordion
  const domainCostLabels: Record<string, string> = {
    'Amygdala Regulation':    getDomainCostLabel(weightedScores.amygdala,       'amygdala'),
    'Prefrontal Buffer':      getDomainCostLabel(weightedScores.prefrontal,     'prefrontal'),
    'Vagal Coherence':        getDomainCostLabel(weightedScores.vagal,          'vagal'),
    'Circadian Alignment':    getDomainCostLabel(weightedScores.circadian,      'circadian'),
    'Acoustic Safety':        getDomainCostLabel(weightedScores.acoustic,       'acoustic'),
    'Neuroendocrine Balance': getDomainCostLabel(weightedScores.neuroendocrine, 'neuroendocrine')
  }

  // 5. Build human-language narratives for primary UI layer
  const costNarrative = buildCostNarrative(
    environmentalCostScore, profile, integration, roomType
  )
  const projectedNarrative = buildProjectedNarrative(
    environmentalCostScore, projectedCostScore, profile, roomType
  )

  return {
    weighted_domain_scores:   weightedScores,
    environmental_cost_score: environmentalCostScore,
    projected_cost_score:     projectedCostScore,
    improvement_delta:        improvementDelta,
    domain_cost_labels:       domainCostLabels,
    cost_narrative:           costNarrative,
    projected_narrative:      projectedNarrative
  }
}
