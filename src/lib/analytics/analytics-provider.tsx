'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { AnalyticsClient, AnalyticsConfig, getAnalytics } from './analytics-client';
import { type UserTraits } from './event-types';

interface AnalyticsContextValue {
  analytics: AnalyticsClient | null;
  isInitialized: boolean;
  isOptedOut: boolean;
  optOut: () => void;
  optIn: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue>({
  analytics: null,
  isInitialized: false,
  isOptedOut: false,
  optOut: () => {},
  optIn: () => {},
});

export interface AnalyticsProviderProps {
  children: React.ReactNode;
  config: AnalyticsConfig;
  userTraits?: UserTraits;
}

export function AnalyticsProvider({ children, config, userTraits }: AnalyticsProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOptedOut, setIsOptedOut] = useState(false);
  const analyticsRef = useRef<AnalyticsClient | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { userId, isSignedIn } = useAuth();
  const lastPathname = useRef(pathname);

  // Initialize analytics
  useEffect(() => {
    const initAnalytics = async () => {
      try {
        const analytics = getAnalytics(config);
        await analytics.initialize();
        analyticsRef.current = analytics;
        setIsInitialized(true);
        setIsOptedOut(analytics.isUserOptedOut());

        // Track initial page view
        analytics.page();
      } catch (error) {
        console.error('[Analytics] Failed to initialize:', error);
      }
    };

    initAnalytics();
  }, [config]);

  // Handle user identification
  useEffect(() => {
    if (!isInitialized || !analyticsRef.current) return;

    if (isSignedIn && userId) {
      // Identify the user when they sign in
      analyticsRef.current.identify(userId, userTraits);
    } else if (!isSignedIn) {
      // Reset analytics when user signs out
      analyticsRef.current.reset();
    }
  }, [isInitialized, isSignedIn, userId, userTraits]);

  // Track page views on route changes
  useEffect(() => {
    if (!isInitialized || !analyticsRef.current) return;

    // Only track if the pathname actually changed
    if (pathname !== lastPathname.current) {
      lastPathname.current = pathname;

      // Get UTM parameters if present
      const utmParams: Record<string, string> = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
        const value = searchParams.get(param);
        if (value) utmParams[param] = value;
      });

      // Track the page view
      analyticsRef.current.page(pathname, {
        ...utmParams,
        referrer: document.referrer,
      });
    }
  }, [pathname, searchParams, isInitialized]);

  // Handle visibility change (tab focus/blur)
  useEffect(() => {
    if (!isInitialized || !analyticsRef.current) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        analyticsRef.current?.track('engagement:feature_used', {
          feature: 'tab',
          action: 'blurred',
        });
      } else {
        analyticsRef.current?.track('engagement:feature_used', {
          feature: 'tab',
          action: 'focused',
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isInitialized]);

  // Opt-out handlers
  const optOut = () => {
    if (analyticsRef.current) {
      analyticsRef.current.optOut();
      setIsOptedOut(true);
    }
  };

  const optIn = () => {
    if (analyticsRef.current) {
      analyticsRef.current.optIn();
      setIsOptedOut(false);
      
      // Re-identify user if signed in
      if (isSignedIn && userId) {
        analyticsRef.current.identify(userId, userTraits);
      }
    }
  };

  const contextValue: AnalyticsContextValue = {
    analytics: analyticsRef.current,
    isInitialized,
    isOptedOut,
    optOut,
    optIn,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
}