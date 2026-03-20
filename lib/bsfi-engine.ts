// /lib/bsfi-engine.ts
// Version: bsfi_v6
//
// =============================================================================
// CHANGELOG v6 — HEALTHKIT FIELD EXTENSIONS
// =============================================================================
//
// All new fields are optional and null-safe. When absent, the engine behaves
// identically to v5. When present, they enrich scoring with objective
// biometric data. No existing scoring logic has been altered.
//
// NEW FIELDS IN DailyLogParams:
//
//   hrv_morning (number | null)
//   ─────────────────────────────────────────────────────────────────────────
//   Morning heart rate variability in milliseconds (RMSSD).
//   Source: Apple Health / Oura / Garmin / any HealthKit-compatible device.
//   Domain: ALS — autonomic load.
//
//   Scored RELATIVE to the user's personal 14-day HRV baseline.
//   Absolute thresholds are not used — HRV varies significantly between
//   individuals by age, fitness, and baseline autonomic tone. A value of
//   35ms is high for some users and low for others. The relative approach
//   is the only clinically defensible method for detecting meaningful
//   deviation without individual calibration data.
//
//   Baseline requires 7+ days of HRV history. Below that threshold the
//   field is ignored to avoid false positives during onboarding.
//
//   Evidence: Shaffer & Ginsberg (2017) Front. Public Health — HRV as
//   index of autonomic nervous system function. Kim et al. (2018) —
//   rMSSD as a reliable measure of short-term HRV.
//
//   hrv_morning < 80% of baseline: ALS += 3
//   hrv_morning < 60% of baseline: ALS += 5 (replaces the +3, not additive)
//
//
//   resting_heart_rate (number | null)
//   ─────────────────────────────────────────────────────────────────────────
//   Resting heart rate in beats per minute.
//   Source: Apple Health / Oura / Garmin / any HealthKit-compatible device.
//   Domain: RDS — recovery disruption.
//
//   Elevated RHR relative to personal baseline is a recovery deficit signal.
//   Like HRV, scored relative to the user's 14-day personal baseline.
//   Requires 7+ days of RHR history.
//
//   Evidence: Plews et al. (2013) Int. J. Sports Physiol. Perform. —
//   resting HR elevation as indicator of physiological stress and
//   incomplete recovery. Buchheit (2014) — combined HRV + RHR interpretation.
//
//   resting_heart_rate > baseline + 5bpm:  RDS += 2
//   resting_heart_rate > baseline + 10bpm: RDS += 4 (replaces +2)
//
//
//   sleep_onset_latency (number | null)
//   ─────────────────────────────────────────────────────────────────────────
//   Time to fall asleep in minutes.
//   Source: Apple Health / Oura / any HealthKit sleep stage data.
//   Domain: CFS — circadian friction.
//
//   Sleep onset latency > 30 minutes is a clinically recognised marker of
//   circadian misalignment or hyperarousal at bedtime, independent of
//   evening light exposure. Provides objective data where the engine
//   currently only has lux readings as a proxy.
//
//   Evidence: Ohayon et al. (2017) Sleep Med. Rev. — SOL normative values.
//   American Academy of Sleep Medicine — SOL > 30 min as diagnostic criterion.
//
//   sleep_onset_latency > 20 min: CFS += 2
//   sleep_onset_latency > 30 min: CFS += 4
//   sleep_onset_latency > 45 min: CFS += 6
//
//
//   sleep_deep_percent (number | null)
//   ─────────────────────────────────────────────────────────────────────────
//   Percentage of total sleep time in deep (slow-wave) sleep. 0–100.
//   Source: Apple Health / Oura / any HealthKit sleep stage data.
//   Domain: RDS — recovery disruption.
//
//   Slow-wave sleep is the primary restorative stage — growth hormone release,
//   glymphatic clearance, and physical recovery all depend on adequate SWS.
//   Normal range in adults: 13–23% of total sleep time.
//
//   Evidence: Cappuccio et al. (2010) Sleep — SWS and health outcomes.
//   Besedovsky et al. (2019) Pflügers Arch. — slow-wave sleep and immune
//   function and metabolic restoration.
//
//   When present, deep percent supplements the existing sleep_wakes proxy.
//   sleep_deep_percent < 10%: RDS += 4
//   sleep_deep_percent < 15%: RDS += 2
//
//
//   sleep_rem_percent (number | null)
//   ─────────────────────────────────────────────────────────────────────────
//   Percentage of total sleep time in REM. 0–100.
//   Source: Apple Health / Oura / any HealthKit sleep stage data.
//   Domain: RDS — recovery disruption.
//
//   REM sleep is the primary stage for emotional memory consolidation,
//   social processing, and autonomic affective regulation. Already
//   referenced in the social demand compound penalty (v5). When objective
//   REM data is available it supersedes the sleep_wakes proxy inference.
//
//   Evidence: Walker (2017) Why We Sleep. Viau et al. (2024) eNeuro.
//   Scientific Reports (2024) — REM suppression and social processing.
//
//   sleep_rem_percent < 15%: RDS += 3
//   sleep_rem_percent < 10%: RDS += 5 (replaces +3, not additive)
//
//   INTERACTION WITH SOCIAL DEMAND COMPOUND PENALTY:
//   When sleep_rem_percent IS provided, the social demand compound penalty
//   (+3 for high demand + sleep_wakes >= 2) is adjusted. If REM is
//   objectively low (<15%), the penalty fires regardless of sleep_wakes count
//   because the mechanism (REM clearance failure) is directly observed.
//
//
//   cycle_phase ('menstrual' | 'follicular' | 'ovulatory' | 'luteal' | null)
//   ─────────────────────────────────────────────────────────────────────────
//   Menstrual cycle phase. Optional. Null for users who do not track.
//   Source: Apple Health (native or via Flo, Clue, Natural Cycles, etc.)
//
//   Menstrual cycle phase modulates sensory threshold, autonomic reactivity,
//   and sleep architecture in documented, phase-specific patterns.
//   The engine applies conservative phase-specific adjustments to prevent
//   misattribution of hormonal load as environmental failure.
//
//   PHASE EFFECTS:
//
//   'menstrual' — Days 1–5 (approximate). Prostaglandin release activates
//   the HPA axis independent of environmental conditions. Sleep quality
//   typically reduced. Sensory threshold may be lowered.
//   ALS += 2 (HPA activation), RDS += 2 (sleep quality)
//
//   'luteal' — Approximately days 15–28. Progesterone elevation reduces
//   sensory threshold. The same acoustic or light environment registers
//   as more demanding. Sleep architecture shifts: reduced deep sleep,
//   more frequent arousals in late luteal phase.
//   SES += 2 (effective sensory threshold reduction), RDS += 1
//
//   'follicular' / 'ovulatory' — Oestrogen-dominant phases. Typically
//   higher energy, lower sensory reactivity, better sleep architecture.
//   No additional load applied. These phases represent peak capacity.
//
//   Evidence: Shechter & Boivin (2010) Sleep Med. Rev. — sleep and
//   menstrual cycle. Parry et al. (2006) J. Affect. Disord. — sleep
//   architecture across cycle phases. Iacovides et al. (2015) Front.
//   Neurosci. — pain and sensory processing across cycle.
//
//   BIOLOGICAL LOAD ATTRIBUTION:
//   When cycle_phase is 'menstrual' or 'luteal', the isInternalDriver
//   flag is suppressed and a new 'biological_load' attribution is set.
//   This prevents misattributing hormonally-driven load as personal
//   dysregulation — the error your users were implicitly flagging.
//
// =============================================================================
// NEW FIELD IN BSFIResult:
//
//   load_attribution: 'environmental' | 'internal' | 'relational' | 'biological'
//   ─────────────────────────────────────────────────────────────────────────
//   Replaces the boolean isInternalDriver with a four-way attribution.
//   isInternalDriver is retained for backwards compatibility.
//
//   'environmental' — primary load is coming from the physical environment
//   'internal'      — load is internal; environment is low-friction
//   'relational'    — high social demand + low environmental friction
//   'biological'    — menstrual or luteal phase load present
//
// =============================================================================

