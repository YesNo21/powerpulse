import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { sql } from 'drizzle-orm'
import * as schema from './schema'

// Load environment variables
import dotenv from 'dotenv'
dotenv.config()

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const client = neon(process.env.DATABASE_URL)
const db = drizzle(client, { schema })

async function migrate() {
  console.log('🚀 Starting database migration...')
  
  try {
    // Create tables in the correct order to respect foreign key constraints
    
    // 1. Create users table first (no dependencies)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        clerk_id VARCHAR(256) UNIQUE NOT NULL,
        email VARCHAR(256) NOT NULL,
        name VARCHAR(256),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        subscription_status VARCHAR(50) DEFAULT 'inactive',
        stripe_customer_id VARCHAR(256),
        stripe_subscription_id VARCHAR(256),
        refund_eligible_until TIMESTAMP
      )
    `)
    console.log('✅ Created users table')

    // 2. Create achievements table (no dependencies)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        code VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(256) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(100),
        category VARCHAR(100),
        requirement JSON NOT NULL,
        points INTEGER DEFAULT 0
      )
    `)
    console.log('✅ Created achievements table')

    // 3. Create tables that depend on users
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        pain_points JSON DEFAULT '[]'::json,
        goals JSON DEFAULT '[]'::json,
        learning_style VARCHAR(50),
        current_level INTEGER DEFAULT 5,
        progress_stage VARCHAR(50) DEFAULT 'beginner',
        personality_type VARCHAR(256),
        triggers JSON DEFAULT '[]'::json,
        blockers JSON DEFAULT '[]'::json,
        preferred_delivery_time VARCHAR(10),
        delivery_method VARCHAR(50) DEFAULT 'email',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `)
    console.log('✅ Created user_profiles table')

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS quiz_responses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        question_id VARCHAR(100) NOT NULL,
        answer JSON NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `)
    console.log('✅ Created quiz_responses table')

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS daily_content (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        date DATE NOT NULL,
        script TEXT NOT NULL,
        audio_url VARCHAR(512),
        duration INTEGER,
        delivered BOOLEAN DEFAULT FALSE,
        delivered_at TIMESTAMP,
        listened BOOLEAN DEFAULT FALSE,
        listened_at TIMESTAMP,
        feedback VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `)
    console.log('✅ Created daily_content table')

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        metric VARCHAR(100) NOT NULL,
        value INTEGER NOT NULL,
        date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `)
    console.log('✅ Created user_progress table')

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_streaks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        total_days_active INTEGER DEFAULT 0,
        last_active_date DATE,
        streak_protection_used INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `)
    console.log('✅ Created user_streaks table')

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        achievement_id INTEGER NOT NULL REFERENCES achievements(id),
        unlocked_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `)
    console.log('✅ Created user_achievements table')

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS referrals (
        id SERIAL PRIMARY KEY,
        referrer_id INTEGER NOT NULL REFERENCES users(id),
        referred_email VARCHAR(256) NOT NULL,
        referred_user_id INTEGER REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'pending',
        reward_granted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `)
    console.log('✅ Created referrals table')

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        stripe_subscription_id VARCHAR(256) UNIQUE NOT NULL,
        stripe_price_id VARCHAR(256) NOT NULL,
        status VARCHAR(50) NOT NULL,
        current_period_start TIMESTAMP NOT NULL,
        current_period_end TIMESTAMP NOT NULL,
        canceled_at TIMESTAMP,
        paused_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `)
    console.log('✅ Created subscriptions table')

    // 4. Create tables that depend on subscriptions
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS refunds (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        subscription_id INTEGER NOT NULL REFERENCES subscriptions(id),
        stripe_refund_id VARCHAR(256),
        amount DECIMAL(10, 2) NOT NULL,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `)
    console.log('✅ Created refunds table')

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS audio_generation_queue (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        script TEXT NOT NULL,
        scheduled_for TIMESTAMP NOT NULL,
        voice_settings JSON DEFAULT '{}'::json,
        status VARCHAR(50) DEFAULT 'pending',
        attempts INTEGER DEFAULT 0,
        error TEXT,
        audio_url VARCHAR(512),
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `)
    console.log('✅ Created audio_generation_queue table')

    // Create indexes for better performance
    console.log('📇 Creating indexes...')
    
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_quiz_responses_user_id ON quiz_responses(user_id)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_daily_content_user_id_date ON daily_content(user_id, date)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_user_progress_user_id_date ON user_progress(user_id, date)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_audio_generation_queue_status ON audio_generation_queue(status)`)
    
    console.log('✅ Indexes created successfully')

    // Seed initial achievements data
    console.log('🌱 Seeding achievements table...')
    
    const defaultAchievements = [
      {
        code: 'first-day',
        name: 'First Step',
        description: 'Complete your first PowerPulse',
        icon: 'trophy',
        category: 'engagement',
        requirement: { type: 'first_audio_completed' },
        points: 10,
      },
      {
        code: 'week-warrior',
        name: 'Week Warrior',
        description: 'Complete 7 days in a row',
        icon: 'fire',
        category: 'streak',
        requirement: { type: 'streak', days: 7 },
        points: 50,
      },
      {
        code: 'habit-formed',
        name: 'Habit Formed',
        description: 'Reach a 21-day streak',
        icon: 'star',
        category: 'streak',
        requirement: { type: 'streak', days: 21 },
        points: 100,
      },
      {
        code: 'foundation-complete',
        name: 'Foundation Complete',
        description: 'Complete your first 14 days',
        icon: 'medal',
        category: 'progress',
        requirement: { type: 'total_days', days: 14 },
        points: 75,
      },
      {
        code: 'momentum-master',
        name: 'Momentum Master',
        description: 'Reach the Momentum stage',
        icon: 'rocket',
        category: 'progress',
        requirement: { type: 'stage', stage: 'momentum' },
        points: 150,
      },
      {
        code: 'transformation-hero',
        name: 'Transformation Hero',
        description: 'Reach the Transformation stage',
        icon: 'crown',
        category: 'progress',
        requirement: { type: 'stage', stage: 'transformation' },
        points: 300,
      },
      {
        code: 'master-achiever',
        name: 'Master Achiever',
        description: 'Reach the Mastery stage',
        icon: 'diamond',
        category: 'progress',
        requirement: { type: 'stage', stage: 'mastery' },
        points: 500,
      },
      {
        code: 'comeback-champion',
        name: 'Comeback Champion',
        description: 'Return after missing days',
        icon: 'heart',
        category: 'engagement',
        requirement: { type: 'comeback' },
        points: 25,
      },
      {
        code: 'referral-rookie',
        name: 'Referral Rookie',
        description: 'Refer your first friend',
        icon: 'users',
        category: 'referral',
        requirement: { type: 'referrals', count: 1 },
        points: 50,
      },
      {
        code: 'referral-champion',
        name: 'Referral Champion',
        description: 'Refer 5 friends',
        icon: 'users-plus',
        category: 'referral',
        requirement: { type: 'referrals', count: 5 },
        points: 200,
      },
    ]

    // Insert achievements, ignoring conflicts on the unique 'code' field
    for (const achievement of defaultAchievements) {
      await db.execute(sql`
        INSERT INTO achievements (code, name, description, icon, category, requirement, points)
        VALUES (
          ${achievement.code},
          ${achievement.name},
          ${achievement.description},
          ${achievement.icon},
          ${achievement.category},
          ${JSON.stringify(achievement.requirement)},
          ${achievement.points}
        )
        ON CONFLICT (code) DO NOTHING
      `)
    }
    
    console.log('✅ Achievements seeded successfully')
    console.log('🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Run the migration
migrate()
  .then(() => {
    console.log('👋 Exiting...')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })