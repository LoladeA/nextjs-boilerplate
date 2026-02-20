import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  // 1. Initialize clients INSIDE the function (Runtime evaluation only)
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
    return NextResponse.json({ error: 'Missing stripe signature or webhook secret' }, { status: 400 })
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
      
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        const userId = session.client_reference_id 
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (!userId) throw new Error('No client_reference_id found in Stripe session.')

        // ACTION 1: Global Entitlement
        await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: userId,
            status: 'active',
            stripe_customer_id: customerId,
          })

        // ACTION 2: Metered Entitlement (Room Audit Ledger)
        await supabaseAdmin
          .from('user_subscription_limits')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            scan_limit_per_month: 2,
            scans_used: 0, 
            status: 'active',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 
          })
        
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: limitRecord } = await supabaseAdmin
          .from('user_subscription_limits')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (limitRecord?.user_id) {
          await supabaseAdmin
            .from('user_subscription_limits')
            .update({
              scans_used: 0, 
              current_period_end: new Date(invoice.lines.data[0].period.end * 1000).toISOString(),
              status: 'active'
            })
            .eq('user_id', limitRecord.user_id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await supabaseAdmin
          .from('user_subscription_limits')
          .update({ status: 'inactive' })
          .eq('stripe_customer_id', customerId)
          
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'inactive' })
          .eq('stripe_customer_id', customerId)
          
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
