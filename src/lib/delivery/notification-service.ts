import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import webpush from 'web-push';
import { db } from '~/server/db';
import { 
  users, 
  userNotificationPreferences, 
  pushSubscriptions,
  inAppNotifications 
} from '~/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Configure web push
webpush.setVapidDetails(
  'mailto:hello@powerpulse.ai',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Notification schemas
export const notificationSchema = z.object({
  userId: z.string(),
  type: z.enum([
    'daily_audio',
    'streak_reminder',
    'milestone_achieved',
    'new_content',
    'system',
    'social',
  ]),
  title: z.string(),
  body: z.string(),
  icon: z.string().optional(),
  badge: z.string().optional(),
  image: z.string().optional(),
  actions: z.array(z.object({
    action: z.string(),
    title: z.string(),
    icon: z.string().optional(),
  })).optional(),
  data: z.record(z.any()).optional(),
  requireInteraction: z.boolean().default(false),
  silent: z.boolean().default(false),
  tag: z.string().optional(),
});

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  expirationTime: z.number().nullable().optional(),
});

export const notificationPreferencesSchema = z.object({
  pushEnabled: z.boolean(),
  inAppEnabled: z.boolean(),
  dailyAudioNotifications: z.boolean(),
  streakReminders: z.boolean(),
  milestoneNotifications: z.boolean(),
  newContentAlerts: z.boolean(),
  socialNotifications: z.boolean(),
  quietHoursEnabled: z.boolean(),
  quietHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  quietHoursEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

type Notification = z.infer<typeof notificationSchema>;
type PushSubscription = z.infer<typeof pushSubscriptionSchema>;
type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;

// Notification service class
export class NotificationService {
  // Push notification methods
  async sendPushNotification(
    userId: string,
    notification: Notification
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user has push enabled
      const preferences = await this.getUserPreferences(userId);
      if (!preferences?.pushEnabled || !this.shouldSendNotification(notification.type, preferences)) {
        return { success: false, error: 'Push notifications disabled' };
      }

      // Check quiet hours
      if (preferences.quietHoursEnabled && this.isInQuietHours(preferences)) {
        return { success: false, error: 'In quiet hours' };
      }

      // Get user's push subscriptions
      const subscriptions = await db.query.pushSubscriptions.findMany({
        where: eq(pushSubscriptions.userId, userId),
      });

      if (subscriptions.length === 0) {
        return { success: false, error: 'No push subscriptions found' };
      }

      // Send to all subscriptions
      const results = await Promise.allSettled(
        subscriptions.map(async (sub) => {
          const pushPayload = {
            title: notification.title,
            body: notification.body,
            icon: notification.icon ?? '/icon-192x192.png',
            badge: notification.badge ?? '/badge-72x72.png',
            image: notification.image,
            actions: notification.actions,
            data: notification.data,
            requireInteraction: notification.requireInteraction,
            silent: notification.silent,
            tag: notification.tag,
          };

          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              JSON.stringify(pushPayload)
            );
            return true;
          } catch (error: any) {
            // Remove invalid subscriptions
            if (error.statusCode === 410) {
              await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
            }
            throw error;
          }
        })
      );

      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
      
      await this.logNotificationDelivery(
        userId,
        'push',
        notification.type,
        successCount > 0
      );

      return {
        success: successCount > 0,
        error: successCount === 0 ? 'All push deliveries failed' : undefined,
      };
    } catch (error) {
      console.error('Push notification error:', error);
      await this.logNotificationDelivery(userId, 'push', notification.type, false);
      return { success: false, error: 'Push notification failed' };
    }
  }

  // In-app notification methods
  async createInAppNotification(
    userId: string,
    notification: Notification
  ): Promise<{ success: boolean; notificationId?: string }> {
    try {
      // Check if user has in-app enabled
      const preferences = await this.getUserPreferences(userId);
      if (!preferences?.inAppEnabled || !this.shouldSendNotification(notification.type, preferences)) {
        return { success: false };
      }

      const [newNotification] = await db.insert(inAppNotifications).values({
        userId,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        data: notification.data,
        read: false,
        createdAt: new Date(),
      }).returning();

      return {
        success: true,
        notificationId: newNotification.id,
      };
    } catch (error) {
      console.error('In-app notification error:', error);
      return { success: false };
    }
  }

  // Combined notification delivery
  async sendNotification(
    userId: string,
    notification: Notification
  ): Promise<{ push?: boolean; inApp?: boolean }> {
    const [pushResult, inAppResult] = await Promise.allSettled([
      this.sendPushNotification(userId, notification),
      this.createInAppNotification(userId, notification),
    ]);

    return {
      push: pushResult.status === 'fulfilled' && pushResult.value.success,
      inApp: inAppResult.status === 'fulfilled' && inAppResult.value.success,
    };
  }

  // Subscription management
  async savePushSubscription(
    userId: string,
    subscription: PushSubscription
  ): Promise<{ success: boolean; subscriptionId?: string }> {
    try {
      // Check if subscription already exists
      const existing = await db.query.pushSubscriptions.findFirst({
        where: and(
          eq(pushSubscriptions.userId, userId),
          eq(pushSubscriptions.endpoint, subscription.endpoint)
        ),
      });

      if (existing) {
        // Update existing subscription
        await db.update(pushSubscriptions)
          .set({
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            updatedAt: new Date(),
          })
          .where(eq(pushSubscriptions.id, existing.id));

        return { success: true, subscriptionId: existing.id };
      }

      // Create new subscription
      const [newSub] = await db.insert(pushSubscriptions).values({
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        createdAt: new Date(),
      }).returning();

      return { success: true, subscriptionId: newSub.id };
    } catch (error) {
      console.error('Save push subscription error:', error);
      return { success: false };
    }
  }

  async removePushSubscription(
    userId: string,
    endpoint: string
  ): Promise<{ success: boolean }> {
    try {
      await db.delete(pushSubscriptions)
        .where(and(
          eq(pushSubscriptions.userId, userId),
          eq(pushSubscriptions.endpoint, endpoint)
        ));

      return { success: true };
    } catch (error) {
      console.error('Remove push subscription error:', error);
      return { success: false };
    }
  }

  // Preference management
  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<{ success: boolean }> {
    try {
      const existing = await db.query.userNotificationPreferences.findFirst({
        where: eq(userNotificationPreferences.userId, userId),
      });

      if (existing) {
        await db.update(userNotificationPreferences)
          .set({
            ...preferences,
            updatedAt: new Date(),
          })
          .where(eq(userNotificationPreferences.userId, userId));
      } else {
        await db.insert(userNotificationPreferences).values({
          userId,
          ...preferences,
          createdAt: new Date(),
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Update preferences error:', error);
      return { success: false };
    }
  }

  async getUserPreferences(
    userId: string
  ): Promise<NotificationPreferences | null> {
    try {
      const prefs = await db.query.userNotificationPreferences.findFirst({
        where: eq(userNotificationPreferences.userId, userId),
      });

      if (!prefs) return null;

      return {
        pushEnabled: prefs.pushEnabled ?? true,
        inAppEnabled: prefs.inAppEnabled ?? true,
        dailyAudioNotifications: prefs.dailyAudioNotifications ?? true,
        streakReminders: prefs.streakReminders ?? true,
        milestoneNotifications: prefs.milestoneNotifications ?? true,
        newContentAlerts: prefs.newContentAlerts ?? true,
        socialNotifications: prefs.socialNotifications ?? false,
        quietHoursEnabled: prefs.quietHoursEnabled ?? false,
        quietHoursStart: prefs.quietHoursStart ?? '22:00',
        quietHoursEnd: prefs.quietHoursEnd ?? '08:00',
      };
    } catch (error) {
      console.error('Get preferences error:', error);
      return null;
    }
  }

  // In-app notification management
  async getInAppNotifications(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<Array<any>> {
    try {
      const notifications = await db.query.inAppNotifications.findMany({
        where: eq(inAppNotifications.userId, userId),
        orderBy: [desc(inAppNotifications.createdAt)],
        limit,
        offset,
      });

      return notifications;
    } catch (error) {
      console.error('Get in-app notifications error:', error);
      return [];
    }
  }

  async markNotificationAsRead(
    userId: string,
    notificationId: string
  ): Promise<{ success: boolean }> {
    try {
      await db.update(inAppNotifications)
        .set({ read: true })
        .where(and(
          eq(inAppNotifications.id, notificationId),
          eq(inAppNotifications.userId, userId)
        ));

      return { success: true };
    } catch (error) {
      console.error('Mark as read error:', error);
      return { success: false };
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<{ success: boolean }> {
    try {
      await db.update(inAppNotifications)
        .set({ read: true })
        .where(and(
          eq(inAppNotifications.userId, userId),
          eq(inAppNotifications.read, false)
        ));

      return { success: true };
    } catch (error) {
      console.error('Mark all as read error:', error);
      return { success: false };
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const result = await db.query.inAppNotifications.findMany({
        where: and(
          eq(inAppNotifications.userId, userId),
          eq(inAppNotifications.read, false)
        ),
      });

      return result.length;
    } catch (error) {
      console.error('Get unread count error:', error);
      return 0;
    }
  }

  // Helper methods
  private shouldSendNotification(
    type: Notification['type'],
    preferences: NotificationPreferences
  ): boolean {
    switch (type) {
      case 'daily_audio':
        return preferences.dailyAudioNotifications;
      case 'streak_reminder':
        return preferences.streakReminders;
      case 'milestone_achieved':
        return preferences.milestoneNotifications;
      case 'new_content':
        return preferences.newContentAlerts;
      case 'social':
        return preferences.socialNotifications;
      case 'system':
        return true; // Always send system notifications
      default:
        return true;
    }
  }

  private isInQuietHours(preferences: NotificationPreferences): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = preferences.quietHoursStart.split(':').map(Number);
    const [endHour, endMin] = preferences.quietHoursEnd.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      // Normal case: quiet hours don't cross midnight
      return currentTime >= startTime && currentTime < endTime;
    } else {
      // Quiet hours cross midnight
      return currentTime >= startTime || currentTime < endTime;
    }
  }

  private async logNotificationDelivery(
    userId: string,
    channel: string,
    type: string,
    success: boolean
  ): Promise<void> {
    // TODO: Implement notification delivery logging to database
    console.log(`Notification delivery log: ${channel}/${type} for user ${userId} - ${success ? 'success' : 'failed'}`);
  }

  // Batch notifications
  async sendBatchNotifications(
    notifications: Array<{
      userId: string;
      notification: Notification;
    }>
  ): Promise<Array<{ userId: string; push?: boolean; inApp?: boolean }>> {
    const results = await Promise.allSettled(
      notifications.map(async ({ userId, notification }) => {
        const result = await this.sendNotification(userId, notification);
        return { userId, ...result };
      })
    );

    return results.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return { userId: '', push: false, inApp: false };
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();