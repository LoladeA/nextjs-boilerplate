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
// BSFI LABEL SYSTEM — unchanged from original
// Colours and opacities are intentional brand decisions. Do not modify.
// ─────────────────────────────────────────────────────────────────────────────
export const getBsfiLabel = (score: number) => {
  if (score <= 20) return { label: 'Your Home Is Supporting You',   color: 'text-[#b5a642]',    border: 'border-[#b5a642]/60' }
  if (score <= 40) return { label: 'Mild Friction Present',         color: 'text-[#b5a642]/80', border: 'border-[#b5a642]/40' }
  if (score <= 60) return { label: 'Moderate Environmental Load',   color: 'text-[#b5a642]/70', border: 'border-[#b5a642]/35' }
  if (score <= 80) return { label: 'Significant Friction Detected', color: 'text-[#b5a642]/60', border: 'border-[#b5a642]/30' }
  return             { label: 'High Environmental Load',            color: 'text-[#b5a642]/50', border: 'border-[#b5a642]/25' }
}
