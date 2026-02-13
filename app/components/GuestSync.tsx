'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { getGuestData, clearGuestData } from '../utils/guest-storage'
import { Save } from 'lucide-react'

export default function GuestSync() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const syncData = async () => {
      // 1. Check if we have a user
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // 2. Check if we have local guest data
      const guestData = getGuestData()
      if (!guestData || Object.keys(guestData.answers).length === 0) return

      // 3. START SYNC
      setSyncing(true)

      // Format data for Supabase
      const updates = Object.entries(guestData.answers).map(([key, value]) => {
         // Determine step based on key (simple heuristic or stored metadata)
         // Defaulting to Step 0 if unknown, or we can improve storage to save step IDs.
         // For now, we just upsert the answers.
         return {
            user_id: session.user.id,
            assessment_step: 0, // You might want to enhance guest-storage to save the step number too
            question_key: key,
            answer: { response: value }
         }
      })

      // Upload
      const { error } = await supabase.from('user_responses').upsert(updates)

      if (!error) {
        // 4. CLEANUP: Wipe local storage so we don't sync again
        clearGuestData()
        
        // 5. REFRESH: Show the new data
        router.refresh()
      }
      
      setSyncing(false)
    }

    syncData()
  }, [supabase, router])

  if (!syncing) return null

  // Optional: Show a little toast while syncing
  return (
    <div className="fixed bottom-4 right-4 bg-[#b5a642] text-[#1b270e] px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest z-50 animate-pulse">
        <Save size={16} /> Syncing your results...
    </div>
  )
}
