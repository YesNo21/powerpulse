# PowerPulse Email System Documentation

## Overview

PowerPulse uses SendGrid for transactional email delivery. The system supports multiple email types, templates, and automated triggers based on user actions.

## Email Types

### 1. Welcome Email
- **Trigger**: User completes onboarding quiz
- **Content**: Welcome message, next steps, what to expect
- **Template**: `welcome`

### 2. Daily Audio Email
- **Trigger**: Daily cron job at 6 AM UTC
- **Content**: Daily coaching audio link, title, description
- **Template**: `daily_audio`

### 3. Payment Success
- **Trigger**: Successful subscription payment
- **Content**: Payment confirmation, plan details, receipt
- **Template**: `payment_success`

### 4. Payment Failed
- **Trigger**: Failed payment attempt
- **Content**: Payment issue notification, update payment method link
- **Template**: `payment_failed`

### 5. Trial Ending
- **Trigger**: 3 days before trial ends
- **Content**: Trial ending reminder, benefits of continuing
- **Template**: `trial_ending`

### 6. Subscription Canceled
- **Trigger**: User cancels subscription
- **Content**: Cancellation confirmation, feedback request
- **Template**: `subscription_canceled`

### 7. Refund Processed
- **Trigger**: Refund issued
- **Content**: Refund confirmation, amount, timeline
- **Template**: `refund_processed`

### 8. Quiz Reminder
- **Trigger**: User starts but doesn't complete quiz (24h later)
- **Content**: Reminder to complete quiz, benefits
- **Template**: `quiz_reminder`

### 9. Achievement Unlocked
- **Trigger**: User unlocks achievement
- **Content**: Achievement details, celebration
- **Template**: `achievement_unlocked`

### 10. Streak Milestone
- **Trigger**: User reaches streak milestone (7, 30, 100 days)
- **Content**: Streak celebration, encouragement
- **Template**: `streak_milestone`

## Technical Implementation

### SendGrid Service
```typescript
// src/lib/email/sendgrid-service.ts
import { sendGridService } from '@/lib/email/sendgrid-service'

// Send single email
await sendGridService.sendEmail({
  to: 'user@example.com',
  type: 'welcome',
  data: { name: 'John' }
})

// Send batch emails
await sendGridService.sendBatch([
  { to: 'user1@example.com', type: 'daily_audio', data: {...} },
  { to: 'user2@example.com', type: 'daily_audio', data: {...} }
])
```

### Email Hooks
```typescript
// src/lib/email/email-hooks.ts
import { sendWelcomeEmail } from '@/lib/email/email-hooks'

// Automated email triggers
await sendWelcomeEmail(userId)
await sendPaymentSuccessEmail(userId, planName, amount)
await sendStreakMilestoneEmail(userId, days)
```

## Cron Jobs

### Daily Audio Email Delivery
- **Schedule**: 6:00 AM UTC daily
- **Endpoint**: `/api/cron/send-daily-emails`
- **Process**:
  1. Query users with active subscriptions
  2. Get today's generated audio content
  3. Send emails in batches of 50
  4. Update delivery status

## Testing

### Test Email Endpoint
```bash
# Send test email (development only)
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "email": "test@example.com"
  }'
```

### Available test types:
- `welcome`
- `daily_audio`
- `payment_success`
- `streak_milestone`

## Email Templates

### Using SendGrid Dynamic Templates
1. Create template in SendGrid dashboard
2. Add template ID to environment variables
3. Template receives dynamic data:
```javascript
{
  // User data
  name: "John",
  email: "john@example.com",
  
  // App data
  appUrl: "https://powerpulse.ai",
  currentYear: 2025,
  
  // Custom data per email type
  ...customData
}
```

### Fallback HTML Templates
If SendGrid template ID is not configured, the system falls back to inline HTML templates with:
- Responsive design
- Dark mode support
- Consistent branding
- Call-to-action buttons

## Configuration

### Environment Variables
```env
# SendGrid API
SENDGRID_API_KEY="SG.YOUR_API_KEY"
SENDGRID_FROM_EMAIL="coach@powerpulse.ai"
SENDGRID_FROM_NAME="PowerPulse Coach"

# Template IDs (optional)
SENDGRID_TEMPLATE_WELCOME="d-template-id"
SENDGRID_TEMPLATE_DAILY_AUDIO="d-template-id"
# ... other templates

# Development
SENDGRID_SEND_IN_DEV="true" # Actually send in dev mode
```

### User Preferences
Users can manage email preferences at `/settings/notifications`:
- Enable/disable email delivery
- Set preferred delivery time
- Choose email frequency
- Unsubscribe from specific types

## Best Practices

### 1. Rate Limiting
- Batch emails in groups of 50-100
- Add 1 second delay between batches
- Monitor SendGrid rate limits

### 2. Error Handling
- Log all email errors
- Implement retry logic for failures
- Track delivery status in database

### 3. Personalization
- Use user's first name
- Reference their goals and progress
- Include relevant metrics

### 4. Compliance
- Include unsubscribe link
- Honor user preferences
- Comply with CAN-SPAM/GDPR

## Monitoring

### Key Metrics
- Delivery rate
- Open rate
- Click rate
- Bounce rate
- Unsubscribe rate

### SendGrid Dashboard
Monitor email performance at:
https://app.sendgrid.com/statistics

### Database Tracking
```sql
-- Check delivery status
SELECT 
  COUNT(*) as total,
  delivery_status,
  DATE(delivered_at) as delivery_date
FROM daily_content
WHERE delivered_at > NOW() - INTERVAL '7 days'
GROUP BY delivery_status, delivery_date
ORDER BY delivery_date DESC;
```

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check SendGrid API key
   - Verify sender domain authentication
   - Check SendGrid account status

2. **Low delivery rates**
   - Authenticate domain with SPF/DKIM
   - Check spam score
   - Review bounce reasons

3. **Template not found**
   - Verify template ID in environment
   - Check SendGrid template status
   - Ensure template is active

4. **Rate limiting**
   - Reduce batch size
   - Increase delay between batches
   - Check SendGrid plan limits