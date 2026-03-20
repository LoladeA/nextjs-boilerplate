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
  total_score:           number
  dominant_domain:       string
  is_internal_driver:    boolean
  integration_pattern:   string | null
  sensory_pattern:       string | null
  accumulative_ali_flag: boolean
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

export const PRIMARY_SOURCE_THRESHOLD = 30

export const shouldShowPrimarySource = (score: number): boolean =>
  score > PRIMARY_SOURCE_THRESHOLD

// ─────────────────────────────────────────────────────────────────────────────
// BSFI LABEL SYSTEM
//
// Bands aligned with BSFI_SCORE_CONTEXTS in sleep-copy.ts:
//   0–30:   Low Friction  (was 0–20)
//   31–55:  Mild Friction (was 21–40)
//   56–74:  Elevated Load (was 41–60)
//   75–100: High Load     (was 81–100)
//
// Previously used five bands (0/20/40/60/80) which diverged from the four
// bands in sleep-copy.ts (0/30/55/74), causing contradictory label and copy
// text for scores in the overlap zones (e.g. 26 = "Mild Friction" label
// but "Low Friction" copy). Now uses four bands, both systems agree.
//
// Colours and opacities are intentional brand decisions. Do not modify.
// ─────────────────────────────────────────────────────────────────────────────

export const getBsfiLabel = (score: number) => {
  if (score <= 30) return { label: 'Your Home Is Supporting You', color: 'text-[#b5a642]',    border: 'border-[#b5a642]/60' }
  if (score <= 55) return { label: 'Mild Friction Present',       color: 'text-[#b5a642]/80', border: 'border-[#b5a642]/40' }
  if (score <= 74) return { label: 'Elevated Environmental Load', color: 'text-[#b5a642]/70', border: 'border-[#b5a642]/35' }
  return                   { label: 'High Environmental Load',    color: 'text-[#b5a642]/50', border: 'border-[#b5a642]/25' }
}
