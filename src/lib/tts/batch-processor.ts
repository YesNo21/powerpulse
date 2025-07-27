import { db } from '@/db'
import { audioGenerationQueue, dailyContent, users } from '@/db/schema'
import { eq, and, lte, or, isNull } from 'drizzle-orm'
import { getGoogleTTS } from './google-tts'
import { getAudioProcessor } from './audio-processor'
import { getAudioStorage } from './audio-storage'
import { env } from '@/env'

export interface BatchProcessorOptions {
  maxConcurrent?: number
  maxRetries?: number
  batchSize?: number
}

export class AudioBatchProcessor {
  private options: Required<BatchProcessorOptions>
  private isProcessing = false

  constructor(options?: BatchProcessorOptions) {
    this.options = {
      maxConcurrent: options?.maxConcurrent || 3,
      maxRetries: options?.maxRetries || 3,
      batchSize: options?.batchSize || 10,
    }
  }

  /**
   * Process all pending audio generation jobs
   */
  async processPendingJobs(): Promise<{
    processed: number
    failed: number
    skipped: number
  }> {
    if (this.isProcessing) {
      console.log('Batch processor is already running')
      return { processed: 0, failed: 0, skipped: 0 }
    }

    this.isProcessing = true
    const results = { processed: 0, failed: 0, skipped: 0 }

    try {
      // Get pending jobs
      const pendingJobs = await db
        .select()
        .from(audioGenerationQueue)
        .where(
          and(
            eq(audioGenerationQueue.status, 'pending'),
            lte(audioGenerationQueue.scheduledFor, new Date()),
            lte(audioGenerationQueue.attempts, this.options.maxRetries)
          )
        )
        .limit(this.options.batchSize)

      if (pendingJobs.length === 0) {
        console.log('No pending audio generation jobs')
        return results
      }

      console.log(`Processing ${pendingJobs.length} audio generation jobs`)

      // Process jobs in batches
      for (let i = 0; i < pendingJobs.length; i += this.options.maxConcurrent) {
        const batch = pendingJobs.slice(i, i + this.options.maxConcurrent)
        
        const batchResults = await Promise.allSettled(
          batch.map(job => this.processJob(job))
        )

        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            if (result.value === 'processed') {
              results.processed++
            } else if (result.value === 'skipped') {
              results.skipped++
            }
          } else {
            results.failed++
          }
        }
      }

