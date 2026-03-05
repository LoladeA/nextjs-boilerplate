import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// PRICE → PLAN MAPPING
//
// Set these env vars in Vercel / .env.local to the Stripe price IDs you
// create for each tier. The webhook resolves the human-readable plan name
// from the price ID on every subscription event so the subscriptions table
// always has a correct 'plan' value.
//
//   STRIPE_PRICE_ID_CORE       → e.g. price_1AbcXXXXXXXX  (€29/month)
//   STRIPE_PRICE_ID_BLUEPRINT  → e.g. price_1DefXXXXXXXX  (€99/month)
// ---------------------------------------------------------------------------
const resolvePlanFromPriceId = (priceId: string): 'core' | 'blueprint' | null => {
  if (priceId === process.env.STRIPE_PRICE_ID_CORE)      return 'core'
  if (priceId === process.env.STRIPE_PRICE_ID_BLUEPRINT) return 'blueprint'
  return null
}

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  })

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body      = await req.text()
  const signature = headers().get('Stripe-Signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing stripe signature or webhook secret' },
      { status: 400 }
    )
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {

      // ── New subscriptions + renewals + plan changes + trial transitions ──
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId  = subscription.metadata?.user_id
        const priceId = subscription.items.data[0]?.price.id ?? null
        const plan    = priceId ? resolvePlanFromPriceId(priceId) : null

        if (!userId) {
          console.error('Missing user_id in subscription metadata')
          break
        }

        if (!plan) {
          console.error(`Unrecognised price ID: ${priceId} — check STRIPE_PRICE_ID_CORE and STRIPE_PRICE_ID_BLUEPRINT env vars`)
        }

        await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id:               userId,
            stripe_customer_id:    subscription.customer as string,
            price_id:              priceId,
            // plan is the human-readable tier: 'core' | 'blueprint'
            // This is what subscription-status/route.ts returns as 'tier'
            plan:                  plan,
            status:                subscription.status,
            current_period_start:  new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end:    new Date(subscription.current_period_end   * 1000).toISOString(),
            cancel_at_period_end:  subscription.cancel_at_period_end,
            cancel_at:             subscription.cancel_at
              ? new Date(subscription.cancel_at * 1000).toISOString()
              : null,
            canceled_at:           subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000).toISOString()
              : null,
            trial_start:           subscription.trial_start
              ? new Date(subscription.trial_start * 1000).toISOString()
              : null,
            trial_end:             subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
          },
          // upsert on user_id so a plan change updates the existing row
          { onConflict: 'user_id' }
        )

        // Also keep profiles.is_premium in sync for any legacy checks
        await supabaseAdmin
          .from('profiles')
          .update({ is_premium: subscription.status === 'active' || subscription.status === 'trialing' })
          .eq('user_id', userId)

        break
      }

      // ── Cancellations ──
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.user_id

        if (!userId) {
          console.error('Missing user_id in subscription metadata on delete')
          break
        }

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status:      subscription.status, // typically 'canceled'
            plan:        null,
            canceled_at: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000).toISOString()
              : new Date().toISOString(),
            ended_at:    new Date().toISOString(),
          })
          .eq('user_id', userId)

        await supabaseAdmin
          .from('profiles')
          .update({ is_premium: false })
          .eq('user_id', userId)

        break
      }
    }

    return NextResponse.json({ received: true })

  } catch (err: any) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
