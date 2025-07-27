import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { emailService } from '@/lib/delivery/email-service';
import { messagingService } from '@/lib/delivery/messaging-service';
import { notificationService } from '@/lib/delivery/notification-service';
import { 
  userNotificationPreferences, 
  deliverySchedules,
  deliveryLogs,
  pushSubscriptions 
} from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { DailyAudioEmail } from '~/lib/email-templates/daily-audio';
import { WelcomeEmail } from '~/lib/email-templates/welcome';

// Input schemas
const deliveryPreferencesSchema = z.object({
  // Email preferences
  emailEnabled: z.boolean().optional(),
  emailFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  
  // Messaging preferences
  whatsappEnabled: z.boolean().optional(),
  telegramEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  telegramChatId: z.string().optional(),
  
  // Push notification preferences
  pushEnabled: z.boolean().optional(),
  inAppEnabled: z.boolean().optional(),
  
  // Content preferences
  dailyAudioNotifications: z.boolean().optional(),
  streakReminders: z.boolean().optional(),
  milestoneNotifications: z.boolean().optional(),
  newContentAlerts: z.boolean().optional(),
  socialNotifications: z.boolean().optional(),
  
  // Timing preferences
  preferredDeliveryTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  timezone: z.string().optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  quietHoursEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
});

const testNotificationSchema = z.object({
  channel: z.enum(['email', 'whatsapp', 'telegram', 'sms', 'push', 'inApp']),
  type: z.enum(['daily_audio', 'reminder', 'milestone', 'test']).default('test'),
});

const deliveryStatusSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  channel: z.enum(['email', 'whatsapp', 'telegram', 'sms', 'push', 'inApp', 'all']).optional(),
});

