import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { dailyContent, userProfiles, userStreaks, userProgress, userAchievements } from '@/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { 
  ContentGenerator, 
  createAIProvider, 
  type UserContext, 
  type GeneratedContent 
} from '@/lib/ai/content-generator'
import { 
  getPromptTemplate, 
  fillTemplate, 
  selectTemplate,
  PROMPT_TEMPLATES,
  type PromptTemplate 
} from '@/lib/ai/prompt-templates'
import { env } from '@/env'

// Environment variables validation
const AI_PROVIDER = env.AI_PROVIDER || 'openai'
const AI_API_KEY = env.AI_API_KEY

if (!AI_API_KEY) {
  console.warn('AI_API_KEY not set. AI content generation will be disabled.')
}

// Input schemas
const generateContentSchema = z.object({
  promptType: z.string().optional(),
  regenerate: z.boolean().optional().default(false),
})

const previewContentSchema = z.object({
  promptType: z.string(),
  customContext: z.object({
    painPoints: z.array(z.string()).optional(),
    goals: z.array(z.string()).optional(),
    learningStyle: z.enum(['direct', 'gentle', 'tough', 'story']).optional(),
    currentLevel: z.number().min(1).max(10).optional(),
  }).optional(),
})

const feedbackSchema = z.object({
  contentId: z.number(),
  feedback: z.enum(['positive', 'neutral', 'negative']),
})

