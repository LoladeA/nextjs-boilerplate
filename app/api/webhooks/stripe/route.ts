import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  })

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await req.text()
  const signature = headers().get('Stripe-Signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing stripe signature or webhook secret' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {

      // 🔹 Handles new subscriptions
      case 'customer.subscription.created':

      // 🔹 Handles renewals, plan changes, trial transitions, status changes
      case 'customer.subscription.updated': {

        const subscription = event.data.object as Stripe.Subscription

        const userId = subscription.metadata?.user_id

        if (!userId) {
          console.error('Missing user_id in subscription metadata')
          break
        }

        await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: subscription.customer as string,
            price_id: subscription.items.data[0]?.price.id ?? null,
            status: subscription.status,
            current_period_start: new Date(
              subscription.current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            cancel_at: subscription.cancel_at
              ? new Date(subscription.cancel_at * 1000).toISOString()
              : null,
            canceled_at: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000).toISOString()
              : null,
            trial_start: subscription.trial_start
              ? new Date(subscription.trial_start * 1000).toISOString()
              : null,
            trial_end: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
          })

        break
      }

      // 🔹 Handles cancellations
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
            status: subscription.status, // typically 'canceled'
            canceled_at: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000).toISOString()
              : new Date().toISOString(),
            ended_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        break
      }
    }

    return NextResponse.json({ received: true })

  } catch (err: any) {
    console.error('Webhook processing error:', err)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
