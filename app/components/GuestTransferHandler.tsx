'use client'

// =============================================================================
// GUEST TRANSFER HANDLER — The Sentient Home
// app/components/GuestTransferHandler.tsx
// =============================================================================
//
// PURPOSE:
//   On first authenticated dashboard load after sign-up, detects guest
//   assessment data in localStorage and transfers it to user_responses.
//   On success, calls router.refresh() so the server component re-fetches
//   and the dashboard renders with the transferred data — no redirect,
//   no visible interruption. The user lands on the dashboard and sees
//   their score and report link as expected.
//
// USAGE:
//   Add once to app/dashboard/page.tsx (or its layout):
//
//     import GuestTransferHandler from '@/app/components/GuestTransferHandler'
//
//     return (
//       <>
//         <GuestTransferHandler />
//         ... rest of dashboard ...
//       </>
//     )
//
// LIFECYCLE:
//   Mount → check sessionStorage flag (skip if already ran this session)
//   → check localStorage for guest data (skip if none)
//   → get authenticated user
//   → run transferGuestDataToAccount()
//   → on success: router.refresh() + set sessionStorage flag
//   → on failure: log error, preserve guest data, skip flag (retries next mount)
//
// WHY router.refresh():
//   Dashboard is a server component — it fetched user_responses at T=0,
//   before this client component had a chance to write anything. Without
//   a refresh, the transferred data exists in the database but the page
//   still shows the empty/pre-transfer state. router.refresh() re-runs
//   the server fetch without a full navigation, updating the dashboard
//   in place.
//
// WHY sessionStorage FOR THE FLAG:
//   Scoped to the browser tab session — cleared on tab close. This means
//   one transfer attempt per login session, not one per page visit.
//   A fresh login always checks for guest data again, which is correct
//   behaviour for users who log out and back in on the same device.
// =============================================================================

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { transferGuestDataToAccount } from '@/app/utils/guest-transfer'
import { getGuestData } from '@/app/utils/guest-storage'

const TRANSFER_FLAG = 'sentient_guest_transfer_done'

export default function GuestTransferHandler() {
  const router   = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const runTransfer = async () => {

      // Already ran this session — skip
      if (sessionStorage.getItem(TRANSFER_FLAG)) return

      // No guest data in localStorage — nothing to transfer
      const guestData = getGuestData()
      if (!guestData || Object.keys(guestData.answers).length === 0) {
        sessionStorage.setItem(TRANSFER_FLAG, 'true')
        return
      }

      // Confirm authenticated user before attempting write
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Session not ready yet — skip without setting flag so it retries
        return
      }

      // Run the transfer
      const result = await transferGuestDataToAccount(user.id)

      if (result.success) {
        // Set flag regardless of rowsWritten — 0 rows is a valid outcome
        // (guest data was empty or already transferred in a previous session)
        sessionStorage.setItem(TRANSFER_FLAG, 'true')

        if (result.rowsWritten > 0) {
          console.info(
            `[GuestTransferHandler] Transferred ${result.rowsWritten} responses ` +
            `for user ${user.id}. Refreshing dashboard.`
          )
          // Re-run the server component fetch so the dashboard reflects
          // the transferred data without a full page navigation.
          router.refresh()
        }

      } else {
        // Transfer failed — do not set flag, preserve guest data for retry
        console.error('[GuestTransferHandler] Transfer failed:', result.error)
      }
    }

    runTransfer()
  }, [supabase, router])

  // Renders nothing — purely a side-effect component
  return null
}
