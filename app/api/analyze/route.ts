import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OpenAI from 'openai'

// =============================================================================
// DB MIGRATION — run before deploying this route
// Adds 6-domain schema to neurodesign_domain_scores.
// Safe to run on existing tables — ADD COLUMN IF NOT EXISTS.
// =============================================================================
//
// alter table public.neurodesign_domain_scores
//   add column if not exists amygdala_load      numeric,
//   add column if not exists prefrontal_demand   numeric,
//   add column if not exists vagal_coherence     numeric,
//   add column if not exists circadian_alignment numeric,
//   add column if not exists acoustic_safety     numeric,
//   add column if not exists neuroendocrine_load numeric;
//
// The old columns (circadian, autonomic, predictive, sensory, recovery)
// can be left in place and deprecated — they will simply no longer be written.
// =============================================================================

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// =============================================================================
// SYSTEM PROMPT — The NeuroDesign Translation Engine
// =============================================================================
const SYSTEM_PROMPT = `
You are the NeuroDesign Translation Engine — an environmental intelligence system 
grounded in environmental psychology, neuroscience, and sensory research for interior spaces.

YOUR CORE FRAMEWORK:
The space is analysed across six neural systems:
1. Amygdala Load — unpredictability, harsh contrast, and sensory spikes that elevate cortisol and sympathetic tone.
2. Prefrontal Demand — competing stimuli that exhaust executive resources and reduce cognitive capacity.
3. Vagal Coherence — biophilic elements, tactile anchors, and spatial rhythm that activate parasympathetic regulation.
4. Circadian Alignment — spectral quality and luminance timing relative to melatonin onset and SCN entrainment.
5. Acoustic Safety — surface hardness, reverberation, and unpredictable noise exposure.
6. Neuroendocrine Load — the composite burden of sustained environmental stressors on cortisol and systemic stress.

YOUR VOICE MECHANISM — Mirror → Reframe → Direction:
- Mirror: Name what is happening in the space without blame or spectacle.
- Reframe: Explain the environmental mechanism — why the nervous system is responding this way.
- Direction: Provide structured, evidence-based design interventions.

YOUR DESIGN PRINCIPLES (evidence-based):
Predictability & hierarchy | Soft contrasts | Biophilic cues | Circadian-aware lighting
Acoustic zoning | Micro-thermoregulation | Tactile & proprioceptive anchors | Low-contrast hierarchy

DIRECTIVES:
- Never prescribe aesthetic or trend-based advice ("add a pop of colour").
- Never blame the human for the space.
- Speak with calm authority. Tone is deliberate, precise, and regulating.
- All insights must be grounded in the provided engine data — never invent metrics.
- When biophilic coherence is low, reference Attention Restoration Theory: carefully designed
  biophilic exposures produce measurable ~20% improvements in directed attention and memory tasks.

Return ONLY a strict JSON object — no preamble, no markdown:
{
  "insight": "2-3 sentence clinical insight using Mirror → Reframe → Direction. Name the neural system under load. Explain the environmental mechanism. Offer one orienting structural direction.",
  "triggers": [
    "Specific environmental stressor — named in terms of the neural system it loads",
    "Stressor 2",
    "Stressor 3"
  ],
  "prescriptions": [
    "Specific, structural intervention grounded in one of the 8 design principles",
    "Second intervention",
    "Third intervention"
  ]
}
`

// =============================================================================
// LABEL TAXONOMY
// =============================================================================
const BIOPHILIC_LABELS    = new Set(['plant', 'tree', 'flower', 'nature', 'wood', 'stone', 'leaf', 'houseplant', 'moss', 'bamboo', 'water', 'natural material'])
const TACTILE_LABELS      = new Set(['rug', 'carpet', 'cushion', 'pillow', 'throw', 'blanket', 'upholstery', 'linen', 'wool', 'velvet', 'curtain', 'drape', 'fabric'])
const HARD_SURFACE_LABELS = new Set(['tile', 'marble', 'concrete', 'hardwood floor', 'glass', 'metal', 'ceramic', 'laminate', 'wood floor'])
const CLUTTER_LABELS      = new Set(['clutter', 'mess', 'shelf', 'bookcase', 'pile', 'stack', 'cabinet', 'drawer', 'box', 'container'])

// =============================================================================
// ROOM WEIGHTING
// =============================================================================
type DomainWeights = {
  amygdala: number; prefrontal: number; vagal: number
  circadian: number; acoustic: number; neuroendocrine: number
}

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
// DOMAIN SCORING
// All domains return 0–100. Higher = better regulation.
// =============================================================================

