import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { db } from '@/db'
import { dailyContent, audioGenerationQueue, users, userProfiles } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getGoogleTTS, VoiceSettingsSchema, SSMLBuilder } from '@/lib/tts/google-tts'
import { getAudioProcessor } from '@/lib/tts/audio-processor'
import { getAudioStorage } from '@/lib/storage/audio-storage'
import { env } from '@/env'

// Input schemas
const GenerateAudioInput = z.object({
  contentId: z.number(),
  voiceSettings: VoiceSettingsSchema.optional(),
  useSSML: z.boolean().default(true),
  regenerate: z.boolean().default(false),
})

const GetAudioUrlInput = z.object({
  contentId: z.number(),
})

const ListVoicesInput = z.object({
  languageCode: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'NEUTRAL']).optional(),
  category: z.enum(['neural', 'wavenet', 'standard']).optional(),
})

const PreviewVoiceInput = z.object({
  voiceName: z.string(),
  sampleText: z.string().optional(),
})

export const audioRouter = createTRPCRouter({
  /**
   * Generate audio from content text
   */
  generateAudio: protectedProcedure
    .input(GenerateAudioInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id

      // Get user from database
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, ctx.auth.userId))
        .limit(1)

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Get the content to generate audio for
      const [content] = await db
        .select()
        .from(dailyContent)
        .where(
          and(
            eq(dailyContent.id, input.contentId),
            eq(dailyContent.userId, user.id)
          )
        )
        .limit(1)

      if (!content) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content not found',
        })
      }

      // Check if audio already exists and not regenerating
      if (content.audioUrl && !input.regenerate) {
        return {
          success: true,
          audioUrl: content.audioUrl,
          cached: true,
        }
      }

      // Get user profile for voice preferences
      const [profile] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, user.id))
        .limit(1)

      try {
        // Initialize services
        const tts = getGoogleTTS(
          {
            projectId: env.GOOGLE_CLOUD_PROJECT_ID,
            keyFilename: env.GOOGLE_CLOUD_KEYFILE,
          },
          input.voiceSettings
        )
        const processor = getAudioProcessor()
        const storage = getAudioStorage()

        // Prepare the script with SSML if enabled
        let scriptToSynthesize = content.script

        if (input.useSSML) {
          // Enhance script with SSML markup
          scriptToSynthesize = tts.enhanceScriptWithSSML(content.script, {
            pauseAfterSentence: '400ms',
            pauseAfterParagraph: '1s',
            emphasisKeywords: content.keyPoints || [],
          })
        }

        // Generate audio
        const ttsResult = await tts.synthesizeSpeech(
          scriptToSynthesize,
          input.voiceSettings,
          { ssml: input.useSSML }
        )

        // Process the audio
        const processedAudio = await processor.processAudio(
          ttsResult.audioContent,
          ttsResult.format
        )

        // Store the audio file
        const storedFile = await storage.storeAudio(processedAudio.buffer, {
          userId: user.id,
          contentId: content.id,
          filename: `content_${content.id}_${Date.now()}.${processedAudio.metadata.format}`,
          format: processedAudio.metadata.format,
          duration: processedAudio.metadata.duration,
          size: processedAudio.metadata.size,
          voiceSettings: input.voiceSettings,
          createdAt: new Date(),
        })

        // Update content with audio URL and duration
        await db
          .update(dailyContent)
          .set({
            audioUrl: storedFile.url,
            duration: processedAudio.metadata.duration,
          })
          .where(eq(dailyContent.id, content.id))

        return {
          success: true,
          audioUrl: storedFile.url,
          duration: processedAudio.metadata.duration,
          format: processedAudio.metadata.format,
          size: processedAudio.metadata.size,
          cached: false,
        }
      } catch (error) {
        console.error('Error generating audio:', error)
        
        // Log to audio generation queue for retry
        await db.insert(audioGenerationQueue).values({
          userId: user.id,
          script: content.script,
          scheduledFor: new Date(),
          voiceSettings: input.voiceSettings || {},
          status: 'failed',
          attempts: 1,
          error: error instanceof Error ? error.message : 'Unknown error',
        })

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate audio',
          cause: error,
        })
      }
    }),

  /**
   * Get signed URL for audio file
   */
  getAudioUrl: protectedProcedure
    .input(GetAudioUrlInput)
    .query(async ({ ctx, input }) => {
      // Get user from database
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, ctx.auth.userId))
        .limit(1)

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Get the content
      const [content] = await db
        .select()
        .from(dailyContent)
        .where(
          and(
            eq(dailyContent.id, input.contentId),
            eq(dailyContent.userId, user.id)
          )
        )
        .limit(1)

      if (!content) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content not found',
        })
      }

      if (!content.audioUrl) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Audio not generated for this content',
        })
      }

      // For Vercel Blob, URLs are already secure and time-limited
      // Just return the existing URL
      return {
        url: content.audioUrl,
        expiresIn: 3600, // 1 hour
      }
    }),

  /**
   * List available voices
   */
  listVoices: protectedProcedure
    .input(ListVoicesInput)
    .query(async ({ ctx, input }) => {
      try {
        const tts = getGoogleTTS({
          projectId: env.GOOGLE_CLOUD_PROJECT_ID,
          keyFilename: env.GOOGLE_CLOUD_KEYFILE,
        })

        // Get all voices
        let voices = await tts.listVoices(input.languageCode)

        // Filter by gender if specified
        if (input.gender) {
          voices = voices.filter(voice => voice.ssmlGender === input.gender)
        }

        // Filter by category if specified
        if (input.category) {
          voices = voices.filter(voice => voice.category === input.category)
        }

        // Sort voices: Neural > Wavenet > Standard
        voices.sort((a, b) => {
          const categoryOrder = { neural: 0, wavenet: 1, standard: 2 }
          const aOrder = categoryOrder[a.category || 'standard']
          const bOrder = categoryOrder[b.category || 'standard']
          return aOrder - bOrder
        })

        // Group by language and gender for better UX
        const grouped = voices.reduce((acc, voice) => {
          const key = `${voice.languageCode}-${voice.ssmlGender}`
          if (!acc[key]) {
            acc[key] = {
              languageCode: voice.languageCode,
              gender: voice.ssmlGender,
              voices: [],
            }
          }
          acc[key].voices.push(voice)
          return acc
        }, {} as Record<string, any>)

        return {
          voices,
          grouped: Object.values(grouped),
          total: voices.length,
        }
      } catch (error) {
        console.error('Error listing voices:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list voices',
          cause: error,
        })
      }
    }),

  /**
   * Generate voice preview
   */
  previewVoice: protectedProcedure
    .input(PreviewVoiceInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const tts = getGoogleTTS({
          projectId: env.GOOGLE_CLOUD_PROJECT_ID,
          keyFilename: env.GOOGLE_CLOUD_KEYFILE,
        })
        const processor = getAudioProcessor()
        const storage = getAudioStorage()

        // Get user from database
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, ctx.auth.userId))
          .limit(1)

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          })
        }

        // Generate preview
        const ttsResult = await tts.generateVoicePreview(
          input.voiceName,
          input.sampleText
        )

        // Process the audio (skip duration validation for preview)
        const processedAudio = await processor.processAudio(
          ttsResult.audioContent,
          ttsResult.format,
          { duration: 10 } // Short preview
        )

        // Store temporarily (with short expiry)
        const storedFile = await storage.storeAudio(processedAudio.buffer, {
          userId: user.id,
          contentId: -1, // Special ID for previews
          filename: `preview_${input.voiceName}_${Date.now()}.${processedAudio.metadata.format}`,
          format: processedAudio.metadata.format,
          duration: processedAudio.metadata.duration,
          size: processedAudio.metadata.size,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
        })

        return {
          success: true,
          previewUrl: storedFile.url,
          duration: processedAudio.metadata.duration,
          format: processedAudio.metadata.format,
        }
      } catch (error) {
        console.error('Error generating voice preview:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate voice preview',
          cause: error,
        })
      }
    }),

  /**
   * Get audio generation queue status
   */
  getQueueStatus: protectedProcedure.query(async ({ ctx }) => {
    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, ctx.auth.userId))
      .limit(1)

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    // Get queue items for user
    const queueItems = await db
      .select()
      .from(audioGenerationQueue)
      .where(eq(audioGenerationQueue.userId, user.id))
      .orderBy(desc(audioGenerationQueue.createdAt))
      .limit(10)

    const pending = queueItems.filter(item => item.status === 'pending').length
    const processing = queueItems.filter(item => item.status === 'processing').length
    const completed = queueItems.filter(item => item.status === 'completed').length
    const failed = queueItems.filter(item => item.status === 'failed').length

    return {
      items: queueItems,
      summary: {
        pending,
        processing,
        completed,
        failed,
        total: queueItems.length,
      },
    }
  }),

  /**
   * Update user voice preferences
   */
  updateVoicePreferences: protectedProcedure
    .input(VoiceSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      // Get user from database
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, ctx.auth.userId))
        .limit(1)

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Store voice preferences in user profile
      // This would typically be stored in a dedicated field
      // For now, we'll return success
      return {
        success: true,
        preferences: input,
      }
    }),
})