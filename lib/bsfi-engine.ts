// /lib/bsfi-engine.ts
// Version: bsfi_v7

// =============================================================================
// BSFI v7 — CORE (ACCESSIBLE ONLY)
// =============================================================================
//
// ✔ Fully accessible — no wearables required
// ✔ Manual SRI proxy (Sleep Regularity Index via wake_time variance)
//   — three-point graduated scale: <65 → +8 | <75 → +4 | <85 → +2
// ✔ Light scoring restored to v5 sensitivity (3-band morning, 4-band evening)
// ✔ Sleep fragmentation (sleep_wakes) across CFS and RDS
// ✔ Focus as SES + RDS signal
// ✔ Social demand as integral engine metric (ALS + RDS, with compound)
// ✔ Morning mood (mood_score) feeds SES — 'How You Woke Up' inputs are live
// ✔ Biological load: female cycle pathway only (menstrual / luteal)
//
// ❌ HealthKit / biometric inputs removed
// ❌ Pearson correlation removed (requires 14-day history density)
// ❌ SD variability multiplier removed
// ❌ lights_out_time removed (was collected but never used)
// ❌ gender / morning_vitality removed (no UX pathway yet — revisit v8)
// ❌ is_internal_driver removed → load_attribution provides clearer signal
// ❌ accumulative_ali_flag removed
//
// TENSION: appears in RDS only. Compound tension+social fires in ALS.
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

    // Manual SRI — wake_time as ISO string (e.g. "2026-03-29T07:15:00Z")
    // Hour is extracted directly from the string to avoid timezone shifts.
    // lights_out_time removed — was collected but never used in scoring.
    wake_time?: string | null;

    // Social demand
    social_demand?: 'low' | 'moderate' | 'high' | null;

    // Biological — female cycle pathway only
    // gender / morning_vitality excluded pending UX design (v8 candidate)
    cycle_phase?: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | null;
}

export interface BSFIResult {
    cfs_score:        number;
    als_score:        number;
    ses_score:        number;
    rds_score:        number;
    bsfi_total:       number;

    // load_attribution: what is driving the score
    //   'environmental' — default; friction traceable to space conditions
    //   'biological'    — menstrual or luteal cycle load present
    //   'internal'      — reserved for future tension-variance detection
    // 'relational' removed — social demand is scored integrally into ALS/RDS,
    // not treated as a separate attribution class.
    load_attribution: 'environmental' | 'biological' | 'internal';

    dominant_domain:  string;
    data_confidence:  'basic';      // enriched path reserved for v8+
    biological_load:  boolean;
    version:          string;
}

// --- HELPERS ---

const cap25 = (n: number) => Math.min(Math.max(n, 0), 25);
const safe  = (v: number | null | undefined, d = 0): number => v ?? d;

// --- MANUAL SRI (Sleep Regularity Index proxy) ---
//
// Uses variance in wake_time hours across history to estimate circadian
// consistency. Lower variance = higher regularity.
//
// Phillips et al. (2017) — SRI correlates with mood, metabolic health,
// and mortality independent of sleep duration.
//
// Hour is extracted from ISO string directly ("T07:") to prevent the Date
// constructor from shifting the hour based on server timezone (Vercel/UTC).
//
// THREE-POINT GRADUATED SCALE:
//   SRI < 65 → +8  (high irregularity — circadian anchor lost)
//   SRI < 75 → +4  (moderate irregularity — anchor weakened)
//   SRI < 85 → +2  (mild irregularity — early warning)
//   SRI ≥ 85 → +0  (adequate regularity — no penalty)
//
// Returns 85 when insufficient data (<3 entries) — no penalty applied.
// ─────────────────────────────────────────────────────────────────────────────

const calculateSRI = (history: DailyLogParams[]): number => {
    if (history.length < 3) return 85;

    const times = history
        .map(h => h.wake_time)
        .filter(Boolean)
        .map(t => {
            const match = (t as string).match(/T(\d{2}):/);
            return match ? parseInt(match[1], 10) : new Date(t as string).getHours();
        });

    if (times.length < 3) return 85;

    const mean     = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / times.length;

    return Math.max(100 - variance * 2, 60);
};

// --- ENGINE ---

