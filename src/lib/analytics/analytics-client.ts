import { type EventName, type EventProperties, type UserTraits, sanitizeProperties } from './event-types';

// Analytics Provider Interface
export interface AnalyticsProvider {
  name: string;
  initialize(config: any): Promise<void>;
  identify(userId: string, traits?: UserTraits): Promise<void>;
  track<T extends EventName>(event: T, properties?: EventProperties<T>): Promise<void>;
  page(name?: string, properties?: Record<string, any>): Promise<void>;
  reset(): Promise<void>;
}

// Mixpanel Provider
class MixpanelProvider implements AnalyticsProvider {
  name = 'mixpanel';
  private mixpanel: any;

  async initialize(config: { token: string; config?: any }) {
    if (typeof window === 'undefined') return;
    
    try {
      const { default: mixpanel } = await import('mixpanel-browser');
      mixpanel.init(config.token, {
        debug: process.env.NODE_ENV === 'development',
        track_pageview: true,
        persistence: 'localStorage',
        ...config.config,
      });
      this.mixpanel = mixpanel;
    } catch (error) {
      console.warn('[Analytics] Mixpanel not installed. Run: pnpm add mixpanel-browser');
    }
  }

  async identify(userId: string, traits?: UserTraits) {
    if (!this.mixpanel) return;
    
    this.mixpanel.identify(userId);
    if (traits) {
      const sanitized = sanitizeProperties(traits);
      this.mixpanel.people.set(sanitized);
      this.mixpanel.register(sanitized);
    }
  }

  async track<T extends EventName>(event: T, properties?: EventProperties<T>) {
    if (!this.mixpanel) return;
    
    const sanitized = properties ? sanitizeProperties(properties) : {};
    this.mixpanel.track(event, sanitized);
  }

  async page(name?: string, properties?: Record<string, any>) {
    if (!this.mixpanel) return;
    
    const pageName = name || window.location.pathname;
    const sanitized = properties ? sanitizeProperties(properties) : {};
    this.mixpanel.track('Page Viewed', {
      page: pageName,
      ...sanitized,
    });
  }

  async reset() {
    if (!this.mixpanel) return;
    this.mixpanel.reset();
  }
}

// Google Analytics Provider
class GoogleAnalyticsProvider implements AnalyticsProvider {
  name = 'google-analytics';
  private gtag: any;

  async initialize(config: { measurementId: string }) {
    if (typeof window === 'undefined') return;
    
    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    this.gtag = function() {
      (window as any).dataLayer.push(arguments);
    };
    this.gtag('js', new Date());
    this.gtag('config', config.measurementId, {
      send_page_view: false,
    });
  }

  async identify(userId: string, traits?: UserTraits) {
    if (!this.gtag) return;
    
    this.gtag('config', 'GA_MEASUREMENT_ID', {
      user_id: userId,
      user_properties: traits ? sanitizeProperties(traits) : {},
    });
  }

  async track<T extends EventName>(event: T, properties?: EventProperties<T>) {
    if (!this.gtag) return;
    
    const sanitized = properties ? sanitizeProperties(properties) : {};
    const eventName = event.replace(':', '_'); // GA doesn't like colons
    this.gtag('event', eventName, sanitized);
  }

  async page(name?: string, properties?: Record<string, any>) {
    if (!this.gtag) return;
    
    const pageName = name || window.location.pathname;
    const sanitized = properties ? sanitizeProperties(properties) : {};
    this.gtag('event', 'page_view', {
      page_path: pageName,
      page_title: document.title,
      ...sanitized,
    });
  }

  async reset() {
    // GA doesn't have a built-in reset method
    if (!this.gtag) return;
    this.gtag('config', 'GA_MEASUREMENT_ID', {
      user_id: null,
    });
  }
}

// PostHog Provider
class PostHogProvider implements AnalyticsProvider {
  name = 'posthog';
  private posthog: any;

  async initialize(config: { apiKey: string; apiHost?: string }) {
    if (typeof window === 'undefined') return;
    
    try {
      const { default: posthog } = await import('posthog-js');
      posthog.init(config.apiKey, {
        api_host: config.apiHost || 'https://app.posthog.com',
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') posthog.debug();
        },
      });
      this.posthog = posthog;
    } catch (error) {
      console.warn('[Analytics] PostHog not installed. Run: pnpm add posthog-js');
    }
  }

  async identify(userId: string, traits?: UserTraits) {
    if (!this.posthog) return;
    
    const sanitized = traits ? sanitizeProperties(traits) : {};
    this.posthog.identify(userId, sanitized);
  }

  async track<T extends EventName>(event: T, properties?: EventProperties<T>) {
    if (!this.posthog) return;
    
    const sanitized = properties ? sanitizeProperties(properties) : {};
    this.posthog.capture(event, sanitized);
  }

  async page(name?: string, properties?: Record<string, any>) {
    if (!this.posthog) return;
    
    const pageName = name || window.location.pathname;
    const sanitized = properties ? sanitizeProperties(properties) : {};
    this.posthog.capture('$pageview', {
      $current_url: window.location.href,
      $pathname: pageName,
      ...sanitized,
    });
  }

  async reset() {
    if (!this.posthog) return;
    this.posthog.reset();
  }
}

// Analytics Configuration
export interface AnalyticsConfig {
  providers: {
    mixpanel?: { token: string; config?: any };
    googleAnalytics?: { measurementId: string };
    posthog?: { apiKey: string; apiHost?: string };
  };
  debug?: boolean;
  optOut?: boolean;
  sessionTracking?: boolean;
  errorTracking?: boolean;
  performanceTracking?: boolean;
}

