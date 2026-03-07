// =============================================================================
// FILE: app/results/update/[id]/page.tsx
// =============================================================================
//
// WHAT THIS PAGE DOES:
//   Fetches the delta report stored on the update snapshot by id.
//   Renders: overall progress classification, domain-by-domain narrative,
//   energy tax delta, subjective alignment check, and context flags.
//   Provides two exit paths: Back to Dashboard, View Full Assessment.
//
// DATA FLOW:
//   /api/submit-update-assessment saves delta_report as JSONB on the snapshot.
//   This page fetches that snapshot by id and reads delta_report directly.
//   No recalculation happens here — the API route did all the work.
//
// =============================================================================

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import UpdateResultsUI from './UpdateResultsUI'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function UpdateResultsPage({
  params
}: {
  params: { id: string }
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // ── Auth ──────────────────────────────────
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  // ── Fetch snapshot with delta report ─────
  const { data: snapshot, error: snapshotError } = await supabase
    .from('assessment_snapshots')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)   // security: users can only fetch their own
    .single()

  // If not found or belongs to another user, send to dashboard
  if (snapshotError || !snapshot || !snapshot.delta_report) {
    redirect('/dashboard')
  }

  return (
    <UpdateResultsUI
      snapshot={snapshot}
      deltaReport={snapshot.delta_report}
    />
  )
}
