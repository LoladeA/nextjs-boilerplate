// =============================================================================
// GUEST TRANSFER UTILITY — The Sentient Home
// app/utils/guest-transfer.ts
// =============================================================================
//
// PURPOSE:
//   Transfers guest assessment answers from localStorage (guest-storage) into
//   user_responses for a newly authenticated user. Called once on first
//   dashboard mount after sign-up.
//
// WHY CLIENT-SIDE:
//   The auth callback (route handler) runs server-side and cannot access
//   localStorage. This utility must run in the browser after the session
//   cookie has been set and the client has hydrated.
//
// CALLED FROM:
//   app/components/GuestTransferHandler.tsx
//   which mounts on the dashboard and runs this once, then removes itself.
//
// IDEMPOTENT:
//   Uses upsert with onConflict: 'user_id, question_key' — safe to call
//   multiple times. Will not duplicate rows if something interrupts and
//   the component re-mounts.
//
// REQUIRES:
//   user_responses table to have a unique constraint on (user_id, question_key).
//   If this constraint does not exist, run:
//     alter table public.user_responses
//       add constraint user_responses_user_question_unique
//       unique (user_id, question_key);
// =============================================================================

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getGuestData, clearGuestData } from './guest-storage'

export type TransferResult =
  | { success: true;  rowsWritten: number }
  | { success: false; error: string; rowsWritten: 0 }

export async function transferGuestDataToAccount(
  userId: string
): Promise<TransferResult> {

  // 1. Read guest data from localStorage
  const guestData = getGuestData()

  if (!guestData || Object.keys(guestData.answers).length === 0) {
    // Nothing to transfer — guest may have navigated directly to sign-up
    // without completing the assessment. This is not an error.
    return { success: true, rowsWritten: 0 }
  }

  const answers = guestData.answers

  // 2. Build rows matching user_responses schema
  //    answer_value is stored as text — coerce all types to string.
  //    Numeric slider answers (energy_tax: 0–100) and scale answers (1–5)
  //    are both safely represented as strings and parsed by the engine.
  const rows = Object.entries(answers).map(([question_key, answer_value]) => ({
    user_id:      userId,
    question_key,
    answer_value: String(answer_value),
  }))

  if (rows.length === 0) {
    return { success: true, rowsWritten: 0 }
  }

  // 3. Upsert to user_responses
  //    onConflict ensures this is safe to re-run if the component
  //    unmounts and remounts before clearGuestData fires.
  const supabase = createClientComponentClient()

  const { error } = await supabase
    .from('user_responses')
    .upsert(rows, { onConflict: 'user_id,question_key' })

  if (error) {
    console.error('[guest-transfer] Upsert failed:', error.message)
    // Do NOT clear guest data on failure — preserve for retry
    return {
      success:     false,
      error:       error.message,
      rowsWritten: 0
    }
  }

  // 4. Clear guest storage only after confirmed write
  clearGuestData()

  return { success: true, rowsWritten: rows.length }
}
