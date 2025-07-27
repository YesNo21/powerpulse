// Client-side exports
export { AnalyticsProvider, useAnalyticsContext } from './analytics-provider';
export { useAnalytics, useTrackVisibility, useTrackClick } from '@/hooks/use-analytics';
export { getAnalytics } from './analytics-client';
export type { AnalyticsClient, AnalyticsConfig } from './analytics-client';

// Server-side exports
export { getServerAnalytics, withAnalytics } from './server-analytics';
export type { ServerAnalytics } from './server-analytics';

// Event types and helpers
export * from './event-types';

// Configuration
export { analyticsConfig, serverAnalyticsConfig } from './config';