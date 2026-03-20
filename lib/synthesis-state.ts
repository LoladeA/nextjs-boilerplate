// lib/synthesis-state.ts
// =============================================================================
//
// Pure utility for computing the 14-day synthesis panel state.
//
// THREE STATES:
//
//   'building'       — fewer than 14 total logs. Progress bar shown.
//
//   'ready'          — 14+ logs AND the user has not yet acknowledged the
//                      current synthesis (last_synthesis_acknowledged_at is
//                      NULL, or 14+ new logs have accumulated since it was
//                      acknowledged). Synthesis is visible and expandable.
//
//   'recalibrating'  — user has acknowledged the current synthesis AND fewer
//                      than 14 new logs have accumulated since that date.
//                      A progress bar shows how many more logs are needed.
//
// This logic is durable — it is anchored to a real database timestamp, not
// a modulo calculation. The recalibration window only fires after the user
// has deliberately engaged with and acknowledged the synthesis.
//
// =============================================================================

export type SynthesisState = 'building' | 'ready' | 'recalibrating'

export interface SynthesisStateResult {
  state:               SynthesisState
  logsSinceAcknowledged: number   // for recalibrating progress bar
  logsUntilReady:      number     // for building progress bar
}

const SYNTHESIS_THRESHOLD = 14

export function getSynthesisState(
  totalLogs:             number,
  lastAcknowledgedAt:    string | null,
  logsSinceAcknowledged: number
): SynthesisStateResult {

  // Not enough logs yet to generate any synthesis
  if (totalLogs < SYNTHESIS_THRESHOLD) {
    return {
      state:                'building',
      logsSinceAcknowledged: 0,
      logsUntilReady:       SYNTHESIS_THRESHOLD - totalLogs,
    }
  }

  // User has never acknowledged a synthesis — show it
  if (!lastAcknowledgedAt) {
    return {
      state:                'ready',
      logsSinceAcknowledged: 0,
      logsUntilReady:       0,
    }
  }

  // User has acknowledged — check whether enough new logs have accumulated
  if (logsSinceAcknowledged >= SYNTHESIS_THRESHOLD) {
    return {
      state:                'ready',
      logsSinceAcknowledged,
      logsUntilReady:       0,
    }
  }

  // Acknowledged and not yet enough new logs — recalibrating
  return {
    state:                'recalibrating',
    logsSinceAcknowledged,
    logsUntilReady:       SYNTHESIS_THRESHOLD - logsSinceAcknowledged,
  }
}
