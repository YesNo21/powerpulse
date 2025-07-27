import { Resend } from 'resend';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { render } from '@react-email/render';
import { db } from '~/server/db';
import { users, audioSessions, userStreaks } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { type ReactElement } from 'react';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration schema
const emailConfigSchema = z.object({
  to: z.string().email(),
  from: z.string().email().default('PowerPulse <hello@powerpulse.ai>'),
  subject: z.string(),
  template: z.any(), // React component
  data: z.record(z.any()).optional(),
});

type EmailConfig = z.infer<typeof emailConfigSchema>;

// Email template data schemas
export const dailyAudioEmailDataSchema = z.object({
  userName: z.string(),
  audioTitle: z.string(),
  audioDuration: z.number(),
  audioUrl: z.string(),
  streakCount: z.number(),
  category: z.string(),
  previewText: z.string().optional(),
  motivationalQuote: z.string().optional(),
});

export const welcomeEmailDataSchema = z.object({
  userName: z.string(),
  verificationUrl: z.string().optional(),
  onboardingUrl: z.string(),
});

export const streakMilestoneEmailDataSchema = z.object({
  userName: z.string(),
  streakCount: z.number(),
  milestone: z.number(),
  nextMilestone: z.number(),
  badgeImageUrl: z.string().optional(),
});

export const comebackEmailDataSchema = z.object({
  userName: z.string(),
  daysAway: z.number(),
  lastSessionDate: z.date(),
  motivationalMessage: z.string(),
  quickStartUrl: z.string(),
});

// Email service class
export class EmailService {
  private from = 'PowerPulse <hello@powerpulse.ai>';

