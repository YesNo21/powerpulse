import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { db } from '@/db';
import { users, subscriptions, refunds } from '@/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = (await headers()).get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleTrialEndingSoon(subscription);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id);
  
  // Get the user ID from the session metadata
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  // Find the user
  const [user] = await db.select().from(users).where(eq(users.clerkId, userId));
  if (!user) {
    console.error('User not found:', userId);
    return;
  }

  // Update user subscription status in database
  if (session.subscription) {
    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    
    // Update user record
    await db.update(users)
      .set({
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        subscriptionStatus: 'active',
        subscriptionPriceId: subscription.items.data[0].price.id,
        subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        // Set refund eligibility for 30 days
        refundEligibleUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
      .where(eq(users.id, user.id));

    // Create subscription record
    await db.insert(subscriptions).values({
      userId: user.id,
      stripeSubscriptionId: session.subscription as string,
      stripePriceId: subscription.items.data[0].price.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });

    // Send payment success email (async)
    import('@/lib/email/email-hooks').then(({ sendPaymentSuccessEmail }) => {
      const amount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format((subscription.items.data[0].price.unit_amount || 0) / 100)
      
      sendPaymentSuccessEmail(
        user.id,
        subscription.items.data[0].price.nickname || 'Subscription',
        amount
      ).catch(console.error)
    })
    
    // TODO: Trigger first audio generation
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);
  
  // Find user by Stripe subscription ID
  const [user] = await db.select().from(users)
    .where(eq(users.stripeSubscriptionId, subscription.id));
  
  if (!user) {
    console.error('User not found for subscription:', subscription.id);
    return;
  }

  // Update user subscription status
  await db.update(users)
    .set({
      subscriptionStatus: subscription.status,
      subscriptionPriceId: subscription.items.data[0].price.id,
      subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    })
    .where(eq(users.id, user.id));

  // Update subscription record
  await db.update(subscriptions)
    .set({
      status: subscription.status,
      stripePriceId: subscription.items.data[0].price.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  // Handle subscription state changes
  if (subscription.status === 'past_due') {
    // Send payment retry email
  import('@/lib/email/email-hooks').then(({ sendPaymentFailedEmail }) => {
    sendPaymentFailedEmail(subscription.customer as string).catch(console.error)
  })
  } else if (subscription.status === 'canceled') {
    // Send cancellation confirmation
  import('@/lib/email/email-hooks').then(({ sendSubscriptionCanceledEmail }) => {
    sendSubscriptionCanceledEmail(user.id).catch(console.error)
  })
  } else if (subscription.status === 'active' && subscription.pause_collection) {
    // Handle paused subscription
    await db.update(subscriptions)
      .set({ pausedUntil: new Date(subscription.pause_collection.resumes_at! * 1000) })
      .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  console.log('Subscription canceled:', subscription.id);
  
  // Find user by Stripe customer ID
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const userId = (customer as Stripe.Customer).metadata?.userId;
  
  if (!userId) {
    console.error('No userId in customer metadata');
    return;
  }

  // Update subscription status to canceled
  await db.update(users)
    .set({
      subscriptionStatus: 'canceled',
      subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    })
    .where(eq(users.clerkId, userId));
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id);
  
  // You can add logic here to send receipt emails, update payment history, etc.
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id);
  
  // Find user by customer ID
  const [user] = await db.select().from(users)
    .where(eq(users.stripeCustomerId, invoice.customer as string));
  
  if (!user) {
    console.error('User not found for customer:', invoice.customer);
    return;
  }

  // Send payment failure email
  import('@/lib/email/email-hooks').then(({ sendPaymentFailedEmail }) => {
    sendPaymentFailedEmail(invoice.customer as string).catch(console.error)
  })
  
  // TODO: Update user status if multiple failures
}

async function handleTrialEndingSoon(subscription: Stripe.Subscription) {
  console.log('Trial ending soon:', subscription.id);
  
  // Find user
  const [user] = await db.select().from(users)
    .where(eq(users.stripeSubscriptionId, subscription.id));
  
  if (!user) {
    console.error('User not found for subscription:', subscription.id);
    return;
  }

  // Send trial ending email (3 days before)
  import('@/lib/email/email-hooks').then(({ sendTrialEndingEmail }) => {
    sendTrialEndingEmail(user.id, 3).catch(console.error)
  })
}

async function handleRefund(charge: Stripe.Charge) {
  console.log('Refund processed:', charge.id);
  
  if (!charge.refunded || !charge.invoice) {
    return;
  }

  // Get the invoice to find the subscription
  const invoice = await stripe.invoices.retrieve(charge.invoice as string);
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) {
    console.error('No subscription found for refunded charge');
    return;
  }

  // Find user and subscription
  const [subscription] = await db.select().from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId as string));

  if (!subscription) {
    console.error('Subscription not found:', subscriptionId);
    return;
  }

  // Record the refund
  await db.insert(refunds).values({
    userId: subscription.userId,
    subscriptionId: subscription.id,
    stripeRefundId: charge.id,
    amount: (charge.amount_refunded / 100).toString(), // Convert from cents to dollars
    reason: 'Customer requested',
    status: 'completed',
  });

  // Update user subscription status
  await db.update(users)
    .set({ subscriptionStatus: 'canceled' })
    .where(eq(users.id, subscription.userId));

  // Send refund confirmation email
  import('@/lib/email/email-hooks').then(({ sendRefundEmail }) => {
    const amount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(charge.amount_refunded / 100)
    
    sendRefundEmail(subscription.userId, amount).catch(console.error)
  })
}