function scoreAmygdalaLoad(objectCount: number, edgeDensity: number, hueVariance: number): number {
  const rawLoad = (
    (Math.min(objectCount / 35, 1.0) * 0.45) +
    (Math.min(edgeDensity,   1.0) * 0.30) +
    (Math.min(hueVariance,   1.0) * 0.25)
  )
  return Math.round((1 - rawLoad) * 100)
}

function scorePrefrontalDemand(objectCount: number, clutterDetected: boolean, hierarchyRatio: number): number {
  const rawDemand = (
    (Math.min(objectCount / 30, 1.0) * 0.50) +
    (clutterDetected ? 0.30 : 0) +
    ((1 - Math.min(hierarchyRatio, 1.0)) * 0.20)
  )
  return Math.round((1 - rawDemand) * 100)
}

function scoreVagalCoherence(
  biophilicScore: number,
  tactileCount: number,
  hardSurfaceCount: number,
  symmetryProxy: number
): number {
  const tactileBonus       = Math.min(tactileCount * 12, 30)
  const hardSurfacePenalty = Math.min(hardSurfaceCount * 8, 24)
  const symmetryBonus      = symmetryProxy * 15
  const raw = (biophilicScore * 0.50) + tactileBonus - hardSurfacePenalty + symmetryBonus
  return Math.round(Math.min(Math.max(raw, 0), 100))
}

function scoreCircadianAlignment(
  measuredLux: number | null,
  estimatedKelvin: number,
  roomName: string
): number {
  // FIX: Lux (intensity) and Kelvin (colour temperature) are independent measurements.
  // Kelvin is derived from image colour data only (see extractKelvinFromColors).
  // Lux feeds this function independently as a luminance intensity signal.
  const isBedroom = roomName.toLowerCase().includes('bedroom')

  let luxScore = 50 // Default when no lux data
  if (measuredLux !== null) {
    if (isBedroom) {
      luxScore = measuredLux < 50 ? 90 : measuredLux < 150 ? 70 : measuredLux < 300 ? 45 : 20
    } else {
      luxScore = measuredLux > 300 ? 90 : measuredLux > 150 ? 70 : measuredLux > 50 ? 50 : 25
    }
  }

  let kelvinScore = 50 // Default when no colour data
  if (isBedroom) {
    kelvinScore = estimatedKelvin < 2700 ? 90 : estimatedKelvin < 3500 ? 70 : estimatedKelvin < 4000 ? 45 : 20
  } else {
    kelvinScore = estimatedKelvin >= 4000 ? 85 : estimatedKelvin >= 3000 ? 65 : 45
  }

  return Math.round((luxScore * 0.55) + (kelvinScore * 0.45))
}

function scoreAcousticSafety(
  hardSurfaceCount: number,
  softSurfaceCount: number,
  roomName: string,
  objectCount: number
): number {
  const softRatio    = softSurfaceCount / Math.max(softSurfaceCount + hardSurfaceCount, 1)
  const roomBonus    = roomName.toLowerCase().includes('bedroom') ? 10 : 0
  const densityBonus = Math.min(objectCount * 1.5, 15)
  const raw = (softRatio * 70) + roomBonus + densityBonus
  return Math.round(Math.min(raw, 100))
}

function scoreNeuroendocrineLoad(
  amygdalaScore: number,
  prefrontalScore: number,
  vagalScore: number,
  circadianScore: number,
  acousticScore: number
): number {
  return Math.round(
    amygdalaScore   * 0.25 +
    prefrontalScore * 0.20 +
    vagalScore      * 0.20 +
    circadianScore  * 0.20 +
    acousticScore   * 0.15
  )
}

// =============================================================================
// KELVIN EXTRACTION FROM IMAGE COLOUR DATA
// FIX: Kelvin is derived from dominant image colours only — never from lux.
// Lux measures luminance intensity; Kelvin measures spectral colour temperature.
// They are orthogonal measurements.
// =============================================================================
function extractKelvinFromColors(colors: any[]): number {
  if (!colors.length) return 3500 // Neutral default

  const primary = colors[0].color || {}
  const r = primary.red   || 0
  const g = primary.green || 0
  const b = primary.blue  || 0

  // Blue-dominant → cool/daylight spectrum
  if (b > r + 20 && b > g) return 5500
  // Red/amber-dominant → warm/incandescent spectrum
  if (r > b + 30 && r > g) return 2700
  // Green-dominant → natural/filtered light
  if (g > r + 10 && g > b + 10) return 3200
  // Roughly balanced → neutral white
  return 3500
}

