import { headers } from 'next/headers';
import { type EventName, type EventProperties, type UserTraits, sanitizeProperties } from './event-types';

// Server-side analytics configuration
interface ServerAnalyticsConfig {
  mixpanel?: {
    token: string;
    apiHost?: string;
  };
  posthog?: {
    apiKey: string;
    apiHost?: string;
  };
  debug?: boolean;
}

// Batch event for processing
interface BatchEvent<T extends EventName = EventName> {
  event: T;
  properties: EventProperties<T>;
  userId?: string;
  timestamp: number;
  distinctId: string;
}

// Server Analytics Client
export class ServerAnalytics {
  private config: ServerAnalyticsConfig;
  private batchQueue: BatchEvent[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 100;
  private readonly BATCH_INTERVAL = 5000; // 5 seconds

  constructor(config: ServerAnalyticsConfig) {
    this.config = config;
  }

  // Track event
  async track<T extends EventName>(
    event: T,
    properties?: EventProperties<T>,
    options?: { userId?: string; anonymousId?: string }
  ) {
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '';
    
    const enrichedProperties = {
      ...properties,
      timestamp: Date.now(),
      environment: process.env.NODE_ENV,
      version: process.env.NEXT_PUBLIC_APP_VERSION,
      server_side: true,
      user_agent: userAgent,
      ip: ip.split(',')[0].trim(), // Get first IP if multiple
    } as EventProperties<T>;

    const sanitized = sanitizeProperties(enrichedProperties);
    
    const batchEvent: BatchEvent<T> = {
      event,
      properties: sanitized as EventProperties<T>,
      userId: options?.userId,
      timestamp: Date.now(),
      distinctId: options?.userId || options?.anonymousId || this.generateAnonymousId(),
    };

    // Add to batch queue
    this.addToBatch(batchEvent);

    if (this.config.debug) {
      console.log('[ServerAnalytics] Track:', event, sanitized);
    }
  }

  // Identify user
  async identify(userId: string, traits?: UserTraits) {
    const sanitized = traits ? sanitizeProperties(traits) : {};

    // Send identify event to providers
    if (this.config.mixpanel) {
      await this.sendToMixpanel('identify', {
        $distinct_id: userId,
        $set: sanitized,
      });
    }

    if (this.config.posthog) {
      await this.sendToPostHog('identify', {
        distinct_id: userId,
        properties: sanitized,
      });
    }

    if (this.config.debug) {
      console.log('[ServerAnalytics] Identify:', userId, sanitized);
    }
  }

  // Track webhook events
  async trackWebhook<T extends EventName>(
    source: 'stripe' | 'clerk' | 'custom',
    event: T,
    properties?: EventProperties<T>,
    userId?: string
  ) {
    const enrichedProperties = {
      ...properties,
      webhook_source: source,
      webhook_received_at: Date.now(),
    } as EventProperties<T>;

    await this.track(event, enrichedProperties, { userId });
  }

  // Track API performance
  async trackApiPerformance(
    endpoint: string,
    method: string,
    duration: number,
    status: number,
    error?: boolean
  ) {
    await this.track('performance:api_called', {
      endpoint,
      method,
      duration,
      status,
      error: error || false,
      server_side: true,
    });
  }

  // Batch processing
  private addToBatch(event: BatchEvent) {
    this.batchQueue.push(event);

    // Process immediately if batch is full
    if (this.batchQueue.length >= this.BATCH_SIZE) {
      this.processBatch();
    } else if (!this.batchTimer) {
      // Set timer for batch processing
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, this.BATCH_INTERVAL);
    }
  }

  private async processBatch() {
    if (this.batchQueue.length === 0) return;

    // Clear timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    // Get current batch
    const batch = [...this.batchQueue];
    this.batchQueue = [];

    // Send to providers
    const promises: Promise<void>[] = [];

    if (this.config.mixpanel) {
      promises.push(this.sendBatchToMixpanel(batch));
    }

    if (this.config.posthog) {
      promises.push(this.sendBatchToPostHog(batch));
    }

    // Wait for all providers to process
    await Promise.all(promises).catch(error => {
      if (this.config.debug) {
        console.error('[ServerAnalytics] Batch processing error:', error);
      }
    });
  }

