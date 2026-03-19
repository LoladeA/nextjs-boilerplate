// /lib/bsfi-engine.ts
// Version: bsfi_v5
//
// CHANGELOG v5
// ─────────────────────────────────────────────────────────────────────────────
// 1. social_demand added to DailyLogParams
//    Type: 'low' | 'moderate' | 'high' | null (optional, backwards-compatible)
//    Anchored to cognitive and emotional demand quality, not social volume.
//    Evidence: Trier Social Stress Test meta-analysis (Dickerson & Kemeny 2004,
//    N=8,452); Kudielka et al. 2009; Viau et al. 2024 (eNeuro); Walker 2017.
//
// 2. ALS: social demand scored as direct autonomic load input (+5 high, +2 moderate)
//    The autonomic nervous system shows the largest effect sizes in response
//    to evaluative and emotionally demanding social engagement — larger than
//    the cortisol response (Dickerson & Kemeny 2004). Placed in ALS because
//    social demand is an autonomic load source, not a spatial or recovery one.
//
// 3. RDS: compound penalty (+3) when high social demand co-occurs with >= 2
//    sleep interruptions. REM theta activity facilitates consolidation of
//    autonomic affective responses (Viau et al. 2024). REM suppression
//    specifically impairs processing of socially loaded material (Scientific
//    Reports 2024). The overnight clearing window cannot efficiently process
//    both environmental and relational residue simultaneously.
//
// 4. isInternalDriver: high social demand days excluded from classification.
//    High demand + low environmental friction is a relational load signature,
//    not an internal dysregulation signature. Prevents misattribution.
//
// 5. Domain labels aligned with UI display names used in sanitiseDomain().
// ─────────────────────────────────────────────────────────────────────────────

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
    // ─────────────────────────────────────────────────────────────────────
    // SOCIAL DEMAND
    //
    // Self-reported quality of social and relational engagement across
    // the day. Anchored to cognitive and emotional cost, not contact volume.
    //
    // Calibration anchors (informed by TSST research and EMA literature):
    //
    //   'low'      — Little to no interaction, or only light contact that
    //                required no significant emotional or cognitive investment.
    //                Includes solitude, passive social exposure (e.g. being
    //                around people without active engagement), or warm low-
    //                stakes contact. No measurable ANS activation expected.
    //
    //   'moderate' — Social engagement that required attention and presence
    //                but felt manageable. Ordinary professional interaction,
    //                routine family contact, social events without evaluative
    //                pressure. Some regulatory cost; unlikely to be acutely
    //                stressful.
    //
    //   'high'     — Interactions that were emotionally taxing, evaluatively
    //                pressured, required sustained emotional labour, involved
    //                conflict or relational complexity, or left the user
    //                feeling spent. Analogous to the evaluative threat
    //                conditions in TSST research that produce robust cortisol
    //                and cardiac ANS activation (effect size 0.96 across
    //                adult studies, Dickerson & Kemeny 2004).
    //
    // Null-safe: users who have not yet logged this field are treated as
    // 'low' and score no additional load. Fully backwards-compatible with
    // all existing log entries.
    // ─────────────────────────────────────────────────────────────────────
    social_demand?: 'low' | 'moderate' | 'high' | null;
}

export interface BSFIResult {
    cfs_score:          number;
    als_score:          number;
    ses_score:          number;
    rds_score:          number;
    bsfi_total:         number;
    is_internal_driver: boolean;
    dominant_domain:    string;
    version:            string;
}

// --- STATISTICAL HELPERS ---

// Standard Deviation — measures baseline stability across the 14-day window
const calculateSD = (arr: number[]): number => {
    if (arr.length === 0) return 0;
    const mean     = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
};

