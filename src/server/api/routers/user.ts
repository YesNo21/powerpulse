import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { users, userProfiles, quizResponses, userStreaks } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

// Input schemas
const updateProfileSchema = z.object({
  painPoints: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  learningStyle: z.enum(['direct', 'gentle', 'tough', 'story']).optional(),
  currentLevel: z.number().min(1).max(10).optional(),
  progressStage: z.enum(['beginner', 'intermediate', 'advanced', 'mastery']).optional(),
  personalityType: z.string().optional(),
  triggers: z.array(z.string()).optional(),
  blockers: z.array(z.string()).optional(),
  preferredDeliveryTime: z.string().regex(/^\d{2}:\d{2}$/).optional(), // HH:MM format
  deliveryMethod: z.enum(['email', 'whatsapp', 'telegram', 'sms']).optional(),
})

const updateUserDetailsSchema = z.object({
  name: z.string().min(1).max(256).optional(),
  bio: z.string().max(500).optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  preferredWorkoutTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
})

const quizResponseSchema = z.object({
  questionId: z.string(),
  answer: z.unknown(), // Allow any type of answer since it's stored as JSON
})

const completeQuizSchema = z.object({
  responses: z.array(quizResponseSchema),
  profileData: z.object({
    painPoints: z.array(z.string()).optional(),
    goals: z.array(z.string()).optional(),
    learningStyle: z.enum(['direct', 'gentle', 'tough', 'story']).optional(),
    currentLevel: z.number().min(1).max(10).optional(),
    progressStage: z.enum(['beginner', 'intermediate', 'advanced', 'mastery']).optional(),
    personalityType: z.string().optional(),
    triggers: z.array(z.string()).optional(),
    blockers: z.array(z.string()).optional(),
    preferredDeliveryTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    deliveryMethod: z.enum(['email', 'whatsapp', 'telegram', 'sms']).optional(),
  }),
})

export const userRouter = createTRPCRouter({
  // Get the current user's profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { user, db } = ctx

    // Get user data from database
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    if (!dbUser) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    // Get user profile
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1)

    // Get user streak data
    const [streak] = await db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, user.id))
      .limit(1)

    // If no profile exists, create a default one
    if (!profile) {
      const [newProfile] = await db
        .insert(userProfiles)
        .values({
          userId: user.id,
          painPoints: [],
          goals: [],
          triggers: [],
          blockers: [],
        })
        .returning()

      return {
        user: dbUser,
        profile: newProfile,
        streak: streak || null,
      }
    }

    return {
      user: dbUser,
      profile,
      streak: streak || null,
    }
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const { user, db } = ctx

      // Check if profile exists
      const [existingProfile] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, user.id))
        .limit(1)

      if (!existingProfile) {
        // Create new profile with input data
        const [newProfile] = await db
          .insert(userProfiles)
          .values({
            userId: user.id,
            ...input,
            updatedAt: new Date(),
          })
          .returning()

        return newProfile
      }

      // Update existing profile
      const [updatedProfile] = await db
        .update(userProfiles)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, user.id))
        .returning()

      if (!updatedProfile) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile',
        })
      }

      return updatedProfile
    }),

  // Complete quiz and save responses
  completeQuiz: protectedProcedure
    .input(completeQuizSchema)
    .mutation(async ({ ctx, input }) => {
      const { user, db } = ctx
      const { responses, profileData } = input

      try {
        // Start a transaction
        await db.transaction(async (tx) => {
          // Save quiz responses
          for (const response of responses) {
            await tx.insert(quizResponses).values({
              userId: user.id,
              questionId: response.questionId,
              answer: response.answer,
            })
          }

          // Check if profile exists
          const [existingProfile] = await tx
            .select()
            .from(userProfiles)
            .where(eq(userProfiles.userId, user.id))
            .limit(1)

          if (!existingProfile) {
            // Create new profile
            await tx.insert(userProfiles).values({
              userId: user.id,
              ...profileData,
              updatedAt: new Date(),
            })
          } else {
            // Update existing profile
            await tx
              .update(userProfiles)
              .set({
                ...profileData,
                updatedAt: new Date(),
              })
              .where(eq(userProfiles.userId, user.id))
          }

          // Initialize user streak if it doesn't exist
          const [existingStreak] = await tx
            .select()
            .from(userStreaks)
            .where(eq(userStreaks.userId, user.id))
            .limit(1)

          if (!existingStreak) {
            await tx.insert(userStreaks).values({
              userId: user.id,
              currentStreak: 0,
              longestStreak: 0,
              totalDaysActive: 0,
            })
          }
        })

        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save quiz responses',
        })
      }
    }),

  // Get quiz responses for the current user
  getQuizResponses: protectedProcedure.query(async ({ ctx }) => {
    const { user, db } = ctx

    const responses = await db
      .select()
      .from(quizResponses)
      .where(eq(quizResponses.userId, user.id))
      .orderBy(quizResponses.createdAt)

    return responses
  }),

  // Update user details (name, bio, etc.)
  updateUserDetails: protectedProcedure
    .input(updateUserDetailsSchema)
    .mutation(async ({ ctx, input }) => {
      const { user, db } = ctx

      // First, let's check if we need to add these fields to the user profile
      const [existingProfile] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, user.id))
        .limit(1)

      if (!existingProfile) {
        // Create profile with the details
        const [newProfile] = await db
          .insert(userProfiles)
          .values({
            userId: user.id,
            ...input,
            updatedAt: new Date(),
          })
          .returning()

        return { success: true, profile: newProfile }
      }

      // Update the profile with additional details
      const [updatedProfile] = await db
        .update(userProfiles)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, user.id))
        .returning()

      return { success: true, profile: updatedProfile }
    }),

  // Get user statistics
  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    const { user, db } = ctx

    // Get user data from database
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    if (!dbUser) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    // Get total days active
    const [streak] = await db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, user.id))
      .limit(1)

    // Get account creation date and other stats
    const stats = {
      accountCreatedAt: dbUser.createdAt,
      totalDaysActive: streak?.totalDaysActive || 0,
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      subscriptionStatus: dbUser.subscriptionStatus,
      refundEligibleUntil: dbUser.refundEligibleUntil,
    }

    return stats
  }),
})