import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
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

  // Update user subscription status in database
  if (session.subscription) {
    await db.update(users)
      .set({
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        subscriptionStatus: 'active',
        subscriptionPriceId: session.metadata?.priceId,
      })
      .where(eq(users.clerkId, userId));
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);
  
  // Find user by Stripe customer ID
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const userId = (customer as Stripe.Customer).metadata?.userId;
  
  if (!userId) {
    console.error('No userId in customer metadata');
    return;
  }

  // Update subscription status
  await db.update(users)
    .set({
      subscriptionStatus: subscription.status,
      subscriptionPriceId: subscription.items.data[0].price.id,
      subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    })
    .where(eq(users.clerkId, userId));
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
  
  // You can add logic here to send payment failure notifications
}