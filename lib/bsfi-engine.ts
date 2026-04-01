// /lib/bsfi-engine.ts
// Version: bsfi_v7.1 (Refined)

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
    wake_time?: string | null;
    social_demand?: 'low' | 'moderate' | 'high' | null;
    cycle_phase?: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | null;
}

export interface BSFIResult {
    cfs_score:        number;
    als_score:        number;
    ses_score:        number;
    rds_score:        number;
    bsfi_total:       number;
    load_attribution: 'environmental' | 'biological' | 'internal';
    dominant_domain:  string;
    data_confidence:  'basic';
    biological_load:  boolean;
    version:          string;
}

const cap25 = (n: number) => Math.min(Math.max(n, 0), 25);
const safe  = (v: number | null | undefined, d = 0): number => v ?? d;

/**
 * REFINED SRI (Sleep Regularity Index Proxy)
 * Circular Variance / Shortest Distance across Midnight.
 */
const calculateSRI = (history: DailyLogParams[]): number => {
    const times = history
        .map(h => h.wake_time)
        .filter(Boolean)
        .map(t => {
            const match = (t as string).match(/T(\d{2}):(\d{2})/);
            if (match) return parseInt(match[1], 10) + parseInt(match[2], 10) / 60;
            const d = new Date(t as string);
            return d.getHours() + d.getMinutes() / 60;
        });

    if (times.length < 3) return 85;

    const rads = times.map(t => (t / 24) * 2 * Math.PI);
    let s = 0, c = 0;
    for (const r of rads) { s += Math.sin(r); c += Math.cos(r); }
    const R = Math.sqrt((s/rads.length)**2 + (c/rads.length)**2);
    
    // Map Circular Variance (1-R) to SRI 60-100 scale.
    // 0 variance (R=1) -> 100 SRI. 0.2 variance (R=0.8) -> 60 SRI.
    return Math.max(100 - (1 - R) * 200, 60);
};

export function calculateBSFI(
    today:   DailyLogParams,
    history: DailyLogParams[] = [],
    session: 'morning' | 'evening' = 'evening'
): BSFIResult {

    let cfs = 0, als = 0, ses = 0, rds = 0;
    const social = today.social_demand ?? 'low';
    const sri    = calculateSRI([today, ...history]);

    // ─────────────────────────────────────────────────────────────────────────
    // CFS — Circadian Friction Score
    // ─────────────────────────────────────────────────────────────────────────
    if      (sri < 65) cfs += 8;
    else if (sri < 75) cfs += 4;
    else if (sri < 85) cfs += 2;

    if (today.morning_lux !== null) {
        if      (today.morning_lux < 100) cfs += 8;
        else if (today.morning_lux < 250) cfs += 6;
        else if (today.morning_lux < 500) cfs += 3;
    }

    if (today.evening_lux !== null) {
        if      (today.evening_lux > 800) cfs += 10;
        else if (today.evening_lux > 300) cfs += 7;
        else if (today.evening_lux > 100) cfs += 4;
        else if (today.evening_lux > 50)  cfs += 2;
    }

    if (safe(today.sleep_wakes) >= 2 && today.evening_lux !== null && today.evening_lux > 100) {
        cfs += 4;
    }
    if (safe(today.sleep_wakes) >= 3) cfs += 3;

    // ─────────────────────────────────────────────────────────────────────────
    // ALS — Autonomic Load Score
    // ─────────────────────────────────────────────────────────────────────────
    if      (social === 'high')     als += 5;
    else if (social === 'moderate') als += 3;

    if (today.daytime_db  !== null && today.daytime_db  > 55) als += 4;
    if (today.nighttime_db !== null && today.nighttime_db > 40) als += 6;

    if (safe(today.morning_tension) >= 7 && social === 'high') als += 4;

    // ─────────────────────────────────────────────────────────────────────────
    // SES — Spatial Entropy Score
    // ─────────────────────────────────────────────────────────────────────────
    if (safe(today.focus_hours) < 3 && today.daytime_db !== null && today.daytime_db > 55) {
        ses += 5;
    }

    if (session === 'evening' && safe(today.focus_hours) < 2) ses += 3;
    if (session === 'evening' && !today.evening_tags.includes('entropy_reset')) ses += 3;

    const hasMorningBuffer = today.morning_tags.includes('noise_buffer');
    if (safe(today.mood_score, 3) <= 2 && !hasMorningBuffer) ses += 5;

    // ❌ REMOVED: if (today.cycle_phase === 'luteal') ses += 2;
    // DE-PATHOLOGISING BIOLOGY: Biological phases represent capacity, not environmental friction.

    // ─────────────────────────────────────────────────────────────────────────
    // RDS — Recovery Disruption Score
    // ─────────────────────────────────────────────────────────────────────────
    if      (safe(today.sleep_wakes) >= 3) rds += 5;
    else if (safe(today.sleep_wakes) === 2) rds += 2;

    if (safe(today.morning_tension) >= 7) rds += 5;

    if (session === 'evening') {
        if      (safe(today.focus_hours) < 2) rds += 4;
        else if (safe(today.focus_hours) < 4) rds += 2;
    }

    if (social === 'high' && safe(today.sleep_wakes) >= 2) rds += 3;

    // ❌ REMOVED: if (today.cycle_phase === 'menstrual') rds += 2;
    // DE-PATHOLOGISING BIOLOGY: Capacity shifts are handled in attribution narrative.

    // ─────────────────────────────────────────────────────────────────────────
    // FINAL WRAP
    // ─────────────────────────────────────────────────────────────────────────
    cfs = cap25(cfs);
    als = cap25(als);
    ses = cap25(ses);
    rds = cap25(rds);

    const total = Math.min(Math.round(cfs + als + ses + rds), 100);

    const domains = {
        'Recovery Disruption':    rds,
        'Circadian Rhythm Index': cfs,
        'Autonomic Load Index':   als,
        'Sensory Load':           ses,
    };

    const dominant_domain = Object.keys(domains).reduce((a, b) => 
        domains[a as keyof typeof domains] > domains[b as keyof typeof domains] ? a : b
    );

    // LOAD ATTRIBUTION: Priority Narrative
    let load_attribution: BSFIResult['load_attribution'] = 'environmental';

    if (today.cycle_phase === 'menstrual' || today.cycle_phase === 'luteal') {
        load_attribution = 'biological';
    } else {
        const isTensionHigh       = safe(today.morning_tension) >= 6;
        const isCircadianClean    = cfs <= 5;
        const isAutonomicClean    = als <= 3;
        const isSleepLargelyIntact = safe(today.sleep_wakes) <= 1;

        if (isTensionHigh && isCircadianClean && isAutonomicClean && isSleepLargelyIntact) {
            load_attribution = 'internal';
        }
    }

    return {
        cfs_score:        Math.round(cfs),
        als_score:        Math.round(als),
        ses_score:        Math.round(ses),
        rds_score:        Math.round(rds),
        bsfi_total:       total,
        load_attribution,
        dominant_domain,
        data_confidence:  'basic',
        biological_load:  load_attribution === 'biological',
        version:          'bsfi_v7.1',
    };
}
