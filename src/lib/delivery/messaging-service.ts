import { Twilio } from 'twilio';
import { TelegramBot } from 'node-telegram-bot-api';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { db } from '~/server/db';
import { users, userNotificationPreferences, audioSessions } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

// Initialize Twilio client
const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

// Initialize Telegram bot
const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, {
  polling: false, // We'll use webhooks in production
});

// Message schemas
export const messageContentSchema = z.object({
  userId: z.string(),
  type: z.enum(['daily_audio', 'reminder', 'milestone', 'custom']),
  title: z.string(),
  body: z.string(),
  mediaUrl: z.string().optional(),
  buttons: z.array(z.object({
    text: z.string(),
    url: z.string(),
  })).optional(),
});

export const whatsAppTemplateSchema = z.object({
  templateName: z.string(),
  language: z.string().default('en'),
  components: z.array(z.object({
    type: z.enum(['header', 'body', 'button']),
    parameters: z.array(z.object({
      type: z.enum(['text', 'image', 'document', 'video']),
      text: z.string().optional(),
      image: z.object({
        link: z.string(),
      }).optional(),
    })),
  })).optional(),
});

type MessageContent = z.infer<typeof messageContentSchema>;
type WhatsAppTemplate = z.infer<typeof whatsAppTemplateSchema>;

// Platform-specific formatters
class MessageFormatter {
  static formatForWhatsApp(content: MessageContent): string {
    let message = `*${content.title}*\n\n${content.body}`;
    
    if (content.buttons && content.buttons.length > 0) {
      message += '\n\n';
      content.buttons.forEach((button, index) => {
        message += `${index + 1}. ${button.text}: ${button.url}\n`;
      });
    }
    
    return message;
  }

  static formatForTelegram(content: MessageContent): {
    text: string;
    parse_mode: string;
    reply_markup?: any;
  } {
    const text = `*${content.title}*\n\n${content.body}`;
    
    const reply_markup = content.buttons && content.buttons.length > 0 ? {
      inline_keyboard: [
        content.buttons.map(button => ({
          text: button.text,
          url: button.url,
        })),
      ],
    } : undefined;
    
    return {
      text,
      parse_mode: 'Markdown',
      reply_markup,
    };
  }

  static formatForSMS(content: MessageContent): string {
    let message = `${content.title}\n\n${content.body}`;
    
    if (content.buttons && content.buttons.length > 0) {
      const primaryButton = content.buttons[0];
      message += `\n\n${primaryButton.text}: ${primaryButton.url}`;
    }
    
    // SMS has character limits, truncate if necessary
    if (message.length > 1600) {
      message = message.substring(0, 1597) + '...';
    }
    
    return message;
  }
}

