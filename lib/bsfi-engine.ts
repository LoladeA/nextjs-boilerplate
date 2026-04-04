// /lib/bsfi-engine.ts
// Version: bsfi_v8
// =============================================================================
// BSFI v8 — CLEAN REBUILD
// =============================================================================
//
// Architecture: Two independent session engines + shared biological capacity.
//
// WHAT CHANGED FROM v7:
//   ✔ Separate calculateMorningBSFI and calculateEveningBSFI functions
//     No session parameter. No contamination possible between sessions.
//   ✔ daytime_db_avg + daytime_db_peak (split from single daytime_db)
//     Distinct signals: sustained load (avg) vs acute startle events (peak)
//   ✔ noise_character input (continuous_hum / intermittent_loud / unpredictable_startling)
//     Noise predictability modulates ANS response independent of dB level
//   ✔ environmental_control_score (0–10 perceived agency over environment)
//     Perceived control is independently protective (Glass & Singer 1972)
//   ✔ task_init_drag (cognitive entropy proxy — PROPRIETARY SIGNAL, see below)
//   ✔ spatial_reset as boolean (replaces entropy_reset evening tag)
//   ✔ nighttime_db measured at morning log time (bedroom ambient on waking)
//   ✔ Biological Capacity Divisor: Experienced_Load = Friction / Capacity
//     Replaces additive cycle penalties with a true capacity model
//   ✔ SRI uses circular statistics (from v7.2) for correct midnight handling
//
// WHAT WAS REJECTED FROM THE V8 SPEC:
//   ✗ sleep_wakes from phone trackers — contradicts wearable-free commitment.
//     Self-reported sleep_wakes is the correct approach.
//   ✗ morning_mood 0–10 scale — app uses 1–5. No breaking change warranted.
//   ✗ Perimenopause capacity modifier — no data collection path exists.
//     Flagged for v9 when a profile field is available.
//   ✗ 'relational' load_attribution — dead code. Social demand is integral
//     to ALS/RDS scoring and requires no separate attribution class.
//   ✗ archetype in BSFIResult — synthesis-only field, not a daily result.
//
// PROPRIETARY SIGNALS (clinically plausible, no direct external citation):
//   ⚠ task_init_drag: difficulty initiating tasks proxies executive function
//     load. Indirect basis: Shallice & Burgess (1991); Cohen et al. (1986).
//     Not validated as a direct BSFI input. Flagged.
//   ⚠ environmental_control_score: strong theoretical basis (Glass & Singer
//     1972) but the 0–10 self-report format has not been validated against
//     objective outcomes in this context. Flagged.
//   ⚠ spatial_reset: platform-observed signal. Clinically plausible via sleep
//     hygiene literature (Buysse et al. 2011) but not directly evidenced.
//
// SCHEMA CHANGES REQUIRED (new fields in daily_logs table):
//   daytime_db_avg    — replaces daytime_db (backward compat: map old → avg)
//   daytime_db_peak   — new, nullable
//   noise_character   — new, nullable
//   environmental_control_score — new, nullable 0–10
//   task_init_drag    — new, nullable enum
//   spatial_reset     — new, boolean
//   nighttime_db      — was bedtime_db (backward compat: map bedtime_db → nighttime_db)
//
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type CyclePhase     = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal'
export type SocialDemand   = 'low' | 'moderate' | 'high'
export type NoiseCharacter = 'continuous_hum' | 'intermittent_loud' | 'unpredictable_startling'
export type TaskInitDrag   = 'none' | 'light' | 'moderate' | 'heavy'

// ─────────────────────────────────────────────────────────────────────────────
// INPUT INTERFACE
//
// Single unified params. Morning engine reads morning fields only.
// Evening engine reads all fields (carrying forward the day's morning data).
// Nullable fields are structurally safe in both engines.
// ─────────────────────────────────────────────────────────────────────────────

