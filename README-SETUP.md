# PowerPulse Setup Guide

## External Services Configuration

### 1. Neon Database Setup
1. Go to [Neon.tech](https://neon.tech)
2. Create a new project
3. Copy your database connection string
4. Add to `.env.local`: `DATABASE_URL=your_connection_string`

### 2. Clerk Authentication Setup
1. Go to [Clerk.com](https://clerk.com)
2. Create a new application
3. Enable social logins (Google, Facebook, Twitter)
4. Copy your keys from the API Keys section
5. Add to `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   ```
6. Create a webhook endpoint for user sync:
   - URL: `https://your-domain.com/api/webhook/clerk`
   - Events: user.created, user.updated
   - Copy the webhook secret and add: `CLERK_WEBHOOK_SECRET=your_webhook_secret`

### 3. Stripe Payment Setup
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Copy your API keys (use test mode for development)
3. Create products and prices:
   - Basic Plan: $9.99/month
   - Pro Plan: $19.99/month  
   - Premium Plan: $39.99/month
4. Add to `.env.local`:
   ```
   STRIPE_SECRET_KEY=your_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
   STRIPE_BASIC_PRICE_ID=price_id_for_basic
   STRIPE_PRO_PRICE_ID=price_id_for_pro
   STRIPE_PREMIUM_PRICE_ID=price_id_for_premium
   ```
5. Create a webhook endpoint:
   - URL: `https://your-domain.com/api/webhook/stripe`
   - Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
   - Copy webhook secret: `STRIPE_WEBHOOK_SECRET=your_webhook_secret`

### 4. Google Cloud Text-to-Speech Setup
1. Create a Google Cloud project
2. Enable the Text-to-Speech API
3. Create a service account and download JSON credentials
4. Add to `.env.local`: `GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json`

### 5. OpenAI/Anthropic API Setup
1. Get API key from OpenAI or Anthropic
2. Add to `.env.local`: `OPENAI_API_KEY=your_api_key` or `ANTHROPIC_API_KEY=your_api_key`

### 6. Vercel Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Configure environment variables in Vercel dashboard
4. Add production domain to Clerk and update webhook URLs

## Running Locally
1. Copy `.env.example` to `.env.local`
2. Fill in all required environment variables
3. Run database migrations: `pnpm db:push`
4. Start development server: `pnpm dev`