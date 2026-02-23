import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // IMPORTANT: Never trust client priceId
    const priceId = process.env.STRIPE_PREMIUM_PRICE_ID!

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: user.id,
      customer_email: user.email ?? undefined,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/upgrade?canceled=true`,
    })

    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    console.error('Stripe Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
