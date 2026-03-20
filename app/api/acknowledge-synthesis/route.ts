// app/api/acknowledge-synthesis/route.ts
// =============================================================================
//
// Stamps last_synthesis_acknowledged_at on the user's profile when they
// collapse the synthesis panel after having opened it. This is the anchor
// date for the recalibration window — the system counts new logs from
// this point to determine when the next synthesis is ready.
//
// Called from the progress page when:
//   isSynthesisExpanded transitions from true → false
//
// Idempotent: calling multiple times on the same day is safe — the timestamp
// is always overwritten with the current time.
//
// =============================================================================

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = cookies()
    const supabase    = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          user_id:                          user.id,
          last_synthesis_acknowledged_at:   new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (error) {
      console.error('acknowledge-synthesis error:', error)
      return NextResponse.json({ error: 'Failed to save acknowledgement' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('acknowledge-synthesis error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
