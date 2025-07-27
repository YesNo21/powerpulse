import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export interface SubscriptionRequirement {
  plans?: string[]; // Specific plan IDs required (e.g., ['pro', 'premium'])
  requireActive?: boolean; // Require any active subscription
}

/**
 * Server-side function to check if user has required subscription
 * Use this in server components and API routes
 */
export async function requireSubscription(
  requirement: SubscriptionRequirement = { requireActive: true }
) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // Get user from database
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user) {
    redirect('/sign-in');
  }

  // Check if user has active subscription
  const hasActiveSubscription = user.subscriptionStatus === 'active';
  
  if (requirement.requireActive && !hasActiveSubscription) {
    redirect('/pricing?error=subscription_required');
  }

  // Check if user has specific plan
  if (requirement.plans && requirement.plans.length > 0) {
    const userPlanId = user.subscriptionPriceId;
    // You might need to map price IDs to plan IDs here
    // For now, we'll assume the price ID contains the plan ID
    const hasRequiredPlan = requirement.plans.some(planId => 
      userPlanId?.includes(planId)
    );
    
    if (!hasRequiredPlan) {
      redirect('/pricing?error=upgrade_required');
    }
  }

  return {
    user,
    subscription: {
      isActive: hasActiveSubscription,
      priceId: user.subscriptionPriceId,
      currentPeriodEnd: user.subscriptionCurrentPeriodEnd,
    },
  };
}

/**
 * Client-side hook wrapper for subscription checks
 * Use this with the useSubscription hook
 */
export function withSubscriptionCheck(
  Component: React.ComponentType<any>,
  requirement: SubscriptionRequirement = { requireActive: true }
) {
  return function SubscriptionProtectedComponent(props: any) {
    // This would use the useSubscription hook
    // For now, returning the component as-is
    // You would implement the actual check here
    return <Component {...props} />;
  };
}