// Pearson Correlation Coefficient — finds relational friction (e.g. dB vs tension)
const calculatePearson = (x: number[], y: number[]): number => {
    if (x.length === 0 || y.length === 0 || x.length !== y.length) return 0;
    const n    = x.length;
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

// Cap sub-scores at 25
const cap25 = (score: number) => Math.min(Math.max(score, 0), 25);

// Null coercion — nullable fields default to 0 unless overridden
const n = (val: number | null | undefined, fallback = 0): number => val ?? fallback;

// --- THE CORE ENGINE ---

export function calculateBSFI(today: DailyLogParams, history: DailyLogParams[] = []): BSFIResult {

    let cfs = 0; // Circadian Friction Score
    let als = 0; // Acoustic + Autonomic Load Score
    let ses = 0; // Spatial Entropy Score
    let rds = 0; // Recovery Disruption Score

    // Resolve social demand once — used across ALS and RDS
    const socialLoad = today.social_demand ?? 'low'

    // -------------------------------------------------------------------------
    // 1️⃣  CIRCADIAN FRICTION SCORE (CFS)
    //
    // References: Zeitzer et al. 2000, Gooley et al. 2011,
    //             Cajochen et al. 2011, Viola et al. 2008
    //
    // Social demand does not affect circadian friction. Light timing and
    // melatonin suppression are independent of relational load.
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
        // <= 50 lux: acceptable wind-down range
    }

    // Compound penalty: sleep fragmentation + elevated evening lux
    if (n(today.sleep_wakes) >= 2 && today.evening_lux !== null && today.evening_lux > 100) {
        cfs += 4;
    }

    // -------------------------------------------------------------------------
    // 2️⃣  ACOUSTIC + AUTONOMIC LOAD SCORE (ALS)
    //
    // Social demand is scored here as a direct autonomic load input alongside
    // acoustic signals. The cardiac autonomic nervous system shows the largest
    // effect sizes in response to evaluative and emotionally demanding social
    // engagement — larger than the cortisol response (Dickerson & Kemeny 2004,
    // effect size 0.96 across adult studies). This places social demand firmly
    // in the autonomic load domain.
    //
    // The ALS cap is 25. On a high-demand day with elevated daytime dB and
    // nighttime dB, this cap will be reached. That is the correct behaviour —
    // it represents a genuinely high autonomic load day.
    //
    // Scoring:
    //   high:     +5 — Evaluatively or emotionally taxing engagement. Produces
    //                  robust sympathetic activation and HPA axis response
    //                  comparable to a meaningful acoustic overexposure event.
    //   moderate: +2 — Manageable engagement with some regulatory cost.
    //                  Ordinary professional or social contact. Non-acute.
    //   low/null: +0 — No additional autonomic load. Passive or absent social
    //                  contact produces no measurable ANS activation.
    // -------------------------------------------------------------------------

    if (socialLoad === 'high')          als += 5;
    else if (socialLoad === 'moderate') als += 2;

    if (today.daytime_db !== null && today.daytime_db > 55)     als += 5;
    if (today.nighttime_db !== null && today.nighttime_db > 40) als += 8;

    // Compound: high morning tension + elevated nighttime dB
    if (n(today.morning_tension) >= 7 && today.nighttime_db !== null && today.nighttime_db > 40) {
        als += 4;
    }

    // 14-day Pearson correlation: dB vs tension
    // If acoustic exposure and somatic tension co-vary over time, the
    // acoustic environment is a confirmed tension driver — weight applied.
    const histDb      = history.map(h => h.daytime_db ?? 0).filter(v => v > 0);
    const histTension = history.map(h => n(h.morning_tension));
    if (histDb.length > 5 && calculatePearson(histDb, histTension) > 0.4) {
        als += 4;
    }

    // -------------------------------------------------------------------------
    // 3️⃣  SPATIAL ENTROPY SCORE (SES)
    //
    // Social demand does not directly affect spatial entropy. SES measures
    // the built environment's contribution to cognitive load — clutter,
    // visual noise, and acoustic buffering practices. These are independent
    // of relational demand.
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
    // 4️⃣  RECOVERY DISRUPTION SCORE (RDS)
    //
    // SOCIAL DEMAND COMPOUND PENALTY
    //
    // REM sleep theta activity facilitates the consolidation of autonomic
    // affective responses — it is the primary mechanism by which the nervous
    // system processes emotionally and relationally loaded material overnight
    // (Viau et al. 2024, eNeuro). REM suppression from sleep fragmentation
    // specifically impairs this processing and increases amygdala reactivity
    // to social stimuli the following day (Scientific Reports 2024).
    //
    // When high social demand co-occurs with fragmented sleep (>= 2 wakes),
    // the overnight clearing window cannot efficiently process both
    // environmental disruption and relational residue simultaneously.
    // This is a compound effect — not an additive one.
    //
    // Penalty: +3
    // Threshold: 'high' demand only. Moderate demand does not trigger this
    // penalty — the compound effect requires evaluative or emotionally taxing
    // engagement, not ordinary social contact.
    // -------------------------------------------------------------------------

    if (n(today.sleep_wakes) >= 3)     rds += 5;
    if (n(today.morning_tension) >= 7) rds += 5;

    // Social demand compound: high relational load + sleep fragmentation
    if (socialLoad === 'high' && n(today.sleep_wakes) >= 2) {
        rds += 3;
    }

    // Chronic pattern: co-occurring wakes and tension across 4 days
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
    //
    // High variance in tension and mood signals an unstable baseline — the
    // nervous system is not holding a steady state. Multipliers applied to
    // RDS (tension variance) and total BSFI (mood variance) separately.
    // -------------------------------------------------------------------------

    const allTension = [...history.map(h => n(h.morning_tension)), n(today.morning_tension)];
    const allMood    = [...history.map(h => n(h.mood_score, 3)),   n(today.mood_score, 3)];

    const tensionSD = calculateSD(allTension);
    const moodSD    = calculateSD(allMood);

    if (tensionSD > 2.5) rds = cap25(rds * 1.15);

    let totalBsfi = cfs + als + ses + rds;
    if (moodSD > 1.2) totalBsfi = totalBsfi * 1.1;

    totalBsfi = Math.min(Math.round(totalBsfi), 100);

    // -------------------------------------------------------------------------
    // NEUROTYPE INCLUSIVITY LAYER — isInternalDriver
    //
    // Flags cases where the load is not originating from the physical
    // environment. Fires when tension variance is high but total environmental
    // friction is low — suggesting biological, hormonal, or emotional origin.
    //
    // SOCIAL DEMAND EXCLUSION
    // High social demand + low environmental friction is a relational load
    // signature, not an internal dysregulation signature. Without this
    // exclusion, a user whose most taxing day involved emotional labour or
    // a difficult relational situation would be told their load is coming
    // from within. That is inaccurate and potentially harmful.
    //
    // The exclusion creates a de facto third category: relational load.
    // The flag does not fire, and the audit translation prompt receives
    // the high social demand context directly to inform its prescriptions.
    // -------------------------------------------------------------------------

    let isInternalDriver = false;

    if (tensionSD > 2.5 && totalBsfi < 40 && socialLoad !== 'high') {
        isInternalDriver = true;
    }

    // -------------------------------------------------------------------------
    // DOMINANT DOMAIN
    //
    // Labels match the domain display names used in getDomainDisplay()
    // and sanitiseDomain() in the progress page — must stay aligned.
    // -------------------------------------------------------------------------

    const scores = {
        'Circadian Rhythm Index': cfs,
        'Autonomic Load Index':   als,
        'Sensory Load':           ses,
        'Recovery Disruption':    rds,
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
        version:            'bsfi_v5',
    };
}
