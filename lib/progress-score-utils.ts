// lib/progress-score-utils.ts
//
// Pure numeric scoring utilities for the daily logs / progress page.
// No React state. No side effects. Safe to import anywhere.

// ─────────────────────────────────────────────────────────────────────────────
// CIRCADIAN COHERENCE SCORE
//
// Derived from morning and evening lux readings. Measures how well the
// user's light exposure across the day supports their circadian rhythm.
// Returns null when both inputs are absent — engine skips the domain.
// ─────────────────────────────────────────────────────────────────────────────
export const deriveLuxScore = (morningLux: string, eveningLux: string): number | null => {
  const morning = morningLux !== '' ? parseInt(morningLux) : null
  const evening = eveningLux !== '' ? parseInt(eveningLux) : null
  if (morning === null && evening === null) return null
  const morningComponent = morning !== null ? Math.min(morning, 1000) / 1000 * 50 : 0
  const eveningComponent = evening !== null ? (1 - Math.min(evening, 800) / 800) * 50 : 50
  return Math.round(morningComponent + eveningComponent)
}

// ─────────────────────────────────────────────────────────────────────────────
// ACOUSTIC COMPOSITE SCORE
//
// Derived from daytime and bedtime dB readings. Measures acoustic load
// relative to established thresholds for daytime and nighttime environments.
// Returns null when both inputs are absent — engine skips the domain.
// ─────────────────────────────────────────────────────────────────────────────
export const deriveDbScore = (daytimeDb: string, bedtimeDb: string): number | null => {
  const d = daytimeDb !== '' ? parseInt(daytimeDb) : null
  const n = bedtimeDb !== '' ? parseInt(bedtimeDb) : null
  if (d === null && n === null) return null
  const DAYTIME_THRESHOLD   = 55
  const NIGHTTIME_THRESHOLD = 40
  const CEILING = 100
  const scores: number[] = []
  if (d !== null) scores.push(Math.max(0, d - DAYTIME_THRESHOLD)  / (CEILING - DAYTIME_THRESHOLD)  * 100)
  if (n !== null) scores.push(Math.max(0, n - NIGHTTIME_THRESHOLD) / (CEILING - NIGHTTIME_THRESHOLD) * 100)
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}