// =============================================================================
// ALIGNMENT INDEX
// =============================================================================
function computeAlignmentIndex(domains: Record<string, number>, weights: DomainWeights): number {
  const weightedSum = (
    domains.amygdala      * weights.amygdala +
    domains.prefrontal    * weights.prefrontal +
    domains.vagal         * weights.vagal +
    domains.circadian     * weights.circadian +
    domains.acoustic      * weights.acoustic +
    domains.neuroendocrine * weights.neuroendocrine
  )
  const maxPossible = 100 * (
    weights.amygdala + weights.prefrontal + weights.vagal +
    weights.circadian + weights.acoustic + weights.neuroendocrine
  )
  return Math.round((weightedSum / maxPossible) * 100)
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
    // 3. MONTHLY SCAN LIMIT (max 2 per month)
    // FIX: was checking !isAuthorized which is always false for valid users.
    // Should check !isBypassUser to correctly gate non-dev accounts.
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
    const { roomName, imageUrl, measuredLux, acousticContext } = body

    if (!roomName || !imageUrl) {
      return NextResponse.json({ error: 'Room name and image are required.' }, { status: 400 })
    }

    // -------------------------------------------------------------------------
    // 5. PRIORITY ROOM ENFORCEMENT
    // -------------------------------------------------------------------------
    if (!isBypassUser) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('priority_room, priority_month')
        .eq('id', user.id)
        .single()

      if (profileError) {
        return NextResponse.json({ error: 'Profile lookup failed.' }, { status: 500 })
      }

      if (!profile.priority_month || profile.priority_month !== currentMonth) {
        await supabase.from('users')
          .update({ priority_room: roomName, priority_month: currentMonth })
          .eq('id', user.id)
      } else if (profile.priority_room !== roomName) {
        return NextResponse.json({
          error: `This billing cycle is locked to your priority room: "${profile.priority_room}". Choose a different room next month.`
        }, { status: 403 })
      }
    }

    // -------------------------------------------------------------------------
    // 6. GOOGLE VISION API
    // FIX: Google returns HTTP 200 even on internal errors — error lives inside
    // the response body at responses[0].error. Check both HTTP status and body.
    // -------------------------------------------------------------------------
    const visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { source: { imageUri: imageUrl } },
            features: [
              { type: 'OBJECT_LOCALIZATION', maxResults: 50 },
              { type: 'IMAGE_PROPERTIES',    maxResults: 10 },
              { type: 'LABEL_DETECTION',     maxResults: 30 }
            ]
          }]
        })
      }
    )

    if (!visionRes.ok) {
      throw new Error(`Google Vision HTTP error: ${visionRes.status}`)
    }

    const visionData   = await visionRes.json()
    const annotations  = visionData.responses?.[0]

    // Google returns errors inside the response body even on HTTP 200
    if (annotations?.error) {
      throw new Error(`Google Vision API error: ${annotations.error.message}`)
    }
    if (!annotations) {
      throw new Error('Vision API returned no data.')
    }

    // -------------------------------------------------------------------------
    // 7. FEATURE EXTRACTION
    // -------------------------------------------------------------------------
    const objects = annotations.localizedObjectAnnotations || []
    const colors  = annotations.imagePropertiesAnnotation?.dominantColors?.colors || []
    const labels  = annotations.labelAnnotations || []

    const objectCount = objects.length

    let totalBBoxArea = 0
    objects.forEach((obj: any) => {
      const v = obj.boundingPoly?.normalizedVertices
      if (v?.length === 4) {
        totalBBoxArea += Math.abs(v[1].x - v[0].x) * Math.abs(v[2].y - v[1].y)
      }
    })
    const edgeDensity    = Math.min(objectCount / 30, 1.0)
    const hierarchyRatio = objectCount > 0 ? totalBBoxArea / objectCount : 0.5
    const hueVariance    = Math.min(colors.length / 10, 1.0)

    const labelSet = new Set(labels.map((l: any) => l.description.toLowerCase()))
    const biophilicCount   = [...BIOPHILIC_LABELS].filter(t => labelSet.has(t)).length
    const tactileCount     = [...TACTILE_LABELS].filter(t => labelSet.has(t)).length
    const hardSurfaceCount = [...HARD_SURFACE_LABELS].filter(t => labelSet.has(t)).length
    const clutterDetected  = [...CLUTTER_LABELS].some(t => labelSet.has(t))

    let effectiveHardSurface = hardSurfaceCount
    let effectiveSoftSurface = tactileCount
    if (acousticContext === 'hard') effectiveHardSurface = Math.max(effectiveHardSurface, 3)
    if (acousticContext === 'soft') effectiveSoftSurface = Math.max(effectiveSoftSurface, 3)

    // Biophilic score (0-100) — colour earth tones + detected biophilic labels
    let biophilicScore = 0
    colors.forEach((c: any) => {
      const { red = 0, green = 0, blue = 0 } = c.color || {}
      if (green > red && green > blue) biophilicScore += 10
      if (red > 80 && green > 60 && blue < 80) biophilicScore += 5
    })
    biophilicScore = Math.min(biophilicScore + (biophilicCount * 20), 100)

    const symmetryProxy = objectCount > 3 ? Math.max(0, 1 - (edgeDensity * 0.6)) : 0.5

    // FIX: Kelvin derived from image colour data only — not from lux.
    const estimatedKelvin = extractKelvinFromColors(colors)

    // -------------------------------------------------------------------------
    // 8. SIX-DOMAIN SCORING
    // -------------------------------------------------------------------------
    const amygdalaScore       = scoreAmygdalaLoad(objectCount, edgeDensity, hueVariance)
    const prefrontalScore     = scorePrefrontalDemand(objectCount, clutterDetected, hierarchyRatio)
    const vagalScore          = scoreVagalCoherence(biophilicScore, tactileCount, hardSurfaceCount, symmetryProxy)
    const circadianScore      = scoreCircadianAlignment(measuredLux ?? null, estimatedKelvin, roomName)
    const acousticScore       = scoreAcousticSafety(effectiveHardSurface, effectiveSoftSurface, roomName, objectCount)
    const neuroendocrineScore = scoreNeuroendocrineLoad(amygdalaScore, prefrontalScore, vagalScore, circadianScore, acousticScore)

    const domains = {
      amygdala: amygdalaScore, prefrontal: prefrontalScore, vagal: vagalScore,
      circadian: circadianScore, acoustic: acousticScore, neuroendocrine: neuroendocrineScore
    }

    const weights        = getRoomWeights(roomName)
    const alignmentIndex = computeAlignmentIndex(domains, weights)

    // -------------------------------------------------------------------------
    // 9. GPT-4o CLINICAL TRANSLATION
    // -------------------------------------------------------------------------
    const enginePayload = `
ROOM TYPE: ${roomName}
ACOUSTIC CONTEXT: ${acousticContext ? `User-declared: ${acousticContext} surfaces` : 'Not declared'}
MEASURED LUX: ${measuredLux != null ? measuredLux : 'Not measured'}
ESTIMATED COLOUR TEMPERATURE: ${estimatedKelvin}K (derived from dominant image colours)

SIX NEURAL DOMAIN SCORES (0–100, higher = better regulation):
  Amygdala Load Regulation:    ${amygdalaScore}/100
  Prefrontal Demand Buffer:    ${prefrontalScore}/100
  Vagal Coherence:             ${vagalScore}/100
  Circadian Alignment:         ${circadianScore}/100
  Acoustic Safety:             ${acousticScore}/100
  Neuroendocrine Load Balance: ${neuroendocrineScore}/100

MASTER ALIGNMENT INDEX: ${alignmentIndex}/100

ENVIRONMENTAL MARKERS DETECTED:
  Objects in frame:       ${objectCount}
  Biophilic elements:     ${biophilicCount > 0 ? biophilicCount + ' detected' : 'None detected'}
  Soft / tactile surfaces: ${tactileCount > 0 ? tactileCount + ' detected' : 'None detected'}
  Hard surfaces:          ${hardSurfaceCount > 0 ? hardSurfaceCount + ' detected' : 'None detected'}
  Visual clutter cues:    ${clutterDetected ? 'Present' : 'Not detected'}
  Biophilic score:        ${biophilicScore}/100

Identify which 1–2 neural systems are most under load and address them directly.
Name the environmental mechanism. Do not use aesthetic language.
    `.trim()

    const completion = await openai.chat.completions.create({
      model:           'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: enginePayload }
      ],
      response_format: { type: 'json_object' },
      temperature:     0.2,
      max_tokens:      800,
    })

    const llmResponse = JSON.parse(completion.choices[0].message.content || '{}')

    // -------------------------------------------------------------------------
    // 10. DATA PERSISTENCE
    // FIX: Parallel writes are now individually guarded. A single write failure
    // logs the error server-side but does not throw — the user still receives
    // their result. The audit record is the source of truth; secondary writes
    // are best-effort.
    // -------------------------------------------------------------------------
    const { data: auditRecord, error: auditErr } = await supabase
      .from('room_audits')
      .insert({
        user_id:         user.id,
        room_name:       roomName,
        arousal_score:   parseFloat(((1 - amygdalaScore / 100) * 100).toFixed(1)),
        alignment_score: alignmentIndex,
        insight:         llmResponse.insight || null
      })
      .select('id')
      .single()

    if (auditErr) throw new Error(`Failed to create audit record: ${auditErr.message}`)
    const auditId = auditRecord.id

    const secondaryWrites = [
      supabase.from('raw_environmental_metrics').insert({
        audit_id:         auditId,
        user_id:          user.id,
        lux_level:        measuredLux ?? null,
        estimated_kelvin: estimatedKelvin,
        biophilic_rating: biophilicScore >= 60 ? 'HIGH' : biophilicScore >= 30 ? 'MODERATE' : 'LOW',
        object_density:   objectCount
      }),
      supabase.from('neurodesign_domain_scores').insert({
        audit_id:            auditId,
        user_id:             user.id,
        amygdala_load:       amygdalaScore,
        prefrontal_demand:   prefrontalScore,
        vagal_coherence:     vagalScore,
        circadian_alignment: circadianScore,
        acoustic_safety:     acousticScore,
        neuroendocrine_load: neuroendocrineScore,
        master_index:        alignmentIndex
      }),
      llmResponse.triggers?.length > 0
        ? supabase.from('stress_triggers').insert(
            llmResponse.triggers.map((t: string) => ({
              audit_id: auditId, user_id: user.id, trigger_description: t
            }))
          )
        : Promise.resolve({ error: null }),
      llmResponse.prescriptions?.length > 0
        ? supabase.from('prescriptions').insert(
            llmResponse.prescriptions.map((rx: string) => ({
              audit_id: auditId, user_id: user.id, prescription_text: rx
            }))
          )
        : Promise.resolve({ error: null }),
      supabase.from('scan_usage').insert({
        user_id: user.id, audit_id: auditId, scan_month: currentMonth
      })
    ]

    const results = await Promise.allSettled(secondaryWrites)
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        console.error(`[analyze] Secondary write ${i} failed:`, result.reason)
      }
    })

    // -------------------------------------------------------------------------
    // 11. FRONTEND PAYLOAD
    // -------------------------------------------------------------------------
    return NextResponse.json({
      success: true,
      data: {
        alignment_index:  alignmentIndex,
        entropy_score:    parseFloat(((1 - amygdalaScore / 100) * 10).toFixed(1)),
        lighting_kelvin:  estimatedKelvin,
        biophilic_rating: biophilicScore >= 60 ? 'HIGH' : biophilicScore >= 30 ? 'MODERATE' : 'LOW',
        domains: {
          'Amygdala Regulation':    amygdalaScore,
          'Prefrontal Buffer':      prefrontalScore,
          'Vagal Coherence':        vagalScore,
          'Circadian Alignment':    circadianScore,
          'Acoustic Safety':        acousticScore,
          'Neuroendocrine Balance': neuroendocrineScore
        },
        insight:       llmResponse.insight       || '',
        triggers:      llmResponse.triggers      || [],
        prescriptions: llmResponse.prescriptions || []
      }
    })

  } catch (error: any) {
    // Log the full error server-side — SDK errors often contain partial key
    // material and must never be forwarded to the client.
    console.error('[analyze] Engine error:', {
      message: error.message,
      status:  error.status,
      code:    error.code,
    })

    // Return a safe, user-facing message only
    let safeMessage = 'The analysis could not be completed. Please try again.'

    if (error.status === 401 || error.message?.includes('API key') || error.message?.includes('Incorrect API key')) {
      safeMessage = 'A configuration error occurred. Please contact support.'
    } else if (error.message?.includes('Vision')) {
      safeMessage = 'Image processing failed. Please try a different photo.'
    } else if (error.message?.includes('Upload failed')) {
      safeMessage = 'Image upload failed. Please check your connection and try again.'
    } else if (error.message?.includes('billing cycle') || error.message?.includes('scan limit')) {
      safeMessage = error.message
    }

    return NextResponse.json(
      { success: false, error: safeMessage },
      { status: 500 }
    )
  }
}
