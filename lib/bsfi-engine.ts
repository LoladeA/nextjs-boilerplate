// /lib/bsfi-engine.ts
// Version: bsfi_v8.1
// =============================================================================
// BSFI v8.1 — NIGHTTIME_DB REMOVED FROM MORNING SCORING
// =============================================================================
//
// Architecture: Two independent session engines + shared biological capacity.
//
// WHAT CHANGED FROM v8:
//   ✔ nighttime_db removed from calculateMorningBSFI scoring
//     Reason: nighttime_db is measured at morning log time, not during the
//     night. A reading taken at 7am tells us nothing about what the bedroom
//     sounded like at 2am. Scoring a recovery penalty from a measurement
//     taken hours after the recovery window closed produces false readings.
//     The field is retained in the schema and interface for future use
//     when deliberately measured at bedtime via the in-app meter.
//     It is not scored in either engine until a reliable collection path exists.
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
// SCHEMA FIELDS (all exist in daily_logs):
//   daytime_db_avg    — replaces daytime_db (backward compat: map old → avg)
//   daytime_db_peak   — new, nullable
//   noise_character   — new, nullable enum
//   environmental_control_score — new, nullable 0–10
//   task_init_drag    — new, nullable enum
//   spatial_reset     — new, boolean
//   nighttime_db      — collected but not currently scored. Retained for
//                       future use when reliably measured at bedtime.
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
// ─────────────────────────────────────────────────────────────────────────────

export interface DailyLogParams {
    // ── MORNING FIELDS ──────────────────────────────────────────────────────
    morning_lux:      number | null    // App sensor / manual — circadian anchoring
    wake_time:        string | null    // ISO string — SRI calculation
    sleep_wakes:      number | null    // Self-reported — fragmentation
    nighttime_db:     number | null    // Collected but NOT scored. Retained for future
                                       // use when reliably measured at bedtime via the
                                       // in-app meter. A reading taken at morning log
                                       // time does not represent overnight conditions
                                       // and cannot be used to score recovery disruption.
    morning_tension:  number | null    // 0–10 somatic residue
    morning_mood:     number | null    // 1–5 emotional baseline (app scale)
    morning_tags:     string[]         // noise_buffer and other morning context tags

    // ── EVENING FIELDS (evening engine only) ────────────────────────────────
    evening_lux:      number | null    // App sensor / manual — melatonin suppression
    daytime_db_avg:   number | null    // Average daytime dB — sustained acoustic load
    daytime_db_peak:  number | null    // Peak daytime dB — acute startle events
    noise_character:  NoiseCharacter | null
    social_demand:    SocialDemand | null
    spatial_reset:    boolean
    task_init_drag:   TaskInitDrag | null
    focus_hours:      number | null
    environmental_control_score: number | null
    evening_tags:     string[]

    // ── BIOLOGICAL ──────────────────────────────────────────────────────────
    cycle_phase:      CyclePhase | null

    // ── BACKWARD COMPATIBILITY ──────────────────────────────────────────────
    // daytime_db → daytime_db_avg
    // bedtime_db → nighttime_db
}

// ─────────────────────────────────────────────────────────────────────────────
// RESULT INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface BSFIResult {
    cfs_score:         number
    als_score:         number
    ses_score:         number
    rds_score:         number
    raw_total:         number
    bsfi_total:        number
    biological_capacity: number
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
//   SRI ≥ 85 → +0  (adequate regularity)
// ─────────────────────────────────────────────────────────────────────────────

