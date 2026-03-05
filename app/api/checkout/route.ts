import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

// ---------------------------------------------------------------------------
// TIER → PRICE ID MAPPING
//
// Set in Vercel / .env.local after creating the two products in Stripe:
//   STRIPE_PRICE_ID_CORE       → €29/month recurring price ID
//   STRIPE_PRICE_ID_BLUEPRINT  → €99/month recurring price ID
// ---------------------------------------------------------------------------
const PRICE_IDS: Record<string, string | undefined> = {
  core:      process.env.STRIPE_PRICE_ID_CORE,
  blueprint: process.env.STRIPE_PRICE_ID_BLUEPRINT,
}

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  })

  const supabase = createRouteHandlerClient({ cookies })

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Parse tier from request body — defaults to 'core' if omitted
  let tier: 'core' | 'blueprint' = 'core'
  try {
    const body = await req.json()
    if (body.tier === 'blueprint') tier = 'blueprint'
  } catch {
    // no body or invalid JSON — use default
  }

  const priceId = PRICE_IDS[tier]
  if (!priceId) {
    console.error(`No price ID configured for tier: ${tier}`)
    return NextResponse.json(
      { error: `Price ID for ${tier} tier is not configured. Check STRIPE_PRICE_ID_${tier.toUpperCase()} env var.` },
      { status: 500 }
    )
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode:                'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price:    priceId,
          quantity: 1,
        },
      ],
      // Pass user_id in metadata so the webhook can identify the subscriber
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
      // Pre-fill email to reduce friction
      customer_email: user.email,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?upgraded=${tier}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/upgrade`,
    })

    return NextResponse.json({ url: session.url })

  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
