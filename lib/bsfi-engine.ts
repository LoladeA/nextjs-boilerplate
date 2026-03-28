// /lib/bsfi-engine.ts
// Version: bsfi_v7_core_clean

// =============================================================================
// BSFI v7 — CORE (ACCESSIBLE ONLY)
// =============================================================================
//
// ✔ Fully accessible (no wearables required)
// ✔ Manual SRI (Sleep Regularity Index proxy)
// ✔ Sleep fragmentation (sleep_wakes)
// ✔ Focus as SES + RDS signal
// ✔ Social demand (conservative weighting)
// ✔ Inclusive Biological Load (Female + Male pathway)
// ✔ Full Morning + Evening log preservation
//
// ❌ All HealthKit / biometric inputs removed
// ❌ No enriched scoring paths
// =============================================================================

// --- INTERFACES ---

export interface DailyLogParams {
    morning_lux:      number | null;
    evening_lux:      number | null;
    daytime_db:       number | null;
    nighttime_db:     number | null;
    morning_tension:  number | null;
    sleep_wakes:      number | null;
    focus_hours:      number | null;
    mood_score:       number | null;
    morning_tags:     string[];
    evening_tags:     string[];

    // Manual SRI inputs
    wake_time?:       string | null;
    lights_out_time?: string | null;

    // Social
    social_demand?:   'low' | 'moderate' | 'high' | null;

    // Biological
    cycle_phase?: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | null;
    gender?: 'female' | 'male' ;
    morning_vitality?: number | null;
}

export interface BSFIResult {
    cfs_score: number;
    als_score: number;
    ses_score: number;
    rds_score: number;
    bsfi_total: number;

    load_attribution: 'environmental' | 'internal' | 'relational' | 'biological';
    dominant_domain: string;

    data_confidence: 'basic';
    biological_load: boolean;

    version: string;
}

// --- HELPERS ---

const cap25 = (n: number) => Math.min(Math.max(n, 0), 25);
const safe = (v: number | null | undefined, d = 0) => v ?? d;


// --- MANUAL SRI (Sleep Regularity Index proxy) ---

const calculateSRI = (history: DailyLogParams[]): number => {
    if (history.length < 3) return 85;

    const times = history
        .map(h => h.wake_time)
        .filter(Boolean)
        .map(t => {
            /**
             * TIMEZONE FIX: Extract the literal hour from the ISO string (e.g., "T07:")
             * This prevents the Date object from shifting the hour based on 
             * the server's local time (Vercel/UTC).
             */
            const match = (t as string).match(/T(\d{2}):/);
            return match ? parseInt(match[1], 10) : new Date(t as string).getHours();
        });

    if (times.length < 3) return 85;

    const mean = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / times.length;

    // Returns a score where lower variance equals a higher regularity index.
    return Math.max(100 - variance * 2, 60);
};

// --- ENGINE ---

export function calculateBSFI(
    today: DailyLogParams,
    history: DailyLogParams[] = []
): BSFIResult {

    let cfs = 0, als = 0, ses = 0, rds = 0;

    const social = today.social_demand ?? 'low';
    const sri = calculateSRI([today, ...history]);

    // -------------------------------------------------------------------------
    // CFS — Circadian
    // -------------------------------------------------------------------------

    if (sri < 75) cfs += 8;

    if (today.morning_lux != null && today.morning_lux < 250) cfs += 4;
    if (today.evening_lux != null && today.evening_lux > 100) cfs += 4;

    if (safe(today.sleep_wakes) >= 3) cfs += 3;

    // -------------------------------------------------------------------------
    // ALS — Autonomic
    // -------------------------------------------------------------------------

    if (social === 'moderate') als += 3;
    if (social === 'high') als += 5;

    if (safe(today.morning_tension) >= 7) als += 5;

    if (today.daytime_db != null && today.daytime_db > 55) als += 4;
    if (today.nighttime_db != null && today.nighttime_db > 40) als += 6;

    // -------------------------------------------------------------------------
    // SES — Sensory
    // -------------------------------------------------------------------------

    if (safe(today.focus_hours) < 3 && today.daytime_db != null && today.daytime_db > 55) {
        ses += 5;
    }

    if (safe(today.focus_hours) < 2) ses += 3;

    if (!today.evening_tags.includes('entropy_reset')) ses += 3;

    if (today.cycle_phase === 'luteal') ses += 2;

    // -------------------------------------------------------------------------
    // RDS — Recovery
    // -------------------------------------------------------------------------

    if (safe(today.sleep_wakes) >= 3) rds += 5;
    else if (safe(today.sleep_wakes) === 2) rds += 2;

    if (safe(today.morning_tension) >= 7) rds += 5;

    if (safe(today.focus_hours) < 2) rds += 4;
    else if (safe(today.focus_hours) < 4) rds += 2;

    if (social === 'high' && safe(today.sleep_wakes) >= 2) rds += 3;

    if (today.cycle_phase === 'menstrual') rds += 2;

    // -------------------------------------------------------------------------
    // BIOLOGICAL LOAD (INCLUSIVE)
    // -------------------------------------------------------------------------

    let load: BSFIResult['load_attribution'] = 'environmental';

    if (
        today.gender === 'female' &&
        (today.cycle_phase === 'menstrual' || today.cycle_phase === 'luteal')
    ) {
        load = 'biological';
    }

    if (
        today.gender === 'male' &&
        today.morning_vitality != null &&
        today.morning_vitality < 4 &&
        safe(today.morning_tension) > 6
    ) {
        load = 'biological';
        als += 3;
        rds += 2;
    }

    // -------------------------------------------------------------------------
    // FINAL
    // -------------------------------------------------------------------------

    cfs = cap25(cfs);
    als = cap25(als);
    ses = cap25(ses);
    rds = cap25(rds);

    const total = Math.min(Math.round(cfs + als + ses + rds), 100);

    const domains = {
        Circadian: cfs,
        Autonomic: als,
        Sensory: ses,
        Recovery: rds
    };

    const dominant = Object.keys(domains).reduce((a, b) =>
        domains[a as keyof typeof domains] > domains[b as keyof typeof domains] ? a : b
    );

    return {
        cfs_score: cfs,
        als_score: als,
        ses_score: ses,
        rds_score: rds,
        bsfi_total: total,
        load_attribution: load,
        dominant_domain: dominant,
        data_confidence: 'basic',
        biological_load: load === 'biological',
        version: 'bsfi_v7_core_clean'
    };
}