export interface DailyLogParams {
    // ── MORNING FIELDS (both engines read these) ────────────────────────────
    morning_lux:      number | null    // App sensor / manual — circadian anchoring
    wake_time:        string | null    // ISO string — SRI calculation
    sleep_wakes:      number | null    // Self-reported — fragmentation
    nighttime_db:     number | null    // Bedroom ambient at morning log time (WHO: <40 dB)
    morning_tension:  number | null    // 0–10 somatic residue
    morning_mood:     number | null    // 1–5 emotional baseline (app scale)
    morning_tags:     string[]         // noise_buffer and other morning context tags

    // ── EVENING FIELDS (evening engine only) ────────────────────────────────
    evening_lux:      number | null    // App sensor / manual — melatonin suppression
    daytime_db_avg:   number | null    // Average daytime dB — sustained acoustic load
    daytime_db_peak:  number | null    // Peak daytime dB — acute startle events
    noise_character:  NoiseCharacter | null  // Quality of noise exposure today
    social_demand:    SocialDemand | null    // Relational/autonomic load
    spatial_reset:    boolean               // Did user deliberately reset their space tonight?
    task_init_drag:   TaskInitDrag | null   // Cognitive entropy proxy [PROPRIETARY]
    focus_hours:      number | null    // 0–12 focused work hours
    environmental_control_score: number | null  // 0–10 perceived agency [PROPRIETARY]
    evening_tags:     string[]

    // ── BIOLOGICAL ──────────────────────────────────────────────────────────
    cycle_phase:      CyclePhase | null

    // ── BACKWARD COMPATIBILITY ──────────────────────────────────────────────
    // Legacy fields — the route maps these to the v8 fields above.
    // These are NOT read by the engine. They exist only for migration reference.
    // daytime_db → daytime_db_avg
    // bedtime_db → nighttime_db
}

// ─────────────────────────────────────────────────────────────────────────────
// RESULT INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface BSFIResult {
    cfs_score:         number
    als_score:         number    // 0 for morning (no valid morning ALS inputs)
    ses_score:         number    // 0 for morning (no valid morning SES inputs)
    rds_score:         number

    raw_total:         number    // Pre-capacity friction score
    bsfi_total:        number    // Experienced load = raw / biological_capacity

    biological_capacity: number  // 1.0 / 0.85 / 0.75 — divisor applied
    load_attribution:  'environmental' | 'biological' | 'internal'
    dominant_domain:   string

    data_confidence:   'basic'
    biological_load:   boolean
    version:           string
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const cap25 = (n: number): number => Math.min(Math.max(n, 0), 25)
const safe  = (v: number | null | undefined, d = 0): number => v ?? d

// ─────────────────────────────────────────────────────────────────────────────
// SRI — SLEEP REGULARITY INDEX PROXY (circular statistics)
//
// Phillips et al. (2017) Scientific Reports: SRI correlates with mood,
// metabolic health, and mortality independent of sleep duration.
//
// Uses circular statistics (Mean Resultant Length) to correctly handle
// wake times near midnight without artificial variance inflation.
// This is mathematically superior to linear variance for time-of-day data.
//
// LIMITATION: wake_time is proxied from log submission time (created_at).
// Users who log late will have underestimated regularity. Known limitation.
//
// Returns 85 when < 3 data points — no penalty applied to new users.
//
// THREE-POINT GRADUATED SCALE:
//   SRI < 65 → +8  (circadian anchor lost)
//   SRI < 75 → +4  (anchor weakened)
//   SRI < 85 → +2  (early irregularity)
//   SRI ≥ 85 → +0  (adequate regularity — no penalty)
// ─────────────────────────────────────────────────────────────────────────────

function calculateSRI(history: DailyLogParams[]): number {
    if (history.length < 3) return 85

    const times = history
        .map(h => h.wake_time)
        .filter(Boolean)
        .map(t => {
            // Extract hour + minute directly from ISO string to avoid timezone shift
            const match = (t as string).match(/T(\d{2}):(\d{2})/)
            if (match) return parseInt(match[1], 10) + parseInt(match[2], 10) / 60
            const d = new Date(t as string)
            return d.getHours() + d.getMinutes() / 60
        })

    if (times.length < 3) return 85

    // Circular statistics: convert hours to radians, compute Mean Resultant Length
    const radians = times.map(t => (t / 24) * 2 * Math.PI)

    let sumSin = 0, sumCos = 0
    for (const r of radians) { sumSin += Math.sin(r); sumCos += Math.cos(r) }

    const R = Math.sqrt((sumSin / radians.length) ** 2 + (sumCos / radians.length) ** 2)
    const circularVariance = 1 - R

    // Map circular variance to SRI scale: 0 variance = 100, high variance → 60
    return Math.max(100 - circularVariance * 200, 60)
}

