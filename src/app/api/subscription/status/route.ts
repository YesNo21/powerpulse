import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { SubscriptionService, SUBSCRIPTION_PLANS } from '@/lib/stripe/subscription-service';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({
        status: 'inactive',
        planId: null,
        planName: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });
    }

    // Get subscription status from Stripe
    const subscriptionStatus = await SubscriptionService.getSubscriptionStatus(
      user.stripeCustomerId
    );

    if (!subscriptionStatus) {
      return NextResponse.json({
        status: 'inactive',
        planId: null,
        planName: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });
    }

    return NextResponse.json({
      status: subscriptionStatus.status,
      planId: subscriptionStatus.plan?.id || null,
      planName: subscriptionStatus.plan?.name || null,
      currentPeriodEnd: subscriptionStatus.currentPeriodEnd,
      cancelAtPeriodEnd: false, // You can enhance this based on Stripe subscription data
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
}