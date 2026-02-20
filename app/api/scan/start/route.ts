import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { roomType } = body

    if (!roomType) {
      return NextResponse.json({ error: 'Room type is required to initiate an audit.' }, { status: 400 })
    }

    // 1. Initialize Supabase for the authenticated session
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const userId = session.user.id

    // 2. Retrieve the Metred Ledger
    const { data: limitRecord, error } = await supabase
      .from('user_subscription_limits')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !limitRecord) {
      return NextResponse.json({ error: 'Access denied. Active subscription required.' }, { status: 403 })
    }

    // 3. CONSTRAINT: Active Subscription Check
    if (limitRecord.status !== 'active') {
      return NextResponse.json({ 
        error: 'Your subscription is inactive. Please upgrade to run a diagnostic audit.' 
      }, { status: 403 })
    }

    // 4. CONSTRAINT: Hard Scan Limit Check
    if (limitRecord.scans_used >= limitRecord.scan_limit_per_month) {
      return NextResponse.json({ 
        error: 'Monthly scan limit reached. Your ledger resets at the start of your next billing cycle.' 
      }, { status: 429 })
    }

    // 5. CONSTRAINT: Priority Room Lock
    if (limitRecord.priority_room && limitRecord.priority_room !== roomType) {
      return NextResponse.json({
        error: `Access denied. Your priority room for this billing cycle is locked to: ${limitRecord.priority_room}.`
      }, { status: 403 })
    }

    // 6. LEDGER UPDATE: Lock in the priority room if this is their first scan
    if (!limitRecord.priority_room) {
      await supabase
        .from('user_subscription_limits')
        .update({ priority_room: roomType })
        .eq('user_id', userId)
    }

    // 7. AUTHORIZATION GRANTED
    // If all constraints pass, the frontend is cleared to execute the actual heavy lifting
    return NextResponse.json({
      success: true,
      message: 'Diagnostic authorized.',
      // Generate a master audit ID here so the frontend can track the multi-step upload and process flow
      auditId: crypto.randomUUID(), 
    })

  } catch (err: any) {
    console.error('Middleware Enforcement Error:', err)
    return NextResponse.json({ error: 'Internal server error during authorization.' }, { status: 500 })
  }
}