  async sendEmail(config: EmailConfig): Promise<{ id: string; success: boolean }> {
    try {
      const html = render(config.template as ReactElement);
      
      const { data, error } = await resend.emails.send({
        from: config.from ?? this.from,
        to: config.to,
        subject: config.subject,
        html,
      });

      if (error) {
        console.error('Email send error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send email',
        });
      }

      return {
        id: data?.id ?? '',
        success: true,
      };
    } catch (error) {
      console.error('Email service error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Email service unavailable',
      });
    }
  }

  async sendDailyAudioEmail(
    userId: string,
    audioSessionId: string,
    template: ReactElement
  ): Promise<boolean> {
    try {
      // Fetch user and audio session data
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      const audioSession = await db.query.audioSessions.findFirst({
        where: eq(audioSessions.id, audioSessionId),
      });

      if (!user || !audioSession) {
        throw new Error('User or audio session not found');
      }

      // Get user's current streak
      const streak = await db.query.userStreaks.findFirst({
        where: eq(userStreaks.userId, userId),
      });

      const result = await this.sendEmail({
        to: user.email,
        subject: `🎧 Your Daily PowerPulse: ${audioSession.title}`,
        template,
        data: {
          userName: user.name ?? 'Friend',
          audioTitle: audioSession.title,
          audioDuration: audioSession.duration,
          audioUrl: audioSession.audioUrl,
          streakCount: streak?.currentStreak ?? 0,
          category: audioSession.category,
          previewText: audioSession.description,
        },
      });

      // Log email delivery
      await this.logEmailDelivery(userId, 'daily_audio', result.id, result.success);

      return result.success;
    } catch (error) {
      console.error('Daily audio email error:', error);
      await this.logEmailDelivery(userId, 'daily_audio', '', false);
      return false;
    }
  }

  async sendWelcomeSequence(userId: string, template: ReactElement): Promise<boolean> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new Error('User not found');
      }

      const result = await this.sendEmail({
        to: user.email,
        subject: 'Welcome to PowerPulse! 🚀 Start Your Journey',
        template,
        data: {
          userName: user.name ?? 'Friend',
          onboardingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,
          verificationUrl: user.emailVerified ? undefined : `${process.env.NEXT_PUBLIC_APP_URL}/verify-email`,
        },
      });

      await this.logEmailDelivery(userId, 'welcome', result.id, result.success);
      return result.success;
    } catch (error) {
      console.error('Welcome email error:', error);
      await this.logEmailDelivery(userId, 'welcome', '', false);
      return false;
    }
  }

  async sendStreakMilestoneEmail(
    userId: string,
    milestone: number,
    template: ReactElement
  ): Promise<boolean> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      const streak = await db.query.userStreaks.findFirst({
        where: eq(userStreaks.userId, userId),
      });

      if (!user || !streak) {
        throw new Error('User or streak not found');
      }

      const nextMilestone = this.getNextMilestone(milestone);

      const result = await this.sendEmail({
        to: user.email,
        subject: `🏆 Incredible! You've hit a ${milestone}-day streak!`,
        template,
        data: {
          userName: user.name ?? 'Friend',
          streakCount: streak.currentStreak,
          milestone,
          nextMilestone,
          badgeImageUrl: this.getMilestoneBadgeUrl(milestone),
        },
      });

      await this.logEmailDelivery(userId, 'streak_milestone', result.id, result.success);
      return result.success;
    } catch (error) {
      console.error('Streak milestone email error:', error);
      await this.logEmailDelivery(userId, 'streak_milestone', '', false);
      return false;
    }
  }

  async sendReEngagementCampaign(
    userId: string,
    daysInactive: number,
    template: ReactElement
  ): Promise<boolean> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get last session
      const lastSession = await db.query.audioSessions.findFirst({
        where: eq(audioSessions.userId, userId),
        orderBy: (sessions, { desc }) => [desc(sessions.createdAt)],
      });

      const motivationalMessage = this.getReEngagementMessage(daysInactive);

      const result = await this.sendEmail({
        to: user.email,
        subject: `${user.name}, we miss you! 🌟 Come back to PowerPulse`,
        template,
        data: {
          userName: user.name ?? 'Friend',
          daysAway: daysInactive,
          lastSessionDate: lastSession?.createdAt ?? new Date(),
          motivationalMessage,
          quickStartUrl: `${process.env.NEXT_PUBLIC_APP_URL}/quick-start`,
        },
      });

      await this.logEmailDelivery(userId, 're_engagement', result.id, result.success);
      return result.success;
    } catch (error) {
      console.error('Re-engagement email error:', error);
      await this.logEmailDelivery(userId, 're_engagement', '', false);
      return false;
    }
  }

  // Helper methods
  private async logEmailDelivery(
    userId: string,
    type: string,
    emailId: string,
    success: boolean
  ): Promise<void> {
    // TODO: Implement email delivery logging to database
    console.log(`Email delivery log: ${type} for user ${userId} - ${success ? 'success' : 'failed'}`);
  }

  private getNextMilestone(currentMilestone: number): number {
    const milestones = [3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365];
    const nextIndex = milestones.findIndex(m => m > currentMilestone);
    return nextIndex !== -1 ? milestones[nextIndex] : currentMilestone + 100;
  }

  private getMilestoneBadgeUrl(milestone: number): string {
    // Map milestones to badge images
    const badges: Record<number, string> = {
      3: '/badges/bronze-starter.png',
      7: '/badges/silver-week.png',
      14: '/badges/gold-fortnight.png',
      21: '/badges/platinum-three-weeks.png',
      30: '/badges/diamond-month.png',
      50: '/badges/emerald-fifty.png',
      75: '/badges/ruby-seventy-five.png',
      100: '/badges/legendary-century.png',
    };

    return badges[milestone] ?? '/badges/default.png';
  }

  private getReEngagementMessage(daysAway: number): string {
    if (daysAway <= 3) {
      return "Just a quick check-in! Your daily audio is waiting for you.";
    } else if (daysAway <= 7) {
      return "It's been a week! Let's get back to building that positive momentum.";
    } else if (daysAway <= 14) {
      return "Two weeks is the perfect time for a fresh start. Your journey continues!";
    } else if (daysAway <= 30) {
      return "A month away means you're ready for something new. Welcome back!";
    } else {
      return "No matter how long it's been, today is the perfect day to restart your journey.";
    }
  }

  // Batch email operations
  async sendBatchEmails(
    emails: Array<{
      userId: string;
      type: 'daily_audio' | 'welcome' | 'streak_milestone' | 're_engagement';
      data: any;
      template: ReactElement;
    }>
  ): Promise<Array<{ userId: string; success: boolean }>> {
    const results = await Promise.allSettled(
      emails.map(async (email) => {
        switch (email.type) {
          case 'daily_audio':
            return {
              userId: email.userId,
              success: await this.sendDailyAudioEmail(
                email.userId,
                email.data.audioSessionId,
                email.template
              ),
            };
          case 'welcome':
            return {
              userId: email.userId,
              success: await this.sendWelcomeSequence(email.userId, email.template),
            };
          case 'streak_milestone':
            return {
              userId: email.userId,
              success: await this.sendStreakMilestoneEmail(
                email.userId,
                email.data.milestone,
                email.template
              ),
            };
          case 're_engagement':
            return {
              userId: email.userId,
              success: await this.sendReEngagementCampaign(
                email.userId,
                email.data.daysInactive,
                email.template
              ),
            };
          default:
            return { userId: email.userId, success: false };
        }
      })
    );

    return results.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return { userId: '', success: false };
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();