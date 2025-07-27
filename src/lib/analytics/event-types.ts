// Event Categories
export const EventCategory = {
  USER: 'user',
  SUBSCRIPTION: 'subscription',
  CONTENT: 'content',
  ENGAGEMENT: 'engagement',
  ONBOARDING: 'onboarding',
  PERFORMANCE: 'performance',
  ERROR: 'error',
} as const;

export type EventCategory = (typeof EventCategory)[keyof typeof EventCategory];

// Common Event Properties
export interface BaseEventProperties {
  timestamp?: number;
  session_id?: string;
  platform?: 'web' | 'mobile' | 'desktop';
  environment?: 'development' | 'staging' | 'production';
  version?: string;
}

// User Properties
export interface UserTraits {
  userId: string;
  email?: string;
  name?: string;
  createdAt?: Date;
  subscriptionStatus?: 'trial' | 'active' | 'paused' | 'canceled' | 'expired';
  subscriptionPlan?: string;
  painPoints?: string[];
  goals?: string[];
  learningStyle?: string;
  stage?: 'foundation' | 'momentum' | 'transformation' | 'mastery';
  streakDays?: number;
  totalSessions?: number;
}

// Event Definitions
export interface AnalyticsEvents {
  // User Events
  'user:signed_up': {
    source: 'organic' | 'referral' | 'paid' | 'social';
    referrer?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
  'user:signed_in': {
    method: 'email' | 'google' | 'facebook' | 'magic_link';
  };
  'user:signed_out': {
    reason?: 'manual' | 'session_expired' | 'error';
  };
  'user:profile_updated': {
    fields: string[];
  };
  'user:deleted_account': {
    reason?: string;
    feedback?: string;
  };

  // Onboarding Events
  'onboarding:quiz_started': {
    step: number;
    referrer?: string;
  };
  'onboarding:quiz_step_completed': {
    step: number;
    stepName: string;
    timeSpent: number;
    answers?: Record<string, any>;
  };
  'onboarding:quiz_completed': {
    totalSteps: number;
    totalTime: number;
    painPoints: string[];
    goals: string[];
    learningStyle: string;
  };
  'onboarding:quiz_abandoned': {
    step: number;
    stepName: string;
    timeSpent: number;
    reason?: string;
  };

  // Subscription Events
  'subscription:trial_started': {
    plan: string;
    source: 'quiz_completion' | 'pricing_page' | 'banner';
  };
  'subscription:trial_converted': {
    plan: string;
    price: number;
    currency: string;
    mrr: number;
  };
  'subscription:payment_succeeded': {
    amount: number;
    currency: string;
    plan: string;
    isRecurring: boolean;
  };
  'subscription:payment_failed': {
    amount: number;
    currency: string;
    plan: string;
    error: string;
    errorCode?: string;
  };
  'subscription:plan_changed': {
    fromPlan: string;
    toPlan: string;
    reason?: string;
  };
  'subscription:paused': {
    reason?: string;
    pauseDuration?: number;
  };
  'subscription:resumed': {
    pauseDuration: number;
  };
  'subscription:canceled': {
    reason?: string;
    feedback?: string;
    churnReason?: 'price' | 'value' | 'competitor' | 'temporary' | 'other';
    refundRequested: boolean;
  };
  'subscription:refund_processed': {
    amount: number;
    currency: string;
    reason?: string;
  };

  // Content Events
  'content:audio_played': {
    contentId: string;
    contentType: 'daily' | 'bonus' | 'onboarding';
    duration: number;
    stage: string;
    dayNumber: number;
    voice?: string;
  };
  'content:audio_completed': {
    contentId: string;
    contentType: 'daily' | 'bonus' | 'onboarding';
    duration: number;
    completionRate: number;
    stage: string;
    dayNumber: number;
  };
  'content:audio_paused': {
    contentId: string;
    position: number;
    duration: number;
    pauseCount: number;
  };
  'content:audio_skipped': {
    contentId: string;
    position: number;
    duration: number;
    skipReason?: 'manual' | 'error';
  };
  'content:audio_downloaded': {
    contentId: string;
    contentType: 'daily' | 'bonus' | 'onboarding';
    size: number;
  };
  'content:script_generated': {
    userId: string;
    stage: string;
    dayNumber: number;
    generationTime: number;
    model: string;
    tokens?: number;
  };
  'content:audio_generated': {
    userId: string;
    contentId: string;
    generationTime: number;
    voice: string;
    size: number;
    cost?: number;
  };
  'content:delivery_sent': {
    userId: string;
    contentId: string;
    channel: 'email' | 'whatsapp' | 'telegram' | 'sms';
    status: 'success' | 'failed';
    error?: string;
  };

  // Engagement Events
  'engagement:streak_achieved': {
    streakDays: number;
    milestone: boolean;
    milestoneValue?: number;
  };
  'engagement:streak_broken': {
    previousStreak: number;
    reason?: 'missed_day' | 'manual_break';
  };
  'engagement:achievement_unlocked': {
    achievementId: string;
    achievementName: string;
    achievementType: string;
    points?: number;
  };
  'engagement:feature_used': {
    feature: string;
    action: string;
    value?: any;
  };
  'engagement:feedback_submitted': {
    type: 'rating' | 'comment' | 'survey';
    rating?: number;
    comment?: string;
    category?: string;
  };
  'engagement:referral_sent': {
    method: 'email' | 'link' | 'social';
    incentive?: string;
  };
  'engagement:referral_completed': {
    referredUserId: string;
    incentiveAwarded?: string;
  };

  // Performance Events
  'performance:page_viewed': {
    path: string;
    title: string;
    referrer?: string;
    loadTime?: number;
  };
  'performance:api_called': {
    endpoint: string;
    method: string;
    duration: number;
    status: number;
    error?: boolean;
  };
  'performance:slow_load': {
    page: string;
    loadTime: number;
    threshold: number;
    resources?: string[];
  };

  // Error Events
  'error:occurred': {
    error: string;
    errorCode?: string;
    errorStack?: string;
    context: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    userId?: string;
  };
  'error:boundary_triggered': {
    componentStack: string;
    error: string;
    errorInfo: any;
  };
}

// Conversion Funnel Events
export const ConversionFunnel = {
  LANDING_PAGE_VIEW: 'conversion:landing_page_view',
  SIGNUP_STARTED: 'conversion:signup_started',
  SIGNUP_COMPLETED: 'conversion:signup_completed',
  QUIZ_STARTED: 'conversion:quiz_started',
  QUIZ_COMPLETED: 'conversion:quiz_completed',
  TRIAL_STARTED: 'conversion:trial_started',
  PAYMENT_PAGE_VIEW: 'conversion:payment_page_view',
  PAYMENT_COMPLETED: 'conversion:payment_completed',
  FIRST_AUDIO_PLAYED: 'conversion:first_audio_played',
  WEEK_ONE_RETAINED: 'conversion:week_one_retained',
  MONTH_ONE_RETAINED: 'conversion:month_one_retained',
} as const;

export type ConversionFunnel = (typeof ConversionFunnel)[keyof typeof ConversionFunnel];

// Type helpers
export type EventName = keyof AnalyticsEvents;
export type EventProperties<T extends EventName> = AnalyticsEvents[T] & BaseEventProperties;

// Event validation helpers
export function isValidEventName(event: string): event is EventName {
  return event in ({} as AnalyticsEvents);
}

export function getEventCategory(event: EventName): EventCategory {
  const [category] = event.split(':') as [EventCategory, string];
  return category;
}

// Privacy-compliant property filtering
export function sanitizeProperties<T extends Record<string, any>>(
  properties: T,
  sensitiveFields: string[] = ['password', 'token', 'secret', 'key']
): Partial<T> {
  const sanitized = { ...properties };
  
  for (const key in sanitized) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      delete sanitized[key];
    }
    
    // Sanitize nested objects
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeProperties(sanitized[key], sensitiveFields);
    }
  }
  
  return sanitized;
}