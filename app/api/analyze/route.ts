import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OpenAI from 'openai'

// =============================================================================
// ANALYZE ROUTE — v2
// Architecture: GPT-4o Vision (Option B)
//
// CHANGE LOG (v2):
//   PREVIOUS: Google Vision API → heuristic formulas → GPT-4o text translation
//   THIS VERSION:
//     - Google Vision eliminated entirely
//     - GPT-4o Vision receives the room image directly as base64
//     - Returns structured RoomObservations (qualitative, fixed vocabulary)
//     - Deterministic scoring functions map observations → domain scores
//     - Clinical translation call receives observations + scores + profile context
//     - Response carries both interpretation layer and domain detail layer
//       (interpretation leads; domain scores available for accordion display)
//
// STEP 2 (profile-weighted scoring) will apply a sensitivity matrix to domain
// scores after this function returns them. Hooks are in place.
// =============================================================================

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// =============================================================================
// TYPES
// =============================================================================

type SensoryProfile    = 'sensor' | 'seeker' | 'anchor'
type IntegrationVariant = 'integrative' | 'mixed' | 'accumulative'

type ChromaticArousal = {
  dominant_hue_family:            'warm' | 'cool' | 'neutral' | 'mixed'
  dominant_saturation:            'high' | 'mid' | 'low' | 'mixed'
  arousal_potential:              'activating' | 'moderate' | 'calming' | 'flat'
  profile_flag:                   'hyperarousal_risk' | 'hypoarousal_risk' | 'within_range' | 'profile_dependent'
  large_format_saturated_surface: boolean
  dominant_value:                 'light' | 'mid' | 'dark' | 'mixed'
  spatial_effect:                 'expansive' | 'neutral' | 'compressive'
}

type RoomObservations = {
  // Domain 1 — Amygdala Load
  visual_contrast:       'low' | 'moderate' | 'high' | 'severe'
  visual_predictability: 'high' | 'moderate' | 'low' | 'absent'
  hue_dissonance:        'harmonious' | 'mild_dissonance' | 'moderate_dissonance' | 'high_dissonance'
  chromatic_arousal:     ChromaticArousal

  // Domain 2 — Prefrontal Demand
  object_density:      'minimal' | 'moderate' | 'high' | 'excessive'
  visual_hierarchy:    'clear' | 'partial' | 'weak' | 'absent'
  surface_complexity:  'minimal' | 'low' | 'moderate' | 'high'

  // Domain 3 — Vagal Coherence
  biophilic_presence: 'integrated' | 'present' | 'minimal' | 'absent'
  tactile_anchors:    'strong' | 'moderate' | 'minimal' | 'absent'
  spatial_rhythm:     'strong' | 'moderate' | 'weak' | 'absent'

  // Domain 4 — Circadian Alignment
  light_directionality: 'natural_angle' | 'diffuse' | 'overhead_flat' | 'below_eye_level' | 'mixed'
  spectral_warmth:      'warm' | 'neutral' | 'cool' | 'mixed' | 'undetermined'
  glare_shadow:         'soft_graduated' | 'moderate' | 'high_contrast' | 'glare_present'

  // Domain 5 — Acoustic Safety
  hard_surface_dominance: 'predominantly_soft' | 'balanced' | 'predominantly_hard' | 'entirely_hard'
  acoustic_interruption:  'well_buffered' | 'partially_buffered' | 'exposed' | 'highly_exposed'

  // Cross-domain
  spatial_containment: 'contained' | 'partially_contained' | 'open' | 'exposed'
  maintenance_signal:  'well_maintained' | 'minor_signals' | 'moderate_signals' | 'significant_signals'

  // Confidence
  image_quality:    'sufficient' | 'partial' | 'insufficient'
  confidence_note:  string
}

type DomainScores = {
  amygdala:       number
  prefrontal:     number
  vagal:          number
  circadian:      number
  acoustic:       number
  neuroendocrine: number
}

type DomainWeights = {
  amygdala: number; prefrontal: number; vagal: number
  circadian: number; acoustic: number; neuroendocrine: number
}

// =============================================================================
// OBSERVATION SYSTEM PROMPT
// Instructs GPT-4o Vision to observe and return structured RoomObservations.
// Profile context is passed so chromatic_arousal.profile_flag is personalised.
// =============================================================================