function calculateSRI(history: DailyLogParams[]): number {
    if (history.length < 3) return 85

    const times = history
        .map(h => h.wake_time)
        .filter(Boolean)
        .map(t => {
            const match = (t as string).match(/T(\d{2}):(\d{2})/)
            if (match) return parseInt(match[1], 10) + parseInt(match[2], 10) / 60
            const d = new Date(t as string)
            return d.getHours() + d.getMinutes() / 60
        })

    if (times.length < 3) return 85

    const radians = times.map(t => (t / 24) * 2 * Math.PI)

    let sumSin = 0, sumCos = 0
    for (const r of radians) { sumSin += Math.sin(r); sumCos += Math.cos(r) }

    const R = Math.sqrt((sumSin / radians.length) ** 2 + (sumCos / radians.length) ** 2)
    const circularVariance = 1 - R

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
// Cycle-based (documented, externally cited):
//   1.0 — follicular / ovulatory: full regulatory capacity
//   0.85 — luteal / menstrual: 15% reduction
//         Driver & Baker (1998); Shechter & Boivin (2010); Rubinow et al. (1998)
//
// Sustained allostatic load (7-day rolling):
//   0.85 — avg tension > 6 OR avg mood < 2.5
//   0.75 — both simultaneously
//         McEwen (1998) Physiological Reviews
// ─────────────────────────────────────────────────────────────────────────────

export function computeBiologicalCapacity(
    today:   DailyLogParams,
    history: DailyLogParams[]
): number {

    let cycleCapacity = 1.0
    if (today.cycle_phase === 'luteal' || today.cycle_phase === 'menstrual') {
        cycleCapacity = 0.85
    }

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

    return Math.min(cycleCapacity, allostaticCapacity)
}

// ─────────────────────────────────────────────────────────────────────────────
// LOAD ATTRIBUTION
//
// Priority order (first match wins):
// 1. biological — menstrual or luteal
// 2. internal   — tension ≥ 6, clean environment, intact sleep
//    Pruessner et al. (1997); Sternberg, Healing Spaces
// 3. environmental — default
// ─────────────────────────────────────────────────────────────────────────────

function computeLoadAttribution(
    today: DailyLogParams,
    cfs: number,
    als: number
): BSFIResult['load_attribution'] {

    if (today.cycle_phase === 'menstrual' || today.cycle_phase === 'luteal') {
        return 'biological'
    }

    if (
        safe(today.morning_tension) >= 6 &&
        cfs <= 5 &&
        als <= 3 &&
        safe(today.sleep_wakes) <= 1
    ) {
        return 'internal'
    }

    return 'environmental'
}

// ─────────────────────────────────────────────────────────────────────────────
// MORNING ENGINE
//
// Domains: CFS + RDS only.
// ALS and SES have no valid morning inputs.
//
// nighttime_db is intentionally excluded from scoring.
// A reading taken at morning log time does not represent overnight bedroom
// conditions. It cannot be used to score recovery disruption without
// producing false penalties. Retained in the interface for future use
// when reliably collected at bedtime via the in-app meter.
//
// Morning score maximum ≈ 40 (worst-case SRI + lux + wakes + tension + mood).
// Biological divisor can push experienced load to ~47.
// ─────────────────────────────────────────────────────────────────────────────

export function calculateMorningBSFI(
    today:    DailyLogParams,
    history:  DailyLogParams[] = []
): BSFIResult {

    let cfs = 0, rds = 0

    const sri = calculateSRI([today, ...history])

    // ── CFS — Circadian Friction Score ────────────────────────────────────
    cfs += applySRI(sri)

    // Morning light — 3-band scale
    // Zeitzer et al. (2000): CAR cannot anchor below 100 lux.
    // Viola et al. (2008): 100–250 lux is suboptimal.
    // 500 lux = minimum for reliable CAR establishment.
    if (today.morning_lux !== null) {
        if      (today.morning_lux < 100) cfs += 8
        else if (today.morning_lux < 250) cfs += 6
        else if (today.morning_lux < 500) cfs += 3
    }

    // Sleep fragmentation — circadian arc disruption
    // Buysse et al. PSQI (1989): ≥ 3 awakenings = clinically significant.
    if (safe(today.sleep_wakes) >= 3) cfs += 3

    // ── RDS — Recovery Disruption Score ───────────────────────────────────
    // Sleep fragmentation
    // Ohayon et al. (2010) N=35,327; Carskadon & Rechtschaffen (2005)
    if      (safe(today.sleep_wakes) >= 3) rds += 5
    else if (safe(today.sleep_wakes) === 2) rds += 2

    // Morning tension — overnight autonomic residue
    // Belongs in RDS ONLY. Not ALS. Do not change this.
    // Pruessner et al. (1997); Wüst et al. (2000)
    if (safe(today.morning_tension) >= 7) rds += 5

    // Morning mood — recovery outcome signal
    // 1–5 scale: ≤ 2 = Exhausted or Tense/Edgy
    // Vgontzas et al. (2004)
    if (safe(today.morning_mood, 3) <= 2) rds += 3

    // nighttime_db intentionally not scored here — see file header.

    // ── Luteal SES ────────────────────────────────────────────────────────
    // Small signal for biological attribution accuracy.
    // Main biological effect is via the capacity divisor.
    // Rubinow et al. (1998)
    let ses = 0
    if (today.cycle_phase === 'luteal') ses += 2

    // ── CAPS ──────────────────────────────────────────────────────────────
    cfs = cap25(cfs); ses = cap25(ses); rds = cap25(rds)
    const als = 0

    // ── TOTAL + CAPACITY ──────────────────────────────────────────────────
    const raw_total = Math.min(Math.round(cfs + als + ses + rds), 100)
    const biological_capacity = computeBiologicalCapacity(today, history)
    const bsfi_total = Math.min(Math.round(raw_total / biological_capacity), 100)

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
        version:            'bsfi_v8.1',
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENING ENGINE
//
// Domains: CFS (full day) + ALS + SES + RDS.
// All four domains active. Evening carries forward the day's morning data.
// ─────────────────────────────────────────────────────────────────────────────

export function calculateEveningBSFI(
    today:    DailyLogParams,
    history:  DailyLogParams[] = []
): BSFIResult {

    let cfs = 0, als = 0, ses = 0, rds = 0

    const sri    = calculateSRI([today, ...history])
    const social = today.social_demand ?? 'low'

    // ── CFS ───────────────────────────────────────────────────────────────
    cfs += applySRI(sri)

    if (today.morning_lux !== null) {
        if      (today.morning_lux < 100) cfs += 8
        else if (today.morning_lux < 250) cfs += 6
        else if (today.morning_lux < 500) cfs += 3
    }

    // Evening light — melatonin suppression (4-band)
    // Cajochen et al. (2011); Gooley et al. (2011); Zeitzer et al. (2000)
    if (today.evening_lux !== null) {
        if      (today.evening_lux > 800) cfs += 10
        else if (today.evening_lux > 300) cfs += 7
        else if (today.evening_lux > 100) cfs += 4
        else if (today.evening_lux > 50)  cfs += 2
    }

    // Compound: fragmented sleep + elevated evening light
    // Inferred from Gooley (2011) + PSQI fragmentation literature.
    if (safe(today.sleep_wakes) >= 2 && today.evening_lux !== null && today.evening_lux > 100) {
        cfs += 4
    }

    if (safe(today.sleep_wakes) >= 3) cfs += 3

    // ── ALS ───────────────────────────────────────────────────────────────
    // Social demand — Dickerson & Kemeny (2004)
    if      (social === 'high')     als += 5
    else if (social === 'moderate') als += 3

    // Sustained acoustic load — WHO (2018)
    if (today.daytime_db_avg !== null && today.daytime_db_avg > 55) als += 4

    // Acute events — Basner et al. (2011)
    if (today.daytime_db_peak !== null && today.daytime_db_peak > 75) als += 3

    // Noise character — Berglund WHO (1999); Öhrström (1989)
    if      (today.noise_character === 'unpredictable_startling') als += 5
    else if (today.noise_character === 'intermittent_loud')       als += 3

    // Compound: tension + high social — Pruessner (1997) + Dickerson & Kemeny (2004)
    if (safe(today.morning_tension) >= 7 && social === 'high') als += 4

    // ── SES ───────────────────────────────────────────────────────────────
    // Spatial reset + drag compound [PROPRIETARY]
    if (!today.spatial_reset && (today.task_init_drag === 'moderate' || today.task_init_drag === 'heavy')) {
        ses += 5
    }

    // Focus + load compound — Van Dongen et al. (2003)
    if (safe(today.focus_hours) < 3 && (
        (today.daytime_db_avg !== null && today.daytime_db_avg > 55) ||
        today.task_init_drag === 'heavy'
    )) {
        ses += 5
    } else if (safe(today.focus_hours) < 2) {
        ses += 3
    }

    // Environmental agency [PROPRIETARY] — Glass & Singer (1972)
    if (today.environmental_control_score !== null && today.environmental_control_score < 5) {
        ses += 3
    }

    // Spatial reset absent (standalone) — Buysse et al. (2011)
    if (!today.spatial_reset && today.task_init_drag !== 'moderate' && today.task_init_drag !== 'heavy') {
        ses += 2
    }

    // Morning mood carried into evening — unmitigated sensory exposure
    const hasMorningBuffer = today.morning_tags.includes('noise_buffer')
    if (safe(today.morning_mood, 3) <= 2 && !hasMorningBuffer) ses += 5

    // Luteal sensory sensitivity — Rubinow et al. (1998)
    if (today.cycle_phase === 'luteal') ses += 2

    // ── RDS ───────────────────────────────────────────────────────────────
    if      (safe(today.sleep_wakes) >= 3) rds += 5
    else if (safe(today.sleep_wakes) === 2) rds += 2

    // Morning tension residue — RDS only, not ALS
    if (safe(today.morning_tension) >= 7) rds += 5

    // Focus depletion — Van Dongen et al. (2003)
    if      (safe(today.focus_hours) < 2) rds += 4
    else if (safe(today.focus_hours) < 4) rds += 2

    // Social + fragmentation compound — Pruessner et al. (1997)
    if (social === 'high' && safe(today.sleep_wakes) >= 2) rds += 3

    // Menstrual recovery load — Driver & Baker (1998); Shechter & Boivin (2010)
    if (today.cycle_phase === 'menstrual') rds += 2

    // ── CAPS ──────────────────────────────────────────────────────────────
    cfs = cap25(cfs); als = cap25(als); ses = cap25(ses); rds = cap25(rds)

    const raw_total = Math.min(Math.round(cfs + als + ses + rds), 100)
    const biological_capacity = computeBiologicalCapacity(today, history)
    const bsfi_total = Math.min(Math.round(raw_total / biological_capacity), 100)

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
        version:            'bsfi_v8.1',
    }
}
