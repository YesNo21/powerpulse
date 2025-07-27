import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceId: string;
  amount: number;
  interval: 'month' | 'year';
  features: string[];
}

// Define your subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'powerpulse',
    name: 'PowerPulse Daily Coaching',
    priceId: process.env.STRIPE_POWERPULSE_PRICE_ID || 'price_1234567890',
    amount: 1499, // $14.99
    interval: 'month',
    features: [
      'Personalized daily 5-minute audio coaching',
      'AI-powered content based on your goals',
      'Progress tracking and streak management',
      'Multi-channel delivery (Email, WhatsApp, Telegram, SMS)',
      'Journey milestones and achievements',
      'Content library with favorites',
      '30-day money-back guarantee',
      'Cancel anytime',
    ],
  },
];

export class SubscriptionService {
  /**
   * Create a new subscription for a customer
   */
  static async createSubscription(
    customerId: string,
    priceId: string,
    paymentMethodId?: string
  ) {
    try {
      // If payment method is provided, attach it to the customer
      if (paymentMethodId) {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: customerId,
        });

        // Set as default payment method
        await stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      }

      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Update a subscription (e.g., change plan)
   */
  static async updateSubscription(
    subscriptionId: string,
    newPriceId: string
  ) {
    try {
      // Retrieve the subscription
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Update the subscription item with the new price
      const updatedSubscription = await stripe.subscriptions.update(
        subscriptionId,
        {
          items: [
            {
              id: subscription.items.data[0].id,
              price: newPriceId,
            },
          ],
        }
      );

      return updatedSubscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  /**
   * Create or retrieve a Stripe customer for a user
   */
  static async createOrRetrieveCustomer(
    userId: string,
    email: string,
    name?: string
  ) {
    try {
      // Check if customer already exists
      const customers = await stripe.customers.list({
        email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        return customers.data[0];
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
        },
      });

      return customer;
    } catch (error) {
      console.error('Error creating/retrieving customer:', error);
      throw error;
    }
  }

  /**
   * Get subscription status for a customer
   */
  static async getSubscriptionStatus(customerId: string) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        return null;
      }

      const subscription = subscriptions.data[0];
      const plan = SUBSCRIPTION_PLANS.find(
        p => p.priceId === subscription.items.data[0].price.id
      );

      return {
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        plan,
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      throw error;
    }
  }

  /**
   * Create a checkout session for subscription
   */
  static async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Create a portal session for managing subscriptions
   */
  static async createPortalSession(
    customerId: string,
    returnUrl: string
  ) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return session;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  }
}