function buildObservationPrompt(
  roomName: string,
  profile: SensoryProfile,
  integrationPattern: IntegrationVariant,
  measuredLux: number | null,
  acousticContext: string | null
): string {
  return `
You are the NeuroPsychology for Interior Design Observation Engine — a precision environmental analysis instrument 
grounded in environmental psychology, neuroscience, and sensory research.

Your task is to observe a room image and return a structured set of environmental observations 
using a fixed vocabulary. You are not scoring. You are not interpreting. You are observing 
with precision and reporting what is present.

USER CONTEXT (use only for chromatic_arousal.profile_flag):
  Sensory profile: ${profile}
  Integration pattern: ${integrationPattern}

ROOM TYPE: ${roomName}
MEASURED LUX (if provided): ${measuredLux != null ? measuredLux + ' lux' : 'Not measured — assess from image only'}
DECLARED SURFACE TYPE: ${acousticContext ?? 'Not declared — assess from image only'}

---

OBSERVATION FRAMEWORK — assess each property carefully from the image:

OB-1 VISUAL CONTRAST (visual_contrast):
Assess the ratio between the lightest and darkest surfaces in the frame.
Are transitions between light and dark gradual or abrupt?
Do high-contrast edges occur at the visual periphery or centre?
Values: "low" | "moderate" | "high" | "severe"

OB-2 VISUAL PREDICTABILITY (visual_predictability):
Do objects follow a discernible hierarchy — grouped by size, type, or proximity?
Does the arrangement appear intentional? Does the eye have a clear resting point?
Values: "high" | "moderate" | "low" | "absent"

OB-3 HUE DISSONANCE (hue_dissonance):
How many distinct hue families are present? Are colour transitions gradual or jarring?
Is any single element significantly more saturated than surrounding surfaces?
Values: "harmonious" | "mild_dissonance" | "moderate_dissonance" | "high_dissonance"

OB-3b CHROMATIC AROUSAL (chromatic_arousal):
Observe dominant hue families across walls, large furnishings, and flooring.
Assess saturation level of each dominant hue.
Note whether warm-spectrum hues (red, orange, yellow, warm pink) or 
cool-spectrum hues (blue, blue-green, grey-green, muted violet) dominate.
Flag whether any single surface carries high saturation occupying significant peripheral vision.

  dominant_hue_family: "warm" | "cool" | "neutral" | "mixed"
  dominant_saturation: "high" | "mid" | "low" | "mixed"
  arousal_potential: "activating" | "moderate" | "calming" | "flat"
  
  profile_flag — assign based on the user's sensory profile AND observed chromatic properties:
    "hyperarousal_risk"  — high saturation warm hues dominant + profile is sensor
    "hypoarousal_risk"   — cool desaturated hues dominant + profile is seeker
    "within_range"       — chromatic properties are within functional range for this profile
    "profile_dependent"  — chromatic properties that regulate one profile but load another
  
  large_format_saturated_surface: true if any single surface at high saturation
    occupies a significant portion of the peripheral visual field during normal occupancy
  
  dominant_value: "light" | "mid" | "dark" | "mixed"
  spatial_effect: "expansive" | "neutral" | "compressive"

OB-4 OBJECT DENSITY (object_density):
Count distinct objects. Are objects layered or stacked?
Do multiple objects compete for attention at the same visual plane?
Values: "minimal" | "moderate" | "high" | "excessive"

OB-5 VISUAL HIERARCHY CLARITY (visual_hierarchy):
Is there a clear dominant element the eye moves toward first?
Are secondary elements visually subordinate?
Do all elements appear to demand equal attention simultaneously?
Values: "clear" | "partial" | "weak" | "absent"

OB-6 SURFACE COMPLEXITY (surface_complexity):
Assess pattern density on visible surfaces — flooring, walls, textiles.
Are patterns geometric, organic, or chaotic?
Do multiple pattern families compete within the same visual field?
Values: "minimal" | "low" | "moderate" | "high"

OB-7 BIOPHILIC PRESENCE (biophilic_presence):
Observe living plants, natural materials (wood grain, stone, linen, rattan),
water features, organic forms, natural light.
Are biophilic elements incidental or structurally integrated?
Values: "integrated" | "present" | "minimal" | "absent"

OB-8 TACTILE ANCHOR PRESENCE (tactile_anchors):
Observe soft furnishings at body-contact surfaces — rugs underfoot,
cushions at seating, throws within reach.
Does the primary seating position have proprioceptive support?
Values: "strong" | "moderate" | "minimal" | "absent"

OB-9 SPATIAL RHYTHM (spatial_rhythm):
Does the arrangement of furniture and objects create visual rhythm?
Repeated forms, consistent spacing, intentional flow through the space?
Does the room feel settled or unresolved?
Values: "strong" | "moderate" | "weak" | "absent"

OB-10 LIGHT DIRECTIONALITY (light_directionality):
Does light enter from above, at eye level, or below?
Are light sources visible in frame?
Does the dominant light direction mimic natural daylight (above, angled)
or artificial overhead (flat, vertical)?
Values: "natural_angle" | "diffuse" | "overhead_flat" | "below_eye_level" | "mixed"

OB-11 SPECTRAL WARMTH (spectral_warmth):
What is the dominant colour temperature visible?
Warm amber/orange tones suggest low Kelvin.
Neutral white suggests 3500–4000K.
Cool blue-white suggests high Kelvin.
Do multiple light sources of different temperatures compete?
Values: "warm" | "neutral" | "cool" | "mixed" | "undetermined"

OB-12 GLARE AND SHADOW PATTERN (glare_shadow):
Does any light source create direct glare in the primary occupancy zone?
Are shadows soft and graduated or hard and abrupt?
Does the room have dark zones creating sharp luminance contrast?
Values: "soft_graduated" | "moderate" | "high_contrast" | "glare_present"

OB-13 HARD SURFACE DOMINANCE (hard_surface_dominance):
Assess the proportion of visible surfaces that are hard and reflective —
bare floors, concrete, tile, plaster walls, glass, metal.
Do soft surfaces interrupt or are they absent?
If user declared acoustic context, weight it alongside visual evidence.
Values: "predominantly_soft" | "balanced" | "predominantly_hard" | "entirely_hard"

OB-14 ACOUSTIC INTERRUPTION POTENTIAL (acoustic_interruption):
Are open doors or windows visible? Proximity indicators of high-traffic zones?
Is there any acoustic buffering between occupancy zone and potential noise sources?
Values: "well_buffered" | "partially_buffered" | "exposed" | "highly_exposed"

OB-15 SPATIAL CONTAINMENT (spatial_containment):
Does the room produce a sense of enclosure?
Walls visible on multiple sides, ceiling visible, furniture defining zones?
Would the occupant's back be exposed to open space?
Values: "contained" | "partially_contained" | "open" | "exposed"

OB-16 MAINTENANCE SIGNAL (maintenance_signal):
Are there visible signs of deferred maintenance — peeling surfaces,
misaligned objects, broken items?
Are objects in a state of incompletion — half-finished arrangements,
displaced furniture, visible disorganisation?
Values: "well_maintained" | "minor_signals" | "moderate_signals" | "significant_signals"

CONFIDENCE:
  image_quality: "sufficient" | "partial" | "insufficient"
  confidence_note: flag explicitly any property you cannot reliably assess from this image.
    If the image is well-lit and comprehensive, state "All observations made with confidence."
    Be precise about limitations — do not invent observations for obscured surfaces.

---

Return ONLY a strict JSON object matching this exact structure.
No preamble, no markdown, no commentary outside the JSON:

{
  "visual_contrast": "",
  "visual_predictability": "",
  "hue_dissonance": "",
  "chromatic_arousal": {
    "dominant_hue_family": "",
    "dominant_saturation": "",
    "arousal_potential": "",
    "profile_flag": "",
    "large_format_saturated_surface": false,
    "dominant_value": "",
    "spatial_effect": ""
  },
  "object_density": "",
  "visual_hierarchy": "",
  "surface_complexity": "",
  "biophilic_presence": "",
  "tactile_anchors": "",
  "spatial_rhythm": "",
  "light_directionality": "",
  "spectral_warmth": "",
  "glare_shadow": "",
  "hard_surface_dominance": "",
  "acoustic_interruption": "",
  "spatial_containment": "",
  "maintenance_signal": "",
  "image_quality": "",
  "confidence_note": ""
}
  `.trim()
}

