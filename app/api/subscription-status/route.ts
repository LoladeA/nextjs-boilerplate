import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ status: null, tier: null })
    }

    // Fetch most recent subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('status, plan, current_period_end')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (subError) {
      console.error('Subscription fetch error:', subError)
      return NextResponse.json({ status: null, tier: null })
    }

    if (!subscription) {
      return NextResponse.json({ status: null, tier: null })
    }

    const now = new Date()

    const isValidDate =
      subscription.current_period_end &&
      !isNaN(new Date(subscription.current_period_end).getTime())

    const isActiveStatus =
      subscription.status === 'active' ||
      subscription.status === 'trialing'

    const notExpired =
      isValidDate &&
      new Date(subscription.current_period_end) >= now

    if (isActiveStatus && notExpired) {
      return NextResponse.json({
        status: subscription.status,
        tier: subscription.plan
      })
    }

    return NextResponse.json({ status: null, tier: null })

  } catch (error) {
    console.error('Subscription Status Check Error:', error)
    return NextResponse.json({ status: null, tier: null }, { status: 500 })
  }
}