export function calculateBSFI(
    today:   DailyLogParams,
    history: DailyLogParams[] = []
): BSFIResult {

    let cfs = 0, als = 0, ses = 0, rds = 0;

    const social = today.social_demand ?? 'low';
    const sri    = calculateSRI([today, ...history]);

    // ─────────────────────────────────────────────────────────────────────────
    // CFS — Circadian Friction Score
    //
    // Zeitzer et al. (2000), Gooley et al. (2011), Cajochen et al. (2011),
    // Viola et al. (2008), Phillips et al. (2017) — SRI.
    // ─────────────────────────────────────────────────────────────────────────

    // SRI — graduated three-point scale
    if      (sri < 65) cfs += 8;   // circadian anchor lost
    else if (sri < 75) cfs += 4;   // anchor weakened
    else if (sri < 85) cfs += 2;   // early irregularity

    // Morning light — 3-band scale (restored from v5)
    // Optimal CAR anchoring requires >= 500 lux within 30min of waking.
    if (today.morning_lux !== null) {
        if      (today.morning_lux < 100) cfs += 8;   // CAR cannot anchor
        else if (today.morning_lux < 250) cfs += 6;   // suboptimal signal
        else if (today.morning_lux < 500) cfs += 3;   // adequate but not optimal
        // >= 500 lux: no friction
    }

    // Evening light — 4-band scale (restored from v5)
    // Melatonin suppression begins at ~50 lux; near-maximal above 300 lux.
    if (today.evening_lux !== null) {
        if      (today.evening_lux > 800) cfs += 10;  // near-maximal suppression
        else if (today.evening_lux > 300) cfs += 7;   // significant suppression
        else if (today.evening_lux > 100) cfs += 4;   // 25–30% suppression begins
        else if (today.evening_lux > 50)  cfs += 2;   // marginal suppression
        // <= 50 lux: acceptable wind-down range
    }

    // Compound: sleep fragmentation + elevated evening light
    // Fragmented sleep on a night with high lux compounds both disruptions.
    if (safe(today.sleep_wakes) >= 2 && today.evening_lux !== null && today.evening_lux > 100) {
        cfs += 4;
    }

    // Wakes signal into CFS — fragmentation disrupts circadian restoration arc
    if (safe(today.sleep_wakes) >= 3) cfs += 3;

    // ─────────────────────────────────────────────────────────────────────────
    // ALS — Autonomic Load Score
    //
    // Social demand scored integrally — relational load activates the same
    // HPA and ANS pathways as environmental stressors.
    // Dickerson & Kemeny (2004); Pruessner et al. (1997).
    //
    // Tension removed from ALS direct scoring — it belongs in RDS (overnight
    // residue). Compound fires only when both tension AND social load are high,
    // which is a distinct autonomic signature from either alone.
    // ─────────────────────────────────────────────────────────────────────────

    // Social demand — integral ALS input
    if      (social === 'high')     als += 5;
    else if (social === 'moderate') als += 3;

    // Acoustic load
    if (today.daytime_db  !== null && today.daytime_db  > 55) als += 4;
    if (today.nighttime_db !== null && today.nighttime_db > 40) als += 6;

    // Compound: high tension + high social — distinct ANS activation pattern
    // When relational load co-occurs with somatic tension, the combined
    // sympathetic activation exceeds the sum of either input alone.
    if (safe(today.morning_tension) >= 7 && social === 'high') als += 4;

    // ─────────────────────────────────────────────────────────────────────────
    // SES — Spatial Entropy Score
    //
    // Captures whether the environment supported cognitive function.
    // mood_score feeds SES — the 'How You Woke Up' morning selection is live
    // in the engine. Low mood + no acoustic buffering = unmitigated sensory load.
    // ─────────────────────────────────────────────────────────────────────────

    // Focus + acoustic load compound: cognitive capacity spent on noise filtering
    if (safe(today.focus_hours) < 3 && today.daytime_db !== null && today.daytime_db > 55) {
        ses += 5;
    }

    // Low focus standalone: attentional capacity constrained by environment
    if (safe(today.focus_hours) < 2) ses += 3;

    // No entropy reset: evening spatial reset absent
    if (!today.evening_tags.includes('entropy_reset')) ses += 3;

    // Morning mood signal: low mood on waking without acoustic buffering
    // indicates unmitigated sensory exposure — restores v5 SES signal.
    const hasMorningBuffer = today.morning_tags.includes('noise_buffer');
    if (safe(today.mood_score, 3) <= 2 && !hasMorningBuffer) ses += 5;

    // Biological: luteal phase increases sensory sensitivity
    if (today.cycle_phase === 'luteal') ses += 2;

    // ─────────────────────────────────────────────────────────────────────────
    // RDS — Recovery Disruption Score
    //
    // Primary home for tension — waking tension is the residue of overnight
    // autonomic activity. It belongs in recovery, not autonomic load.
    // Pruessner et al. (1997); Wüst et al. (2000).
    // ─────────────────────────────────────────────────────────────────────────

    // Sleep fragmentation
    if      (safe(today.sleep_wakes) >= 3) rds += 5;
    else if (safe(today.sleep_wakes) === 2) rds += 2;

    // Morning tension — the overnight autonomic residue signal
    // Appears in RDS only. Compound with social fires separately in ALS.
    if (safe(today.morning_tension) >= 7) rds += 5;

    // Focus depletion feeds recovery cost
    // Van Dongen et al. (2003): sustained cognitive load increases allostatic load
    if      (safe(today.focus_hours) < 2) rds += 4;
    else if (safe(today.focus_hours) < 4) rds += 2;

    // Social compound: high relational load + fragmented sleep
    // Overnight clearing window must process both environmental and relational
    // residue — a compound load that exceeds either in isolation.
    if (social === 'high' && safe(today.sleep_wakes) >= 2) rds += 3;

    // Biological: menstrual phase increases recovery load
    if (today.cycle_phase === 'menstrual') rds += 2;

    // ─────────────────────────────────────────────────────────────────────────
    // CAP AT 25 PER DOMAIN
    // ─────────────────────────────────────────────────────────────────────────

    cfs = cap25(cfs);
    als = cap25(als);
    ses = cap25(ses);
    rds = cap25(rds);

    // ─────────────────────────────────────────────────────────────────────────
    // TOTAL + DOMINANT DOMAIN
    // ─────────────────────────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────────────────────────
    // LOAD ATTRIBUTION
    //
    // Determines the primary origin of friction. Three states, priority order:
    //
    // 1. 'biological'
    //    cycle_phase is menstrual or luteal — physiological load is known and
    //    documented. The engine has already added phase-specific scoring.
    //
    // 2. 'internal'
    //    High somatic tension is present, but the measurable environmental
    //    inputs do not account for it: light/circadian friction is low (cfs ≤ 5),
    //    acoustic/social load is low (als ≤ 3), and sleep is largely intact
    //    (wakes ≤ 1). The load is arriving from within — accumulated
    //    psychological stress, emotional residue, or cognitive carry-over
    //    that the environment did not generate and cannot fully address.
    //
    //    Pruessner et al. (1997): waking tension unexplained by environmental
    //    or sleep disruption inputs reflects internal psychological load.
    //    Sternberg, Healing Spaces: environments and internal states are
    //    bidirectional — the environment shapes the internal state AND the
    //    internal state determines what the environment can do for the person.
    //
    //    This replaces v5's is_internal_driver (tensionSD > 2.5) which
    //    required 14-day history and was silent for all new users.
    //    This heuristic works on a single-day entry from day one.
    //
    // 3. 'environmental' (default)
    //    Environmental inputs are measurably contributing to the score.
    //    The space is the addressable lever.
    // ─────────────────────────────────────────────────────────────────────────

    let load_attribution: BSFIResult['load_attribution'] = 'environmental';

    if (
        today.cycle_phase === 'menstrual' ||
        today.cycle_phase === 'luteal'
    ) {
        load_attribution = 'biological';

    } else {
        // Internal load: high tension + clean environment + intact sleep
        const isTensionHigh       = safe(today.morning_tension) >= 6;
        const isCircadianClean    = cfs <= 5;   // light and SRI not the source
        const isAutonomicClean    = als <= 3;   // acoustic/social not the source
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
        version:          'bsfi_v7',
    };
}
