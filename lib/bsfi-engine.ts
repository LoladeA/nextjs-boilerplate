// /lib/bsfi-engine.ts - Version 7

// --- INTERFACES ---
export interface DailyLogParams {
    morning_lux:    number | null;
    evening_lux:    number | null;
    daytime_db:     number | null;
    nighttime_db:   number | null;
    morning_tension: number | null;
    sleep_wakes:    number | null;
    focus_hours:    number | null;
    mood_score:     number | null;
    morning_tags:   string[];
    evening_tags:   string[];
    social_demand?: 'low' | 'moderate' | 'high' | null;
}

export interface BSFIResult {
    cfs_score:          number;
    als_score:          number;
    rli_score:          number; // New: Relational Load Index
    ses_score:          number;
    rds_score:          number;
    bsfi_total:         number;
    is_internal_driver: boolean;
    dominant_domain:    string;
    version:            string;
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
    const sumX  = x.reduce((a, b) => a + b, 0);
    const sumY  = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);
    const sumY2 = y.reduce((a, b) => a + b * b, 0);

    const numerator   = (n * sumXY) - (sumX * sumY);
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
const n = (val: number | null | undefined, fallback = 0): number => val ?? fallback;

// --- CONSTANTS FOR V.7 ---
const LAG_CORRELATION_WINDOW = 7; // Days for lagged correlation
const LAG_CORRELATION_THRESHOLD = 0.4; // Pearson correlation threshold
const VFR_THRESHOLD = 2.0; // Variance-to-Friction Ratio threshold for internal driver

// --- THE CORE IP ENGINE ---

