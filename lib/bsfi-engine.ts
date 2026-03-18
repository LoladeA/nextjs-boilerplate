// /lib/bsfi-engine.ts — Version 7.3 (Clinical-Grade Autonomic Integration)

// ============================================================
// INTERFACES
// ============================================================

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
    social_demand?: 'low' | 'moderate' | 'high' | null;
}

export interface BaselineInput {
    threshold: 'low' | 'high';
    integrationPattern: 'integrative' | 'mixed' | 'accumulative';
    energyTaxBaseline: number;
}

export interface BSFIResult {
    cfs_score: number;
    als_score: number;
    ses_score: number;
    rds_score: number;

    bsfi_total: number;

    internal_driver_score: number;
    external_driver_score: number;

    dominant_domain: string;
    version: string;
}

// ============================================================
// STATISTICAL & MATH HELPERS
// ============================================================

const cap25 = (x: number) => Math.min(Math.max(x, 0), 25);
const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const n = (v: number | null | undefined, f = 0) => v ?? f;

const scale = (x: number, min: number, max: number) =>
    clamp01((x - min) / (max - min));

const calculatePearson = (x: number[], y: number[]): number => {
    if (x.length !== y.length || x.length < 3) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);
    const sumY2 = y.reduce((a, b) => a + b * b, 0);

    const denom = Math.sqrt(
        (n * sumX2 - sumX * sumX) *
        (n * sumY2 - sumY * sumY)
    );

    if (denom === 0) return 0;
    return (n * sumXY - sumX * sumY) / denom;
};

// ============================================================
// CORE ENGINE
// ============================================================