// =============================================================================
// CLINICAL TRANSLATION SYSTEM PROMPT
// Receives observations + domain scores + profile context.
// Returns interpretation (leads), vision (after interventions), triggers,
// prescriptions. No score leads the output — interpretation leads.
// =============================================================================

const TRANSLATION_SYSTEM_PROMPT = `
You are the NeuroDesign Translation Engine — an environmental intelligence system 
grounded in environmental psychology, neuroscience, and sensory research.

YOUR FRAMEWORK:
You translate structured environmental observations and domain scores into 
precise, human-first interpretations for a specific nervous system.

This is neuropsychology applied to interior design — not clinical diagnosis.
Your language lives in the domain of home, environment, and lived experience.
You never pathologise. You never use clinical severity language.
You name environmental conditions and their nervous system consequences
with calm authority and without blame.

YOUR VOICE: Mirror → Reframe → Direction
  Mirror:   Name what is present in the space without judgement.
  Reframe:  Explain what that condition costs this specific nervous system.
  Direction: Orient toward what would change if the environment changed.

YOUR DESIGN PRINCIPLES (evidence-based — draw from these only):
  Predictability & spatial hierarchy
  Soft contrast and low-frequency visual load
  Biophilic and nature integration
  Circadian-aware lighting and spectral quality
  Acoustic buffering and zoning
  Micro-thermal regulation and tactile grounding
  Inclusive and sensory-regulated design

DIRECTIVES:
  - Never use aesthetic or trend language ("add a pop of colour", "feels cosy").
  - Never blame the person for the space.
  - Never invent findings not supported by the observation data.
  - Speak directly to the person's profile — a Sensor Accumulative and an Anchor
    Integrative in the same room have genuinely different experiences of it.
  - The interpretation leads. The score does not lead.
  - The vision (what this space becomes after interventions) should feel like a 
    genuine possibility — specific enough to be believable, not a generic aspiration.

Return ONLY a strict JSON object — no preamble, no markdown:
{
  "interpretation": "3-4 sentences. Mirror → Reframe → Direction. Name the 1-2 dominant environmental conditions and what they cost this specific nervous system. End with one orienting direction — what changes first and why.",
  "vision": "2-3 sentences. What this space becomes for this specific nervous system once the interventions are in place. Not generic. Grounded in the specific findings. Written in second person — speak to the person directly.",
  "triggers": [
    "Environmental condition named in terms of the neural system it loads — 1 sentence each",
    "Trigger 2",
    "Trigger 3"
  ],
  "prescriptions": [
    "Specific structural intervention grounded in one design principle — 1-2 sentences each",
    "Prescription 2",
    "Prescription 3"
  ],
  "primary_domain_under_load": "The single domain name carrying the highest load for this profile",
  "secondary_domain_under_load": "The second domain name, or null if only one is notable"
}
`

