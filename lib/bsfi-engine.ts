// /lib/bsfi-engine.ts

// --- INTERFACES ---
export interface DailyLogParams {
    morning_lux: number | null;
    evening_lux: number | null;
    daytime_db: number | null;
    nighttime_db: number | null;
    morning_tension: number | null;
    sleep_wakes: number | null;
    focus_hours: number | null;
    mood_score: number | null;
    morning_tags: string[];
    evening_tags: string[];
}

export interface BSFIResult {
    cfs_score: number;
    als_score: number;
    ses_score: number;
    rds_score: number;
    bsfi_total: number;
    is_internal_driver: boolean;
    dominant_domain: string;
    version: string;
}

// --- STATISTICAL HELPERS ---

// Calculates Standard Deviation to measure baseline stability
const calculateSD = (arr: number[]): number => {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
};

// Pearson Correlation Coefficient to find relational friction (e.g., dB vs tension)
const calculatePearson = (x: number[], y: number[]): number => {
    if (x.length === 0 || y.length === 0 || x.length !== y.length) return 0;
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);
    const sumY2 = y.reduce((a, b) => a + b * b, 0);

    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt(
        ((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY))
    );

    if (denominator === 0) return 0;
    return numerator / denominator;
};

// Helper to cap sub-scores at 25
const cap25 = (score: number) => Math.min(Math.max(score, 0), 25);

// --- NULL COERCION HELPERS ---
// Nullable fields in DailyLogParams are coerced to safe defaults before
// comparisons. Numeric fields default to 0; this preserves the original
// scoring intent while satisfying TypeScript strict null checks.
const n = (val: number | null, fallback = 0): number => val ?? fallback;

// --- THE CORE IP ENGINE ---

