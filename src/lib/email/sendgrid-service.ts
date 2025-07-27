import sgMail from '@sendgrid/mail'
import { z } from 'zod'

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

// Email types
export const EmailTypeSchema = z.enum([
  'welcome',
  'daily_audio',
  'payment_success',
  'payment_failed',
  'trial_ending',
  'subscription_canceled',
  'refund_processed',
  'quiz_reminder',
  'achievement_unlocked',
  'streak_milestone',
])

export type EmailType = z.infer<typeof EmailTypeSchema>

// Base email options
export interface EmailOptions {
  to: string
  type: EmailType
  data?: Record<string, any>
}

// Email templates
const emailTemplates: Record<EmailType, { subject: (data?: any) => string; templateId?: string }> = {
  welcome: {
    subject: () => 'Welcome to PowerPulse! Your transformation begins today 🚀',
    templateId: process.env.SENDGRID_TEMPLATE_WELCOME,
  },
  daily_audio: {
    subject: (data) => `Your Daily PowerPulse: ${data?.title || 'Ready for Today\'s Session?'}`,
    templateId: process.env.SENDGRID_TEMPLATE_DAILY_AUDIO,
  },
  payment_success: {
    subject: () => 'Payment Confirmed - Welcome to PowerPulse Premium! 🎉',
    templateId: process.env.SENDGRID_TEMPLATE_PAYMENT_SUCCESS,
  },
  payment_failed: {
    subject: () => 'Payment Issue - Action Required',
    templateId: process.env.SENDGRID_TEMPLATE_PAYMENT_FAILED,
  },
  trial_ending: {
    subject: (data) => `Your trial ends in ${data?.daysLeft || 3} days - Continue your journey`,
    templateId: process.env.SENDGRID_TEMPLATE_TRIAL_ENDING,
  },
  subscription_canceled: {
    subject: () => 'We\'re sorry to see you go 💔',
    templateId: process.env.SENDGRID_TEMPLATE_SUBSCRIPTION_CANCELED,
  },
  refund_processed: {
    subject: () => 'Refund Processed - Your payment has been returned',
    templateId: process.env.SENDGRID_TEMPLATE_REFUND,
  },
  quiz_reminder: {
    subject: () => 'Complete your PowerPulse quiz - Your coach is waiting! ⏰',
    templateId: process.env.SENDGRID_TEMPLATE_QUIZ_REMINDER,
  },
  achievement_unlocked: {
    subject: (data) => `Achievement Unlocked: ${data?.achievementName || 'New Milestone!'} 🏆`,
    templateId: process.env.SENDGRID_TEMPLATE_ACHIEVEMENT,
  },
  streak_milestone: {
    subject: (data) => `${data?.days || 7} Day Streak! You\'re unstoppable! 🔥`,
    templateId: process.env.SENDGRID_TEMPLATE_STREAK,
  },
}

// SendGrid service class
export class SendGridService {
  private from: string
  private fromName: string
  private isDevelopment: boolean