// --- INTERFACES ---

export interface DailyLogParams {
    // ── Core environmental inputs (unchanged from v5) ─────────────────────────
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

    // ── Social demand (v5) ────────────────────────────────────────────────────
    // Self-reported quality of social and relational engagement.
    // Anchored to cognitive and emotional cost, not contact volume.
    // Null treated as 'low'. Fully backwards-compatible.
    social_demand?: 'low' | 'moderate' | 'high' | null;

    // ── HealthKit biometric fields (v6) ───────────────────────────────────────
    // All optional. All null-safe. Ignored when absent.
    // Populated by Apple Health / Oura / Garmin via HealthKit when native
    // app is available. Can also be manually entered via advanced log UI.

    // Morning HRV in milliseconds (RMSSD)
    // Scored relative to personal 14-day baseline. Requires 7+ history days.
    hrv_morning?: number | null;

    // Resting heart rate in BPM
    // Scored relative to personal 14-day baseline. Requires 7+ history days.
    resting_heart_rate?: number | null;

    // Time to fall asleep in minutes
    // Direct CFS input. Available from HealthKit sleep stage data.
    sleep_onset_latency?: number | null;

    // Percentage of total sleep time in deep/slow-wave sleep (0–100)
    // Available from HealthKit sleep stage data (Oura, Apple Watch Series 4+)
    sleep_deep_percent?: number | null;

    // Percentage of total sleep time in REM (0–100)
    // Available from HealthKit sleep stage data
    sleep_rem_percent?: number | null;

    // ── Cycle phase (v6) ──────────────────────────────────────────────────────
    // Optional. Null for users who do not track. Read from Apple Health
    // (populated by native Health app or any HealthKit cycle tracker).
    // Never requested directly from the user in the platform UI.
    cycle_phase?: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | null;
}

export interface BSFIResult {
    cfs_score:          number;
    als_score:          number;
    ses_score:          number;
    rds_score:          number;
    bsfi_total:         number;
    is_internal_driver: boolean; // retained for backwards compatibility
    load_attribution:   'environmental' | 'internal' | 'relational' | 'biological';
    dominant_domain:    string;
    version:            string;
    // Metadata flags for UI and delta engine
    healthkit_enriched: boolean; // true if any HealthKit field contributed to scoring
    biological_load:    boolean; // true when cycle_phase is menstrual or luteal
}

export interface BaselineInput {
    threshold:          'low' | 'high';
    integrationPattern: 'integrative' | 'mixed' | 'accumulative';
    energyTaxBaseline:  number;
}

// --- STATISTICAL HELPERS ---

// Standard Deviation
const calculateSD = (arr: number[]): number => {
    if (arr.length === 0) return 0;
    const mean     = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
};

// Pearson Correlation Coefficient
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

const cap25 = (score: number) => Math.min(Math.max(score, 0), 25);
const safe  = (val: number | null | undefined, fallback = 0): number => val ?? fallback;

// --- HEALTHKIT RELATIVE BASELINE HELPERS ---

// Computes personal median from history array.
// Returns null when fewer than minDays are present — prevents false positives
// during onboarding before the engine has enough data to establish a baseline.
const personalMedian = (values: (number | null | undefined)[], minDays = 7): number | null => {
    const valid = values.filter(v => v != null && !isNaN(v as number)) as number[];
    if (valid.length < minDays) return null;
    const sorted = [...valid].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
};

// --- THE CORE ENGINE ---

export function calculateBSFI(
    today:    DailyLogParams,
    history:  DailyLogParams[] = [],
    baseline: BaselineInput = { threshold: 'high', integrationPattern: 'integrative', energyTaxBaseline: 50 }
): BSFIResult {

    let cfs = 0;
    let als = 0;
    let ses = 0;
    let rds = 0;

    let healthkitEnriched = false; // tracks whether any v6 field contributed
    const socialLoad      = today.social_demand ?? 'low';
    const cyclePhase      = today.cycle_phase   ?? null;
    const isBiological    = cyclePhase === 'menstrual' || cyclePhase === 'luteal';

    // -------------------------------------------------------------------------
    // 1️⃣  CIRCADIAN FRICTION SCORE (CFS)
    //
    // v5 logic: lux thresholds for morning and evening, compound penalty.
    // v6 adds: sleep_onset_latency as an objective circadian signal.
    //
    // References: Zeitzer et al. 2000, Gooley et al. 2011,
    //             Cajochen et al. 2011, Viola et al. 2008
    // -------------------------------------------------------------------------

    if (today.morning_lux !== null) {
        if (today.morning_lux < 100)      cfs += 8;
        else if (today.morning_lux < 250) cfs += 6;
        else if (today.morning_lux < 500) cfs += 3;
    }

    if (today.evening_lux !== null) {
        if (today.evening_lux > 800)      cfs += 10;
        else if (today.evening_lux > 300) cfs += 7;
        else if (today.evening_lux > 100) cfs += 4;
        else if (today.evening_lux > 50)  cfs += 2;
    }

    // Compound: sleep fragmentation + elevated evening lux
    if (safe(today.sleep_wakes) >= 2 && today.evening_lux !== null && today.evening_lux > 100) {
        cfs += 4;
    }

    // v6 — Sleep onset latency (objective circadian misalignment signal)
    // Latency > 20 min indicates the circadian system did not produce a clean
    // sleep-pressure signal at bedtime — regardless of environmental conditions.
    if (today.sleep_onset_latency != null) {
        if (today.sleep_onset_latency > 45)      { cfs += 6; healthkitEnriched = true; }
        else if (today.sleep_onset_latency > 30) { cfs += 4; healthkitEnriched = true; }
        else if (today.sleep_onset_latency > 20) { cfs += 2; healthkitEnriched = true; }
    }

    // -------------------------------------------------------------------------
    // 2️⃣  ACOUSTIC + AUTONOMIC LOAD SCORE (ALS)
    //
    // v5 logic: social demand, daytime dB, nighttime dB, compound penalty,
    //           Pearson correlation over 14-day history.
    // v6 adds:  HRV relative deviation (objective autonomic suppression),
    //           cycle phase ALS modifier (menstrual HPA activation).
    // -------------------------------------------------------------------------

    // Social demand (v5)
    if (socialLoad === 'high')          als += 5;
    else if (socialLoad === 'moderate') als += 2;

    // Acoustic inputs (v5)
    if (today.daytime_db !== null && today.daytime_db > 55)     als += 5;
    if (today.nighttime_db !== null && today.nighttime_db > 40) als += 8;

    // Compound: high morning tension + elevated nighttime dB (v5)
    if (safe(today.morning_tension) >= 7 && today.nighttime_db !== null && today.nighttime_db > 40) {
        als += 4;
    }

    // 14-day Pearson: dB vs tension (v5)
    const histDb      = history.map(h => h.daytime_db ?? 0).filter(v => v > 0);
    const histTension = history.map(h => safe(h.morning_tension));
    if (histDb.length > 5 && calculatePearson(histDb, histTension) > 0.4) {
        als += 4;
    }

    // v6 — HRV relative deviation (objective autonomic load signal)
    // Requires 7+ days of HRV history to establish personal baseline.
    // Below that threshold the field is ignored entirely.
    if (today.hrv_morning != null) {
        const histHrv  = history.map(h => h.hrv_morning ?? null);
        const baseline_hrv = personalMedian(histHrv, 7);
        if (baseline_hrv !== null && baseline_hrv > 0) {
            const ratio = today.hrv_morning / baseline_hrv;
            if (ratio < 0.60)      { als += 5; healthkitEnriched = true; }
            else if (ratio < 0.80) { als += 3; healthkitEnriched = true; }
        }
        // If no baseline yet: field present but not scored — healthkitEnriched stays false
    }

    // v6 — Cycle phase: menstrual ALS modifier
    // Prostaglandin release during menstruation activates the HPA axis
    // independent of environmental or social load (Iacovides et al. 2015).
    if (cyclePhase === 'menstrual') {
        als += 2;
        healthkitEnriched = true;
    }

    // -------------------------------------------------------------------------
    // 3️⃣  SPATIAL ENTROPY SCORE (SES)
    //
    // v5 logic: declutter/entropy_reset tag patterns, focus vs dB interaction,
    //           mood vs buffering interaction.
    // v6 adds:  cycle phase SES modifier (luteal sensory threshold reduction).
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

    if (safe(today.focus_hours) < 3 && today.daytime_db !== null && today.daytime_db > 55) ses += 5;

    const hasBuffering =
        today.morning_tags.includes('noise_buffer') ||
        today.evening_tags.includes('acoustic_seal');
    if (safe(today.mood_score, 3) <= 2 && !hasBuffering) ses += 5;

    // v6 — Cycle phase: luteal SES modifier
    // Progesterone elevation in the luteal phase reduces effective sensory
    // threshold. The same acoustic or visual environment registers as more
    // demanding — this is not environmental failure, it is biological
    // modulation of the processing threshold (Shechter & Boivin 2010).
    if (cyclePhase === 'luteal') {
        ses += 2;
        healthkitEnriched = true;
    }

    // -------------------------------------------------------------------------
    // 4️⃣  RECOVERY DISRUPTION SCORE (RDS)
    //
    // v5 logic: sleep wakes, morning tension, social demand compound penalty,
    //           chronic co-occurrence pattern, tactile enclosure tag.
    // v6 adds:  resting_heart_rate relative deviation, sleep_deep_percent,
    //           sleep_rem_percent (objective REM deficit — refines the social
    //           demand compound penalty), cycle phase RDS modifier.
    // -------------------------------------------------------------------------

    if (safe(today.sleep_wakes) >= 3)     rds += 5;
    if (safe(today.morning_tension) >= 7) rds += 5;

    // Social demand compound penalty (v5) — modified in v6 when REM data present
    // When sleep_rem_percent IS available, the penalty fires on objective low REM
    // regardless of sleep_wakes count (the mechanism is directly observed, not proxied).
    const hasObjectiveRemData = today.sleep_rem_percent != null;
    const objectiveRemLow     = hasObjectiveRemData && (today.sleep_rem_percent as number) < 15;

    if (socialLoad === 'high') {
        if (hasObjectiveRemData) {
            // Use objective REM data: fires when REM is actually low
            if (objectiveRemLow) rds += 3;
        } else {
            // v5 proxy: infer from sleep fragmentation
            if (safe(today.sleep_wakes) >= 2) rds += 3;
        }
    }

    // Chronic pattern: co-occurring wakes and tension across 4 days (v5)
    let wakesTensionCoOccur = 0;
    history.slice(0, 3).forEach(log => {
        if (safe(log.sleep_wakes) >= 3 && safe(log.morning_tension) >= 7) wakesTensionCoOccur++;
    });
    if (safe(today.sleep_wakes) >= 3 && safe(today.morning_tension) >= 7) wakesTensionCoOccur++;
    if (wakesTensionCoOccur >= 3) rds += 8;

    if (safe(today.sleep_wakes) >= 2 && !today.evening_tags.includes('tactile_enclosure')) rds += 4;

    // v6 — Resting heart rate relative deviation
    if (today.resting_heart_rate != null) {
        const histRhr      = history.map(h => h.resting_heart_rate ?? null);
        const baseline_rhr = personalMedian(histRhr, 7);
        if (baseline_rhr !== null) {
            const delta = today.resting_heart_rate - baseline_rhr;
            if (delta > 10)      { rds += 4; healthkitEnriched = true; }
            else if (delta > 5)  { rds += 2; healthkitEnriched = true; }
        }
    }

    // v6 — Sleep deep percent (slow-wave sleep deficit)
    if (today.sleep_deep_percent != null) {
        if (today.sleep_deep_percent < 10)      { rds += 4; healthkitEnriched = true; }
        else if (today.sleep_deep_percent < 15) { rds += 2; healthkitEnriched = true; }
    }

    // v6 — Sleep REM percent (objective REM deficit)
    if (today.sleep_rem_percent != null) {
        if (today.sleep_rem_percent < 10)      { rds += 5; healthkitEnriched = true; }
        else if (today.sleep_rem_percent < 15) { rds += 3; healthkitEnriched = true; }
    }

    // v6 — Cycle phase: menstrual + luteal RDS modifier
    // Menstrual: sleep quality reduction is documented across studies
    // Luteal: late-luteal progesterone withdrawal disrupts sleep continuity
    if (cyclePhase === 'menstrual') {
        rds += 2;
        healthkitEnriched = true;
    } else if (cyclePhase === 'luteal') {
        rds += 1;
        healthkitEnriched = true;
    }

    // CAP SUB-SCORES AT 25
    cfs = cap25(cfs);
    als = cap25(als);
    ses = cap25(ses);
    rds = cap25(rds);

    // -------------------------------------------------------------------------
    // VARIABILITY MULTIPLIER (unchanged from v5)
    // -------------------------------------------------------------------------

    const allTension = [...history.map(h => safe(h.morning_tension)), safe(today.morning_tension)];
    const allMood    = [...history.map(h => safe(h.mood_score, 3)),   safe(today.mood_score, 3)];

    const tensionSD = calculateSD(allTension);
    const moodSD    = calculateSD(allMood);

    if (tensionSD > 2.5) rds = cap25(rds * 1.15);

    let totalBsfi = cfs + als + ses + rds;
    if (moodSD > 1.2) totalBsfi = totalBsfi * 1.1;

    totalBsfi = Math.min(Math.round(totalBsfi), 100);

    // -------------------------------------------------------------------------
    // LOAD ATTRIBUTION — v6 REPLACES isInternalDriver BOOLEAN
    //
    // Four-way attribution:
    //
    //   'biological'    — cycle phase is menstrual or luteal. The load is
    //                     hormonally mediated. isInternalDriver suppressed.
    //                     Prevents misattributing biological load as personal
    //                     dysregulation.
    //
    //   'relational'    — high social demand + low environmental friction.
    //                     The load is interpersonal, not spatial.
    //
    //   'internal'      — tension variance is high but environmental load is
    //                     low. Not explained by biology, environment, or
    //                     relational context. May warrant further assessment.
    //
    //   'environmental' — default. Load is primarily environmentally driven.
    //
    // isInternalDriver retained as boolean for backwards compatibility with
    // existing dashboard, results, and audit pages.
    // -------------------------------------------------------------------------

    let loadAttribution: BSFIResult['load_attribution'] = 'environmental';
    let isInternalDriver = false;

    if (isBiological) {
        loadAttribution = 'biological';
        // isInternalDriver stays false — hormonal load is not personal dysregulation
    } else if (socialLoad === 'high' && totalBsfi < 40) {
        loadAttribution = 'relational';
    } else if (tensionSD > 2.5 && totalBsfi < 40) {
        loadAttribution = 'internal';
        isInternalDriver = true;
    }

    // -------------------------------------------------------------------------
    // DOMINANT DOMAIN
    // Labels must match getDomainDisplay() and sanitiseDomain() in the UI.
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
        load_attribution:   loadAttribution,
        dominant_domain:    dominant_domain,
        version:            'bsfi_v6',
        healthkit_enriched: healthkitEnriched,
        biological_load:    isBiological,
    };
}