      return results
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Process a single audio generation job
   */
  private async processJob(job: typeof audioGenerationQueue.$inferSelect): Promise<'processed' | 'failed' | 'skipped'> {
    try {
      // Update status to processing
      await db
        .update(audioGenerationQueue)
        .set({ status: 'processing' })
        .where(eq(audioGenerationQueue.id, job.id))

      // Initialize services
      const tts = getGoogleTTS(
        {
          projectId: env.GOOGLE_CLOUD_PROJECT_ID,
          keyFilename: env.GOOGLE_CLOUD_KEYFILE,
        },
        job.voiceSettings as any
      )
      const processor = getAudioProcessor()
      const storage = getAudioStorage()

      // Generate audio
      const ttsResult = await tts.synthesizeSpeech(
        job.script,
        job.voiceSettings as any,
        { ssml: true }
      )

      // Process the audio
      const processedAudio = await processor.processAudio(
        ttsResult.audioContent,
        ttsResult.format
      )

      // Store the audio file
      const storedFile = await storage.storeAudio(processedAudio.buffer, {
        userId: job.userId,
        contentId: -1, // Queue items may not have associated content
        filename: `queue_${job.id}_${Date.now()}.${processedAudio.metadata.format}`,
        format: processedAudio.metadata.format,
        duration: processedAudio.metadata.duration,
        size: processedAudio.metadata.size,
        voiceSettings: job.voiceSettings as any,
        createdAt: new Date(),
      })

      // Update job status
      await db
        .update(audioGenerationQueue)
        .set({
          status: 'completed',
          audioUrl: storedFile.url,
          processedAt: new Date(),
        })
        .where(eq(audioGenerationQueue.id, job.id))

      console.log(`Successfully processed audio job ${job.id}`)
      return 'processed'
    } catch (error) {
      console.error(`Error processing audio job ${job.id}:`, error)

      // Update job with error
      await db
        .update(audioGenerationQueue)
        .set({
          status: 'failed',
          attempts: job.attempts + 1,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        .where(eq(audioGenerationQueue.id, job.id))

      return 'failed'
    }
  }

  /**
   * Generate audio for all daily content that doesn't have audio yet
   */
  async generateMissingAudio(date?: Date): Promise<{
    generated: number
    failed: number
  }> {
    const targetDate = date || new Date()
    const results = { generated: 0, failed: 0 }

    try {
      // Get content without audio
      const contentWithoutAudio = await db
        .select({
          content: dailyContent,
          user: users,
        })
        .from(dailyContent)
        .innerJoin(users, eq(dailyContent.userId, users.id))
        .where(
          and(
            eq(dailyContent.date, targetDate.toISOString().split('T')[0]),
            or(isNull(dailyContent.audioUrl), eq(dailyContent.audioUrl, ''))
          )
        )
        .limit(this.options.batchSize)

      if (contentWithoutAudio.length === 0) {
        console.log('All content has audio generated')
        return results
      }

      console.log(`Generating audio for ${contentWithoutAudio.length} content items`)

      // Initialize services
      const tts = getGoogleTTS({
        projectId: env.GOOGLE_CLOUD_PROJECT_ID,
        keyFilename: env.GOOGLE_CLOUD_KEYFILE,
      })
      const processor = getAudioProcessor()
      const storage = getAudioStorage()

      // Process in batches
      for (let i = 0; i < contentWithoutAudio.length; i += this.options.maxConcurrent) {
        const batch = contentWithoutAudio.slice(i, i + this.options.maxConcurrent)
        
        const batchResults = await Promise.allSettled(
          batch.map(async ({ content, user }) => {
            try {
              // Generate audio with SSML
              const scriptWithSSML = tts.enhanceScriptWithSSML(content.script, {
                pauseAfterSentence: '400ms',
                pauseAfterParagraph: '1s',
                emphasisKeywords: content.keyPoints || [],
              })

              const ttsResult = await tts.synthesizeSpeech(scriptWithSSML, {}, { ssml: true })

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
                createdAt: new Date(),
              })

              // Update content with audio URL
              await db
                .update(dailyContent)
                .set({
                  audioUrl: storedFile.url,
                  duration: processedAudio.metadata.duration,
                })
                .where(eq(dailyContent.id, content.id))

              return 'success'
            } catch (error) {
              console.error(`Error generating audio for content ${content.id}:`, error)
              
              // Log to queue for retry
              await db.insert(audioGenerationQueue).values({
                userId: user.id,
                script: content.script,
                scheduledFor: new Date(),
                voiceSettings: {},
                status: 'failed',
                attempts: 1,
                error: error instanceof Error ? error.message : 'Unknown error',
              })
              
              throw error
            }
          })
        )

        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            results.generated++
          } else {
            results.failed++
          }
        }
      }

      return results
    } catch (error) {
      console.error('Error in batch audio generation:', error)
      throw error
    }
  }

  /**
   * Clean up old completed jobs
   */
  async cleanupOldJobs(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    const result = await db
      .delete(audioGenerationQueue)
      .where(
        and(
          eq(audioGenerationQueue.status, 'completed'),
          lte(audioGenerationQueue.processedAt, cutoffDate)
        )
      )

    return result.count || 0
  }

  /**
   * Retry failed jobs
   */
  async retryFailedJobs(): Promise<number> {
    const result = await db
      .update(audioGenerationQueue)
      .set({
        status: 'pending',
        attempts: 0,
        error: null,
      })
      .where(
        and(
          eq(audioGenerationQueue.status, 'failed'),
          lte(audioGenerationQueue.attempts, this.options.maxRetries)
        )
      )

    return result.count || 0
  }
}

// Singleton instance
let processorInstance: AudioBatchProcessor | null = null

export function getAudioBatchProcessor(options?: BatchProcessorOptions): AudioBatchProcessor {
  if (!processorInstance) {
    processorInstance = new AudioBatchProcessor(options)
  }
  return processorInstance
}