// =============================================================================
// ROOM WEIGHTING
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
// SCORING FUNCTIONS — OBSERVATION → DOMAIN SCORE
// All scores 0–100. Higher = better regulation.
// Inputs are qualitative observations; outputs are deterministic numbers.
// =============================================================================

function scoreAmygdalaLoad(obs: RoomObservations): number {
  // Visual contrast load
  const contrastLoad: Record<string, number> = {
    low: 8, moderate: 25, high: 55, severe: 80
  }
  // Visual predictability load
  const predictabilityLoad: Record<string, number> = {
    high: 5, moderate: 22, low: 50, absent: 75
  }
  // Hue dissonance load
  const dissonanceLoad: Record<string, number> = {
    harmonious: 5, mild_dissonance: 18, moderate_dissonance: 40, high_dissonance: 65
  }
  // Chromatic arousal load
  const arousalLoad: Record<string, number> = {
    activating: 20, moderate: 10, calming: 4, flat: 0
  }

  let raw =
    (contrastLoad[obs.visual_contrast]         ?? 25) * 0.30 +
    (predictabilityLoad[obs.visual_predictability] ?? 25) * 0.28 +
    (dissonanceLoad[obs.hue_dissonance]         ?? 20) * 0.22 +
    (arousalLoad[obs.chromatic_arousal.arousal_potential] ?? 10) * 0.20

  // Large-format saturated surface adds meaningful load
  if (obs.chromatic_arousal.large_format_saturated_surface) raw += 12

  // Spatial compression compounds amygdala load
  if (obs.chromatic_arousal.spatial_effect === 'compressive') raw += 6

  // Maintenance signals add unresolved-task vigilance load
  const maintenanceAdd: Record<string, number> = {
    well_maintained: 0, minor_signals: 4, moderate_signals: 10, significant_signals: 18
  }
  raw += (maintenanceAdd[obs.maintenance_signal] ?? 0)

  return Math.round(Math.max(0, Math.min(100, (1 - raw / 100) * 100)))
}

function scorePrefrontalDemand(obs: RoomObservations): number {
  const densityLoad: Record<string, number> = {
    minimal: 8, moderate: 30, high: 60, excessive: 85
  }
  const hierarchyLoad: Record<string, number> = {
    clear: 5, partial: 22, weak: 48, absent: 72
  }
  const complexityLoad: Record<string, number> = {
    minimal: 5, low: 18, moderate: 42, high: 68
  }

  const raw =
    (densityLoad[obs.object_density]       ?? 30) * 0.45 +
    (hierarchyLoad[obs.visual_hierarchy]   ?? 25) * 0.30 +
    (complexityLoad[obs.surface_complexity] ?? 20) * 0.25

  return Math.round(Math.max(0, Math.min(100, (1 - raw / 100) * 100)))
}

function scoreVagalCoherence(obs: RoomObservations): number {
  const biophilicScore: Record<string, number> = {
    integrated: 85, present: 60, minimal: 28, absent: 5
  }
  const tactileScore: Record<string, number> = {
    strong: 85, moderate: 58, minimal: 28, absent: 5
  }
  const rhythmScore: Record<string, number> = {
    strong: 80, moderate: 55, weak: 25, absent: 5
  }
  const hardSurfacePenalty: Record<string, number> = {
    predominantly_soft: 0, balanced: 8, predominantly_hard: 22, entirely_hard: 38
  }
  const containmentBonus: Record<string, number> = {
    contained: 10, partially_contained: 4, open: 0, exposed: 0
  }

  const raw =
    (biophilicScore[obs.biophilic_presence]           ?? 28) * 0.40 +
    (tactileScore[obs.tactile_anchors]                ?? 28) * 0.32 +
    (rhythmScore[obs.spatial_rhythm]                  ?? 25) * 0.28

  const penalty  = hardSurfacePenalty[obs.hard_surface_dominance] ?? 8
  const bonus    = containmentBonus[obs.spatial_containment] ?? 4

  return Math.round(Math.max(0, Math.min(100, raw - penalty + bonus)))
}

