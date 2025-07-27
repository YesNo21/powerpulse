# PowerPulse External Services Setup Guide

This guide provides step-by-step instructions for setting up all external services required for PowerPulse.

## 🚨 Setup Order Matters!

Follow this order to avoid dependency issues:
1. Clerk (authentication)
2. Stripe (payments)
3. Google Cloud (TTS)
4. SendGrid (email)
5. Twilio (SMS/WhatsApp) - optional
6. Telegram (bot) - optional

## 1. Clerk Authentication Setup

### Create Clerk Application
1. Go to [clerk.com](https://clerk.com) and sign up
2. Create new application: "PowerPulse"
3. Choose authentication methods:
   - ✅ Email
   - ✅ Google OAuth
   - ✅ Facebook OAuth

### Configure Social Logins

#### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs:
     ```
     https://awake-ocelot-54.clerk.accounts.dev/v1/oauth_callback
     http://localhost:3000/sign-up/sso-callback
     http://localhost:3000/sign-in/sso-callback
     ```
5. Copy Client ID and Client Secret to Clerk

#### Facebook OAuth Setup:
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create new app: "PowerPulse"
3. Add Facebook Login product
4. Settings:
   - Valid OAuth Redirect URIs:
     ```
     https://awake-ocelot-54.clerk.accounts.dev/v1/oauth_callback
     ```
5. Copy App ID and App Secret to Clerk

### Clerk Webhook Setup:
1. In Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhook/clerk`
3. Select events:
   - user.created
   - user.updated
   - user.deleted
4. Copy webhook signing secret

### Environment Variables:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_YOUR_KEY"
CLERK_SECRET_KEY="sk_test_YOUR_KEY"
CLERK_WEBHOOK_SECRET="whsec_YOUR_SECRET"
```

## 2. Stripe Payment Setup

### Create Stripe Account:
1. Sign up at [stripe.com](https://stripe.com)
2. Complete business profile
3. Set up tax settings if applicable

### Run Automated Setup:
```bash
# First add your Stripe keys to .env.local
STRIPE_SECRET_KEY="sk_test_YOUR_KEY"
STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_KEY"

# Run setup script
pnpm tsx scripts/setup-stripe.ts
```

This creates:
- PowerPulse product
- Monthly ($14.99), yearly ($143.88), lifetime ($299) prices
- Customer portal configuration
- Webhook endpoint
- Promotional coupons

### Manual Webhook Setup (if needed):
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhook/stripe`
3. Select events:
   - checkout.session.completed
   - customer.subscription.*
   - invoice.*
   - charge.refunded
4. Copy signing secret

### Environment Variables:
```env
STRIPE_SECRET_KEY="sk_test_YOUR_KEY"
STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_KEY"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_KEY"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_SECRET"
STRIPE_PRODUCT_ID="prod_YOUR_ID"
STRIPE_PRICE_MONTHLY_ID="price_YOUR_ID"
STRIPE_PRICE_YEARLY_ID="price_YOUR_ID"
STRIPE_PRICE_LIFETIME_ID="price_YOUR_ID"
```

## 3. Google Cloud TTS Setup

### Create Project:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project: "powerpulse-production"
3. Enable billing (required for TTS API)

### Enable Text-to-Speech API:
1. APIs & Services → Library
2. Search "Cloud Text-to-Speech API"
3. Click Enable

### Create Service Account:
1. IAM & Admin → Service Accounts
2. Create service account:
   - Name: powerpulse-tts
   - Roles: Cloud Text-to-Speech User
3. Create JSON key and download

### For Local Development:
```env
GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

### For Vercel Deployment:
```bash
# Convert key to base64
base64 -i service-account-key.json | tr -d '\n' > encoded-key.txt

# Add to .env
GOOGLE_CLOUD_CREDENTIALS_BASE64="contents-of-encoded-key.txt"
```

### Set up Budget Alerts:
1. Billing → Budgets & alerts
2. Create budget: $50/month
3. Alert at 50%, 90%, 100%

## 4. SendGrid Email Setup

### Create SendGrid Account:
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Complete sender verification
3. Create API key with full access

### Configure Domain Authentication:
1. Settings → Sender Authentication
2. Authenticate your domain
3. Add DNS records as instructed

### Create Email Templates:
1. Email API → Dynamic Templates
2. Create templates:
   - Welcome email
   - Daily audio delivery
   - Payment confirmation
   - Trial ending reminder

### Environment Variables:
```env
SENDGRID_API_KEY="SG.YOUR_API_KEY"
SENDGRID_FROM_EMAIL="coach@yourdomain.com"
SENDGRID_FROM_NAME="PowerPulse Coach"
```

## 5. Twilio Setup (Optional)

### Create Twilio Account:
1. Sign up at [twilio.com](https://twilio.com)
2. Get phone number for SMS
3. Enable WhatsApp if needed

### WhatsApp Business Setup:
1. Twilio Console → Messaging → Try it out → WhatsApp
2. Follow WhatsApp Business verification
3. Configure webhook URLs

### Environment Variables:
```env
TWILIO_ACCOUNT_SID="YOUR_ACCOUNT_SID"
TWILIO_AUTH_TOKEN="YOUR_AUTH_TOKEN"
TWILIO_PHONE_NUMBER="+1234567890"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
```

## 6. Telegram Bot Setup (Optional)

### Create Telegram Bot:
1. Message @BotFather on Telegram
2. Send `/newbot`
3. Choose name: "PowerPulse Coach"
4. Choose username: "PowerPulseBot"
5. Copy bot token

### Configure Webhook:
```bash
curl -X POST "https://api.telegram.org/bot{YOUR_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/api/webhook/telegram"}'
```

### Environment Variables:
```env
TELEGRAM_BOT_TOKEN="YOUR_BOT_TOKEN"
```

## 7. Additional Services

### OpenAI/Anthropic (AI Content):
```env
# Choose one:
OPENAI_API_KEY="sk-YOUR_KEY"
# OR
ANTHROPIC_API_KEY="sk-ant-YOUR_KEY"
```

### Vercel Blob Storage (Audio Storage):
1. Vercel Dashboard → Storage → Create Database
2. Choose Blob Storage
3. Copy connection string

```env
BLOB_READ_WRITE_TOKEN="vercel_blob_YOUR_TOKEN"
```

## 8. Production Deployment Checklist

### Environment Variables:
- [ ] All API keys are production keys (not test)
- [ ] Webhook URLs point to production domain
- [ ] App URL is set correctly

### Security:
- [ ] API keys are in Vercel environment variables
- [ ] Webhook secrets are configured
- [ ] CORS settings are restricted

### Testing:
- [ ] Test user signup flow
- [ ] Test payment processing
- [ ] Test audio generation
- [ ] Test email delivery
- [ ] Test webhook handling

### Monitoring:
- [ ] Set up Sentry for error tracking
- [ ] Configure uptime monitoring
- [ ] Enable Vercel Analytics

## Quick Setup Commands

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Run database migrations
pnpm db:push

# 4. Test Clerk webhook
pnpm dev
# Then use Clerk's webhook testing tool

# 5. Test Stripe webhook (local)
stripe listen --forward-to localhost:3000/api/webhook/stripe

# 6. Run Stripe setup
pnpm tsx scripts/setup-stripe.ts

# 7. Test TTS integration
pnpm tsx scripts/test-tts.ts

# 8. Start development server
pnpm dev
```

## Support Links

- Clerk: https://clerk.com/docs
- Stripe: https://stripe.com/docs
- Google Cloud: https://cloud.google.com/text-to-speech/docs
- SendGrid: https://docs.sendgrid.com
- Twilio: https://www.twilio.com/docs
- Telegram: https://core.telegram.org/bots/api