// Messaging service class
export class MessagingService {
  // WhatsApp methods
  async sendWhatsAppMessage(
    phoneNumber: string,
    content: MessageContent
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      const formattedMessage = MessageFormatter.formatForWhatsApp(content);
      
      const message = await twilioClient.messages.create({
        body: formattedMessage,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${phoneNumber}`,
        mediaUrl: content.mediaUrl ? [content.mediaUrl] : undefined,
      });

      await this.logMessageDelivery(
        content.userId,
        'whatsapp',
        message.sid,
        'sent'
      );

      return {
        success: true,
        messageId: message.sid,
      };
    } catch (error) {
      console.error('WhatsApp send error:', error);
      await this.logMessageDelivery(
        content.userId,
        'whatsapp',
        '',
        'failed'
      );
      return { success: false };
    }
  }

  async sendWhatsAppTemplate(
    phoneNumber: string,
    userId: string,
    template: WhatsAppTemplate
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      const message = await twilioClient.messages.create({
        contentSid: template.templateName,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${phoneNumber}`,
        contentVariables: JSON.stringify(template.components),
      });

      await this.logMessageDelivery(
        userId,
        'whatsapp_template',
        message.sid,
        'sent'
      );

      return {
        success: true,
        messageId: message.sid,
      };
    } catch (error) {
      console.error('WhatsApp template error:', error);
      await this.logMessageDelivery(
        userId,
        'whatsapp_template',
        '',
        'failed'
      );
      return { success: false };
    }
  }

  // Telegram methods
  async sendTelegramMessage(
    chatId: string,
    content: MessageContent
  ): Promise<{ success: boolean; messageId?: number }> {
    try {
      const formatted = MessageFormatter.formatForTelegram(content);
      
      let message;
      if (content.mediaUrl) {
        // Send photo with caption
        message = await telegramBot.sendPhoto(chatId, content.mediaUrl, {
          caption: formatted.text,
          parse_mode: formatted.parse_mode,
          reply_markup: formatted.reply_markup,
        });
      } else {
        // Send text message
        message = await telegramBot.sendMessage(chatId, formatted.text, {
          parse_mode: formatted.parse_mode,
          reply_markup: formatted.reply_markup,
        });
      }

      await this.logMessageDelivery(
        content.userId,
        'telegram',
        message.message_id.toString(),
        'sent'
      );

      return {
        success: true,
        messageId: message.message_id,
      };
    } catch (error) {
      console.error('Telegram send error:', error);
      await this.logMessageDelivery(
        content.userId,
        'telegram',
        '',
        'failed'
      );
      return { success: false };
    }
  }

  // SMS methods
  async sendSMS(
    phoneNumber: string,
    content: MessageContent
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      const formattedMessage = MessageFormatter.formatForSMS(content);
      
      const message = await twilioClient.messages.create({
        body: formattedMessage,
        from: process.env.TWILIO_SMS_NUMBER,
        to: phoneNumber,
      });

      await this.logMessageDelivery(
        content.userId,
        'sms',
        message.sid,
        'sent'
      );

      return {
        success: true,
        messageId: message.sid,
      };
    } catch (error) {
      console.error('SMS send error:', error);
      await this.logMessageDelivery(
        content.userId,
        'sms',
        '',
        'failed'
      );
      return { success: false };
    }
  }

  // Daily audio delivery methods
  async sendDailyAudioToAllChannels(
    userId: string,
    audioSessionId: string
  ): Promise<{ whatsapp?: boolean; telegram?: boolean; sms?: boolean }> {
    try {
      // Get user preferences and contact info
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      const preferences = await db.query.userNotificationPreferences.findFirst({
        where: eq(userNotificationPreferences.userId, userId),
      });

      const audioSession = await db.query.audioSessions.findFirst({
        where: eq(audioSessions.id, audioSessionId),
      });

      if (!user || !audioSession) {
        throw new Error('User or audio session not found');
      }

      const content: MessageContent = {
        userId,
        type: 'daily_audio',
        title: `🎧 Daily PowerPulse: ${audioSession.title}`,
        body: `${audioSession.description}\n\nDuration: ${Math.ceil(audioSession.duration / 60)} minutes\nCategory: ${audioSession.category}`,
        mediaUrl: audioSession.thumbnailUrl,
        buttons: [
          {
            text: 'Listen Now',
            url: `${process.env.NEXT_PUBLIC_APP_URL}/audio/${audioSessionId}`,
          },
          {
            text: 'View Progress',
            url: `${process.env.NEXT_PUBLIC_APP_URL}/progress`,
          },
        ],
      };

      const results: { whatsapp?: boolean; telegram?: boolean; sms?: boolean } = {};

      // Send to enabled channels
      if (preferences?.whatsappEnabled && user.phoneNumber) {
        const whatsappResult = await this.sendWhatsAppMessage(user.phoneNumber, content);
        results.whatsapp = whatsappResult.success;
      }

      if (preferences?.telegramEnabled && preferences.telegramChatId) {
        const telegramResult = await this.sendTelegramMessage(
          preferences.telegramChatId,
          content
        );
        results.telegram = telegramResult.success;
      }

      if (preferences?.smsEnabled && user.phoneNumber) {
        const smsResult = await this.sendSMS(user.phoneNumber, content);
        results.sms = smsResult.success;
      }

      return results;
    } catch (error) {
      console.error('Multi-channel delivery error:', error);
      return {};
    }
  }

  // Webhook handlers for incoming messages
  async handleWhatsAppWebhook(body: any): Promise<void> {
    try {
      const messages = body.entry?.[0]?.changes?.[0]?.value?.messages;
      if (!messages || messages.length === 0) return;

      for (const message of messages) {
        const from = message.from;
        const text = message.text?.body;

        // Handle common commands
        if (text?.toLowerCase() === 'stop') {
          await this.handleUnsubscribe(from, 'whatsapp');
        } else if (text?.toLowerCase() === 'start') {
          await this.handleResubscribe(from, 'whatsapp');
        }
      }
    } catch (error) {
      console.error('WhatsApp webhook error:', error);
    }
  }

  async handleTelegramWebhook(update: any): Promise<void> {
    try {
      if (update.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text;

        // Handle commands
        if (text === '/stop') {
          await this.handleUnsubscribe(chatId.toString(), 'telegram');
          await telegramBot.sendMessage(
            chatId,
            'You have been unsubscribed from daily audio messages.'
          );
        } else if (text === '/start') {
          await this.handleResubscribe(chatId.toString(), 'telegram');
          await telegramBot.sendMessage(
            chatId,
            'Welcome to PowerPulse! You will receive daily audio content.'
          );
        }
      }
    } catch (error) {
      console.error('Telegram webhook error:', error);
    }
  }

  // Helper methods
  private async logMessageDelivery(
    userId: string,
    channel: string,
    messageId: string,
    status: string
  ): Promise<void> {
    // TODO: Implement message delivery logging to database
    console.log(`Message delivery log: ${channel} for user ${userId} - ${status}`);
  }

  private async handleUnsubscribe(
    identifier: string,
    channel: 'whatsapp' | 'telegram' | 'sms'
  ): Promise<void> {
    // TODO: Update user preferences to disable the channel
    console.log(`Unsubscribe request from ${identifier} on ${channel}`);
  }

  private async handleResubscribe(
    identifier: string,
    channel: 'whatsapp' | 'telegram' | 'sms'
  ): Promise<void> {
    // TODO: Update user preferences to enable the channel
    console.log(`Resubscribe request from ${identifier} on ${channel}`);
  }

  // Batch messaging
  async sendBatchMessages(
    messages: Array<{
      userId: string;
      channel: 'whatsapp' | 'telegram' | 'sms';
      phoneNumber?: string;
      chatId?: string;
      content: MessageContent;
    }>
  ): Promise<Array<{ userId: string; channel: string; success: boolean }>> {
    const results = await Promise.allSettled(
      messages.map(async (msg) => {
        let result: { success: boolean };

        switch (msg.channel) {
          case 'whatsapp':
            if (!msg.phoneNumber) {
              result = { success: false };
            } else {
              result = await this.sendWhatsAppMessage(msg.phoneNumber, msg.content);
            }
            break;
          case 'telegram':
            if (!msg.chatId) {
              result = { success: false };
            } else {
              result = await this.sendTelegramMessage(msg.chatId, msg.content);
            }
            break;
          case 'sms':
            if (!msg.phoneNumber) {
              result = { success: false };
            } else {
              result = await this.sendSMS(msg.phoneNumber, msg.content);
            }
            break;
        }

        return {
          userId: msg.userId,
          channel: msg.channel,
          success: result.success,
        };
      })
    );

    return results.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return { userId: '', channel: '', success: false };
    });
  }
}

// Export singleton instance
export const messagingService = new MessagingService();