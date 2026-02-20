import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// 1. Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Use your current Stripe API version
})

// 2. Initialize Supabase Admin (Bypasses RLS to write to the database)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
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
      
      // 🟢 EVENT A: INITIAL PURCHASE VIA PAYMENT LINK
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // This is the Supabase UUID we passed into the Payment Link URL
        const userId = session.client_reference_id 
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (!userId) throw new Error('No client_reference_id found in Stripe session.')

        // ACTION 1: Global Entitlement (Unlock Flashcards, Coaching, etc.)
        // Update your primary users/subscriptions table to mark them as premium
        await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: userId,
            status: 'active',
            stripe_customer_id: customerId,
          })

        // ACTION 2: Metered Entitlement (Setup the Room Audit Ledger)
        await supabaseAdmin
          .from('user_subscription_limits')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            scan_limit_per_month: 2,
            scans_used: 0, // Fresh ledger
            status: 'active',
            // Default to roughly 30 days from now; accurate sync happens on invoice.paid
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 
          })
        
        break
      }

      // 🟢 EVENT B: MONTHLY RECURRING PAYMENT (THE RESET TRIGGER)
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const subscriptionId = invoice.subscription as string

        // ACTION 1: Find the user linked to this Stripe customer
        const { data: limitRecord } = await supabaseAdmin
          .from('user_subscription_limits')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (limitRecord?.user_id) {
          // ACTION 2: The Critical Monthly Reset
          await supabaseAdmin
            .from('user_subscription_limits')
            .update({
              scans_used: 0, // 🟢 Resets scans to zero for the new month
              current_period_end: new Date(invoice.lines.data[0].period.end * 1000).toISOString(),
              status: 'active'
            })
            .eq('user_id', limitRecord.user_id)
            
          // Note: Priority room remains locked to the previous choice unless you specifically 
          // want to wipe it here. If you want to let them choose a new room each month:
          // priority_room: null
        }
        break
      }

      // 🛑 EVENT C: CANCELLATIONS
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Revoke Access
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