export function calculateBSFI(
    today: DailyLogParams,
    history: DailyLogParams[] = [],
    baseline: BaselineInput
): BSFIResult {

    let cfs = 0, als = 0, ses = 0, rds = 0;

    // =========================================================
    // 1. CFS (Circadian Friction Score)
    // =========================================================
    if (today.morning_lux !== null) {
        if (today.morning_lux < 100) cfs += 8;
        else if (today.morning_lux < 250) cfs += 6;
        else if (today.morning_lux < 500) cfs += 3;
    }

    if (today.evening_lux !== null) {
        if (today.evening_lux > 800) cfs += 10;
        else if (today.evening_lux > 300) cfs += 7;
        else if (today.evening_lux > 100) cfs += 4;
        else if (today.evening_lux > 50) cfs += 2;
    }

    // Compound penalty: sleep fragmentation + elevated evening lux
    if (n(today.sleep_wakes) >= 2 && today.evening_lux !== null && today.evening_lux > 100) {
        cfs += 4;
    }

    // Soft lag (Maintained from V7.2)
    const luxHist = history.slice(-7).map(h => n(h.evening_lux));
    const tensionHist = history.slice(-7).map(h => n(h.morning_tension));
    const corr = calculatePearson(luxHist, tensionHist);
    cfs += Math.max(0, corr) * 5;

    // =========================================================
    // 2. ALS (Autonomic Load Source: Acoustic + Social)
    // =========================================================
    const socialMap = { low: 0, moderate: 2, high: 5 };
    const socialLoad = today.social_demand ?? 'low';
    
    // Base social load
    const currentSocialScore = socialMap[socialLoad];
    als += currentSocialScore;

    // Historic social load carry-over
    const histSocial = history.slice(-7).map(h => socialMap[h.social_demand ?? 'low']);
    const avgSocial = histSocial.length > 0 ? histSocial.reduce((a, b) => a + b, 0) / histSocial.length : 0;
    als += avgSocial;

    if (today.daytime_db !== null && today.daytime_db > 55) als += 5;
    if (today.nighttime_db !== null && today.nighttime_db > 40) als += 8;
    if (n(today.morning_tension) >= 7 && today.nighttime_db !== null && today.nighttime_db > 40) als += 4;

    // THE FRONTIERS SYNERGY PENALTY
    // If both external stressors coexist, the ANS loses its "quiet" channel.
    let appliedSynergyPenalty = 0;
    if (socialLoad === 'high' && today.daytime_db !== null && today.daytime_db > 55) {
        appliedSynergyPenalty = 4;
        als += appliedSynergyPenalty; 
    }

    // =========================================================
    // 3. SES (Spatial Entropy Score - Unchanged)
    // =========================================================
    let missingDeclutterDays = 0;
    let missingEntropyResetDays = 0;

    for (const log of history.slice(0, 3)) {
        if (!log.morning_tags?.includes('declutter')) missingDeclutterDays++;
        if (!log.evening_tags?.includes('entropy_reset')) missingEntropyResetDays++;
    }

    if (!today.morning_tags.includes('declutter')) missingDeclutterDays++;
    if (!today.evening_tags.includes('entropy_reset')) missingEntropyResetDays++;

    if (missingDeclutterDays >= 3) ses += 5;
    if (missingEntropyResetDays >= 3) ses += 5;

    if (n(today.focus_hours) < 3 && today.daytime_db !== null && today.daytime_db > 55) ses += 5;

    const hasBuffering =
        today.morning_tags.includes('noise_buffer') ||
        today.evening_tags.includes('acoustic_seal');

    if (n(today.mood_score, 3) <= 2 && !hasBuffering) ses += 5;

    // =========================================================
    // 4. RDS (Recovery Disruption Score)
    // =========================================================
    if (n(today.sleep_wakes) >= 3) rds += 5;
    if (n(today.morning_tension) >= 7) rds += 5;
    
    // THE eNeuro REM-PROCESSING BLOCKADE
    if (socialLoad === 'high' && n(today.sleep_wakes) >= 2) {
        rds += 6; // Severe penalty for inability to process social load
        if (n(today.sleep_wakes) >= 3) rds += 2; // Closure penalty
    }
    
    if (n(today.sleep_wakes) >= 2 && !today.evening_tags.includes('tactile_enclosure')) rds += 4;

    // =========================================================
    // CAP + TOTAL
    // =========================================================
    cfs = cap25(cfs);
    als = cap25(als);
    ses = cap25(ses);
    rds = cap25(rds);

    const totalBsfi = Math.min(Math.round(cfs + als + ses + rds), 100);

    // =========================================================
    // ATTRIBUTION LAYER (V7.2 Logic Preserved)
    // =========================================================

    const thresholdFactor = baseline.threshold === 'low' ? 1.2 : 0.8;

    const integrationFactor =
        baseline.integrationPattern === 'accumulative' ? 1.3 :
        baseline.integrationPattern === 'mixed' ? 1.1 : 1.0;

    const energyFactor =
        1 + (baseline.energyTaxBaseline - 50) / 100;

    const expectedReactivity =
        thresholdFactor * integrationFactor * energyFactor;

    // External load now seamlessly processes both environmental and social autonomic drivers
    const external_load = (cfs + als) / 50; 

    const predicted_strain = clamp01(external_load * expectedReactivity);

    const tension = scale(n(today.morning_tension, 5), 1, 10);
    const inverseMood = 1 - scale(n(today.mood_score, 3), 1, 5);

    const observed_strain = clamp01(0.6 * tension + 0.4 * inverseMood);

    const residual = observed_strain - predicted_strain;

    const internal_driver_score = clamp01(residual);
    const external_driver_score = clamp01(predicted_strain);

    // =========================================================
    // DOMINANT DOMAIN & SYNTHESIS HICCUP FIX
    // =========================================================
    const scores = {
        'Circadian Rhythm Index': cfs,
        'Autonomic Load Index': als,
        'Spatial Entropy': ses,
        'Recovery Disruption': rds
    };

    let dominant_domain = Object.keys(scores).reduce((a, b) =>
        scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b
    );

    // THE ATTRIBUTION FIX: Prevent the house from taking the blame for a hard day
    if (dominant_domain === 'Autonomic Load Index' && (socialLoad === 'high' || socialLoad === 'moderate')) {
        const totalSocialContribution = currentSocialScore + avgSocial + appliedSynergyPenalty;
        
        // If social friction accounts for 50% or more of the ALS score, re-label it for the UI.
        if (totalSocialContribution >= (als / 2)) {
            dominant_domain = 'Relational / Social Load';
        }
    }

    return {
        cfs_score: cfs,
        als_score: als,
        ses_score: ses,
        rds_score: rds,

        bsfi_total: totalBsfi,

        internal_driver_score,
        external_driver_score,

        dominant_domain,
        version: 'bsfi_v7.3'
    };
}
