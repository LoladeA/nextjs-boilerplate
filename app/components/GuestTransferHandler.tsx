'use client'

// =============================================================================
// GUEST TRANSFER HANDLER — The Sentient Home
// app/components/GuestTransferHandler.tsx
// =============================================================================
//
// PURPOSE:
//   Detects guest assessment data in localStorage on first authenticated
//   dashboard load and transfers it to user_responses.
//   Renders nothing visible. Handles its own lifecycle silently.
//
// USAGE:
//   Add once to your dashboard page or layout — it self-deactivates
//   after a successful transfer so it never runs twice.
//
//   In app/dashboard/page.tsx (or layout.tsx):
//     import GuestTransferHandler from '@/app/components/GuestTransferHandler'
//     ...
//     return (
//       <>
//         <GuestTransferHandler />
//         ... rest of dashboard ...
//       </>
//     )
//
// LIFECYCLE:
//   Mount → check localStorage for guest data
//   If found → run transferGuestDataToAccount()
//   On success → guest data cleared, flag set in sessionStorage to skip reruns
//   On failure → logs error, preserves guest data for retry on next mount
//
// WHY sessionStorage FLAG:
//   Prevents the transfer from running on every dashboard navigation.
//   sessionStorage is cleared when the browser tab closes, so a fresh
//   session always checks again. This is the correct scope — we want
//   one attempt per login session, not one per page visit.
// =============================================================================

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { transferGuestDataToAccount } from '@/app/utils/guest-transfer'
import { getGuestData } from '@/app/utils/guest-storage'

const TRANSFER_FLAG = 'sentient_guest_transfer_done'

export default function GuestTransferHandler() {
  const supabase = createClientComponentClient()

  useEffect(() => {
    const runTransfer = async () => {

      // Skip if already transferred this session
      if (sessionStorage.getItem(TRANSFER_FLAG)) return

      // Skip if no guest data exists — avoids unnecessary auth call
      // for users who signed up without completing the guest assessment
      const guestData = getGuestData()
      if (!guestData || Object.keys(guestData.answers).length === 0) {
        sessionStorage.setItem(TRANSFER_FLAG, 'true')
        return
      }

      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Not authenticated yet — do not transfer, do not set flag
        // Component will re-run on next mount when session is ready
        return
      }

      // Run the transfer
      const result = await transferGuestDataToAccount(user.id)

      if (result.success) {
        if (result.rowsWritten > 0) {
          console.info(
            `[GuestTransferHandler] Transferred ${result.rowsWritten} responses for user ${user.id}`
          )
        }
        // Set flag whether rowsWritten is 0 or more — either way, no more transfers needed
        sessionStorage.setItem(TRANSFER_FLAG, 'true')
      } else {
        // Transfer failed — log but do not set flag so it retries next mount
        console.error('[GuestTransferHandler] Transfer failed:', result.error)
      }
    }

    runTransfer()
  }, [supabase])

  // Renders nothing — purely a side-effect component
  return null
}
