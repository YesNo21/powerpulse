import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { db } from '@/db'
import { users, subscriptions } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
})

export const subscriptionRouter = createTRPCRouter({
  // Get subscription status
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    // Get user with subscription data
    const user = await db.query.users.findFirst({
      where: eq(users.id, ctx.userId),
    })

    if (!user?.stripeSubscriptionId) {
      return {
        status: null,
        subscriptionId: null,
      }
    }

    try {
      // Get subscription from Stripe
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId, {
        expand: ['default_payment_method', 'latest_invoice'],
      })

      // Get recent invoices
      const invoices = await stripe.invoices.list({
        subscription: subscription.id,
        limit: 5,
      })

      // Extract payment method details
      const paymentMethod = subscription.default_payment_method as Stripe.PaymentMethod | null

      return {
        status: subscription.status,
        subscriptionId: subscription.id,
        priceId: subscription.items.data[0]?.price.id,
        amount: subscription.items.data[0]?.price.unit_amount,
        interval: subscription.items.data[0]?.price.recurring?.interval,
        currentPeriodEnd: subscription.current_period_end * 1000,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? subscription.canceled_at * 1000 : null,
        trialEnd: subscription.trial_end ? subscription.trial_end * 1000 : null,
        refundEligibleUntil: user.refundEligibleUntil?.toISOString(),
        paymentMethod: paymentMethod ? {
          id: paymentMethod.id,
          brand: paymentMethod.card?.brand,
          last4: paymentMethod.card?.last4,
          expMonth: paymentMethod.card?.exp_month,
          expYear: paymentMethod.card?.exp_year,
        } : null,
        invoices: invoices.data.map(invoice => ({
          id: invoice.id,
          amount: invoice.amount_paid,
          status: invoice.status,
          created: invoice.created,
          invoicePdf: invoice.invoice_pdf,
        })),
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
      
      // Return cached data from database if Stripe fails
      return {
        status: user.subscriptionStatus,
        subscriptionId: user.stripeSubscriptionId,
        priceId: user.subscriptionPriceId,
        currentPeriodEnd: user.subscriptionCurrentPeriodEnd?.getTime(),
        refundEligibleUntil: user.refundEligibleUntil?.toISOString(),
      }
    }
  }),

  // Create customer portal session
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, ctx.userId),
    })

    if (!user?.stripeCustomerId) {
      throw new Error('No customer ID found')
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    })

    return { url: session.url }
  }),

  // Cancel subscription
  cancelSubscription: protectedProcedure
    .input(
      z.object({
        reason: z.string().optional(),
        feedback: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.id, ctx.userId),
      })

      if (!user?.stripeSubscriptionId) {
        throw new Error('No active subscription found')
      }

      // Cancel at period end (not immediately)
      const subscription = await stripe.subscriptions.update(
        user.stripeSubscriptionId,
        {
          cancel_at_period_end: true,
          metadata: {
            cancel_reason: input.reason,
            cancel_feedback: input.feedback,
          },
        }
      )

      // Update database
      await db
        .update(users)
        .set({
          subscriptionStatus: 'canceled',
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.userId))

      return {
        success: true,
        cancelAt: subscription.cancel_at ? subscription.cancel_at * 1000 : null,
      }
    }),

  // Resume canceled subscription
  resumeSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, ctx.userId),
    })

    if (!user?.stripeSubscriptionId) {
      throw new Error('No subscription found')
    }

    // Resume subscription
    const subscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      {
        cancel_at_period_end: false,
      }
    )

    // Update database
    await db
      .update(users)
      .set({
        subscriptionStatus: 'active',
        updatedAt: new Date(),
      })
      .where(eq(users.id, ctx.userId))

    return {
      success: true,
      status: subscription.status,
    }
  }),

  // Update payment method
  updatePaymentMethod: protectedProcedure
    .input(
      z.object({
        paymentMethodId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.id, ctx.userId),
      })

      if (!user?.stripeCustomerId) {
        throw new Error('No customer found')
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(input.paymentMethodId, {
        customer: user.stripeCustomerId,
      })

      // Set as default payment method
      await stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: input.paymentMethodId,
        },
      })

      // Update subscription default payment method if exists
      if (user.stripeSubscriptionId) {
        await stripe.subscriptions.update(user.stripeSubscriptionId, {
          default_payment_method: input.paymentMethodId,
        })
      }

      return { success: true }
    }),

  // Check refund eligibility
  checkRefundEligibility: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, ctx.userId),
    })

    if (!user?.refundEligibleUntil) {
      return { eligible: false }
    }

    const eligible = new Date(user.refundEligibleUntil) > new Date()

    return {
      eligible,
      eligibleUntil: user.refundEligibleUntil.toISOString(),
      daysSinceSubscription: Math.floor(
        (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }
  }),

  // Request refund
  requestRefund: protectedProcedure
    .input(
      z.object({
        reason: z.string(),
        feedback: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.id, ctx.userId),
      })

      if (!user?.stripeCustomerId || !user.refundEligibleUntil) {
        throw new Error('Not eligible for refund')
      }

      if (new Date(user.refundEligibleUntil) < new Date()) {
        throw new Error('Refund period has expired')
      }

      // Get the most recent charge
      const charges = await stripe.charges.list({
        customer: user.stripeCustomerId,
        limit: 1,
      })

      if (charges.data.length === 0) {
        throw new Error('No charges found')
      }

      // Create refund
      const refund = await stripe.refunds.create({
        charge: charges.data[0].id,
        reason: 'requested_by_customer',
        metadata: {
          user_reason: input.reason,
          user_feedback: input.feedback,
        },
      })

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100,
      }
    }),
})