function applySRI(sri: number): number {
    if      (sri < 65) return 8
    else if (sri < 75) return 4
    else if (sri < 85) return 2
    return 0
}

// ─────────────────────────────────────────────────────────────────────────────
// BIOLOGICAL CAPACITY
//
// Experienced_Load = Environmental_Friction / Biological_Capacity
//
// A capacity below 1.0 means the same environmental friction costs more.
// Physiologically: when the body's regulatory resources are reduced, the
// nervous system processes environmental load less efficiently.
//
// Cycle-based (documented, externally cited):
//   1.0 — follicular / ovulatory: full regulatory capacity
//   0.85 — luteal / menstrual: 15% reduction
//         Driver & Baker (1998) Sleep; Shechter & Boivin (2010) Sleep Med Rev;
//         Asso (1983); Rubinow et al. (1998) Neuropsychopharmacology
//
// Sustained allostatic load (14-day pattern — computed from history):
//   0.85 — avg morning_tension > 6 for ≥ 7 days (high tension pattern)
//         OR avg morning_mood < 2.5 for ≥ 7 days (low mood pattern)
//         McEwen (1998) Physiological Reviews: allostatic load reduces
//         the body's regulatory capacity for environmental demands
//   0.75 — both conditions simultaneously (compound allostatic overload)
//
// NOTE: If cycle_phase indicates reduced capacity AND sustained allostatic load
// is also present, the more severe of the two divisors applies (0.75 minimum).
// Perimenopause (capacity 0.75) excluded — no data collection path yet. v9.
// ─────────────────────────────────────────────────────────────────────────────

export function computeBiologicalCapacity(
    today:   DailyLogParams,
    history: DailyLogParams[]
): number {

    // Step 1: cycle phase capacity
    let cycleCapacity = 1.0
    if (today.cycle_phase === 'luteal' || today.cycle_phase === 'menstrual') {
        cycleCapacity = 0.85
    }

    // Step 2: sustained allostatic load from 14-day history
    let allostaticCapacity = 1.0

    if (history.length >= 7) {
        const recent = history.slice(0, 7)

        const avgTension = recent.reduce((s, h) => s + safe(h.morning_tension), 0) / recent.length
        const avgMood    = recent.reduce((s, h) => s + safe(h.morning_mood, 3),  0) / recent.length

        const highTension = avgTension > 6
        const lowMood     = avgMood    < 2.5

        if (highTension && lowMood) allostaticCapacity = 0.75
        else if (highTension || lowMood) allostaticCapacity = 0.85
    }

    // Apply the more severe of the two
    return Math.min(cycleCapacity, allostaticCapacity)
}

// ─────────────────────────────────────────────────────────────────────────────
// LOAD ATTRIBUTION
//
// Priority order (first match wins):
//
// 1. 'biological'  — cycle_phase is menstrual or luteal
// 2. 'internal'    — high tension in a clean environment
//    Fires when: tension ≥ 6 AND cfs ≤ 5 AND als ≤ 3 AND wakes ≤ 1
//    Pruessner et al. (1997): waking tension unexplained by environmental
//    inputs reflects internal psychological load.
//    Sternberg, Healing Spaces: environments and internal states are
//    bidirectional — the internal state determines what the environment
//    can do for the person.
// 3. 'environmental' — default; the space is the addressable lever
// ─────────────────────────────────────────────────────────────────────────────

