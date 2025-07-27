import { pgTable, serial, varchar, timestamp, integer, boolean, text, json, date, decimal, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Users table - synced with Clerk
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 256 }).unique().notNull(),
  email: varchar('email', { length: 256 }).notNull(),
  name: varchar('name', { length: 256 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  subscriptionStatus: varchar('subscription_status', { length: 50 }).default('inactive'),
  stripeCustomerId: varchar('stripe_customer_id', { length: 256 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 256 }),
  subscriptionPriceId: varchar('subscription_price_id', { length: 256 }),
  subscriptionCurrentPeriodEnd: timestamp('subscription_current_period_end'),
  refundEligibleUntil: timestamp('refund_eligible_until'),
})

// User profiles with detailed preferences
export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  painPoints: json('pain_points').$type<string[]>().default([]),
  goals: json('goals').$type<string[]>().default([]),
  learningStyle: varchar('learning_style', { length: 50 }), // direct, gentle, tough, story (deprecated)
  learningStyles: json('learning_styles').$type<string[]>().default([]), // Multiple styles
  voicePreference: varchar('voice_preference', { length: 100 }), // Selected voice ID
  currentLevel: integer('current_level').default(5), // 1-10 scale
  progressStage: varchar('progress_stage', { length: 50 }).default('beginner'), // beginner, intermediate, advanced, mastery
  personalityType: varchar('personality_type', { length: 256 }),
  triggers: json('triggers').$type<string[]>().default([]),
  blockers: json('blockers').$type<string[]>().default([]),
  preferredDeliveryTime: varchar('preferred_delivery_time', { length: 10 }), // HH:MM format
  deliveryMethod: varchar('delivery_method', { length: 50 }).default('email'), // email, whatsapp, telegram, sms
  bio: text('bio'),
  timezone: varchar('timezone', { length: 100 }),
  language: varchar('language', { length: 10 }).default('en'),
  preferredWorkoutTime: varchar('preferred_workout_time', { length: 10 }), // HH:MM format
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Quiz responses for onboarding
export const quizResponses = pgTable('quiz_responses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  questionId: varchar('question_id', { length: 100 }).notNull(),
  answer: json('answer').$type<any>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Daily content generation
export const dailyContent = pgTable('daily_content', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  date: date('date').notNull(),
  title: varchar('title', { length: 256 }),
  script: text('script').notNull(),
  audioUrl: varchar('audio_url', { length: 512 }),
  duration: integer('duration'), // in seconds
  keyPoints: json('key_points').$type<string[]>().default([]),
  stage: varchar('stage', { length: 50 }), // awareness, consideration, decision, retention
  tone: varchar('tone', { length: 50 }), // motivational, educational, celebratory, supportive
  promptType: varchar('prompt_type', { length: 100 }), // template used
  delivered: boolean('delivered').default(false),
  deliveredAt: timestamp('delivered_at'),
  listened: boolean('listened').default(false),
  listenedAt: timestamp('listened_at'),
  feedback: varchar('feedback', { length: 50 }), // positive, neutral, negative
  playCount: integer('play_count').default(0),
  lastPlayedAt: timestamp('last_played_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// User progress tracking
export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  metric: varchar('metric', { length: 100 }).notNull(), // confidence, consistency, energy, etc.
  value: integer('value').notNull(), // 0-100 scale
  date: date('date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Streaks and achievements
export const userStreaks = pgTable('user_streaks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  totalDaysActive: integer('total_days_active').default(0),
  lastActiveDate: date('last_active_date'),
  streakProtectionUsed: integer('streak_protection_used').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Achievements system
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 100 }).unique().notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  description: text('description').notNull(),
  icon: varchar('icon', { length: 100 }),
  category: varchar('category', { length: 100 }), // streak, progress, engagement, referral
  requirement: json('requirement').$type<any>().notNull(),
  points: integer('points').default(0),
})

// User achievements
export const userAchievements = pgTable('user_achievements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  achievementId: integer('achievement_id').references(() => achievements.id).notNull(),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
})

