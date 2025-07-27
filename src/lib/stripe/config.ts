import Stripe from 'stripe'

// Stripe configuration
export const STRIPE_CONFIG = {
  // Product IDs
  products: {
    powerPulse: {
      name: 'PowerPulse Daily Coaching',
      description: 'Personalized 5-minute daily audio coaching sessions',
      metadata: {
        type: 'subscription',
        category: 'coaching',
      },
    },
  },

  // Price configurations
  prices: {
    monthly: {
      nickname: 'Monthly Subscription',
      unit_amount: 1499, // $14.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month' as const,
        interval_count: 1,
      },
      metadata: {
        popular: 'true',
        savings: '0',
      },
    },
    yearly: {
      nickname: 'Yearly Subscription',
      unit_amount: 14388, // $143.88 in cents ($11.99/month)
      currency: 'usd',
      recurring: {
        interval: 'year' as const,
        interval_count: 1,
      },
      metadata: {
        popular: 'false',
        savings: '20%',
        monthly_equivalent: '1199', // $11.99
      },
    },
    lifetime: {
      nickname: 'Lifetime Access',
      unit_amount: 29900, // $299.00 in cents
      currency: 'usd',
      // No recurring for one-time payment
      metadata: {
        popular: 'false',
        type: 'lifetime',
        value: 'best',
      },
    },
  },

  // Checkout session configuration
  checkout: {
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/quiz/payment?canceled=true`,
    mode: 'subscription' as const,
    allow_promotion_codes: true,
    billing_address_collection: 'auto' as const,
    payment_method_types: ['card' as const],
    customer_creation: 'always' as const,
    phone_number_collection: {
      enabled: false,
    },
    // Custom fields for additional data collection
    custom_fields: [],
    // Subscription data
    subscription_data: {
      metadata: {
        app: 'powerpulse',
      },
    },
  },

  // Trial configuration
  trial: {
    trial_period_days: 7,
    trial_from_plan: true,
  },

  // Customer portal configuration
  portal: {
    business_profile: {
      headline: 'Manage your PowerPulse subscription',
      privacy_policy_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pulse.powerhub.dev'}/privacy`,
      terms_of_service_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pulse.powerhub.dev'}/terms`,
    },
    features: {
      customer_update: {
        allowed_updates: ['email', 'address', 'phone', 'tax_id'],
        enabled: true,
      },
      invoice_history: {
        enabled: true,
      },
      payment_method_update: {
        enabled: true,
      },
      subscription_cancel: {
        enabled: true,
        mode: 'at_period_end',
        cancellation_reason: {
          enabled: true,
          options: [
            'too_expensive',
            'missing_features',
            'switched_service',
            'unused',
            'other',
          ],
        },
      },
      subscription_pause: {
        enabled: true,
      },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ['price', 'quantity'],
        proration_behavior: 'create_prorations',
        products: [],
      },
    },
  },

  // Webhook events to listen for
  webhookEvents: [
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'customer.subscription.trial_will_end',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
    'charge.refunded',
    'customer.created',
    'customer.updated',
    'payment_method.attached',
    'payment_method.detached',
  ],
}

// Helper to get price by interval
export function getStripePrice(interval: 'month' | 'year' | 'lifetime') {
  switch (interval) {
    case 'month':
      return process.env.STRIPE_PRICE_MONTHLY_ID
    case 'year':
      return process.env.STRIPE_PRICE_YEARLY_ID
    case 'lifetime':
      return process.env.STRIPE_PRICE_LIFETIME_ID
    default:
      return process.env.STRIPE_PRICE_MONTHLY_ID
  }
}

// Helper to format price
export function formatPrice(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount / 100)
}