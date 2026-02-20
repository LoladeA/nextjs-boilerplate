import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // --------------------------------------------------
    // 1️⃣ AUTH VALIDATION
    // --------------------------------------------------
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // --------------------------------------------------
    // 2️⃣ SUBSCRIPTION VALIDATION
    // --------------------------------------------------
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('plan, status, current_period_end')
      .eq('user_id', user.id)
      .single()

    if (
      subError ||
      !subscription ||
      subscription.plan !== 'premium' ||
      subscription.status !== 'active' ||
      new Date(subscription.current_period_end) < new Date()
    ) {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      )
    }

    // --------------------------------------------------
    // 3️⃣ MONTHLY SCAN LIMIT (MAX 2)
    // --------------------------------------------------
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setUTCDate(1)
    firstDayOfMonth.setUTCHours(0, 0, 0, 0)

    const { count, error: countError } = await supabase
      .from('room_audits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', firstDayOfMonth.toISOString())

    if (countError) {
      return NextResponse.json(
        { error: 'Usage check failed' },
        { status: 500 }
      )
    }

    if ((count ?? 0) >= 2) {
      return NextResponse.json(
        { error: 'Monthly scan limit reached (2 per month)' },
        { status: 429 }
      )
    }

    // --------------------------------------------------
    // 4️⃣ PRIORITY ROOM ENFORCEMENT (1 PER MONTH)
    // --------------------------------------------------
    const body = await req.json()
    const { roomName, measuredLux } = body

    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('priority_room, priority_month')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'Profile lookup failed' },
        { status: 500 }
      )
    }

    if (!profile.priority_month || profile.priority_month !== currentMonth) {
      // First scan this month → lock priority room
      await supabase
        .from('users')
        .update({
          priority_room: roomName,
          priority_month: currentMonth
        })
        .eq('id', user.id)
    } else {
      if (profile.priority_room !== roomName) {
        return NextResponse.json(
          { error: `Only priority room "${profile.priority_room}" allowed this month` },
          { status: 403 }
        )
      }
    }

    // --------------------------------------------------
    // 5️⃣ PREMIUM SCORING ENGINE (RUNS ONLY AFTER VALIDATION)
    // --------------------------------------------------

    const entropyScore = (
      Math.random() * (9.0 - 6.0) + 6.0
    ).toFixed(1)

    let prescriptions: string[] = []
    let insight = ''

    if (roomName === 'Bedroom') {
      insight =
        "This space currently signals 'vigilance' rather than 'rest' due to high visual complexity near the sleep horizon."
      prescriptions = [
        'Reduce visual complexity (clutter) on bedside surfaces.',
        "Cover reflective screens to reduce 'gaze pull'."
      ]

      if (measuredLux !== null) {
        if (measuredLux > 50) {
          prescriptions.push(
            `Current lighting (${measuredLux} lx) is suppressing melatonin release. Switch to amber lamps (<20 lx).`
          )
          insight +=
            ' Detected light levels are biologically antagonistic to sleep onset.'
        } else {
          prescriptions.push(
            'Light levels are optimal for evening wind-down.'
          )
        }
      } else {
        prescriptions.push('Shift lighting temp to <2700K (Amber).')
      }
    } else if (roomName === 'Home Office') {
      insight =
        "Cognitive load is elevated. The visual field contains too many 'open loops'."
      prescriptions = [
        'Clear the primary visual cone (desk surface).',
        'Introduce a biophilic anchor in the left periphery.'
      ]

      if (measuredLux !== null) {
        if (measuredLux < 400) {
          prescriptions.push(
            `Current lighting (${measuredLux} lx) is too low. Boost to >500 lx.`
          )
          insight += ' Low illuminance likely causing fatigue.'
        } else {
          prescriptions.push('Light levels are sufficient.')
        }
      } else {
        prescriptions.push('Reposition monitor to reduce glare.')
      }
    } else {
      insight =
        "The room lacks a clear 'safe harbor'. The eye is forced to scan."
      prescriptions = [
        'Create a singular focal point.',
        'Use containment (rugs/blankets) to define the zone.'
      ]

      if (measuredLux !== null && measuredLux > 100) {
        prescriptions.push('Dim overheads to <50 lx for evenings.')
      } else {
        prescriptions.push('Lower lighting horizon.')
      }
    }

    // --------------------------------------------------
    // 6️⃣ WRITE AUDIT RECORD (AFTER SUCCESS)
    // --------------------------------------------------
    await supabase.from('room_audits').insert({
      user_id: user.id,
      room_name: roomName,
      arousal_score: parseFloat(entropyScore),
      light_score: measuredLux ?? null,
      insight,
      prescriptions
    })

    // --------------------------------------------------
    // 7️⃣ RETURN PREMIUM RESPONSE
    // --------------------------------------------------
    return NextResponse.json({
      success: true,
      data: {
        entropy_score: entropyScore,
        lighting_kelvin: measuredLux
          ? measuredLux > 300
            ? 4000
            : 2700
          : 3500,
        biophilic_rating: 'LOW',
        insight,
        prescriptions
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Analysis Failed' },
      { status: 500 }
    )
  }
}
