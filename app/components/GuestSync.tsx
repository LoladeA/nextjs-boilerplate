'use client'

// =============================================================================
// GUEST SYNC — The Sentient Home
// app/components/GuestSync.tsx
// =============================================================================
//
// FIXES APPLIED:
//
//  1. SCHEMA MISMATCH
//     Was writing: { user_id, assessment_step, question_key, answer: { response: value } }
//     user_responses expects: { user_id, question_key, answer_value: String }
//     The engine reads answer_value (text). Writing to 'answer' (jsonb) meant
//     upserts succeeded but data was invisible to the scoring engine.
//
//  2. sessionStorage FLAG
//     Without a flag, the sync check re-ran on every dashboard mount.
//     If router.refresh() triggered a remount before clearGuestData() completed,
//     a second sync attempt would fire against already-cleared storage.
//     Flag is now set on success — one attempt per browser session.
//
//  3. onConflict EXPLICIT
//     Now that user_responses has a unique constraint on (user_id, question_key),
//     onConflict is specified explicitly. Guarantees idempotent upsert behaviour
//     regardless of how Supabase infers the conflict target from the primary key.
//
//  4. RACE CONDITION / SETTLING BUFFER
//     Added a settling buffer and recovery ping to ensure Next.js Server 
//     Components do not re-render before the Supabase view has materialized.
// =============================================================================

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { getGuestData, clearGuestData } from '../utils/guest-storage'
import { Save } from 'lucide-react'

const SYNC_FLAG = 'sentient_guest_sync_done'

export default function GuestSync() {
  const supabase  = createClientComponentClient()
  const router    = useRouter()
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const syncData = async () => {

      // FIX 4: The Recovery Ping
      // If the flag is true, but this component is STILL mounted, 
      // the server refreshed too quickly and missed the data. 
      // We wait 1.5 seconds and ask the server to check again.
      if (sessionStorage.getItem(SYNC_FLAG)) {
        timeoutId = setTimeout(() => {
          router.refresh()
        }, 1500)
        return
      }

      // No authenticated session — nothing to do
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // No guest data in localStorage — nothing to transfer
      const guestData = getGuestData()
      if (!guestData || Object.keys(guestData.answers).length === 0) {
      sessionStorage.setItem(SYNC_FLAG, 'true')
      // If they are on the dashboard but have no data, 
      // push them to the assessment to build their baseline.
      router.push('/assessment') 
      return
      }

      setSyncing(true)

      // FIX 1: Write to answer_value (text) not answer (jsonb)
      // This is what calculateNeuroLoad reads via current_user_responses view
      const updates = Object.entries(guestData.answers).map(([question_key, value]) => ({
        user_id:      session.user.id,
        question_key,
        answer_value: String(value),  // engine expects a text string
      }))

      // FIX 3: onConflict explicit — relies on unique constraint added in migration
      // alter table public.user_responses
      //   add constraint user_responses_user_question_unique
      //   unique (user_id, question_key);
      const { error } = await supabase
        .from('user_responses')
        .upsert(updates, { onConflict: 'user_id,question_key' })

      if (!error) {
        // Clear guest storage only after confirmed write
        clearGuestData()

        // FIX 2: Set flag before refresh — prevents re-run if remount fires
        // before clearGuestData() propagates
        sessionStorage.setItem(SYNC_FLAG, 'true')

        // FIX 4: The Settling Buffer
        // Wait 1 second before asking the server to refresh 
        // to ensure the Supabase view has materialized the new rows.
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

    // Cleanup function to prevent memory leaks if the component unmounts
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [supabase, router])

  // Only visible during active sync — silent otherwise
  if (!syncing) return null

  return (
    <div className="fixed bottom-4 right-4 bg-[#b5a642] text-[#1b270e] px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest z-50 animate-pulse">
      <Save size={16} /> Syncing your results...
    </div>
  )
}
