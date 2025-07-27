import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

export interface SubscriptionStatus {
  isActive: boolean;
  planId: string | null;
  planName: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

export function useSubscription() {
  const { user } = useUser();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isActive: false,
    planId: null,
    planName: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  });

  // Fetch subscription status from your API
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const response = await fetch('/api/subscription/status');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }
      
      return response.json();
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (data) {
      setSubscriptionStatus({
        isActive: data.status === 'active',
        planId: data.planId,
        planName: data.planName,
        currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
      });
    }
  }, [data]);

  const createCheckoutSession = async (priceId: string) => {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { url } = await response.json();
    window.location.href = url;
  };

  const createPortalSession = async () => {
    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const { url } = await response.json();
    window.location.href = url;
  };

  const cancelSubscription = async () => {
    const response = await fetch('/api/subscription/cancel', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    await refetch();
  };

  return {
    ...subscriptionStatus,
    isLoading,
    error,
    createCheckoutSession,
    createPortalSession,
    cancelSubscription,
    refetch,
  };
}