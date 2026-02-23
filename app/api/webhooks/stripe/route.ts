import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16', 
  })

  // We use the Service Role Key here because webhooks operate outside of normal user authentication
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
      
      // TRIGGERED WHEN A USER FIRST UPGRADES
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        const userId = session.client_reference_id 
        const customerId = session.customer as string

        if (!userId) throw new Error('No client_reference_id found in Stripe session.')

        // Create or update the master subscription record
        await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: userId,
            status: 'active',
            plan: 'premium',
            stripe_customer_id: customerId,
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 
          })
        
        break
      }

      // TRIGGERED EVERY MONTH WHEN THEIR RECURRING PAYMENT CLEARS
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Find who this customer is in our database
        const { data: subRecord } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        // Push their expiration date out another 30 days
        if (subRecord?.user_id) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              current_period_end: new Date(invoice.lines.data[0].period.end * 1000).toISOString(),
              status: 'active'
            })
            .eq('user_id', subRecord.user_id)
        }
        break
      }

      // TRIGGERED IF THEY CANCEL OR THEIR CARD FAILS MULTIPLE TIMES
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
          
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'canceled' })
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
