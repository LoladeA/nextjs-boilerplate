'use client'

// =============================================================================
// GUEST SYNC — The Sentient Home
// app/components/GuestSync.tsx
// =============================================================================
//
// PURPOSE:
//   When a guest completes the assessment and then signs up or signs in,
//   this component transfers their localStorage answers into user_responses
//   in Supabase so the scoring engine can read them.
//
// FIXES IN THIS VERSION:
//
//   FIX 1 — CORRECT COLUMN FORMAT
//     user_responses stores answers as JSONB in the 'answer' column.
//     The view (current_user_responses) extracts answer->>'response' as
//     answer_value. GuestSync must write to 'answer' not 'answer_value'.
//     Format: { answer: { response: String(value) } }
//
//   FIX 2 — REMOVED router.push('/assessment') ON NO GUEST DATA
//     The new dashboard renders EmptyStateBanner when no data exists.
//     Pushing to /assessment from GuestSync created a redirect loop:
//     assessment → dashboard → GuestSync → assessment → ...
//     GuestSync now exits silently when there is no guest data to sync.
//
//   FIX 3 — RECOVERY PING LOOP ELIMINATED
//     The previous recovery ping fired router.refresh() on every mount
//     when the flag was set — including after a successful sync while
//     GuestSync was still mounted. This caused an infinite refresh loop.
//     The ping is now removed entirely. The settling buffer (1 second)
//     before router.refresh() is sufficient for the Supabase view to
//     materialise. If the view is slow, the empty dashboard renders
//     briefly then updates — which is acceptable UX.
//
//   FIX 4 — SETTLED FLAG CHECK PREVENTS RE-RUNS
//     A useRef variable prevents the effect from re-running if GuestSync
//     remounts during a router.refresh() cycle within the same page session.
//
// =============================================================================

import { useEffect, useState, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { getGuestData, clearGuestData } from '../utils/guest-storage'
import { Save } from 'lucide-react'

const SYNC_FLAG = 'sentient_guest_sync_done'

export default function GuestSync() {
  const supabase              = createClientComponentClient()
  const router                = useRouter()
  const [syncing, setSyncing] = useState(false)
  const hasSynced             = useRef(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const syncData = async () => {

      // Already synced in this page session — exit silently.
      // Prevents infinite refresh loop on remount.
      if (hasSynced.current) return
      if (sessionStorage.getItem(SYNC_FLAG)) {
        hasSynced.current = true
        return
      }

      // No authenticated session — nothing to do.
      // Small delay added for email verification redirects where the
      // Supabase session token may not be immediately available in
      // the client after the OAuth/email callback completes.
      await new Promise(resolve => setTimeout(resolve, 300))
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // No guest data in localStorage — exit silently.
      // EmptyStateBanner on the dashboard handles directing the user
      // to /assessment. GuestSync no longer redirects.
      const guestData = getGuestData()
      if (!guestData || Object.keys(guestData.answers).length === 0) return

      setSyncing(true)

      // FIX 1: Write to 'answer' (JSONB) — not 'answer_value' (view alias).
      // user_responses real column: answer jsonb
      // View extracts: answer->>'response' AS answer_value
      // Scoring engine reads via view — must match { response: value } format.
      const updates = Object.entries(guestData.answers).map(([question_key, value]) => ({
        user_id:      session.user.id,
        question_key,
        answer:       { response: String(value) }
      }))

      const { error } = await supabase
        .from('user_responses')
        .upsert(updates, { onConflict: 'user_id,question_key' })

      if (!error) {
        clearGuestData()

        hasSynced.current = true
        sessionStorage.setItem(SYNC_FLAG, 'true')

        // 1-second settling buffer before refresh so the Supabase view
        // has time to materialise the new rows before the server re-renders.
        timeoutId = setTimeout(() => {
          router.refresh()
        }, 1000)

      } else {
        // Do not set flag on failure — preserves guest data for retry
        console.error('[GuestSync] Sync failed:', error.message)
      }

      setSyncing(false)
    }

    syncData()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [supabase, router])

  if (!syncing) return null

  return (
    <div className="fixed bottom-4 right-4 bg-[#b5a642] text-[#1b270e] px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest z-50 animate-pulse">
      <Save size={16} /> Syncing your results...
    </div>
  )
}