function scoreCircadianAlignment(
  obs: RoomObservations,
  roomName: string,
  measuredLux: number | null
): number {
  const isBedroom = roomName.toLowerCase().includes('bedroom')

  // Light directionality score
  const directionalityScore: Record<string, number> = {
    natural_angle: 88, diffuse: 62, overhead_flat: 40, below_eye_level: 20, mixed: 45
  }

  // Spectral warmth — context-dependent
  let spectralScore = 50
  const warmthMap = isBedroom
    ? { warm: 90, neutral: 65, cool: 30, mixed: 40, undetermined: 50 }
    : { warm: 50, neutral: 72, cool: 85, mixed: 60, undetermined: 50 }
  spectralScore = warmthMap[obs.spectral_warmth] ?? 50

  // Glare/shadow score
  const glareScore: Record<string, number> = {
    soft_graduated: 88, moderate: 62, high_contrast: 35, glare_present: 15
  }

  // Lux override — if measured, weight it heavily for circadian accuracy
  let luxScore = 50
  if (measuredLux !== null) {
    if (isBedroom) {
      luxScore = measuredLux < 50 ? 92 : measuredLux < 150 ? 72 : measuredLux < 300 ? 45 : 18
    } else {
      luxScore = measuredLux > 300 ? 92 : measuredLux > 150 ? 72 : measuredLux > 50 ? 50 : 25
    }
  }

  const observationScore =
    (directionalityScore[obs.light_directionality] ?? 45) * 0.40 +
    spectralScore * 0.35 +
    (glareScore[obs.glare_shadow] ?? 50) * 0.25

  // If lux was measured, blend it with observation score
  const finalScore = measuredLux !== null
    ? (observationScore * 0.55) + (luxScore * 0.45)
    : observationScore

  return Math.round(Math.max(0, Math.min(100, finalScore)))
}

function scoreAcousticSafety(obs: RoomObservations, roomName: string): number {
  const surfaceScore: Record<string, number> = {
    predominantly_soft: 88, balanced: 62, predominantly_hard: 35, entirely_hard: 15
  }
  const interruptionScore: Record<string, number> = {
    well_buffered: 88, partially_buffered: 62, exposed: 35, highly_exposed: 15
  }
  const containmentBonus: Record<string, number> = {
    contained: 8, partially_contained: 3, open: 0, exposed: 0
  }
  const bedroomBonus = roomName.toLowerCase().includes('bedroom') ? 8 : 0

  const raw =
    (surfaceScore[obs.hard_surface_dominance]    ?? 50) * 0.55 +
    (interruptionScore[obs.acoustic_interruption] ?? 50) * 0.45

  return Math.round(Math.max(0, Math.min(100,
    raw +
    (containmentBonus[obs.spatial_containment] ?? 0) +
    bedroomBonus
  )))
}

function scoreNeuroendocrineLoad(scores: Omit<DomainScores, 'neuroendocrine'>): number {
  return Math.round(
    scores.amygdala   * 0.25 +
    scores.prefrontal * 0.20 +
    scores.vagal      * 0.20 +
    scores.circadian  * 0.20 +
    scores.acoustic   * 0.15
  )
}

// =============================================================================
// ALIGNMENT INDEX
// =============================================================================

function computeAlignmentIndex(scores: DomainScores, weights: DomainWeights): number {
  const weightedSum =
    scores.amygdala       * weights.amygdala +
    scores.prefrontal     * weights.prefrontal +
    scores.vagal          * weights.vagal +
    scores.circadian      * weights.circadian +
    scores.acoustic       * weights.acoustic +
    scores.neuroendocrine * weights.neuroendocrine

  const maxPossible = 100 * (
    weights.amygdala + weights.prefrontal + weights.vagal +
    weights.circadian + weights.acoustic + weights.neuroendocrine
  )
  return Math.round((weightedSum / maxPossible) * 100)
}

// =============================================================================
// SCORE ALL DOMAINS FROM OBSERVATIONS
// =============================================================================

function scoreAllDomains(
  obs: RoomObservations,
  roomName: string,
  measuredLux: number | null
): DomainScores {
  const amygdala   = scoreAmygdalaLoad(obs)
  const prefrontal = scorePrefrontalDemand(obs)
  const vagal      = scoreVagalCoherence(obs)
  const circadian  = scoreCircadianAlignment(obs, roomName, measuredLux)
  const acoustic   = scoreAcousticSafety(obs, roomName)
  const neuroendocrine = scoreNeuroendocrineLoad({ amygdala, prefrontal, vagal, circadian, acoustic })

  return { amygdala, prefrontal, vagal, circadian, acoustic, neuroendocrine }
}