function computeLoadAttribution(
    today: DailyLogParams,
    cfs: number,
    als: number
): BSFIResult['load_attribution'] {

    if (today.cycle_phase === 'menstrual' || today.cycle_phase === 'luteal') {
        return 'biological'
    }

    const isTensionHigh      = safe(today.morning_tension) >= 6
    const isCircadianClean   = cfs <= 5
    const isAutonomicClean   = als <= 3
    const isSleepIntact      = safe(today.sleep_wakes) <= 1

    if (isTensionHigh && isCircadianClean && isAutonomicClean && isSleepIntact) {
        return 'internal'
    }

    return 'environmental'
}

// ─────────────────────────────────────────────────────────────────────────────
// MORNING ENGINE
//
// Domains: CFS + RDS only.
// ALS and SES have no valid morning inputs — focus, social demand, noise
// character, and spatial entropy are all either future data (day has not
// started) or evening-specific signals.
//
// Morning score maximum ≈ 46 (with worst-case SRI, lux, nighttime_db, wakes,
// tension, mood). Biological divisor can push experienced load to ~54.
// Session-aware bands are calibrated to this range.
// ─────────────────────────────────────────────────────────────────────────────

export function calculateMorningBSFI(
    today:    DailyLogParams,
    history:  DailyLogParams[] = []
): BSFIResult {

    let cfs = 0, rds = 0

    const sri = calculateSRI([today, ...history])

    // ── CFS — Circadian Friction Score ────────────────────────────────────
    //
    // What it measures: Whether the body received the light signals and
    // sleep-timing consistency required to anchor the circadian rhythm.
    //
    // SRI penalty — wake time regularity
    cfs += applySRI(sri)

    // Morning light — 3-band scale
    // The cortisol awakening response (CAR) requires adequate morning light
    // intensity to establish circadian phase. Zeitzer et al. (2000): below
    // 100 lux, CAR cannot anchor. Gooley et al. (2011): sub-100 lux produces
    // negligible phase-advancing effect. Viola et al. (2008): 100–250 lux
    // is suboptimal. 500 lux is the minimum for reliable CAR establishment.
    if (today.morning_lux !== null) {
        if      (today.morning_lux < 100) cfs += 8   // CAR cannot anchor
        else if (today.morning_lux < 250) cfs += 6   // suboptimal signal
        else if (today.morning_lux < 500) cfs += 3   // adequate but not optimal
        // ≥ 500 lux: no friction
    }

    // Sleep fragmentation — circadian arc disruption
    // Fragmented sleep prevents completion of the circadian restoration arc.
    // Buysse et al. PSQI (1989): ≥ 3 awakenings = clinically significant.
    if (safe(today.sleep_wakes) >= 3) cfs += 3

    // ── RDS — Recovery Disruption Score ───────────────────────────────────
    //
    // What it measures: The overnight recovery outcome — what the sleep
    // environment produced (or failed to produce) in the body.
    //
    // Sleep fragmentation — primary recovery signal
    // Ohayon et al. (2010) N=35,327: ≥ 3 awakenings = significant next-day
    // impairment. Carskadon & Rechtschaffen (2005): fragmentation prevents
    // full slow-wave and REM progression.
    if      (safe(today.sleep_wakes) >= 3) rds += 5
    else if (safe(today.sleep_wakes) === 2) rds += 2

    // Morning tension — overnight autonomic residue
    // IMPORTANT: tension belongs in RDS ONLY. It is the output of failed
    // overnight clearance, not a concurrent environmental stressor.
    // Placing it in ALS double-counts and inflates by +10. Do not change this.
    // Pruessner et al. (1997); Wüst et al. (2000): waking tension reflects
    // uncleared autonomic activation from the overnight period.
    if (safe(today.morning_tension) >= 7) rds += 5

    // Nighttime dB — bedroom ambient at log time
    // Measured at morning log time (when user wakes and logs), not during the
    // night. Captures bedroom ambient noise level on waking.
    // WHO Environmental Noise Guidelines: > 40 dB in bedroom environments
    // disrupts sleep onset and maintenance. Basner et al. (2011) Sleep.
    if (today.nighttime_db !== null && today.nighttime_db > 40) rds += 6

    // Morning mood — recovery outcome signal
    // Low mood on waking reflects inadequate overnight restoration.
    // On app scale 1–5: ≤ 2 = Exhausted or Tense/Edgy.
    // Vgontzas et al. (2004): subjective morning state reflects physiological
    // recovery quality independently of sleep duration.
    if (safe(today.morning_mood, 3) <= 2) rds += 3

    // ── Luteal SES signal — sensory sensitivity elevated ──────────────────
    // Carried into morning for biological attribution accuracy.
    // Rubinow et al. (1998): luteal phase increases sensory sensitivity.
    // Kept minimal in morning (+2) — the main biological effect is via
    // the capacity divisor, not additive scoring.
    let ses = 0
    if (today.cycle_phase === 'luteal') ses += 2

    // ── CAPS ──────────────────────────────────────────────────────────────
    cfs = cap25(cfs); ses = cap25(ses); rds = cap25(rds)
    const als = 0  // no ALS in morning — explicit zero

    // ── RAW TOTAL + CAPACITY ──────────────────────────────────────────────
    const raw_total = Math.min(Math.round(cfs + als + ses + rds), 100)
    const biological_capacity = computeBiologicalCapacity(today, history)
    const bsfi_total = Math.min(Math.round(raw_total / biological_capacity), 100)

    // ── DOMINANT DOMAIN ───────────────────────────────────────────────────
    const domains = {
        'Circadian Rhythm Index': cfs,
        'Recovery Disruption':    rds,
    }
    const dominant_domain = Object.keys(domains).reduce((a, b) =>
        domains[a as keyof typeof domains] >= domains[b as keyof typeof domains] ? a : b
    )

    return {
        cfs_score:          Math.round(cfs),
        als_score:          0,
        ses_score:          Math.round(ses),
        rds_score:          Math.round(rds),
        raw_total,
        bsfi_total,
        biological_capacity,
        load_attribution:   computeLoadAttribution(today, cfs, als),
        dominant_domain,
        data_confidence:    'basic',
        biological_load:    today.cycle_phase === 'menstrual' || today.cycle_phase === 'luteal',
        version:            'bsfi_v8',
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENING ENGINE
//
// Domains: CFS (full day) + ALS + SES + RDS.
// All four domains are active. Evening carries forward the day's morning
// data alongside the evening-specific inputs.
//
// The evening score represents the full accumulated environmental toll
// and the conditions under which the overnight clearing window will operate.
// ─────────────────────────────────────────────────────────────────────────────

export function calculateEveningBSFI(
    today:    DailyLogParams,
    history:  DailyLogParams[] = []
): BSFIResult {

    let cfs = 0, als = 0, ses = 0, rds = 0

    const sri    = calculateSRI([today, ...history])
    const social = today.social_demand ?? 'low'

    // ── CFS — Full-Day Circadian Friction ─────────────────────────────────
    //
    // Includes morning light history + evening light suppression.
    // The full circadian picture is only available at end of day.

    cfs += applySRI(sri)

    if (today.morning_lux !== null) {
        if      (today.morning_lux < 100) cfs += 8
        else if (today.morning_lux < 250) cfs += 6
        else if (today.morning_lux < 500) cfs += 3
    }

    // Evening light — melatonin suppression (4-band scale)
    // Cajochen et al. (2011): near-maximal suppression above 800 lux.
    // Gooley et al. (2011): bright pre-sleep light suppresses melatonin
    // by up to 85% and delays sleep onset by 1.5 hours. Highest single
    // penalty in the engine — reflects the strongest modifiable input.
    // Zeitzer et al. (2000): suppression begins at ~50 lux.
    if (today.evening_lux !== null) {
        if      (today.evening_lux > 800) cfs += 10
        else if (today.evening_lux > 300) cfs += 7
        else if (today.evening_lux > 100) cfs += 4
        else if (today.evening_lux > 50)  cfs += 2
    }

    // Compound: fragmented sleep + elevated evening light
    // Mechanistically: high evening lux suppresses melatonin; prior
    // sleep fragmentation compounds the overnight clearing deficit.
    // NOTE: This compound is inferred from separate research streams
    // (Gooley 2011; PSQI fragmentation literature), not a single study.
    if (safe(today.sleep_wakes) >= 2 && today.evening_lux !== null && today.evening_lux > 100) {
        cfs += 4
    }

    if (safe(today.sleep_wakes) >= 3) cfs += 3

    // ── ALS — Autonomic Load Score ─────────────────────────────────────────
    //
    // Captures the day's accumulated load on the autonomic nervous system
    // from acoustic and relational inputs.
    // Evening-only: these are end-of-day measurements.

    // Social demand — integral engine metric
    // Dickerson & Kemeny (2004) meta-analysis N=208: evaluative social demand
    // produces the largest effect sizes for ANS and HPA activation of any
    // stressor category. Relational load is scored here, not as a separate
    // attribution class.
    if      (social === 'high')     als += 5
    else if (social === 'moderate') als += 3

    // Sustained daytime acoustic load
    // WHO Environmental Noise Guidelines (2018): > 55 dB in residential
    // environments produces measurable ANS activation and cortisol release.
    if (today.daytime_db_avg !== null && today.daytime_db_avg > 55) als += 4

    // Acute acoustic events — peak dB
    // Basner et al. (2011) Sleep: acute loud events trigger startle-mediated
    // cortisol spikes independent of average dB. A space with low average
    // but high peak noise is distinctly dysregulating.
    if (today.daytime_db_peak !== null && today.daytime_db_peak > 75) als += 3

    // Noise character — predictability modulation
    // Berglund et al. WHO (1999): intermittent noise is more dysregulating
    // than continuous noise at the same dB level.
    // Öhrström (1989): unpredictable startling noise produces the highest
    // cortisol and orienting responses across noise types.
    // These penalties are additive to dB penalties because the character of
    // noise modulates ANS response independently of its amplitude.
    if      (today.noise_character === 'unpredictable_startling') als += 5
    else if (today.noise_character === 'intermittent_loud')       als += 3
    // 'continuous_hum': already captured by dB average — no additional penalty

    // Compound: high tension + high social demand
    // When somatic tension co-occurs with high relational load, combined
    // sympathetic activation exceeds the sum of either alone.
    // Pruessner et al. (1997) + Dickerson & Kemeny (2004) basis.
    if (safe(today.morning_tension) >= 7 && social === 'high') als += 4

    // ── SES — Spatial Entropy Score ───────────────────────────────────────
    //
    // Captures whether the environment supported cognitive engagement
    // and whether the user has established conditions for sleep.
    // Evening-only: focus, spatial entropy, and environmental agency
    // are only meaningful as end-of-day assessments.

    // Spatial reset + task initiation drag compound [PROPRIETARY compound]
    // spatial_reset = false indicates the user did not deliberately reduce
    // environmental complexity before sleep.
    // task_init_drag = moderate/heavy indicates high cognitive entropy today.
    // Together: high entropy + no reset = maximum sensory load going into sleep.
    // No single external citation. Proprietary compound. Clinically plausible.
    if (!today.spatial_reset && (today.task_init_drag === 'moderate' || today.task_init_drag === 'heavy')) {
        ses += 5
    }

    // Focus + acoustic/cognitive load compound
    // Van Dongen et al. (2003) Sleep: sustained cognitive performance is
    // impaired by elevated ambient noise. When the environment was acoustically
    // overloaded (dB avg > 55) or cognitively taxing (heavy drag) and focused
    // output was low (< 3 hours), the compound indicates the environment was
    // consuming cognitive resources.
    if (safe(today.focus_hours) < 3 && (
        (today.daytime_db_avg !== null && today.daytime_db_avg > 55) ||
        today.task_init_drag === 'heavy'
    )) {
        ses += 5
    } else if (safe(today.focus_hours) < 2) {
        // Standalone low focus — attentional capacity constrained
        ses += 3
    }

    // Environmental control — perceived agency [PROPRIETARY, research-supported]
    // Glass & Singer (1972) Urban Stress: perceived control over noise
    // reduces its physiological impact. Langer & Rodin (1976): perceived
    // agency is itself protective against stressor effects.
    // Threshold: < 5/10 = below midpoint of agency spectrum.
    // Measurement instrument not validated against objective outcomes.
    if (today.environmental_control_score !== null && today.environmental_control_score < 5) {
        ses += 3
    }

    // Spatial reset absent (standalone — when drag is low)
    // If no spatial reset AND no heavy cognitive load today, the absence
    // of a deliberate pre-sleep environment reset still carries a small signal.
    // Clinically: Buysse et al. (2011) sleep hygiene — deliberate pre-sleep
    // routine is associated with improved sleep quality.
    if (!today.spatial_reset && today.task_init_drag !== 'moderate' && today.task_init_drag !== 'heavy') {
        ses += 2
    }

    // Morning mood — carried into evening SES when low and unbuffered
    // Low mood on waking without acoustic buffering indicates unmitigated
    // sensory exposure persisting into the day.
    const hasMorningBuffer = today.morning_tags.includes('noise_buffer')
    if (safe(today.morning_mood, 3) <= 2 && !hasMorningBuffer) ses += 5

    // Luteal sensory sensitivity
    // Rubinow et al. (1998): luteal phase increases sensory sensitivity.
    if (today.cycle_phase === 'luteal') ses += 2

    // ── RDS — Full-Day Recovery Disruption ────────────────────────────────
    //
    // Reflects the total allostatic cost the body is carrying into the
    // overnight clearing window.

    if      (safe(today.sleep_wakes) >= 3) rds += 5
    else if (safe(today.sleep_wakes) === 2) rds += 2

    // Morning tension — overnight residue signal (RDS only, not ALS direct)
    if (safe(today.morning_tension) >= 7) rds += 5

    // Focus depletion — allostatic carry cost
    // Van Dongen et al. (2003): sustained cognitive load increases allostatic
    // load carried into sleep. This is an end-of-day signal — valid here.
    if      (safe(today.focus_hours) < 2) rds += 4
    else if (safe(today.focus_hours) < 4) rds += 2

    // Social demand compound: high relational load + prior fragmented sleep
    // When these co-occur, the overnight clearing window must process both
    // relational and environmental residue simultaneously.
    // Pruessner et al. (1997): combined load exceeds either in isolation.
    if (social === 'high' && safe(today.sleep_wakes) >= 2) rds += 3

    // Menstrual phase recovery load
    // Driver & Baker (1998); Shechter & Boivin (2010): menstrual phase
    // produces documented increases in sleep fragmentation and recovery cost.
    if (today.cycle_phase === 'menstrual') rds += 2

    // ── CAPS ──────────────────────────────────────────────────────────────
    cfs = cap25(cfs); als = cap25(als); ses = cap25(ses); rds = cap25(rds)

    // ── RAW TOTAL + CAPACITY ──────────────────────────────────────────────
    const raw_total = Math.min(Math.round(cfs + als + ses + rds), 100)
    const biological_capacity = computeBiologicalCapacity(today, history)
    const bsfi_total = Math.min(Math.round(raw_total / biological_capacity), 100)

    // ── DOMINANT DOMAIN ───────────────────────────────────────────────────
    const domains = {
        'Recovery Disruption':    rds,
        'Circadian Rhythm Index': cfs,
        'Autonomic Load Index':   als,
        'Sensory Load':           ses,
    }
    const dominant_domain = Object.keys(domains).reduce((a, b) =>
        domains[a as keyof typeof domains] >= domains[b as keyof typeof domains] ? a : b
    )

    return {
        cfs_score:          Math.round(cfs),
        als_score:          Math.round(als),
        ses_score:          Math.round(ses),
        rds_score:          Math.round(rds),
        raw_total,
        bsfi_total,
        biological_capacity,
        load_attribution:   computeLoadAttribution(today, cfs, als),
        dominant_domain,
        data_confidence:    'basic',
        biological_load:    today.cycle_phase === 'menstrual' || today.cycle_phase === 'luteal',
        version:            'bsfi_v8',
    }
}
