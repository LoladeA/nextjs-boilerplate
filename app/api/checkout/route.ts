import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // This handles the connection to Stripe
});

export async function POST(req: Request) {
  try {
    // 1. Read the request from your button
    const body = await req.json();
    const { priceId } = body;

    console.log("Processing Checkout for Price ID:", priceId);

    // 2. Validate the Price ID
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is missing' },
        { status: 400 }
      );
    }

    // 3. Create the Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', 
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/upgrade?canceled=true`,
    });

    // 4. Send the checkout URL back to the button
    return NextResponse.json({ url: session.url });
    
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