// =============================================================================
// ROUTE HANDLER
// =============================================================================

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // -------------------------------------------------------------------------
    // 1. AUTH
    // -------------------------------------------------------------------------
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isBypassUser = user.email === 'christchilde@gmail.com'

    // -------------------------------------------------------------------------
    // 2. SUBSCRIPTION VALIDATION
    // -------------------------------------------------------------------------
    let isAuthorized = isBypassUser

    if (!isAuthorized) {
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('plan, status, current_period_end')
        .eq('user_id', user.id)
        .maybeSingle()

      if (
        !subError && subscription &&
        subscription.plan === 'premium' &&
        subscription.status === 'active' &&
        new Date(subscription.current_period_end) >= new Date()
      ) {
        isAuthorized = true
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Premium subscription required.' }, { status: 403 })
    }

    // -------------------------------------------------------------------------
    // 3. MONTHLY SCAN LIMIT
    // -------------------------------------------------------------------------
    const currentMonth    = new Date().toISOString().slice(0, 7)
    const firstDayOfMonth = new Date(`${currentMonth}-01T00:00:00.000Z`)

    if (!isBypassUser) {
      const { count, error: countError } = await supabase
        .from('room_audits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', firstDayOfMonth.toISOString())

      if (countError) {
        return NextResponse.json({ error: 'Usage check failed.' }, { status: 500 })
      }

      if ((count ?? 0) >= 2) {
        return NextResponse.json({
          error: 'Monthly scan limit reached. Your allocation resets at the start of your next billing cycle.'
        }, { status: 429 })
      }
    }

    // -------------------------------------------------------------------------
    // 4. REQUEST BODY
    // -------------------------------------------------------------------------
    const body = await req.json()
    const {
      roomName,
      imageUrl,
      measuredLux,
      acousticContext,
      profile            = 'anchor',
      integrationPattern = 'integrative'
    } = body

    if (!roomName || !imageUrl) {
      return NextResponse.json({ error: 'Room name and image are required.' }, { status: 400 })
    }

    // -------------------------------------------------------------------------
    // 5. PRIORITY ROOM ENFORCEMENT
    // -------------------------------------------------------------------------
    if (!isBypassUser) {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('priority_room, priority_month')
        .eq('id', user.id)
        .single()

      if (profileError) {
        return NextResponse.json({ error: 'Profile lookup failed.' }, { status: 500 })
      }

      if (!profileData.priority_month || profileData.priority_month !== currentMonth) {
        await supabase.from('users')
          .update({ priority_room: roomName, priority_month: currentMonth })
          .eq('id', user.id)
      } else if (profileData.priority_room !== roomName) {
        return NextResponse.json({
          error: `This billing cycle is locked to your priority room: "${profileData.priority_room}". Choose a different room next month.`
        }, { status: 403 })
      }
    }

    // -------------------------------------------------------------------------
    // 6. IMAGE RETRIEVAL
    // Bucket is private. Download server-side, convert to base64.
    // GPT-4o Vision receives image data directly — never touches storage URL.
    // -------------------------------------------------------------------------
    const storagePath = imageUrl.split('/room_audits/')[1]
    if (!storagePath) {
      throw new Error('Could not parse storage path from image URL.')
    }

    const { data: imageBlob, error: downloadError } = await supabase
      .storage
      .from('room_audits')
      .download(storagePath)

    if (downloadError || !imageBlob) {
      throw new Error('Could not retrieve image from storage.')
    }

    const imageBuffer = await imageBlob.arrayBuffer()
    const imageBase64 = Buffer.from(imageBuffer).toString('base64')

    // -------------------------------------------------------------------------
    // 7. GPT-4o VISION — OBSERVATION PASS
    // GPT-4o observes the room and returns structured RoomObservations.
    // Profile context is passed for chromatic_arousal.profile_flag only.
    // GPT-4o does not score — it observes.
    // -------------------------------------------------------------------------
    const observationPrompt = buildObservationPrompt(
      roomName,
      profile as SensoryProfile,
      integrationPattern as IntegrationVariant,
      measuredLux ?? null,
      acousticContext ?? null
    )

    const observationCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url:    `data:image/jpeg;base64,${imageBase64}`,
                detail: 'high'
              }
            },
            {
              type: 'text',
              text: observationPrompt
            }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      temperature:     0.1,  // Low temperature — observation should be stable
      max_tokens:      1200,
    })

    const rawObservations = JSON.parse(
      observationCompletion.choices[0].message.content || '{}'
    ) as RoomObservations

    // Guard: if image quality is insufficient, return early with a clear message
    if (rawObservations.image_quality === 'insufficient') {
      return NextResponse.json({
        success: false,
        error:   'The image does not provide enough environmental detail for a reliable analysis. Please photograph the full room in good lighting, ideally showing at least three walls, the floor, and the primary light sources.'
      }, { status: 422 })
    }

    // -------------------------------------------------------------------------
    // 8. DETERMINISTIC DOMAIN SCORING
    // Scoring functions map qualitative observations to 0-100 domain scores.
    // This is your authority layer — the formulas reflect your framework.
    // -------------------------------------------------------------------------
    const domainScores  = scoreAllDomains(rawObservations, roomName, measuredLux ?? null)
    const weights       = getRoomWeights(roomName)
    const alignmentIndex = computeAlignmentIndex(domainScores, weights)

    // -------------------------------------------------------------------------
    // 9. GPT-4o CLINICAL TRANSLATION — INTERPRETATION PASS
    // Receives observations + scores + full profile context.
    // Returns interpretation (leads), vision, triggers, prescriptions.
    // Step 3 will deepen prescription personalisation and add FFE library.
    // -------------------------------------------------------------------------
    const translationPayload = `
USER SENSORY PROFILE: ${profile} (${integrationPattern} pattern)
ROOM TYPE: ${roomName}
MEASURED LUX: ${measuredLux != null ? measuredLux + ' lux' : 'Not measured'}

DOMAIN SCORES (0–100, higher = better regulation):
  Amygdala Load Regulation:    ${domainScores.amygdala}/100
  Prefrontal Demand Buffer:    ${domainScores.prefrontal}/100
  Vagal Coherence:             ${domainScores.vagal}/100
  Circadian Alignment:         ${domainScores.circadian}/100
  Acoustic Safety:             ${domainScores.acoustic}/100
  Neuroendocrine Load Balance: ${domainScores.neuroendocrine}/100
  Master Alignment Index:      ${alignmentIndex}/100

KEY OBSERVATIONS:
  Visual contrast:          ${rawObservations.visual_contrast}
  Visual predictability:    ${rawObservations.visual_predictability}
  Hue dissonance:           ${rawObservations.hue_dissonance}
  Chromatic arousal:        ${rawObservations.chromatic_arousal.arousal_potential} (${rawObservations.chromatic_arousal.dominant_hue_family} hues, ${rawObservations.chromatic_arousal.dominant_saturation} saturation)
  Chromatic profile flag:   ${rawObservations.chromatic_arousal.profile_flag}
  Large-format saturated surface: ${rawObservations.chromatic_arousal.large_format_saturated_surface}
  Object density:           ${rawObservations.object_density}
  Visual hierarchy:         ${rawObservations.visual_hierarchy}
  Biophilic presence:       ${rawObservations.biophilic_presence}
  Tactile anchors:          ${rawObservations.tactile_anchors}
  Spatial rhythm:           ${rawObservations.spatial_rhythm}
  Light directionality:     ${rawObservations.light_directionality}
  Spectral warmth:          ${rawObservations.spectral_warmth}
  Glare / shadow pattern:   ${rawObservations.glare_shadow}
  Hard surface dominance:   ${rawObservations.hard_surface_dominance}
  Acoustic interruption:    ${rawObservations.acoustic_interruption}
  Spatial containment:      ${rawObservations.spatial_containment}
  Maintenance signal:       ${rawObservations.maintenance_signal}
  Observation confidence:   ${rawObservations.image_quality}
  ${rawObservations.confidence_note ? 'Confidence note: ' + rawObservations.confidence_note : ''}

PROFILE CONTEXT FOR TRANSLATION:
  A ${profile} (${integrationPattern}) nervous system experiences this room differently
  from a different profile in the same space.
  ${profile === 'sensor'
    ? 'This system runs at higher baseline sensitivity. Environmental conditions that produce mild arousal in a regulated system produce measurable load in this one. Chromatic and acoustic conditions carry compounded cost with an accumulative pattern.'
    : profile === 'seeker'
    ? 'This system requires adequate environmental stimulation for executive engagement. Under-stimulating conditions compound the under-arousal tendency. Cool desaturated palettes and low sensory complexity are as problematic as overload for a different profile.'
    : 'This system has broader environmental tolerance. The relevant findings are sustained sustained load conditions such as particularly accumulated circadian misalignment, persistent maintenance signals, and acoustic vulnerability, that exceed the system\'s absorption capacity over time.'
  }

Generate the interpretation, vision, triggers, prescriptions, and domain identifiers
as specified. The interpretation leads, not the score.
    `.trim()

    const translationCompletion = await openai.chat.completions.create({
      model:    'gpt-4o',
      messages: [
        { role: 'system', content: TRANSLATION_SYSTEM_PROMPT },
        { role: 'user',   content: translationPayload }
      ],
      response_format: { type: 'json_object' },
      temperature:     0.25,
      max_tokens:      1000,
    })

    const translation = JSON.parse(
      translationCompletion.choices[0].message.content || '{}'
    )

    // -------------------------------------------------------------------------
    // 10. DATA PERSISTENCE
    // Primary audit record is the source of truth.
    // Secondary writes are individually guarded and best-effort.
    // Observations stored as JSONB for Step 2 (profile weighting) and
    // Step 4 (BSFI correlation) to query against.
    // -------------------------------------------------------------------------
    const { data: auditRecord, error: auditErr } = await supabase
      .from('room_audits')
      .insert({
        user_id:         user.id,
        room_type:       roomName,
        arousal_score:   parseFloat(((1 - domainScores.amygdala / 100) * 100).toFixed(1)),
        alignment_score: alignmentIndex,
        insight:         translation.interpretation || null,
        // Step 2 hook — profile context stored for weighted scoring layer
        sensory_profile:      profile,
        integration_pattern:  integrationPattern
      })
      .select('id')
      .single()

    if (auditErr) throw new Error(`Failed to create audit record: ${auditErr.message}`)
    const auditId = auditRecord.id

    const secondaryWrites = [
      // domain_scores — deterministic scores from observation pass
      supabase.from('domain_scores').insert({
        audit_id:            auditId,
        user_id:             user.id,
        amygdala_load:       domainScores.amygdala,
        prefrontal_demand:   domainScores.prefrontal,
        vagal_coherence:     domainScores.vagal,
        circadian_alignment: domainScores.circadian,
        acoustic_safety:     domainScores.acoustic,
        neuroendocrine_load: domainScores.neuroendocrine,
        master_index:        alignmentIndex
      }),
      // raw_metrics — qualitative observations as JSONB
      // queried by Step 2 (profile weighting) and Step 4 (BSFI correlation)
      supabase.from('raw_metrics').insert({
        audit_id:         auditId,
        user_id:          user.id,
        raw_observations: rawObservations,
        image_quality:    rawObservations.image_quality,
        confidence_note:  rawObservations.confidence_note || null,
        measured_lux:     measuredLux ?? null,
        estimated_kelvin: rawObservations.spectral_warmth === 'warm'   ? 2700
                        : rawObservations.spectral_warmth === 'cool'   ? 5500
                        : rawObservations.spectral_warmth === 'neutral' ? 3500
                        : null
      }),
      translation.triggers?.length > 0
        ? supabase.from('stress_triggers').insert(
            translation.triggers.map((t: string) => ({
              audit_id: auditId, user_id: user.id, trigger_description: t
            }))
          )
        : Promise.resolve({ error: null }),
      translation.prescriptions?.length > 0
        ? supabase.from('prescriptions').insert(
            translation.prescriptions.map((rx: string) => ({
              audit_id: auditId, user_id: user.id, prescription_text: rx
            }))
          )
        : Promise.resolve({ error: null })
    ]

    const results = await Promise.allSettled(secondaryWrites)
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        console.error(`[analyze] Secondary write ${i} failed:`, result.reason)
      }
    })

    // -------------------------------------------------------------------------
    // 11. FRONTEND PAYLOAD
    // Structure carries both layers:
    //   - interpretation layer (leads in UI)
    //   - detail layer (accordion — domain scores + observations)
    // Step 2 will add profile_weighted_scores to the detail layer.
    // Step 3 will add ffe_recommendations to prescriptions.
    // Step 4 will add bsfi_correlation to the interpretation layer.
    // -------------------------------------------------------------------------
    return NextResponse.json({
      success: true,
      data: {

        // INTERPRETATION LAYER — leads in UI
        interpretation:   translation.interpretation || '',
        vision:           translation.vision         || '',
        triggers:         translation.triggers        || [],
        prescriptions:    translation.prescriptions   || [],

        primary_domain_under_load:   translation.primary_domain_under_load   || null,
        secondary_domain_under_load: translation.secondary_domain_under_load || null,

        // DETAIL LAYER — accordion display
        // Step 2 will add profile_weighted_scores here
        detail: {
          alignment_index:  alignmentIndex,
          image_quality:    rawObservations.image_quality,
          confidence_note:  rawObservations.confidence_note || null,

          domain_scores: {
            'Amygdala Regulation':    domainScores.amygdala,
            'Prefrontal Buffer':      domainScores.prefrontal,
            'Vagal Coherence':        domainScores.vagal,
            'Circadian Alignment':    domainScores.circadian,
            'Acoustic Safety':        domainScores.acoustic,
            'Neuroendocrine Balance': domainScores.neuroendocrine
          },

          observations: {
            chromatic_arousal_flag:          rawObservations.chromatic_arousal.profile_flag,
            large_format_saturated_surface:  rawObservations.chromatic_arousal.large_format_saturated_surface,
            biophilic_presence:              rawObservations.biophilic_presence,
            tactile_anchors:                 rawObservations.tactile_anchors,
            spatial_containment:             rawObservations.spatial_containment,
            light_directionality:            rawObservations.light_directionality,
            spectral_warmth:                 rawObservations.spectral_warmth,
            hard_surface_dominance:          rawObservations.hard_surface_dominance,
            maintenance_signal:              rawObservations.maintenance_signal
          }
        }
      }
    })

  } catch (error: any) {
    console.error('[analyze] Engine error:', {
      message: error.message,
      status:  error.status,
      code:    error.code,
    })

    let safeMessage = 'The analysis could not be completed. Please try again.'

    if (
      error.status === 401 ||
      error.message?.includes('API key') ||
      error.message?.includes('Incorrect API key')
    ) {
      safeMessage = 'A configuration error occurred. Please contact support.'
    } else if (error.message?.includes('storage') || error.message?.includes('image')) {
      safeMessage = 'Image processing failed. Please try a different photo.'
    } else if (error.message?.includes('Upload failed')) {
      safeMessage = 'Image upload failed. Please check your connection and try again.'
    } else if (
      error.message?.includes('billing cycle') ||
      error.message?.includes('scan limit')
    ) {
      safeMessage = error.message
    }

    return NextResponse.json(
      { success: false, error: safeMessage },
      { status: 500 }
    )
  }
}