export const deliveryRouter = createTRPCRouter({
  // Get current delivery preferences
  getDeliveryPreferences: protectedProcedure
    .query(async ({ ctx }) => {
      const preferences = await ctx.db.query.userNotificationPreferences.findFirst({
        where: eq(userNotificationPreferences.userId, ctx.session.user.id),
      });

      const schedule = await ctx.db.query.deliverySchedules.findFirst({
        where: and(
          eq(deliverySchedules.userId, ctx.session.user.id),
          eq(deliverySchedules.isActive, true)
        ),
      });

      return {
        preferences: preferences ?? {
          emailEnabled: true,
          emailFrequency: 'daily',
          whatsappEnabled: false,
          telegramEnabled: false,
          smsEnabled: false,
          pushEnabled: true,
          inAppEnabled: true,
          dailyAudioNotifications: true,
          streakReminders: true,
          milestoneNotifications: true,
          newContentAlerts: true,
          socialNotifications: false,
          preferredDeliveryTime: '08:00',
          timezone: 'America/New_York',
          quietHoursEnabled: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
        },
        schedule: schedule ?? null,
      };
    }),

  // Update delivery preferences
  updateDeliveryPreferences: protectedProcedure
    .input(deliveryPreferencesSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Update or create preferences
      const existing = await ctx.db.query.userNotificationPreferences.findFirst({
        where: eq(userNotificationPreferences.userId, userId),
      });

      if (existing) {
        await ctx.db.update(userNotificationPreferences)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(userNotificationPreferences.userId, userId));
      } else {
        await ctx.db.insert(userNotificationPreferences).values({
          userId,
          ...input,
          createdAt: new Date(),
        });
      }

      // Update delivery schedule if time or timezone changed
      if (input.preferredDeliveryTime || input.timezone) {
        const existingSchedule = await ctx.db.query.deliverySchedules.findFirst({
          where: and(
            eq(deliverySchedules.userId, userId),
            eq(deliverySchedules.isActive, true)
          ),
        });

        if (existingSchedule) {
          await ctx.db.update(deliverySchedules)
            .set({
              scheduledTime: input.preferredDeliveryTime ?? existingSchedule.scheduledTime,
              timezone: input.timezone ?? existingSchedule.timezone,
              updatedAt: new Date(),
            })
            .where(eq(deliverySchedules.id, existingSchedule.id));
        } else {
          await ctx.db.insert(deliverySchedules).values({
            userId,
            scheduledTime: input.preferredDeliveryTime ?? '08:00',
            timezone: input.timezone ?? 'America/New_York',
            isActive: true,
            createdAt: new Date(),
          });
        }
      }

      // Update notification service preferences
      await notificationService.updateNotificationPreferences(userId, input);

      return { success: true };
    }),

  // Send test notification
  sendTestNotification: protectedProcedure
    .input(testNotificationSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const user = ctx.session.user;

      try {
        switch (input.channel) {
          case 'email':
            const emailResult = await emailService.sendEmail({
              to: user.email!,
              subject: 'Test Notification from PowerPulse',
              template: <WelcomeEmail userName={user.name ?? 'Friend'} onboardingUrl="" />,
            });
            return { success: emailResult.success };

          case 'whatsapp':
          case 'telegram':
          case 'sms':
            const messageResult = await messagingService.sendDailyAudioToAllChannels(
              userId,
              'test-audio-id'
            );
            return { 
              success: messageResult[input.channel as keyof typeof messageResult] ?? false 
            };

          case 'push':
          case 'inApp':
            const notificationResult = await notificationService.sendNotification(userId, {
              userId,
              type: 'system',
              title: 'Test Notification',
              body: 'This is a test notification from PowerPulse.',
              icon: '/icon-192x192.png',
              requireInteraction: false,
            });
            return { 
              success: notificationResult[input.channel as keyof typeof notificationResult] ?? false 
            };

          default:
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid notification channel',
            });
        }
      } catch (error) {
        console.error('Test notification error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send test notification',
        });
      }
    }),

  // Get delivery status and logs
  getDeliveryStatus: protectedProcedure
    .input(deliveryStatusSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Get delivery logs
      const logs = await ctx.db.query.deliveryLogs.findMany({
        where: and(
          eq(deliveryLogs.userId, userId),
          input.channel && input.channel !== 'all' 
            ? eq(deliveryLogs.channel, input.channel)
            : undefined,
          input.startDate
            ? and(
                input.startDate ? eq(deliveryLogs.createdAt, input.startDate) : undefined,
                input.endDate ? eq(deliveryLogs.createdAt, input.endDate) : undefined
              )
            : undefined
        ),
        orderBy: [desc(deliveryLogs.createdAt)],
        limit: 100,
      });

      // Get current schedule
      const schedule = await ctx.db.query.deliverySchedules.findFirst({
        where: and(
          eq(deliverySchedules.userId, userId),
          eq(deliverySchedules.isActive, true)
        ),
      });

      // Calculate delivery stats
      const stats = {
        totalDeliveries: logs.length,
        successfulDeliveries: logs.filter(log => log.status === 'delivered').length,
        failedDeliveries: logs.filter(log => log.status === 'failed').length,
        pendingDeliveries: logs.filter(log => log.status === 'pending').length,
        deliveryRate: logs.length > 0 
          ? (logs.filter(log => log.status === 'delivered').length / logs.length) * 100 
          : 0,
      };

      return {
        logs,
        schedule,
        stats,
      };
    }),

  // Pause delivery
  pauseDelivery: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      // Deactivate current schedule
      await ctx.db.update(deliverySchedules)
        .set({
          isActive: false,
          pausedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(deliverySchedules.userId, userId),
          eq(deliverySchedules.isActive, true)
        ));

      // Update preferences to disable all channels temporarily
      await ctx.db.update(userNotificationPreferences)
        .set({
          emailEnabled: false,
          whatsappEnabled: false,
          telegramEnabled: false,
          smsEnabled: false,
          pushEnabled: false,
          updatedAt: new Date(),
        })
        .where(eq(userNotificationPreferences.userId, userId));

      // Log the pause action
      await ctx.db.insert(deliveryLogs).values({
        userId,
        channel: 'all',
        type: 'system',
        status: 'paused',
        message: 'User paused all deliveries',
        createdAt: new Date(),
      });

      return { success: true, message: 'Delivery paused successfully' };
    }),

  // Resume delivery
  resumeDelivery: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      // Find the most recent paused schedule
      const pausedSchedule = await ctx.db.query.deliverySchedules.findFirst({
        where: and(
          eq(deliverySchedules.userId, userId),
          eq(deliverySchedules.isActive, false)
        ),
        orderBy: [desc(deliverySchedules.pausedAt)],
      });

      if (pausedSchedule) {
        // Reactivate the schedule
        await ctx.db.update(deliverySchedules)
          .set({
            isActive: true,
            pausedAt: null,
            updatedAt: new Date(),
          })
          .where(eq(deliverySchedules.id, pausedSchedule.id));
      } else {
        // Create a new schedule with default settings
        await ctx.db.insert(deliverySchedules).values({
          userId,
          scheduledTime: '08:00',
          timezone: 'America/New_York',
          isActive: true,
          createdAt: new Date(),
        });
      }

      // Re-enable preferred channels (we'll enable email and push by default)
      await ctx.db.update(userNotificationPreferences)
        .set({
          emailEnabled: true,
          pushEnabled: true,
          updatedAt: new Date(),
        })
        .where(eq(userNotificationPreferences.userId, userId));

      // Log the resume action
      await ctx.db.insert(deliveryLogs).values({
        userId,
        channel: 'all',
        type: 'system',
        status: 'resumed',
        message: 'User resumed deliveries',
        createdAt: new Date(),
      });

      return { success: true, message: 'Delivery resumed successfully' };
    }),

  // Get push subscription status
  getPushSubscriptionStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      const subscriptions = await ctx.db.query.pushSubscriptions.findMany({
        where: eq(pushSubscriptions.userId, userId),
      });

      return {
        hasSubscriptions: subscriptions.length > 0,
        subscriptionCount: subscriptions.length,
        subscriptions: subscriptions.map(sub => ({
          id: sub.id,
          endpoint: sub.endpoint,
          createdAt: sub.createdAt,
        })),
      };
    }),

  // Save push subscription
  savePushSubscription: protectedProcedure
    .input(z.object({
      subscription: z.object({
        endpoint: z.string(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await notificationService.savePushSubscription(
        ctx.session.user.id,
        input.subscription
      );

      if (!result.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save push subscription',
        });
      }

      return result;
    }),

  // Remove push subscription
  removePushSubscription: protectedProcedure
    .input(z.object({
      endpoint: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await notificationService.removePushSubscription(
        ctx.session.user.id,
        input.endpoint
      );

      if (!result.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove push subscription',
        });
      }

      return result;
    }),

  // Get in-app notifications
  getInAppNotifications: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const notifications = await notificationService.getInAppNotifications(
        ctx.session.user.id,
        input.limit,
        input.offset
      );

      const unreadCount = await notificationService.getUnreadCount(ctx.session.user.id);

      return {
        notifications,
        unreadCount,
      };
    }),

  // Mark notification as read
  markNotificationAsRead: protectedProcedure
    .input(z.object({
      notificationId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await notificationService.markNotificationAsRead(
        ctx.session.user.id,
        input.notificationId
      );

      if (!result.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark notification as read',
        });
      }

      return result;
    }),

  // Mark all notifications as read
  markAllNotificationsAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      const result = await notificationService.markAllNotificationsAsRead(
        ctx.session.user.id
      );

      if (!result.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark all notifications as read',
        });
      }

      return result;
    }),
});