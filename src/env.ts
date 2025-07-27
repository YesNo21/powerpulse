// This file is a placeholder for environment variable validation
// You can use libraries like @t3-oss/env-nextjs for runtime validation

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // AI Configuration
  AI_PROVIDER: process.env.AI_PROVIDER as 'openai' | 'anthropic' | undefined,
  AI_API_KEY: process.env.AI_API_KEY,
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL!,
  
  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
  CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET!,
  
  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  
  // Google Cloud
  GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
  GOOGLE_CLOUD_KEYFILE: process.env.GOOGLE_CLOUD_KEYFILE,
  
  // Application
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}