export const contentRouter = createTRPCRouter({
  // Generate daily content for the user
  generateDailyContent: protectedProcedure
    .input(generateContentSchema)
    .mutation(async ({ ctx, input }) => {
      const { user, db } = ctx
      const { promptType, regenerate } = input

      if (!AI_API_KEY) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'AI content generation is not configured',
        })
      }

      try {
        // Check if content already exists for today
        const today = new Date().toISOString().split('T')[0]
        const [existingContent] = await db
          .select()
          .from(dailyContent)
          .where(
            and(
              eq(dailyContent.userId, user.id),
              eq(dailyContent.date, today)
            )
          )
          .limit(1)

        if (existingContent && !regenerate) {
          return existingContent
        }

        // Gather user context
        const userContext = await gatherUserContext(db, user.id)

        // Initialize AI provider and generator
        const provider = createAIProvider(AI_PROVIDER, AI_API_KEY)
        const generator = new ContentGenerator(provider)

        // Generate content
        let generatedContent: GeneratedContent
        if (regenerate && existingContent?.feedback === 'negative') {
          generatedContent = await generator.regenerateContent(userContext, existingContent.feedback)
        } else {
          generatedContent = await generator.generateDailyContent(userContext)
        }

        // Save to database
        if (existingContent) {
          // Update existing content
          const [updated] = await db
            .update(dailyContent)
            .set({
              title: generatedContent.title,
              script: generatedContent.script,
              duration: generatedContent.duration,
              keyPoints: generatedContent.keyPoints,
              stage: generatedContent.stage,
              tone: generatedContent.tone,
              promptType: promptType || selectTemplate({
                currentStreak: userContext.currentStreak,
                longestStreak: userContext.longestStreak,
                totalDaysActive: userContext.totalDaysActive,
                timeOfDay: userContext.timeOfDay,
                isReturning: userContext.currentStreak === 0 && userContext.longestStreak > 0,
              }),
              delivered: false,
              deliveredAt: null,
              listened: false,
              listenedAt: null,
              feedback: null,
            })
            .where(eq(dailyContent.id, existingContent.id))
            .returning()

          return updated
        } else {
          // Create new content
          const [created] = await db
            .insert(dailyContent)
            .values({
              userId: user.id,
              date: today,
              title: generatedContent.title,
              script: generatedContent.script,
              duration: generatedContent.duration,
              keyPoints: generatedContent.keyPoints,
              stage: generatedContent.stage,
              tone: generatedContent.tone,
              promptType: promptType || selectTemplate({
                currentStreak: userContext.currentStreak,
                longestStreak: userContext.longestStreak,
                totalDaysActive: userContext.totalDaysActive,
                timeOfDay: userContext.timeOfDay,
                isReturning: userContext.currentStreak === 0 && userContext.longestStreak > 0,
              }),
            })
            .returning()

          return created
        }
      } catch (error) {
        console.error('Error generating content:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate content',
        })
      }
    }),

  // Regenerate content with different parameters
  regenerateContent: protectedProcedure
    .input(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        reason: z.enum(['feedback', 'preference', 'error']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user, db } = ctx
      const { date, reason } = input

      if (!AI_API_KEY) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'AI content generation is not configured',
        })
      }

      try {
        // Find existing content
        const [existingContent] = await db
          .select()
          .from(dailyContent)
          .where(
            and(
              eq(dailyContent.userId, user.id),
              eq(dailyContent.date, date)
            )
          )
          .limit(1)

        if (!existingContent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No content found for the specified date',
          })
        }

        // Gather user context
        const userContext = await gatherUserContext(db, user.id)

        // Initialize AI provider and generator
        const provider = createAIProvider(AI_PROVIDER, AI_API_KEY)
        const generator = new ContentGenerator(provider)

        // Regenerate with feedback context
        const generatedContent = await generator.regenerateContent(
          userContext, 
          reason === 'feedback' ? existingContent.feedback || undefined : undefined
        )

        // Update content
        const [updated] = await db
          .update(dailyContent)
          .set({
            title: generatedContent.title,
            script: generatedContent.script,
            duration: generatedContent.duration,
            keyPoints: generatedContent.keyPoints,
            stage: generatedContent.stage,
            tone: generatedContent.tone,
            promptType: selectTemplate({
              currentStreak: userContext.currentStreak,
              longestStreak: userContext.longestStreak,
              totalDaysActive: userContext.totalDaysActive,
              timeOfDay: userContext.timeOfDay,
              isReturning: userContext.currentStreak === 0 && userContext.longestStreak > 0,
            }),
            audioUrl: null, // Reset audio URL so it gets regenerated
            delivered: false,
            deliveredAt: null,
            listened: false,
            listenedAt: null,
            feedback: null,
          })
          .where(eq(dailyContent.id, existingContent.id))
          .returning()

        return updated
      } catch (error) {
        console.error('Error regenerating content:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to regenerate content',
        })
      }
    }),

  // Preview content with specific prompt type
  previewContent: protectedProcedure
    .input(previewContentSchema)
    .mutation(async ({ ctx, input }) => {
      const { user, db } = ctx
      const { promptType, customContext } = input

      if (!AI_API_KEY) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'AI content generation is not configured',
        })
      }

      try {
        // Gather base user context
        let userContext = await gatherUserContext(db, user.id)

        // Override with custom context if provided
        if (customContext) {
          userContext = {
            ...userContext,
            ...customContext,
          }
        }

        // Initialize AI provider and generator
        const provider = createAIProvider(AI_PROVIDER, AI_API_KEY)
        const generator = new ContentGenerator(provider)

        // Generate preview
        const generatedContent = await generator.previewContent(userContext, promptType)

        return {
          script: generatedContent.script,
          title: generatedContent.title,
          duration: generatedContent.duration,
          keyPoints: generatedContent.keyPoints,
          stage: generatedContent.stage,
          tone: generatedContent.tone,
          promptType,
        }
      } catch (error) {
        console.error('Error generating preview:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate preview content',
        })
      }
    }),

  // Get content for a specific date
  getContent: protectedProcedure
    .input(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
    )
    .query(async ({ ctx, input }) => {
      const { user, db } = ctx
      const { date } = input

      const [content] = await db
        .select()
        .from(dailyContent)
        .where(
          and(
            eq(dailyContent.userId, user.id),
            eq(dailyContent.date, date)
          )
        )
        .limit(1)

      return content || null
    }),

  // Get recent content history
  getRecentContent: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(30).default(7),
      })
    )
    .query(async ({ ctx, input }) => {
      const { user, db } = ctx
      const { limit } = input

      const content = await db
        .select()
        .from(dailyContent)
        .where(eq(dailyContent.userId, user.id))
        .orderBy(desc(dailyContent.date))
        .limit(limit)

      return content
    }),

  // Mark content as listened
  markAsListened: protectedProcedure
    .input(
      z.object({
        contentId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user, db } = ctx
      const { contentId } = input

      const [updated] = await db
        .update(dailyContent)
        .set({
          listened: true,
          listenedAt: new Date(),
        })
        .where(
          and(
            eq(dailyContent.id, contentId),
            eq(dailyContent.userId, user.id)
          )
        )
        .returning()

      if (!updated) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content not found',
        })
      }

      // Update user streak if this is today's content
      const today = new Date().toISOString().split('T')[0]
      if (updated.date === today) {
        await updateUserStreak(db, user.id)
      }

      return updated
    }),

  // Submit feedback for content
  submitFeedback: protectedProcedure
    .input(feedbackSchema)
    .mutation(async ({ ctx, input }) => {
      const { user, db } = ctx
      const { contentId, feedback } = input

      const [updated] = await db
        .update(dailyContent)
        .set({
          feedback,
        })
        .where(
          and(
            eq(dailyContent.id, contentId),
            eq(dailyContent.userId, user.id)
          )
        )
        .returning()

      if (!updated) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content not found',
        })
      }

      return updated
    }),

  // Get available prompt templates
  getPromptTemplates: protectedProcedure.query(async ({ ctx }) => {
    const { user, db } = ctx

    // Get user context to determine appropriate templates
    const userContext = await gatherUserContext(db, user.id)
    
    // Select appropriate template
    const recommendedTemplate = selectTemplate({
      currentStreak: userContext.currentStreak,
      longestStreak: userContext.longestStreak,
      totalDaysActive: userContext.totalDaysActive,
      timeOfDay: userContext.timeOfDay,
      isReturning: userContext.currentStreak === 0 && userContext.longestStreak > 0,
    })

    // Get all templates with metadata
    const templates = Object.entries(PROMPT_TEMPLATES).map(([key, template]) => ({
      key,
      name: template.name,
      description: template.description,
      tone: template.tone,
      recommended: key === recommendedTemplate,
    }))

    return {
      templates,
      recommendedTemplate,
    }
  }),
})

