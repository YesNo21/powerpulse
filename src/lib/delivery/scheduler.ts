import { CronJob } from 'cron';
import { z } from 'zod';
import { db } from '~/server/db';
import { 
  users, 
  userNotificationPreferences, 
  deliverySchedules, 
  deliveryQueue,
  deliveryLogs,
  audioSessions 
} from '~/server/db/schema';
import { eq, and, lt, isNull, inArray } from 'drizzle-orm';
import { emailService } from './email-service';
import { messagingService } from './messaging-service';
import { notificationService } from './notification-service';
import { DailyAudioEmail } from '~/lib/email-templates/daily-audio';
import { StreakMilestoneEmail } from '~/lib/email-templates/streak-milestone';
import { ComebackEmail } from '~/lib/email-templates/comeback';
import moment from 'moment-timezone';

// Queue item schema
const queueItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['daily_audio', 'streak_milestone', 're_engagement', 'welcome']),
  scheduledFor: z.date(),
  timezone: z.string(),
  channels: z.array(z.enum(['email', 'whatsapp', 'telegram', 'sms', 'push', 'inApp'])),
  data: z.record(z.any()),
  attempts: z.number().default(0),
  maxAttempts: z.number().default(3),
  status: z.enum(['pending', 'processing', 'delivered', 'failed']),
});

type QueueItem = z.infer<typeof queueItemSchema>;

// Delivery scheduler class
export class DeliveryScheduler {
  private jobs: Map<string, CronJob> = new Map();
  private processingQueue: boolean = false;

  constructor() {
    // Initialize main scheduler job (runs every minute)
    this.initializeScheduler();
  }

  private initializeScheduler() {
    // Main scheduler - runs every minute to check for deliveries
    const mainJob = new CronJob('* * * * *', async () => {
      await this.checkAndQueueDeliveries();
      await this.processDeliveryQueue();
    });

    // Cleanup job - runs daily at 3 AM to clean old logs
    const cleanupJob = new CronJob('0 3 * * *', async () => {
      await this.cleanupOldLogs();
    });

    // Re-engagement check - runs daily at 10 AM
    const reEngagementJob = new CronJob('0 10 * * *', async () => {
      await this.checkForInactiveUsers();
    });

    this.jobs.set('main', mainJob);
    this.jobs.set('cleanup', cleanupJob);
    this.jobs.set('reEngagement', reEngagementJob);

    // Start all jobs
    this.jobs.forEach(job => job.start());
  }

  // Check for users who need deliveries and add to queue
  private async checkAndQueueDeliveries() {
    try {
      const now = moment();

      // Get all active delivery schedules
      const schedules = await db.query.deliverySchedules.findMany({
        where: eq(deliverySchedules.isActive, true),
      });

      for (const schedule of schedules) {
        // Convert scheduled time to user's timezone
        const userTime = moment.tz(schedule.timezone);
        const scheduledTime = moment.tz(
          `${userTime.format('YYYY-MM-DD')} ${schedule.scheduledTime}`,
          'YYYY-MM-DD HH:mm',
          schedule.timezone
        );

        // Check if it's time to deliver (within 1 minute window)
        if (Math.abs(now.diff(scheduledTime, 'minutes')) <= 1) {
          // Check if already queued for today
          const existingQueue = await db.query.deliveryQueue.findFirst({
            where: and(
              eq(deliveryQueue.userId, schedule.userId),
              eq(deliveryQueue.type, 'daily_audio'),
              eq(deliveryQueue.status, 'pending')
            ),
          });

          if (!existingQueue) {
            await this.queueDailyDelivery(schedule.userId, schedule.timezone);
          }
        }
      }
    } catch (error) {
      console.error('Error checking deliveries:', error);
    }
  }