  // Provider-specific methods
  private async sendToMixpanel(endpoint: string, data: any) {
    if (!this.config.mixpanel) return;

    const url = `${this.config.mixpanel.apiHost || 'https://api.mixpanel.com'}/${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'text/plain',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          token: this.config.mixpanel.token,
        }),
      });

      if (!response.ok) {
        throw new Error(`Mixpanel API error: ${response.status}`);
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('[ServerAnalytics] Mixpanel error:', error);
      }
    }
  }

  private async sendBatchToMixpanel(batch: BatchEvent[]) {
    if (!this.config.mixpanel) return;

    const events = batch.map(({ event, properties, distinctId }) => ({
      event: event,
      properties: {
        ...properties,
        distinct_id: distinctId,
        token: this.config.mixpanel!.token,
      },
    }));

    const data = Buffer.from(JSON.stringify(events)).toString('base64');
    
    try {
      const response = await fetch('https://api.mixpanel.com/import', {
        method: 'POST',
        headers: {
          'Accept': 'text/plain',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${data}`,
      });

      if (!response.ok) {
        throw new Error(`Mixpanel batch API error: ${response.status}`);
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('[ServerAnalytics] Mixpanel batch error:', error);
      }
    }
  }

  private async sendToPostHog(endpoint: string, data: any) {
    if (!this.config.posthog) return;

    const url = `${this.config.posthog.apiHost || 'https://app.posthog.com'}/capture/`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.posthog.apiKey}`,
        },
        body: JSON.stringify({
          api_key: this.config.posthog.apiKey,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error(`PostHog API error: ${response.status}`);
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('[ServerAnalytics] PostHog error:', error);
      }
    }
  }

  private async sendBatchToPostHog(batch: BatchEvent[]) {
    if (!this.config.posthog) return;

    const events = batch.map(({ event, properties, distinctId, timestamp }) => ({
      event,
      properties,
      distinct_id: distinctId,
      timestamp: new Date(timestamp).toISOString(),
    }));

    const url = `${this.config.posthog.apiHost || 'https://app.posthog.com'}/batch/`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.config.posthog.apiKey,
          batch: events,
        }),
      });

      if (!response.ok) {
        throw new Error(`PostHog batch API error: ${response.status}`);
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('[ServerAnalytics] PostHog batch error:', error);
      }
    }
  }

  // Helper methods
  private generateAnonymousId(): string {
    return `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Flush any pending events (useful for serverless)
  async flush() {
    await this.processBatch();
  }
}

// Singleton instance for server-side analytics
let serverAnalyticsInstance: ServerAnalytics | null = null;

export function getServerAnalytics(config?: ServerAnalyticsConfig): ServerAnalytics {
  if (!serverAnalyticsInstance && config) {
    serverAnalyticsInstance = new ServerAnalytics(config);
  }

  if (!serverAnalyticsInstance) {
    // Create a no-op instance if no config provided
    serverAnalyticsInstance = new ServerAnalytics({});
  }

  return serverAnalyticsInstance;
}

// Middleware helper for tracking API routes
export function withAnalytics(
  handler: (req: Request) => Promise<Response>
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    const startTime = Date.now();
    const analytics = getServerAnalytics();
    
    try {
      const response = await handler(req);
      const duration = Date.now() - startTime;
      
      // Track API performance
      await analytics.trackApiPerformance(
        new URL(req.url).pathname,
        req.method,
        duration,
        response.status,
        !response.ok
      );
      
      // Flush events for serverless
      await analytics.flush();
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Track error
      await analytics.trackApiPerformance(
        new URL(req.url).pathname,
        req.method,
        duration,
        500,
        true
      );
      
      await analytics.track('error:occurred', {
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        context: 'api_route',
        severity: 'high',
      });
      
      // Flush events for serverless
      await analytics.flush();
      
      throw error;
    }
  };
}