export function calculateBSFI(today: DailyLogParams, history: DailyLogParams[] = []): BSFIResult {
    let cfs = 0; // Circadian Friction
    let als = 0; // Acoustic Load
    let rli = 0; // Relational Load Index (NEW)
    let ses = 0; // Spatial Entropy
    let rds = 0; // Recovery Disruption

    // -------------------------------------------------------------------------
    // 1️⃣ CIRCADIAN FRICTION SCORE (CFS)
    // -------------------------------------------------------------------------
    if (today.morning_lux !== null) {
        if (today.morning_lux < 100)      cfs += 8; // CAR cannot anchor — critical deficit
        else if (today.morning_lux < 250) cfs += 6; // Suboptimal circadian signal
        else if (today.morning_lux < 500) cfs += 3; // Adequate but not optimal
        // >= 500 lux: no friction added
    }

    if (today.evening_lux !== null) {
        if (today.evening_lux > 800)      cfs += 10; // Near-maximal melatonin suppression
        else if (today.evening_lux > 300) cfs += 7;  // Significant suppression
        else if (today.evening_lux > 100) cfs += 4;  // 25–30% suppression begins
        else if (today.evening_lux > 50)  cfs += 2;  // Marginal suppression — caution band
        // <= 50 lux: acceptable wind-down range — no friction added
    }

    // Compound penalty: sleep fragmentation + elevated evening lux
    if (n(today.sleep_wakes) >= 2 && today.evening_lux !== null && today.evening_lux > 100) {
        cfs += 4;
    }

    // V.7: Lagged Correlation for Lux vs. Morning Tension/Sleep Wakes
    // We assume history is ordered chronologically, with the most recent being at the end.
    // To check for lagged effects, we look at previous evening_lux and subsequent morning_tension/sleep_wakes.
    const histEveningLux = history.slice(-LAG_CORRELATION_WINDOW).map(h => n(h.evening_lux));
    const histMorningTension = history.slice(-LAG_CORRELATION_WINDOW).map(h => n(h.morning_tension));
    const histSleepWakes = history.slice(-LAG_CORRELATION_WINDOW).map(h => n(h.sleep_wakes));

    // Add today's data to the history for correlation calculation if applicable
    // For lagged correlation, we need to correlate yesterday's evening lux with today's morning tension/sleep wakes.
    // So, we need to align the arrays correctly.
    const luxForLaggedCorrelation = history.slice(-LAG_CORRELATION_WINDOW -1, -1).map(h => n(h.evening_lux)); // Evening lux from previous days
    const tensionForLaggedCorrelation = history.slice(-LAG_CORRELATION_WINDOW).map(h => n(h.morning_tension)); // Morning tension from those days + today
    const wakesForLaggedCorrelation = history.slice(-LAG_CORRELATION_WINDOW).map(h => n(h.sleep_wakes)); // Sleep wakes from those days + today

    // Ensure arrays are of equal length for Pearson correlation
    if (luxForLaggedCorrelation.length > 0 && tensionForLaggedCorrelation.length > 0 &&
        luxForLaggedCorrelation.length === tensionForLaggedCorrelation.length) {
        const luxTensionCorr = calculatePearson(luxForLaggedCorrelation, tensionForLaggedCorrelation);
        if (luxTensionCorr > LAG_CORRELATION_THRESHOLD) {
            cfs += 3; // Penalty for consistent lagged impact of evening lux on morning tension
        }
    }

    if (luxForLaggedCorrelation.length > 0 && wakesForLaggedCorrelation.length > 0 &&
        luxForLaggedCorrelation.length === wakesForLaggedCorrelation.length) {
        const luxWakesCorr = calculatePearson(luxForLaggedCorrelation, wakesForLaggedCorrelation);
        if (luxWakesCorr > LAG_CORRELATION_THRESHOLD) {
            cfs += 3; // Penalty for consistent lagged impact of evening lux on sleep wakes
        }
    }

    // -------------------------------------------------------------------------
    // 2️⃣ ACOUSTIC LOAD SCORE (ALS) - V.7: Social Demand removed
    // -------------------------------------------------------------------------
    if (today.daytime_db !== null && today.daytime_db > 55)    als += 5;
    if (today.nighttime_db !== null && today.nighttime_db > 40) als += 8;
    if (n(today.morning_tension) >= 7 && today.nighttime_db !== null && today.nighttime_db > 40) als += 4;

    // Relational weight: 14-day Pearson correlation between dB and tension
    const histDb      = history.map(h => h.daytime_db ?? 0).filter(v => v > 0);
    const histTension = history.map(h => n(h.morning_tension));
    if (histDb.length > 5 && calculatePearson(histDb, histTension) > 0.4) {
        als += 4; // Synergy weight applied if statistically correlated
    }

    // -------------------------------------------------------------------------
    // 3️⃣ RELATIONAL LOAD INDEX (RLI) - NEW IN V.7
    // -------------------------------------------------------------------------
    const socialLoad = today.social_demand ?? 'low';
    if (socialLoad === 'high')     rli += 5;
    else if (socialLoad === 'moderate') rli += 2;

    // Consider cumulative social load from history
    const histSocialLoads = history.slice(-LAG_CORRELATION_WINDOW).map(h => {
        const hSocialLoad = h.social_demand ?? 'low';
        if (hSocialLoad === 'high') return 5;
        if (hSocialLoad === 'moderate') return 2;
        return 0;
    });
    const cumulativeSocialLoad = histSocialLoads.reduce((sum, val) => sum + val, 0);
    if (cumulativeSocialLoad > (LAG_CORRELATION_WINDOW * 3)) { // Arbitrary threshold for cumulative stress
        rli += 3; // Additional penalty for sustained high social demand
    }

    // -------------------------------------------------------------------------
    // 4️⃣ SPATIAL ENTROPY SCORE (SES)
    // -------------------------------------------------------------------------
    let missingDeclutterDays    = 0;
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
    // 5️⃣ RECOVERY DISRUPTION SCORE (RDS)
    // -------------------------------------------------------------------------
    if (n(today.sleep_wakes) >= 3)     rds += 5;
    if (n(today.morning_tension) >= 7) rds += 5;

    // Social demand compound penalty (now using RLI for clarity)
    if (socialLoad === 'high' && n(today.sleep_wakes) >= 2) {
        rds += 3;
    }

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
    rli = cap25(rli); // Cap RLI
    ses = cap25(ses);
    rds = cap25(rds);

    // -------------------------------------------------------------------------
    // VARIABILITY MULTIPLIER (VM)
    // -------------------------------------------------------------------------
    const allTension = [...history.map(h => n(h.morning_tension)), n(today.morning_tension)];
    const allMood    = [...history.map(h => n(h.mood_score, 3)),   n(today.mood_score, 3)];

    const tensionSD = calculateSD(allTension);
    const moodSD    = calculateSD(allMood);

    if (tensionSD > 2.5) rds = cap25(rds * 1.15);

    let totalBsfi = cfs + als + rli + ses + rds; // Include RLI in total
    if (moodSD > 1.2) totalBsfi = totalBsfi * 1.1;

    totalBsfi = Math.min(Math.round(totalBsfi), 100);

    // -------------------------------------------------------------------------
    // NEUROTYPE INCLUSIVITY LAYER - V.7: Proportional Attribution
    // -------------------------------------------------------------------------
    let isInternalDriver = false;

    // Calculate Variance-to-Friction Ratio (VFR)
    const internalVarianceScore = (tensionSD * 0.7) + (moodSD * 0.3); // Weighted composite of internal variability
    const environmentalFrictionScore = totalBsfi; // Use totalBsfi as environmental friction

    // Avoid division by zero for VFR
    if (environmentalFrictionScore > 0.1) { // Small epsilon to prevent division by zero
        const vfr = internalVarianceScore / environmentalFrictionScore;
        if (vfr > VFR_THRESHOLD && socialLoad !== 'high') {
            isInternalDriver = true;
        }
    } else if (internalVarianceScore > 1.0) { // If environmental friction is near zero, but internal variance is high
        isInternalDriver = true;
    }

    // Determine dominant friction source for the UI
    const scores = {
        'Circadian Rhythm Index': cfs,
        'Autonomic Load Index':   als,
        'Relational Load Index':  rli, // Include RLI
        'Spatial Entropy':        ses,
        'Recovery Disruption':    rds
    };
    const dominant_domain = Object.keys(scores).reduce((a, b) =>
        scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b
    );

    return {
        cfs_score:          Math.round(cfs),
        als_score:          Math.round(als),
        rli_score:          Math.round(rli), // Return RLI score
        ses_score:          Math.round(ses),
        rds_score:          Math.round(rds),
        bsfi_total:         totalBsfi,
        is_internal_driver: isInternalDriver,
        dominant_domain:    dominant_domain,
        version:            'bsfi_v7'
    };
}