  // Queue daily audio delivery
  private async queueDailyDelivery(userId: string, timezone: string) {
    try {
      // Get user preferences
      const preferences = await db.query.userNotificationPreferences.findFirst({
        where: eq(userNotificationPreferences.userId, userId),
      });

      if (!preferences) return;

      // Determine enabled channels
      const channels: string[] = [];
      if (preferences.emailEnabled) channels.push('email');
      if (preferences.whatsappEnabled) channels.push('whatsapp');
      if (preferences.telegramEnabled) channels.push('telegram');
      if (preferences.smsEnabled) channels.push('sms');
      if (preferences.pushEnabled) channels.push('push');
      if (preferences.inAppEnabled) channels.push('inApp');

      if (channels.length === 0) return;

      // Get today's audio session for the user
      const audioSession = await this.getTodaysAudioSession(userId);
      if (!audioSession) return;

      // Add to queue
      await db.insert(deliveryQueue).values({
        userId,
        type: 'daily_audio',
        scheduledFor: new Date(),
        timezone,
        channels,
        data: {
          audioSessionId: audioSession.id,
        },
        attempts: 0,
        maxAttempts: 3,
        status: 'pending',
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error queueing daily delivery:', error);
    }
  }

  // Process delivery queue
  private async processDeliveryQueue() {
    if (this.processingQueue) return;
    this.processingQueue = true;

    try {
      // Get pending items from queue
      const queueItems = await db.query.deliveryQueue.findMany({
        where: and(
          eq(deliveryQueue.status, 'pending'),
          lt(deliveryQueue.attempts, deliveryQueue.maxAttempts)
        ),
        limit: 10, // Process 10 at a time
      });

      for (const item of queueItems) {
        await this.processQueueItem(item);
      }
    } catch (error) {
      console.error('Error processing queue:', error);
    } finally {
      this.processingQueue = false;
    }
  }

  // Process individual queue item
  private async processQueueItem(item: any) {
    try {
      // Update status to processing
      await db.update(deliveryQueue)
        .set({ 
          status: 'processing',
          attempts: item.attempts + 1,
          updatedAt: new Date(),
        })
        .where(eq(deliveryQueue.id, item.id));

      const results: Record<string, boolean> = {};

      // Process each channel
      for (const channel of item.channels) {
        try {
          switch (channel) {
            case 'email':
              results.email = await this.sendEmailDelivery(item);
              break;
            case 'whatsapp':
            case 'telegram':
            case 'sms':
              results[channel] = await this.sendMessagingDelivery(item, channel);
              break;
            case 'push':
            case 'inApp':
              results[channel] = await this.sendNotificationDelivery(item, channel);
              break;
          }
        } catch (error) {
          console.error(`Error sending to ${channel}:`, error);
          results[channel] = false;
        }
      }

      // Check if any channel succeeded
      const anySuccess = Object.values(results).some(r => r);

      // Update queue status
      await db.update(deliveryQueue)
        .set({
          status: anySuccess ? 'delivered' : 'failed',
          deliveryResults: results,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(deliveryQueue.id, item.id));

      // Log delivery results
      for (const [channel, success] of Object.entries(results)) {
        await db.insert(deliveryLogs).values({
          userId: item.userId,
          channel,
          type: item.type,
          status: success ? 'delivered' : 'failed',
          metadata: {
            queueId: item.id,
            attempts: item.attempts,
          },
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error processing queue item:', error);
      
      // Mark as failed if max attempts reached
      if (item.attempts + 1 >= item.maxAttempts) {
        await db.update(deliveryQueue)
          .set({
            status: 'failed',
            updatedAt: new Date(),
          })
          .where(eq(deliveryQueue.id, item.id));
      }
    }
  }

  // Send email delivery
  private async sendEmailDelivery(item: any): Promise<boolean> {
    try {
      switch (item.type) {
        case 'daily_audio':
          return await emailService.sendDailyAudioEmail(
            item.userId,
            item.data.audioSessionId,
            <DailyAudioEmail {...item.data} />
          );
        case 'streak_milestone':
          return await emailService.sendStreakMilestoneEmail(
            item.userId,
            item.data.milestone,
            <StreakMilestoneEmail {...item.data} />
          );
        case 're_engagement':
          return await emailService.sendReEngagementCampaign(
            item.userId,
            item.data.daysInactive,
            <ComebackEmail {...item.data} />
          );
        default:
          return false;
      }
    } catch (error) {
      console.error('Email delivery error:', error);
      return false;
    }
  }

  // Send messaging delivery
  private async sendMessagingDelivery(
    item: any,
    channel: 'whatsapp' | 'telegram' | 'sms'
  ): Promise<boolean> {
    try {
      if (item.type === 'daily_audio') {
        const results = await messagingService.sendDailyAudioToAllChannels(
          item.userId,
          item.data.audioSessionId
        );
        return results[channel] ?? false;
      }
      return false;
    } catch (error) {
      console.error('Messaging delivery error:', error);
      return false;
    }
  }

  // Send notification delivery
  private async sendNotificationDelivery(
    item: any,
    channel: 'push' | 'inApp'
  ): Promise<boolean> {
    try {
      const notification = {
        userId: item.userId,
        type: item.type as any,
        title: this.getNotificationTitle(item),
        body: this.getNotificationBody(item),
        data: item.data,
      };

      const results = await notificationService.sendNotification(
        item.userId,
        notification
      );
      
      return results[channel] ?? false;
    } catch (error) {
      console.error('Notification delivery error:', error);
      return false;
    }
  }

  // Check for inactive users
  private async checkForInactiveUsers() {
    try {
      const inactivityThresholds = [3, 7, 14, 30]; // Days

      for (const days of inactivityThresholds) {
        const cutoffDate = moment().subtract(days, 'days').toDate();

        // Find users who haven't had a session in X days
        const inactiveUsers = await db.query.users.findMany({
          where: and(
            lt(users.lastActiveAt, cutoffDate),
            isNull(users.deletedAt)
          ),
        });

        for (const user of inactiveUsers) {
          // Check if we've already sent a re-engagement for this threshold
          const recentReEngagement = await db.query.deliveryLogs.findFirst({
            where: and(
              eq(deliveryLogs.userId, user.id),
              eq(deliveryLogs.type, 're_engagement'),
              eq(deliveryLogs.metadata.daysInactive, days)
            ),
            orderBy: (logs, { desc }) => [desc(logs.createdAt)],
          });

          if (!recentReEngagement || 
              moment().diff(recentReEngagement.createdAt, 'days') > 7) {
            // Queue re-engagement campaign
            await db.insert(deliveryQueue).values({
              userId: user.id,
              type: 're_engagement',
              scheduledFor: new Date(),
              timezone: 'America/New_York', // Default, should get from user prefs
              channels: ['email', 'push'],
              data: { daysInactive: days },
              attempts: 0,
              maxAttempts: 1,
              status: 'pending',
              createdAt: new Date(),
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking inactive users:', error);
    }
  }

  // Cleanup old logs
  private async cleanupOldLogs() {
    try {
      const cutoffDate = moment().subtract(90, 'days').toDate();

      // Delete old delivery logs
      await db.delete(deliveryLogs)
        .where(lt(deliveryLogs.createdAt, cutoffDate));

      // Delete old completed queue items
      await db.delete(deliveryQueue)
        .where(and(
          inArray(deliveryQueue.status, ['delivered', 'failed']),
          lt(deliveryQueue.completedAt, cutoffDate)
        ));
    } catch (error) {
      console.error('Error cleaning up logs:', error);
    }
  }

  // Helper methods
  private async getTodaysAudioSession(userId: string): Promise<any | null> {
    // This should be implemented based on your audio selection logic
    // For now, return a mock session
    const sessions = await db.query.audioSessions.findMany({
      where: eq(audioSessions.isActive, true),
      limit: 1,
    });

    return sessions[0] ?? null;
  }

  private getNotificationTitle(item: any): string {
    switch (item.type) {
      case 'daily_audio':
        return '🎧 Your Daily PowerPulse is Ready!';
      case 'streak_milestone':
        return `🏆 ${item.data.milestone} Day Streak!`;
      case 're_engagement':
        return 'We miss you! 🌟';
      default:
        return 'PowerPulse Notification';
    }
  }

  private getNotificationBody(item: any): string {
    switch (item.type) {
      case 'daily_audio':
        return 'Your personalized audio session is waiting. Tap to listen now!';
      case 'streak_milestone':
        return `Incredible achievement! You've maintained a ${item.data.milestone} day streak.`;
      case 're_engagement':
        return `It's been ${item.data.daysInactive} days. Ready to get back on track?`;
      default:
        return 'You have a new update from PowerPulse.';
    }
  }

  // Control methods
  start() {
    this.jobs.forEach(job => job.start());
    console.log('Delivery scheduler started');
  }

  stop() {
    this.jobs.forEach(job => job.stop());
    console.log('Delivery scheduler stopped');
  }

  // Manual trigger methods for testing
  async triggerDailyDelivery(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) throw new Error('User not found');

    await this.queueDailyDelivery(userId, 'America/New_York');
    await this.processDeliveryQueue();
  }

  async triggerReEngagement(userId: string, daysInactive: number) {
    await db.insert(deliveryQueue).values({
      userId,
      type: 're_engagement',
      scheduledFor: new Date(),
      timezone: 'America/New_York',
      channels: ['email'],
      data: { daysInactive },
      attempts: 0,
      maxAttempts: 1,
      status: 'pending',
      createdAt: new Date(),
    });

    await this.processDeliveryQueue();
  }
}

// Export singleton instance
export const deliveryScheduler = new DeliveryScheduler();