// Helper function to gather user context for AI generation
async function gatherUserContext(db: any, userId: number): Promise<UserContext> {
  // Get user profile
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1)

  if (!profile) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'User profile not found',
    })
  }

  // Get user streak data
  const [streak] = await db
    .select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId))
    .limit(1)

  // Get recent achievements
  const recentAchievements = await db
    .select({
      name: sql`a.name`,
    })
    .from(userAchievements)
    .innerJoin('achievements as a', sql`a.id = ${userAchievements.achievementId}`)
    .where(eq(userAchievements.userId, userId))
    .orderBy(desc(userAchievements.unlockedAt))
    .limit(5)

  // Determine time of day
  const hour = new Date().getHours()
  let timeOfDay: 'morning' | 'afternoon' | 'evening'
  if (hour < 12) timeOfDay = 'morning'
  else if (hour < 18) timeOfDay = 'afternoon'
  else timeOfDay = 'evening'

  return {
    userId,
    name: profile.personalityType?.split(' ')[0] || undefined, // Extract first name if stored
    painPoints: profile.painPoints || [],
    goals: profile.goals || [],
    learningStyle: profile.learningStyle,
    currentLevel: profile.currentLevel || 5,
    progressStage: profile.progressStage || 'beginner',
    currentStreak: streak?.currentStreak || 0,
    longestStreak: streak?.longestStreak || 0,
    totalDaysActive: streak?.totalDaysActive || 0,
    lastActiveDate: streak?.lastActiveDate ? new Date(streak.lastActiveDate) : undefined,
    recentAchievements: recentAchievements.map(a => a.name),
    timeOfDay,
    personalityType: profile.personalityType,
    triggers: profile.triggers || [],
    blockers: profile.blockers || [],
  }
}

// Helper function to update user streak
async function updateUserStreak(db: any, userId: number) {
  const today = new Date().toISOString().split('T')[0]
  
  // Get current streak
  const [streak] = await db
    .select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId))
    .limit(1)

  if (!streak) {
    // Create new streak
    await db.insert(userStreaks).values({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      totalDaysActive: 1,
      lastActiveDate: today,
    })
  } else {
    const lastActive = streak.lastActiveDate
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    let newCurrentStreak = streak.currentStreak
    let newLongestStreak = streak.longestStreak

    if (lastActive === yesterdayStr) {
      // Continuing streak
      newCurrentStreak = streak.currentStreak + 1
      newLongestStreak = Math.max(newCurrentStreak, streak.longestStreak)
    } else if (lastActive !== today) {
      // Broken streak or same day
      newCurrentStreak = lastActive === today ? streak.currentStreak : 1
    }

    await db
      .update(userStreaks)
      .set({
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        totalDaysActive: streak.totalDaysActive + (lastActive === today ? 0 : 1),
        lastActiveDate: today,
        updatedAt: new Date(),
      })
      .where(eq(userStreaks.userId, userId))
  }
}