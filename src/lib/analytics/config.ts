import { AnalyticsConfig } from './analytics-client';

export const analyticsConfig: AnalyticsConfig = {
  providers: {
    // Mixpanel configuration
    mixpanel: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ? {
      token: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
      config: {
        track_pageview: true,
        persistence: 'localStorage',
        ip: true,
        property_blacklist: ['$current_url', '$initial_referrer', '$referrer'],
      },
    } : undefined,

    // Google Analytics configuration
    googleAnalytics: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? {
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    } : undefined,

    // PostHog configuration
    posthog: process.env.NEXT_PUBLIC_POSTHOG_API_KEY ? {
      apiKey: process.env.NEXT_PUBLIC_POSTHOG_API_KEY,
      apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    } : undefined,
  },
  
  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Check for opt-out preference
  optOut: false,
  
  // Enable session tracking
  sessionTracking: true,
  
  // Enable error tracking
  errorTracking: true,
  
  // Enable performance tracking
  performanceTracking: true,
};

// Server-side analytics configuration
export const serverAnalyticsConfig = {
  mixpanel: process.env.MIXPANEL_TOKEN ? {
    token: process.env.MIXPANEL_TOKEN,
    apiHost: 'https://api.mixpanel.com',
  } : undefined,

  posthog: process.env.POSTHOG_API_KEY ? {
    apiKey: process.env.POSTHOG_API_KEY,
    apiHost: process.env.POSTHOG_HOST || 'https://app.posthog.com',
  } : undefined,

  debug: process.env.NODE_ENV === 'development',
};