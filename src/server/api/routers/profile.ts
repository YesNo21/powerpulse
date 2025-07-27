import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { z } from 'zod'
import { db } from '@/db'
import { userProfiles, quizResponses, users } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

const createProfileSchema = z.object({
  painPoints: z.array(z.string()),
  goals: z.array(z.string()),
  learningStyles: z.array(z.string()),
  currentLevel: z.number().min(1).max(10),
  progressStage: z.enum(['beginner', 'intermediate', 'advanced', 'mastery']),
  personalityType: z.string().optional(),
  triggers: z.array(z.string()).optional(),
  blockers: z.array(z.string()).optional(),
  preferredDeliveryTime: z.string().optional(),
  deliveryMethod: z.enum(['email', 'whatsapp', 'telegram']).optional(),
  voicePreference: z.string().optional(),
  bio: z.string().optional(),
  timezone: z.string().optional(),
  preferredWorkoutTime: z.string().optional(),
})

const quizResponseSchema = z.object({
  questionId: z.string(),
  answer: z.any(),
})

export const profileRouter = createTRPCRouter({
  // Get current user's profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, ctx.userId),
    })
    
    return profile
  }),

  // Create or update user profile
  upsertProfile: protectedProcedure
    .input(createProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const existingProfile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, ctx.userId),
      })

      if (existingProfile) {
        const [updatedProfile] = await db
          .update(userProfiles)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.userId, ctx.userId))
          .returning()

        return updatedProfile
      } else {
        const [newProfile] = await db
          .insert(userProfiles)
          .values({
            userId: ctx.userId,
            ...input,
          })
          .returning()

        return newProfile
      }
    }),

  // Save quiz response
  saveQuizResponse: protectedProcedure
    .input(quizResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const [response] = await db
        .insert(quizResponses)
        .values({
          userId: ctx.userId,
          questionId: input.questionId,
          answer: input.answer,
        })
        .returning()

      return response
    }),

  // Get all quiz responses for user
  getQuizResponses: protectedProcedure.query(async ({ ctx }) => {
    const responses = await db.query.quizResponses.findMany({
      where: eq(quizResponses.userId, ctx.userId),
    })
    
    return responses
  }),

  // Complete quiz and create profile
  completeQuiz: protectedProcedure
    .input(z.object({
      identity: z.object({
        name: z.string(),
        pronouns: z.string().optional(),
      }),
      goals: z.object({
        primaryGoals: z.array(z.string()),
        specificGoals: z.array(z.string()),
      }),
      painPoints: z.object({
        painPoints: z.array(z.string()),
      }),
      currentLevel: z.object({
        level: z.number(),
        biggestFrustration: z.string(),
      }),
      idealOutcome: z.object({
        dreamTransformation: z.string(),
      }),
      learningStyle: z.object({
        styles: z.array(z.string()),
        intensity: z.number(),
      }),
      voiceSelection: z.object({
        voiceId: z.string(),
        voiceName: z.string(),
        persona: z.any().optional(),
      }),
      schedule: z.object({
        preferredTime: z.string(),
        timezone: z.string(),
      }),
      delivery: z.object({
        method: z.enum(['email', 'whatsapp', 'telegram']),
        contact: z.string(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      // Save all quiz responses
      const quizData = [
        { questionId: 'identity', answer: input.identity },
        { questionId: 'goals', answer: input.goals },
        { questionId: 'painPoints', answer: input.painPoints },
        { questionId: 'currentLevel', answer: input.currentLevel },
        { questionId: 'idealOutcome', answer: input.idealOutcome },
        { questionId: 'learningStyle', answer: input.learningStyle },
        { questionId: 'voiceSelection', answer: input.voiceSelection },
        { questionId: 'schedule', answer: input.schedule },
        { questionId: 'delivery', answer: input.delivery },
      ]

      // Save quiz responses
      for (const response of quizData) {
        await db.insert(quizResponses).values({
          userId: ctx.userId,
          questionId: response.questionId,
          answer: response.answer,
        })
      }

      // Determine progress stage based on current level
      let progressStage: 'beginner' | 'intermediate' | 'advanced' | 'mastery'
      if (input.currentLevel.level <= 3) progressStage = 'beginner'
      else if (input.currentLevel.level <= 6) progressStage = 'intermediate'
      else if (input.currentLevel.level <= 8) progressStage = 'advanced'
      else progressStage = 'mastery'

      // Create comprehensive profile
      const profileData = {
        painPoints: input.painPoints.painPoints,
        goals: [...input.goals.primaryGoals, ...input.goals.specificGoals],
        learningStyles: input.learningStyle.styles,
        currentLevel: input.currentLevel.level,
        progressStage,
        personalityType: `${input.learningStyle.styles.join('-')}-${input.learningStyle.intensity}`,
        triggers: input.goals.specificGoals,
        blockers: input.painPoints.painPoints,
        preferredDeliveryTime: input.schedule.preferredTime,
        deliveryMethod: input.delivery.method,
        voicePreference: input.voiceSelection.voiceId,
        bio: `${input.idealOutcome.dreamTransformation}. Biggest frustration: ${input.currentLevel.biggestFrustration}`,
        timezone: input.schedule.timezone,
      }

      const [profile] = await db
        .insert(userProfiles)
        .values({
          userId: ctx.userId,
          ...profileData,
        })
        .onConflictDoUpdate({
          target: userProfiles.userId,
          set: {
            ...profileData,
            updatedAt: new Date(),
          },
        })
        .returning()

      // Update user name in users table if provided
      if (input.identity.name) {
        await db
          .update(users)
          .set({
            name: input.identity.name,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.userId))
      }

      return { profile, quizCompleted: true }
    }),

  // Get profile completion status
  getProfileCompletion: protectedProcedure.query(async ({ ctx }) => {
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, ctx.userId),
    })
    
    const quizResponseCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(quizResponses)
      .where(eq(quizResponses.userId, ctx.userId))

    return {
      hasProfile: !!profile,
      quizCompleted: quizResponseCount[0]?.count >= 8,
      profileComplete: !!(profile?.painPoints?.length && profile?.goals?.length),
    }
  }),
})