// Referrals
export const referrals = pgTable('referrals', {
  id: serial('id').primaryKey(),
  referrerId: integer('referrer_id').references(() => users.id).notNull(),
  referredEmail: varchar('referred_email', { length: 256 }).notNull(),
  referredUserId: integer('referred_user_id').references(() => users.id),
  status: varchar('status', { length: 50 }).default('pending'), // pending, completed, expired
  rewardGranted: boolean('reward_granted').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Subscriptions and billing
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 256 }).unique().notNull(),
  stripePriceId: varchar('stripe_price_id', { length: 256 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(), // active, canceled, past_due, paused
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  canceledAt: timestamp('canceled_at'),
  pausedUntil: timestamp('paused_until'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Refunds
export const refunds = pgTable('refunds', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  subscriptionId: integer('subscription_id').references(() => subscriptions.id).notNull(),
  stripeRefundId: varchar('stripe_refund_id', { length: 256 }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  reason: text('reason'),
  status: varchar('status', { length: 50 }).default('pending'), // pending, completed, failed
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Audio generation queue
export const audioGenerationQueue = pgTable('audio_generation_queue', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  contentId: integer('content_id').references(() => dailyContent.id),
  script: text('script').notNull(),
  scheduledFor: timestamp('scheduled_for').notNull(),
  voiceSettings: json('voice_settings').$type<any>().default({}),
  status: varchar('status', { length: 50 }).default('pending'), // pending, processing, completed, failed
  attempts: integer('attempts').default(0),
  error: text('error'),
  audioUrl: varchar('audio_url', { length: 512 }),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// User notification preferences
export const userNotificationPreferences = pgTable('user_notification_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  // Channel preferences
  emailEnabled: boolean('email_enabled').default(true),
  emailFrequency: varchar('email_frequency', { length: 20 }).default('daily'), // daily, weekly, monthly
  whatsappEnabled: boolean('whatsapp_enabled').default(false),
  telegramEnabled: boolean('telegram_enabled').default(false),
  smsEnabled: boolean('sms_enabled').default(false),
  pushEnabled: boolean('push_enabled').default(true),
  inAppEnabled: boolean('in_app_enabled').default(true),
  // Content preferences
  dailyAudioNotifications: boolean('daily_audio_notifications').default(true),
  streakReminders: boolean('streak_reminders').default(true),
  milestoneNotifications: boolean('milestone_notifications').default(true),
  newContentAlerts: boolean('new_content_alerts').default(true),
  socialNotifications: boolean('social_notifications').default(false),
  // Timing preferences
  preferredDeliveryTime: varchar('preferred_delivery_time', { length: 5 }), // HH:MM format
  timezone: varchar('timezone', { length: 100 }).default('America/New_York'),
  quietHoursEnabled: boolean('quiet_hours_enabled').default(false),
  quietHoursStart: varchar('quiet_hours_start', { length: 5 }), // HH:MM format
  quietHoursEnd: varchar('quiet_hours_end', { length: 5 }), // HH:MM format
  // Telegram specific
  telegramChatId: varchar('telegram_chat_id', { length: 256 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Delivery schedules
export const deliverySchedules = pgTable('delivery_schedules', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  scheduledTime: varchar('scheduled_time', { length: 5 }).notNull(), // HH:MM format
  timezone: varchar('timezone', { length: 100 }).notNull(),
  frequency: varchar('frequency', { length: 20 }).default('daily'), // daily, weekdays, custom
  isActive: boolean('is_active').default(true),
  pausedAt: timestamp('paused_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Delivery logs
export const deliveryLogs = pgTable('delivery_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  contentId: integer('content_id').references(() => dailyContent.id),
  channel: varchar('channel', { length: 20 }).notNull(), // email, whatsapp, telegram, sms, push, inApp, all
  type: varchar('type', { length: 50 }).notNull(), // daily_audio, reminder, milestone, system
  status: varchar('status', { length: 20 }).notNull(), // pending, delivered, failed, paused, resumed
  message: text('message'),
  metadata: json('metadata').$type<any>(),
  attemptedAt: timestamp('attempted_at'),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Push subscriptions
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  endpoint: text('endpoint').notNull().unique(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// User favorites
export const userFavorites = pgTable('user_favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  contentId: integer('content_id').references(() => dailyContent.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Define relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  quizResponses: many(quizResponses),
  dailyContent: many(dailyContent),
  progress: many(userProgress),
  streak: one(userStreaks, {
    fields: [users.id],
    references: [userStreaks.userId],
  }),
  achievements: many(userAchievements),
  referralsMade: many(referrals, {
    relationName: 'referrer',
  }),
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
  favorites: many(userFavorites),
}))

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}))

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}))

export const dailyContentRelations = relations(dailyContent, ({ one, many }) => ({
  user: one(users, {
    fields: [dailyContent.userId],
    references: [users.id],
  }),
  favorites: many(userFavorites),
}))

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
  user: one(users, {
    fields: [userFavorites.userId],
    references: [users.id],
  }),
  content: one(dailyContent, {
    fields: [userFavorites.contentId],
    references: [dailyContent.id],
  }),
}))