'use client';

import { useCallback, useRef } from 'react';
import { useAnalyticsContext } from '@/lib/analytics/analytics-provider';
import { type EventName, type EventProperties, ConversionFunnel } from '@/lib/analytics/event-types';

export interface UseAnalyticsReturn {
  track: <T extends EventName>(event: T, properties?: Omit<EventProperties<T>, keyof BaseEventProperties>) => void;
  trackConversion: (funnel: ConversionFunnel, properties?: Record<string, any>) => void;
  trackError: (error: Error | string, context: string, severity?: 'low' | 'medium' | 'high' | 'critical') => void;
  trackTiming: (category: string, variable: string, time: number, label?: string) => void;
  isOptedOut: boolean;
  optOut: () => void;
  optIn: () => void;
}

interface BaseEventProperties {
  timestamp?: number;
  session_id?: string;
  platform?: 'web' | 'mobile' | 'desktop';
  environment?: 'development' | 'staging' | 'production';
  version?: string;
}

/**
 * Hook for easy analytics tracking in components
 * 
 * @example
 * ```tsx
 * const { track, trackError } = useAnalytics();
 * 
 * // Track an event
 * track('user:signed_up', { source: 'organic' });
 * 
 * // Track an error
 * trackError(error, 'checkout_form', 'high');
 * ```
 */
export function useAnalytics(): UseAnalyticsReturn {
  const { analytics, isInitialized, isOptedOut, optOut, optIn } = useAnalyticsContext();
  const timingStartRef = useRef<Map<string, number>>(new Map());

  // Track event with auto-enrichment
  const track = useCallback(<T extends EventName>(
    event: T,
    properties?: Omit<EventProperties<T>, keyof BaseEventProperties>
  ) => {
    if (!isInitialized || !analytics || isOptedOut) return;

    // Add component context if available
    const enrichedProperties = {
      ...properties,
      component: typeof window !== 'undefined' ? window.location.pathname : undefined,
    } as EventProperties<T>;

    analytics.track(event, enrichedProperties);
  }, [analytics, isInitialized, isOptedOut]);

  // Track conversion funnel events
  const trackConversion = useCallback((
    funnel: ConversionFunnel,
    properties?: Record<string, any>
  ) => {
    if (!isInitialized || !analytics || isOptedOut) return;

    // Map conversion funnel to event name
    const eventMap: Record<ConversionFunnel, EventName> = {
      'conversion:landing_page_view': 'performance:page_viewed',
      'conversion:signup_started': 'user:signed_up',
      'conversion:signup_completed': 'user:signed_up',
      'conversion:quiz_started': 'onboarding:quiz_started',
      'conversion:quiz_completed': 'onboarding:quiz_completed',
      'conversion:trial_started': 'subscription:trial_started',
      'conversion:payment_page_view': 'performance:page_viewed',
      'conversion:payment_completed': 'subscription:payment_succeeded',
      'conversion:first_audio_played': 'content:audio_played',
      'conversion:week_one_retained': 'engagement:streak_achieved',
      'conversion:month_one_retained': 'engagement:streak_achieved',
    };

    const event = eventMap[funnel];
    if (event) {
      analytics.track(event as any, {
        ...properties,
        conversion_funnel: funnel,
        conversion_step: funnel.split(':')[1],
      } as any);
    }
  }, [analytics, isInitialized, isOptedOut]);

  // Track errors with context
  const trackError = useCallback((
    error: Error | string,
    context: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) => {
    if (!isInitialized || !analytics || isOptedOut) return;

    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    analytics.track('error:occurred', {
      error: errorMessage,
      errorStack,
      context,
      severity,
      errorType: error instanceof Error ? error.name : 'string',
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Analytics Error] ${context}:`, error);
    }
  }, [analytics, isInitialized, isOptedOut]);

  // Track timing metrics
  const trackTiming = useCallback((
    category: string,
    variable: string,
    time?: number,
    label?: string
  ) => {
    if (!isInitialized || !analytics || isOptedOut) return;

    const key = `${category}:${variable}`;

    // If no time provided, this is a start timing call
    if (time === undefined) {
      timingStartRef.current.set(key, performance.now());
      return;
    }

    // If we have a start time, calculate duration
    const startTime = timingStartRef.current.get(key);
    if (startTime !== undefined) {
      time = performance.now() - startTime;
      timingStartRef.current.delete(key);
    }

    // Track the timing event
    analytics.track('performance:page_viewed', {
      path: category,
      title: variable,
      loadTime: time,
      referrer: label,
    });
  }, [analytics, isInitialized, isOptedOut]);

  return {
    track,
    trackConversion,
    trackError,
    trackTiming,
    isOptedOut,
    optOut,
    optIn,
  };
}

/**
 * Hook for tracking component visibility
 * 
 * @example
 * ```tsx
 * const ref = useTrackVisibility('hero_section', {
 *   threshold: 0.5,
 *   trackOnce: true,
 * });
 * 
 * return <div ref={ref}>...</div>
 * ```
 */
export function useTrackVisibility(
  componentName: string,
  options?: {
    threshold?: number;
    trackOnce?: boolean;
    properties?: Record<string, any>;
  }
) {
  const { track } = useAnalytics();
  const hasTrackedRef = useRef(false);
  const elementRef = useRef<HTMLElement | null>(null);

  const setRef = useCallback((element: HTMLElement | null) => {
    if (!element || (options?.trackOnce && hasTrackedRef.current)) return;

    elementRef.current = element;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && (!options?.trackOnce || !hasTrackedRef.current)) {
            track('engagement:feature_used', {
              feature: 'component_viewed',
              action: componentName,
              value: {
                ...options?.properties,
                visibility_ratio: entry.intersectionRatio,
              },
            });
            hasTrackedRef.current = true;
          }
        });
      },
      {
        threshold: options?.threshold || 0.5,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [componentName, options, track]);

  return setRef;
}

/**
 * Hook for tracking click events with debouncing
 * 
 * @example
 * ```tsx
 * const trackClick = useTrackClick('cta_button', { position: 'hero' });
 * 
 * return <button onClick={trackClick}>Click me</button>
 * ```
 */
export function useTrackClick(
  actionName: string,
  properties?: Record<string, any>,
  options?: {
    debounceMs?: number;
    preventDefault?: boolean;
  }
) {
  const { track } = useAnalytics();
  const lastClickRef = useRef(0);

  return useCallback((event?: React.MouseEvent) => {
    const now = Date.now();
    const debounceMs = options?.debounceMs || 500;

    if (now - lastClickRef.current < debounceMs) {
      return; // Debounce duplicate clicks
    }

    lastClickRef.current = now;

    if (options?.preventDefault && event) {
      event.preventDefault();
    }

    track('engagement:feature_used', {
      feature: 'button_clicked',
      action: actionName,
      value: {
        ...properties,
        element_text: event?.currentTarget instanceof HTMLElement 
          ? event.currentTarget.textContent?.trim() 
          : undefined,
      },
    });
  }, [actionName, properties, options, track]);
}