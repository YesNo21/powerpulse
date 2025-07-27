# PowerPulse Analytics System

A comprehensive, privacy-compliant analytics tracking system with support for multiple providers (Mixpanel, Google Analytics, PostHog).

## Features

- 🔌 **Multi-Provider Support**: Mixpanel, Google Analytics, PostHog
- 🔒 **Privacy-Compliant**: GDPR/CCPA compliant with opt-out support
- 📊 **Type-Safe Events**: Strongly typed event definitions
- 🚀 **Performance Optimized**: Minimal impact with batch processing
- 🔍 **Debug Mode**: Development-friendly logging
- 🖥️ **Universal**: Works on client and server
- 🎯 **Auto-Enrichment**: Automatic context and metadata

## Installation

### Optional Dependencies

Install the analytics providers you want to use:

```bash
# For Mixpanel
pnpm add mixpanel-browser

# For PostHog
pnpm add posthog-js

# For Google Analytics (no package needed, loads from CDN)
```

## Configuration

### Environment Variables

Add to your `.env.local`:

```env
# Mixpanel
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token
MIXPANEL_TOKEN=your_mixpanel_token_for_server

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# PostHog
NEXT_PUBLIC_POSTHOG_API_KEY=your_posthog_api_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
POSTHOG_API_KEY=your_posthog_api_key_for_server
```

## Usage

### Client-Side Tracking

```tsx
import { useAnalytics } from '@/hooks/use-analytics';

function MyComponent() {
  const { track, trackError, trackConversion } = useAnalytics();
  
  // Track an event
  const handleClick = () => {
    track('engagement:feature_used', {
      feature: 'button',
      action: 'clicked',
    });
  };
  
  // Track errors
  try {
    // ... some code
  } catch (error) {
    trackError(error, 'my_component', 'high');
  }
  
  // Track conversions
  trackConversion('conversion:signup_completed');
}
```

### Server-Side Tracking

```ts
import { getServerAnalytics } from '@/lib/analytics/server-analytics';

export async function POST(req: Request) {
  const analytics = getServerAnalytics();
  
  // Track event
  await analytics.track('subscription:payment_succeeded', {
    amount: 1499,
    currency: 'USD',
    plan: 'premium',
  });
  
  // Track webhook
  await analytics.trackWebhook('stripe', 'subscription:created', {
    customerId: 'cus_123',
  });
  
  // Flush events (important for serverless)
  await analytics.flush();
}
```

### Track Visibility

```tsx
import { useTrackVisibility } from '@/hooks/use-analytics';

function HeroSection() {
  const ref = useTrackVisibility('hero_section', {
    threshold: 0.5,
    trackOnce: true,
  });
  
  return <div ref={ref}>...</div>;
}
```

### Track Clicks with Debouncing

```tsx
import { useTrackClick } from '@/hooks/use-analytics';

function CTAButton() {
  const trackClick = useTrackClick('cta_primary', { 
    position: 'hero' 
  });
  
  return <button onClick={trackClick}>Get Started</button>;
}
```

## Event Types

The system includes comprehensive event definitions for:

- **User Events**: signup, signin, profile updates
- **Onboarding Events**: quiz progress and completion
- **Subscription Events**: trials, payments, cancellations
- **Content Events**: audio plays, completions, downloads
- **Engagement Events**: streaks, achievements, feedback
- **Performance Events**: page views, API calls, slow loads
- **Error Events**: application errors, boundaries

## Privacy & Compliance

### User Opt-Out

```tsx
const { isOptedOut, optOut, optIn } = useAnalytics();

// In settings component
<Switch 
  checked={!isOptedOut}
  onCheckedChange={(checked) => checked ? optIn() : optOut()}
/>
```

### Data Sanitization

Sensitive fields are automatically removed:
- Passwords, tokens, secrets, keys
- Any field containing sensitive keywords

### GDPR/CCPA Compliance

- User consent tracking
- Right to deletion (via reset)
- Data portability
- Opt-out persistence

## Performance

- **Batch Processing**: Events batched every 5 seconds
- **Minimal Bundle Impact**: Providers loaded dynamically
- **Error Boundaries**: Failures don't affect app
- **Automatic Retries**: Network failures handled gracefully

## Debugging

Enable debug mode in development:

```ts
// Automatically enabled in development
// Or set explicitly:
const config = {
  debug: true,
};
```

View events in console:
```
[Analytics] Track: user:signed_up { source: 'organic', ... }
[Analytics] Page: /dashboard { session_id: '...', ... }
```

## Best Practices

1. **Event Naming**: Use colon-separated categories (e.g., `user:action`)
2. **Properties**: Keep flat, avoid deep nesting
3. **PII**: Never track personally identifiable information
4. **Timing**: Track immediately after user actions
5. **Context**: Include relevant context (page, feature, etc.)

## Troubleshooting

### Events Not Appearing

1. Check environment variables are set
2. Verify provider is installed (`pnpm add mixpanel-browser`)
3. Check browser console for errors
4. Ensure user hasn't opted out

### Performance Issues

1. Reduce event frequency
2. Batch similar events
3. Use `trackOnce` for visibility tracking
4. Disable performance tracking if needed

### Type Errors

1. Update event definitions in `event-types.ts`
2. Run TypeScript check: `pnpm typecheck`
3. Use proper event names from `AnalyticsEvents`