  constructor() {
    this.from = process.env.SENDGRID_FROM_EMAIL || 'coach@powerpulse.ai'
    this.fromName = process.env.SENDGRID_FROM_NAME || 'PowerPulse Coach'
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  // Send email using SendGrid
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = emailTemplates[options.type]
      
      if (!template) {
        throw new Error(`Unknown email type: ${options.type}`)
      }

      // Prepare email data
      const emailData: any = {
        to: options.to,
        from: {
          email: this.from,
          name: this.fromName,
        },
        subject: template.subject(options.data),
        ...this.getEmailContent(options),
      }

      // Add tracking settings
      emailData.trackingSettings = {
        clickTracking: { enable: true },
        openTracking: { enable: true },
      }

      // Development mode: log instead of sending
      if (this.isDevelopment && !process.env.SENDGRID_SEND_IN_DEV) {
        console.log('📧 Email (dev mode):', {
          to: emailData.to,
          subject: emailData.subject,
          type: options.type,
          data: options.data,
        })
        return { success: true, messageId: 'dev-mode-' + Date.now() }
      }

      // Send email
      const [response] = await sgMail.send(emailData)
      
      return {
        success: true,
        messageId: response.headers['x-message-id'],
      }
    } catch (error: any) {
      console.error('SendGrid error:', error.response?.body || error.message)
      
      return {
        success: false,
        error: error.message || 'Failed to send email',
      }
    }
  }

  // Get email content based on type
  private getEmailContent(options: EmailOptions) {
    const template = emailTemplates[options.type]
    
    // If we have a SendGrid template ID, use it
    if (template.templateId) {
      return {
        templateId: template.templateId,
        dynamicTemplateData: {
          ...options.data,
          appUrl: process.env.NEXT_PUBLIC_APP_URL,
          currentYear: new Date().getFullYear(),
        },
      }
    }

    // Otherwise, use HTML content
    return {
      html: this.getHtmlContent(options),
      text: this.getTextContent(options),
    }
  }

  // Generate HTML content for emails without templates
  private getHtmlContent(options: EmailOptions): string {
    const baseStyles = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    `

    const buttonStyles = `
      display: inline-block;
      padding: 12px 24px;
      background-color: #7C3AED;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    `

    switch (options.type) {
      case 'welcome':
        return `
          <div style="${baseStyles}">
            <h1 style="color: #7C3AED;">Welcome to PowerPulse!</h1>
            <p>Hi ${options.data?.name || 'there'},</p>
            <p>You've just taken the first step towards transforming your life with personalized daily coaching.</p>
            <p>Here's what happens next:</p>
            <ul>
              <li>✅ You'll receive your first audio session tomorrow morning</li>
              <li>🎯 Each session is personalized based on your goals</li>
              <li>📈 Track your progress in your dashboard</li>
              <li>🏆 Unlock achievements as you build consistency</li>
            </ul>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="${buttonStyles}">Go to Dashboard</a>
            <p>Ready to crush your goals!</p>
            <p>Your PowerPulse Coach</p>
          </div>
        `

      case 'daily_audio':
        return `
          <div style="${baseStyles}">
            <h1 style="color: #7C3AED;">Your Daily PowerPulse is Ready!</h1>
            <p>Hi ${options.data?.name || 'there'},</p>
            <p><strong>Today's Focus:</strong> ${options.data?.title}</p>
            <p>${options.data?.description || 'Your personalized 5-minute coaching session is ready.'}</p>
            <a href="${options.data?.audioUrl}" style="${buttonStyles}">Listen Now</a>
            <p style="font-size: 14px; color: #666;">
              Can't listen now? No worries! Your audio will be available in your dashboard anytime.
            </p>
            <p>Keep crushing it!</p>
            <p>Your PowerPulse Coach</p>
          </div>
        `

      case 'streak_milestone':
        return `
          <div style="${baseStyles}">
            <h1 style="color: #7C3AED; text-align: center;">🔥 ${options.data?.days} Day Streak! 🔥</h1>
            <p>Incredible work, ${options.data?.name || 'champion'}!</p>
            <p>You've been consistently showing up for ${options.data?.days} days straight. That's the kind of dedication that creates real transformation.</p>
            <p style="text-align: center; font-size: 48px;">🏆</p>
            <p>Keep this momentum going - you're building habits that will last a lifetime!</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="${buttonStyles}">View Your Progress</a>
            <p>Proud of you!</p>
            <p>Your PowerPulse Coach</p>
          </div>
        `

      default:
        return `
          <div style="${baseStyles}">
            <h1>PowerPulse Notification</h1>
            <p>${options.data?.message || 'You have a new update from PowerPulse.'}</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="${buttonStyles}">View Details</a>
          </div>
        `
    }
  }

  // Generate text content for emails
  private getTextContent(options: EmailOptions): string {
    switch (options.type) {
      case 'welcome':
        return `
Welcome to PowerPulse!

Hi ${options.data?.name || 'there'},

You've just taken the first step towards transforming your life with personalized daily coaching.

Here's what happens next:
- You'll receive your first audio session tomorrow morning
- Each session is personalized based on your goals  
- Track your progress in your dashboard
- Unlock achievements as you build consistency

Go to Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Ready to crush your goals!
Your PowerPulse Coach
        `.trim()

      case 'daily_audio':
        return `
Your Daily PowerPulse is Ready!

Hi ${options.data?.name || 'there'},

Today's Focus: ${options.data?.title}
${options.data?.description || 'Your personalized 5-minute coaching session is ready.'}

Listen Now: ${options.data?.audioUrl}

Can't listen now? No worries! Your audio will be available in your dashboard anytime.

Keep crushing it!
Your PowerPulse Coach
        `.trim()

      default:
        return `
PowerPulse Notification

${options.data?.message || 'You have a new update from PowerPulse.'}

View Details: ${process.env.NEXT_PUBLIC_APP_URL}
        `.trim()
    }
  }

  // Batch send emails
  async sendBatch(emails: EmailOptions[]): Promise<{ successful: number; failed: number; results: any[] }> {
    const results = await Promise.allSettled(
      emails.map(email => this.sendEmail(email))
    )

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.length - successful

    return {
      successful,
      failed,
      results: results.map((r, i) => ({
        email: emails[i].to,
        ...( r.status === 'fulfilled' ? r.value : { success: false, error: r.reason })
      }))
    }
  }
}

// Export singleton instance
export const sendGridService = new SendGridService()