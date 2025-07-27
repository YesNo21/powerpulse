import { sendGridService } from './sendgrid-service'
import { db } from '@/db'
import { users, userProfiles } from '@/db/schema'
import { eq } from 'drizzle-orm'

// Send welcome email after user completes quiz
export async function sendWelcomeEmail(userId: string) {
  try {
    // Get user details
    const [user] = await db
      .select({
        email: users.email,
        firstName: users.firstName,
        profile: userProfiles,
      })
      .from(users)
      .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
      .where(eq(users.id, userId))

    if (!user?.email) {
      console.error('No email found for user:', userId)
      return
    }

    // Send welcome email
    const result = await sendGridService.sendEmail({
      to: user.email,
      type: 'welcome',
      data: {
        name: user.firstName || 'there',
        goals: user.profile?.primaryGoals?.join(', ') || 'your goals',
      },
    })

    if (!result.success) {
      console.error('Failed to send welcome email:', result.error)
    } else {
      console.log('Welcome email sent to:', user.email)
    }
  } catch (error) {
    console.error('Error sending welcome email:', error)
  }
}

// Send payment success email
export async function sendPaymentSuccessEmail(userId: string, planName: string, amount: string) {
  try {
    const [user] = await db
      .select({ email: users.email, firstName: users.firstName })
      .from(users)
      .where(eq(users.id, userId))

    if (!user?.email) return

    await sendGridService.sendEmail({
      to: user.email,
      type: 'payment_success',
      data: {
        name: user.firstName || 'there',
        planName,
        amount,
      },
    })
  } catch (error) {
    console.error('Error sending payment success email:', error)
  }
}

// Send payment failed email
export async function sendPaymentFailedEmail(customerId: string) {
  try {
    const [user] = await db
      .select({ email: users.email, firstName: users.firstName })
      .from(users)
      .where(eq(users.stripeCustomerId, customerId))

    if (!user?.email) return

    await sendGridService.sendEmail({
      to: user.email,
      type: 'payment_failed',
      data: {
        name: user.firstName || 'there',
      },
    })
  } catch (error) {
    console.error('Error sending payment failed email:', error)
  }
}

// Send trial ending reminder
export async function sendTrialEndingEmail(userId: string, daysLeft: number) {
  try {
    const [user] = await db
      .select({ email: users.email, firstName: users.firstName })
      .from(users)
      .where(eq(users.id, userId))

    if (!user?.email) return

    await sendGridService.sendEmail({
      to: user.email,
      type: 'trial_ending',
      data: {
        name: user.firstName || 'there',
        daysLeft,
      },
    })
  } catch (error) {
    console.error('Error sending trial ending email:', error)
  }
}

// Send streak milestone email
export async function sendStreakMilestoneEmail(userId: string, days: number) {
  try {
    const [user] = await db
      .select({ email: users.email, firstName: users.firstName })
      .from(users)
      .where(eq(users.id, userId))

    if (!user?.email) return

    await sendGridService.sendEmail({
      to: user.email,
      type: 'streak_milestone',
      data: {
        name: user.firstName || 'there',
        days,
      },
    })
  } catch (error) {
    console.error('Error sending streak milestone email:', error)
  }
}

// Send achievement unlocked email
export async function sendAchievementEmail(userId: string, achievementName: string, achievementDescription: string) {
  try {
    const [user] = await db
      .select({ email: users.email, firstName: users.firstName })
      .from(users)
      .where(eq(users.id, userId))

    if (!user?.email) return

    await sendGridService.sendEmail({
      to: user.email,
      type: 'achievement_unlocked',
      data: {
        name: user.firstName || 'there',
        achievementName,
        achievementDescription,
      },
    })
  } catch (error) {
    console.error('Error sending achievement email:', error)
  }
}

// Send subscription canceled email
export async function sendSubscriptionCanceledEmail(userId: string) {
  try {
    const [user] = await db
      .select({ email: users.email, firstName: users.firstName })
      .from(users)
      .where(eq(users.id, userId))

    if (!user?.email) return

    await sendGridService.sendEmail({
      to: user.email,
      type: 'subscription_canceled',
      data: {
        name: user.firstName || 'there',
      },
    })
  } catch (error) {
    console.error('Error sending subscription canceled email:', error)
  }
}

// Send refund processed email
export async function sendRefundEmail(userId: string, amount: string) {
  try {
    const [user] = await db
      .select({ email: users.email, firstName: users.firstName })
      .from(users)
      .where(eq(users.id, userId))

    if (!user?.email) return

    await sendGridService.sendEmail({
      to: user.email,
      type: 'refund_processed',
      data: {
        name: user.firstName || 'there',
        amount,
      },
    })
  } catch (error) {
    console.error('Error sending refund email:', error)
  }
}