export function calculateBSFI(today: DailyLogParams, history: DailyLogParams[] = []): BSFIResult {
    let cfs = 0; // Circadian Friction
    let als = 0; // Acoustic Load
    let ses = 0; // Spatial Entropy
    let rds = 0; // Recovery Disruption

    // -------------------------------------------------------------------------
    // 1️⃣ CIRCADIAN FRICTION SCORE (CFS)
    // Thresholds: Zeitzer et al. 2000, Gooley et al. 2011, Cajochen et al. 2011,
    //             Viola et al. 2008
    // -------------------------------------------------------------------------
    if (today.morning_lux !== null) {
        if (today.morning_lux < 100)       cfs += 8; // CAR cannot anchor — critical deficit
        else if (today.morning_lux < 250)  cfs += 6; // Suboptimal circadian signal
        else if (today.morning_lux < 500)  cfs += 3; // Adequate but not optimal
        // >= 500 lux: no friction added
    }

    if (today.evening_lux !== null) {
        if (today.evening_lux > 800)       cfs += 10; // Near-maximal melatonin suppression
        else if (today.evening_lux > 300)  cfs += 7;  // Significant suppression
        else if (today.evening_lux > 100)  cfs += 4;  // 25–30% suppression begins
        else if (today.evening_lux > 50)   cfs += 2;  // Marginal suppression — caution band
        // <= 50 lux: acceptable wind-down range — no friction added
    }

    // Compound penalty: sleep fragmentation + elevated evening lux
    // Threshold lowered from 300 to 100 — research supports earlier compound effect
    if (n(today.sleep_wakes) >= 2 && today.evening_lux !== null && today.evening_lux > 100) {
        cfs += 4;
    }

    // -------------------------------------------------------------------------
    // 2️⃣ ACOUSTIC LOAD SCORE (ALS)
    // -------------------------------------------------------------------------
    if (today.daytime_db !== null && today.daytime_db > 55)   als += 5;
    if (today.nighttime_db !== null && today.nighttime_db > 40) als += 8;
    if (n(today.morning_tension) >= 7 && today.nighttime_db !== null && today.nighttime_db > 40) als += 4;

    // Relational weight: 14-day Pearson correlation between dB and tension
    const histDb = history.map(h => h.daytime_db ?? 0).filter(v => v > 0);
    const histTension = history.map(h => n(h.morning_tension));
    if (histDb.length > 5 && calculatePearson(histDb, histTension) > 0.4) {
        als += 4; // Synergy weight applied if statistically correlated
    }

    // -------------------------------------------------------------------------
    // 3️⃣ SPATIAL ENTROPY SCORE (SES)
    // -------------------------------------------------------------------------
    let missingDeclutterDays = 0;
    let missingEntropyResetDays = 0;

    for (const log of history.slice(0, 3)) {
        if (!log.morning_tags?.includes('declutter'))     missingDeclutterDays++;
        if (!log.evening_tags?.includes('entropy_reset')) missingEntropyResetDays++;
    }
    if (!today.morning_tags.includes('declutter'))     missingDeclutterDays++;
    if (!today.evening_tags.includes('entropy_reset')) missingEntropyResetDays++;

    if (missingDeclutterDays >= 3)    ses += 5;
    if (missingEntropyResetDays >= 3) ses += 5;

    if (n(today.focus_hours) < 3 && today.daytime_db !== null && today.daytime_db > 55) ses += 5;

    const hasBuffering =
        today.morning_tags.includes('noise_buffer') ||
        today.evening_tags.includes('acoustic_seal');
    if (n(today.mood_score, 3) <= 2 && !hasBuffering) ses += 5;

    // -------------------------------------------------------------------------
    // 4️⃣ RECOVERY DISRUPTION SCORE (RDS)
    // -------------------------------------------------------------------------
    if (n(today.sleep_wakes) >= 3)      rds += 5;
    if (n(today.morning_tension) >= 7)  rds += 5;

    let wakesTensionCoOccur = 0;
    history.slice(0, 3).forEach(log => {
        if (n(log.sleep_wakes) >= 3 && n(log.morning_tension) >= 7) wakesTensionCoOccur++;
    });
    if (n(today.sleep_wakes) >= 3 && n(today.morning_tension) >= 7) wakesTensionCoOccur++;
    if (wakesTensionCoOccur >= 3) rds += 8;

    if (n(today.sleep_wakes) >= 2 && !today.evening_tags.includes('tactile_enclosure')) rds += 4;

    // CAP SUB-SCORES AT 25
    cfs = cap25(cfs);
    als = cap25(als);
    ses = cap25(ses);
    rds = cap25(rds);

    // -------------------------------------------------------------------------
    // VARIABILITY MULTIPLIER (VM)
    // Filters null values before passing to calculateSD — fixes TS2345
    // -------------------------------------------------------------------------
    const allTension = [...history.map(h => n(h.morning_tension)), n(today.morning_tension)];
    const allMood    = [...history.map(h => n(h.mood_score, 3)),   n(today.mood_score, 3)];

    const tensionSD = calculateSD(allTension);
    const moodSD    = calculateSD(allMood);

    if (tensionSD > 2.5) rds = cap25(rds * 1.15); // Multiplier applied to RDS only

    let totalBsfi = cfs + als + ses + rds;
    if (moodSD > 1.2) totalBsfi = totalBsfi * 1.1; // Multiplier applied to total

    totalBsfi = Math.min(Math.round(totalBsfi), 100); // Cap at 100

    // -------------------------------------------------------------------------
    // NEUROTYPE INCLUSIVITY LAYER
    // -------------------------------------------------------------------------
    let isInternalDriver = false;

    // If tension variance is high but environment is relatively flat/stable
    if (tensionSD > 2.5 && totalBsfi < 40) {
        isInternalDriver = true;
    }

    // Determine dominant friction source for the UI
    const scores = {
        'Circadian Friction':   cfs,
        'Acoustic Load':        als,
        'Spatial Entropy':      ses,
        'Recovery Disruption':  rds
    };
    const dominant_domain = Object.keys(scores).reduce((a, b) =>
        scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b
    );

    return {
        cfs_score:          Math.round(cfs),
        als_score:          Math.round(als),
        ses_score:          Math.round(ses),
        rds_score:          Math.round(rds),
        bsfi_total:         totalBsfi,
        is_internal_driver: isInternalDriver,
        dominant_domain:    dominant_domain,
        version:            'bsfi_v4'
    };
}
