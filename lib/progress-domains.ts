// lib/progress-domains.ts
//
// Pure utility functions for the daily logs / progress page.
// No React state. No side effects. Safe to import anywhere.
//
// IMPORTANT: dominant_domain label strings here must stay aligned with
// the domain label keys in bsfi-engine.ts calculateBSFI() scores object.
// If bsfi-engine domain keys change, update getDomainDisplay() to match.

// ─────────────────────────────────────────────────────────────────────────────
// BSFI STATE TYPE
//
// Shared type for the morningBsfi / eveningBsfi UI state objects.
// Distinct from BSFIResult in bsfi-engine.ts — this carries additional
// profile context fields stamped by the calculate-bsfi route.
// ─────────────────────────────────────────────────────────────────────────────
export interface BsfiState {
  total_score:         number
  dominant_domain:     string
  // load_attribution replaces is_internal_driver (v7).
  // Three states: 'environmental' | 'internal' | 'biological'
  // Read from domain_scores JSONB on page load; set directly from
  // the API response on save. Defaults to 'environmental' if absent
  // (legacy records written before v7).
  load_attribution:    'environmental' | 'internal' | 'biological'
  biological_load:     boolean
  integration_pattern: string | null
  sensory_pattern:     string | null
  // accumulative_ali_flag removed — engine no longer produces this signal
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN DISPLAY
// ─────────────────────────────────────────────────────────────────────────────

export const DAILY_DOMAINS = new Set([
  'Recovery Disruption',
  'Circadian Rhythm Index',
  'Autonomic Load Index',
  'Sensory Load',
])

export const sanitiseDomain = (domain: string): string | null =>
  DAILY_DOMAINS.has(domain) ? domain : null

export const getDomainDisplay = (domain: string): { label: string; driver: string } => {
  const map: Record<string, { label: string; driver: string }> = {
    'Recovery Disruption':    { label: 'Overnight Recovery',   driver: 'Sleep interruptions, bedtime sound level, and sleep readiness' },
    'Circadian Rhythm Index': { label: 'Light & Sleep Timing', driver: 'Morning and evening light readings' },
    'Autonomic Load Index':   { label: 'Stress & Tension',     driver: 'Body tension and mood on waking' },
    'Sensory Load':           { label: 'Sound & Visual Load',  driver: 'Sound levels, light readings, and daily environment tags' },
  }
  return map[domain] ?? { label: 'Environmental Load', driver: 'Environmental readings today' }
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY SOURCE VISIBILITY
//
// When the total score is in the Low Friction band (0–30), no single domain
// meaningfully dominates — the environment is well-aligned. Showing a primary
// source in this state contradicts the reframe copy ("well-aligned today").
//
// The primary source tag is only shown when the score exceeds this threshold,
// meaning the dominant domain is actually contributing meaningful friction.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY SOURCE VISIBILITY
//
// When the score is in the lowest band for the session type, no single domain
// meaningfully dominates — showing a primary source would contradict the
// label copy. The threshold is session-aware because morning-only entries
// produce structurally lower scores (~0–37 realistic range) than full-day
// entries (~0–100). Using a single threshold of 30 for both sessions meant
// the primary source was suppressed on virtually every morning entry.
//
// Morning threshold: 10  (below this = genuinely supported recovery)
// Evening threshold: 30  (existing calibration, unchanged)
// ─────────────────────────────────────────────────────────────────────────────

export const shouldShowPrimarySource = (
  score:   number,
  session: 'morning' | 'evening' = 'evening'
): boolean => score > (session === 'morning' ? 10 : 30)

// ─────────────────────────────────────────────────────────────────────────────
// BSFI LABEL SYSTEM
//
// Session-aware bands. Morning-only entries are structurally capped at ~37
// because ~60% of scoring inputs are evening-dependent (evening_lux,
// nighttime_db, bedtime_lux, tactile_enclosure, CFS compound, RDS
// co-occurrence). Using the evening bands (0/30/55/74) for morning entries
// caused the vast majority of morning scores to land in "Your Home Is
// Supporting You" regardless of severity — a direct contradiction of the data.
//
// MORNING BANDS (calibrated to 0–37 realistic range):
//   0–10:  Your Body Recovered Well
//   11–20: Some Recovery Friction Present
//   21–30: Elevated Recovery Load
//   31+:   Significant Recovery Disruption
//
// EVENING / FULL-DAY BANDS (calibrated to 0–100):
//   0–30:  Your Home Is Supporting You
//   31–55: Mild Friction Present
//   56–74: Elevated Environmental Load
//   75+:   High Environmental Load
//
// Colours and opacities are intentional brand decisions. Do not modify.
// Minimum safe opacity for gold (#b5a642) to render visibly on the dark green
// background: /20 for backgrounds, /30 for borders, /50 for text.
// Values below these thresholds wash out to near-white.
// ─────────────────────────────────────────────────────────────────────────────

export const getBsfiLabel = (
  score:   number,
  session: 'morning' | 'evening' = 'evening'
) => {
  if (session === 'morning') {
    if (score <= 10) return { label: 'Your Body Recovered Well',          color: 'text-[#b5a642]',    border: 'border-[#b5a642]/60' }
    if (score <= 20) return { label: 'Some Recovery Friction Present',    color: 'text-[#b5a642]/80', border: 'border-[#b5a642]/50' }
    if (score <= 30) return { label: 'Elevated Recovery Load',            color: 'text-[#b5a642]/70', border: 'border-[#b5a642]/40' }
    return                   { label: 'Significant Recovery Disruption',  color: 'text-[#b5a642]',    border: 'border-[#b5a642]/60' }
    //                         ↑ Band 4 morning uses full gold — highest severity should be most visible
  }

  // Evening / full-day bands
  if (score <= 30) return { label: 'Your Home Is Supporting You', color: 'text-[#b5a642]',    border: 'border-[#b5a642]/60' }
  if (score <= 55) return { label: 'Mild Friction Present',       color: 'text-[#b5a642]/80', border: 'border-[#b5a642]/50' }
  if (score <= 74) return { label: 'Elevated Environmental Load', color: 'text-[#b5a642]/70', border: 'border-[#b5a642]/40' }
  return                   { label: 'High Environmental Load',    color: 'text-[#b5a642]',    border: 'border-[#b5a642]/60' }
  //                         ↑ Same principle: highest severity bands use full gold, not the most faded value
}
