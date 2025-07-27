import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { SubscriptionService } from '@/lib/stripe/subscription-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    const customer = await SubscriptionService.createOrRetrieveCustomer(
      userId,
      user.emailAddresses[0].emailAddress,
      user.fullName || undefined
    );

    // Create checkout session
    const session = await SubscriptionService.createCheckoutSession(
      customer.id,
      priceId,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true`,
      `${process.env.NEXT_PUBLIC_APP_URL}/pricing`
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}