// Main Analytics Client
export class AnalyticsClient {
  private providers: AnalyticsProvider[] = [];
  private isInitialized = false;
  private config: AnalyticsConfig;
  private sessionId: string;
  private userId?: string;
  private userTraits?: UserTraits;
  private isOptedOut = false;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.isOptedOut = config.optOut || false;

    // Check for opt-out preference in localStorage
    if (typeof window !== 'undefined') {
      const storedOptOut = localStorage.getItem('analytics_opt_out');
      if (storedOptOut === 'true') {
        this.isOptedOut = true;
      }
    }
  }

  async initialize() {
    if (this.isInitialized || this.isOptedOut) return;

    const { providers } = this.config;

    // Initialize Mixpanel
    if (providers.mixpanel) {
      const provider = new MixpanelProvider();
      await provider.initialize(providers.mixpanel);
      this.providers.push(provider);
    }

    // Initialize Google Analytics
    if (providers.googleAnalytics) {
      const provider = new GoogleAnalyticsProvider();
      await provider.initialize(providers.googleAnalytics);
      this.providers.push(provider);
    }

    // Initialize PostHog
    if (providers.posthog) {
      const provider = new PostHogProvider();
      await provider.initialize(providers.posthog);
      this.providers.push(provider);
    }

    // Set up error tracking
    if (this.config.errorTracking) {
      this.setupErrorTracking();
    }

    // Set up performance tracking
    if (this.config.performanceTracking) {
      this.setupPerformanceTracking();
    }

    this.isInitialized = true;

    if (this.config.debug) {
      console.log('[Analytics] Initialized with providers:', this.providers.map(p => p.name));
    }
  }

  async identify(userId: string, traits?: UserTraits) {
    if (this.isOptedOut) return;

    this.userId = userId;
    this.userTraits = traits;

    await Promise.all(
      this.providers.map(provider => 
        provider.identify(userId, traits).catch(err => {
          if (this.config.debug) {
            console.error(`[Analytics] Error in ${provider.name} identify:`, err);
          }
        })
      )
    );
  }

  async track<T extends EventName>(event: T, properties?: EventProperties<T>) {
    if (this.isOptedOut) return;

    const enrichedProperties = {
      ...properties,
      session_id: this.sessionId,
      timestamp: Date.now(),
      environment: process.env.NODE_ENV,
      version: process.env.NEXT_PUBLIC_APP_VERSION,
    } as EventProperties<T>;

    if (this.config.debug) {
      console.log('[Analytics] Track:', event, enrichedProperties);
    }

    await Promise.all(
      this.providers.map(provider => 
        provider.track(event, enrichedProperties).catch(err => {
          if (this.config.debug) {
            console.error(`[Analytics] Error in ${provider.name} track:`, err);
          }
        })
      )
    );
  }

  async page(name?: string, properties?: Record<string, any>) {
    if (this.isOptedOut) return;

    const enrichedProperties = {
      ...properties,
      session_id: this.sessionId,
      timestamp: Date.now(),
      referrer: document.referrer,
      url: window.location.href,
      path: window.location.pathname,
      search: window.location.search,
      title: document.title,
    };

    if (this.config.debug) {
      console.log('[Analytics] Page:', name || window.location.pathname, enrichedProperties);
    }

    await Promise.all(
      this.providers.map(provider => 
        provider.page(name, enrichedProperties).catch(err => {
          if (this.config.debug) {
            console.error(`[Analytics] Error in ${provider.name} page:`, err);
          }
        })
      )
    );
  }

  async reset() {
    this.userId = undefined;
    this.userTraits = undefined;
    this.sessionId = this.generateSessionId();

    await Promise.all(
      this.providers.map(provider => 
        provider.reset().catch(err => {
          if (this.config.debug) {
            console.error(`[Analytics] Error in ${provider.name} reset:`, err);
          }
        })
      )
    );
  }

  // Opt-out management
  optOut() {
    this.isOptedOut = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem('analytics_opt_out', 'true');
    }
    this.reset();
  }

  optIn() {
    this.isOptedOut = false;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('analytics_opt_out');
    }
  }

  isUserOptedOut() {
    return this.isOptedOut;
  }

  // Helper methods
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupErrorTracking() {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.track('error:occurred', {
        error: event.message,
        errorStack: event.error?.stack,
        context: 'window_error',
        severity: 'high',
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.track('error:occurred', {
        error: event.reason?.message || String(event.reason),
        errorStack: event.reason?.stack,
        context: 'unhandled_promise_rejection',
        severity: 'high',
      });
    });
  }

  private setupPerformanceTracking() {
    if (typeof window === 'undefined') return;

    // Track page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        const domInteractive = navigation.domInteractive - navigation.fetchStart;

        this.track('performance:page_viewed', {
          path: window.location.pathname,
          title: document.title,
          loadTime,
          domContentLoaded,
          domInteractive,
        });

        // Track slow loads
        if (loadTime > 3000) {
          this.track('performance:slow_load', {
            page: window.location.pathname,
            loadTime,
            threshold: 3000,
          });
        }
      }
    });

    // Track API performance
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const [input, init] = args;
      const url = typeof input === 'string' ? input : input.url;
      const method = init?.method || 'GET';

      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;

        this.track('performance:api_called', {
          endpoint: url,
          method,
          duration,
          status: response.status,
          error: !response.ok,
        });

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;

        this.track('performance:api_called', {
          endpoint: url,
          method,
          duration,
          status: 0,
          error: true,
        });

        throw error;
      }
    };
  }
}

// Singleton instance
let analyticsInstance: AnalyticsClient | null = null;

export function getAnalytics(config?: AnalyticsConfig): AnalyticsClient {
  if (!analyticsInstance && config) {
    analyticsInstance = new AnalyticsClient(config);
  }

  if (!analyticsInstance) {
    throw new Error('Analytics not initialized. Please provide a configuration.');
  }

  return analyticsInstance;
}