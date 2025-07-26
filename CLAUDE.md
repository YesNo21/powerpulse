# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Working Instructions

1. **Task Management**: Always read and update the `todo.md` file to track progress. Mark tasks as completed when done and update the current working status for in-progress items.

2. **Parallel Execution**: Use as many agents or tasks as possible that can run simultaneously. When multiple independent operations are needed (e.g., running multiple bash commands, reading multiple files, or performing searches), execute them in parallel using multiple tool calls in a single response for optimal performance.

3. **TodoWrite Tool**: Frequently use the TodoWrite tool to track your progress and give the user visibility into what you're working on. Mark tasks as:
   - `pending` - Not yet started
   - `in_progress` - Currently working on (only one task at a time)
   - `completed` - Finished successfully

## PowerPulse Overview

PowerPulse is an AI-powered personalized fitness and motivation platform that delivers daily 5-minute audio coaching sessions tailored to individual user pain points and goals. The platform uses AI to generate personalized scripts that are converted to audio using Google Text-to-Speech.

## Tech Stack & Key Technologies

- **Framework**: Next.js 14 with App Router and TypeScript
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Clerk (handles user auth and webhooks)
- **Payments**: Stripe subscriptions ($14.99/month with 30-day money-back guarantee)
- **API Layer**: tRPC for type-safe API routes
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Custom components with CVA (class-variance-authority)
- **Animations**: Framer Motion
- **Package Manager**: pnpm (always use pnpm, not npm or yarn)

## Common Development Commands

```bash
# Development
pnpm dev              # Start Next.js dev server (http://localhost:3000)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm typecheck        # Run TypeScript type checking

# Database
pnpm db:generate      # Generate Drizzle migrations
pnpm db:push          # Push schema changes to database
pnpm db:studio        # Open Drizzle Studio for database management
```

## Architecture & Key Patterns

### Database Architecture
The application uses a comprehensive relational schema with the following core tables:
- `users` - Synced with Clerk via webhooks
- `userProfiles` - Stores personalization data (pain points, goals, learning style)
- `dailyContent` - Generated audio content with delivery tracking
- `subscriptions` - Stripe subscription management
- `userProgress` - Tracks user journey stages and metrics
- `achievements` - Gamification system
- `audioGenerationQueue` - Batch processing queue for TTS

### Authentication Flow
1. Clerk handles all authentication (social logins, magic links)
2. Webhook at `/api/webhook/clerk` syncs Clerk users to our database
3. Middleware protects routes based on authentication status
4. After sign-up, users are redirected to `/quiz` for onboarding

### AI Content Generation Pipeline
1. User completes onboarding quiz (pain points, goals, learning style)
2. Daily cron job triggers content generation for all active users
3. AI generates personalized scripts based on user profile and progress stage
4. Scripts are queued for batch TTS processing (24-hour delay acceptable)
5. Audio files stored in Vercel Blob/AWS S3
6. Delivered via user's preferred channel (email, WhatsApp, Telegram, SMS)

### User Journey Stages
- **Foundation** (Days 1-14): Building basic habits
- **Momentum** (Days 15-45): Accelerating progress
- **Transformation** (Days 46-90): Advanced strategies
- **Mastery** (90+ days): Maintenance and peak performance

### Component Architecture
- UI components use CVA for variant management
- All components support dark mode (default)
- Animations use Framer Motion with reduced motion support
- Custom Ripple Grid background effect for hero sections

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:
- Clerk keys for authentication
- Neon DATABASE_URL
- Stripe keys and webhook secret
- Google Cloud credentials for TTS
- API keys for AI content generation (OpenAI/Anthropic)
- Delivery service credentials (SendGrid, Twilio, Telegram)

## Key Implementation Details

### Clerk Webhook Verification
The Clerk webhook uses Svix for signature verification. The webhook handler at `/api/webhook/clerk/route.ts` must verify the signature before processing user sync events.

### Database Queries
Always use Drizzle ORM for database operations. The db instance is exported from `/src/db/index.ts` with the schema pre-loaded.

### Subscription Lifecycle
- Users are charged immediately upon signup
- 30-day refund eligibility tracked in `users.refundEligibleUntil`
- Subscription status synced via Stripe webhooks
- Pause/resume functionality available

### Audio Generation
- Scripts generated daily at 2 AM via Vercel Cron
- Batch processing in groups of 100 for cost optimization
- Voice settings customizable per user profile
- 5-minute audio structure: greeting (30s) + coaching (3m) + actions (1m) + affirmation (30s)

## Project Status

Currently implemented:
- Project setup with Next.js, TypeScript, and core dependencies
- Complete database schema
- Clerk authentication integration
- Basic UI components (Button, Card, Badge)
- Landing page with animated Ripple Grid background

Next priorities (see todo.md for full list):
1. Set up external services (Neon DB, Clerk app, Stripe)
2. Build quiz system for user onboarding
3. Implement AI script generation
4. Create audio generation pipeline
5. Build user dashboard