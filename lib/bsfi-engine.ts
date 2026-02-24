// /lib/bsfi-engine.ts

// --- INTERFACES ---
export interface DailyLogParams {
    morning_lux: number | null;
    evening_lux: number | null;
    daytime_db: number | null;
    nighttime_db: number | null;
    morning_tension: number;
    sleep_wakes: number;
    focus_hours: number;
    mood_score: number;
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

// Pearson Correlation Coefficient to find relational friction (e.g., db vs tension)
const calculatePearson = (x: number[], y: number[]): number => {
    if (x.length === 0 || y.length === 0 || x.length !== y.length) return 0;
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);
    const sumY2 = y.reduce((a, b) => a + b * b, 0);

    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
    
    if (denominator === 0) return 0;
    return numerator / denominator;
};

// Helper to cap sub-scores at 25
const cap25 = (score: number) => Math.min(Math.max(score, 0), 25);

// --- THE CORE IP ENGINE ---

export function calculateBSFI(today: DailyLogParams, history: DailyLogParams[] = []): BSFIResult {
    let cfs = 0; // Circadian Friction
    let als = 0; // Acoustic Load
    let ses = 0; // Spatial Entropy
    let rds = 0; // Recovery Disruption

    // 1️⃣ CIRCADIAN FRICTION SCORE (CFS)
    if (today.morning_lux !== null) {
        if (today.morning_lux < 250) cfs += 6;
        else if (today.morning_lux < 500) cfs += 3;
    }
    if (today.evening_lux !== null) {
        if (today.evening_lux > 800) cfs += 10;
        else if (today.evening_lux > 300) cfs += 5;
    }
    if (today.sleep_wakes >= 2 && today.evening_lux !== null && today.evening_lux > 300) {
        cfs += 4;
    }

    // 2️⃣ ACOUSTIC LOAD SCORE (ALS)
    if (today.daytime_db !== null && today.daytime_db > 55) als += 5;
    if (today.nighttime_db !== null && today.nighttime_db > 40) als += 8;
    if (today.morning_tension >= 7 && today.nighttime_db !== null && today.nighttime_db > 40) als += 4;

    // Relational Weight (14-day pearson correlation between dB and tension)
    const histDb = history.map(h => h.daytime_db || 0).filter(v => v > 0);
    const histTension = history.map(h => h.morning_tension);
    if (histDb.length > 5 && calculatePearson(histDb, histTension) > 0.4) {
        als += 4; // Synergy weight applied if statistically correlated
    }

    // 3️⃣ SPATIAL ENTROPY SCORE (SES)
    // Track consecutive days of missing habits
    let missingDeclutterDays = 0;
    let missingEntropyResetDays = 0;
    for (const log of history.slice(0, 3)) { // Check last 3 days
        if (!log.morning_tags?.includes('declutter')) missingDeclutterDays++;
        if (!log.evening_tags?.includes('entropy_reset')) missingEntropyResetDays++;
    }
    if (!today.morning_tags.includes('declutter')) missingDeclutterDays++;
    if (!today.evening_tags.includes('entropy_reset')) missingEntropyResetDays++;

    if (missingDeclutterDays >= 3) ses += 5;
    if (missingEntropyResetDays >= 3) ses += 5;
    if (today.focus_hours < 3 && today.daytime_db !== null && today.daytime_db > 55) ses += 5;
    
    const hasBuffering = today.morning_tags.includes('noise_buffer') || today.evening_tags.includes('acoustic_seal');
    if (today.mood_score <= 2 && !hasBuffering) ses += 5;

    // 4️⃣ RECOVERY DISRUPTION SCORE (RDS)
    if (today.sleep_wakes >= 3) rds += 5;
    if (today.morning_tension >= 7) rds += 5;
    
    let wakesTensionCoOccur = 0;
    history.slice(0, 3).forEach(log => {
        if (log.sleep_wakes >= 3 && log.morning_tension >= 7) wakesTensionCoOccur++;
    });
    if (today.sleep_wakes >= 3 && today.morning_tension >= 7) wakesTensionCoOccur++;
    if (wakesTensionCoOccur >= 3) rds += 8;

    if (today.sleep_wakes >= 2 && !today.evening_tags.includes('tactile_enclosure')) rds += 4;

    // CAP SUB-SCORES AT 25
    cfs = cap25(cfs);
    als = cap25(als);
    ses = cap25(ses);
    rds = cap25(rds);

    // --- VARIABILITY MULTIPLIER (VM) ---
    const allTension = [...history.map(h => h.morning_tension), today.morning_tension];
    const allMood = [...history.map(h => h.mood_score), today.mood_score];
    
    const tensionSD = calculateSD(allTension);
    const moodSD = calculateSD(allMood);

    if (tensionSD > 2.5) rds = cap25(rds * 1.15); // Apply multiplier just to RDS

    let totalBsfi = cfs + als + ses + rds;
    if (moodSD > 1.2) totalBsfi = totalBsfi * 1.1; // Apply multiplier to total

    totalBsfi = Math.min(Math.round(totalBsfi), 100); // Cap at 100

    // --- NEUROTYPE INCLUSIVITY LAYER ---
    let isInternalDriver = false;
    const avgLux = history.reduce((acc, log) => acc + (log.daytime_db || 0), 0) / (history.length || 1); // rough proxy check
    
    // If tension variance is high, but environment is relatively flat/stable
    if (tensionSD > 2.5 && totalBsfi < 40) {
        isInternalDriver = true;
    }

    // Determine the dominant friction source for the UI
    const scores = { 'Circadian Friction': cfs, 'Acoustic Load': als, 'Spatial Entropy': ses, 'Recovery Disruption': rds };
    const dominant_domain = Object.keys(scores).reduce((a, b) => scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b);

    return {
        cfs_score: Math.round(cfs),
        als_score: Math.round(als),
        ses_score: Math.round(ses),
        rds_score: Math.round(rds),
        bsfi_total: totalBsfi,
        is_internal_driver: isInternalDriver,
        dominant_domain: dominant_domain,
        version: 'bsfi_v4'
    };
}
