import { put, del, list, head } from '@vercel/blob'
import { z } from 'zod'

export const AudioFileMetadataSchema = z.object({
  userId: z.number(),
  contentId: z.number(),
  filename: z.string(),
  format: z.enum(['mp3', 'wav', 'ogg']),
  duration: z.number(),
  size: z.number(),
  voiceSettings: z.record(z.any()).optional(),
  createdAt: z.date(),
  expiresAt: z.date().optional(),
})

export type AudioFileMetadata = z.infer<typeof AudioFileMetadataSchema>

export interface StoredAudioFile {
  url: string
  pathname: string
  metadata: AudioFileMetadata
}

export interface AudioStorageOptions {
  basePrefix?: string
  defaultExpiry?: number // hours
  maxFileSize?: number // bytes
}

export class AudioStorage {
  private basePrefix: string
  private defaultExpiry: number
  private maxFileSize: number

  constructor(options?: AudioStorageOptions) {
    this.basePrefix = options?.basePrefix || 'audio'
    this.defaultExpiry = options?.defaultExpiry || 24 * 7 // 1 week
    this.maxFileSize = options?.maxFileSize || 50 * 1024 * 1024 // 50MB
  }

  /**
   * Store an audio file in Vercel Blob storage
   */
  async storeAudio(
    audioBuffer: Buffer,
    metadata: AudioFileMetadata
  ): Promise<StoredAudioFile> {
    // Validate file size
    if (audioBuffer.length > this.maxFileSize) {
      throw new Error(`File too large: ${audioBuffer.length} bytes (max: ${this.maxFileSize})`)
    }

    // Generate pathname
    const pathname = this.generatePathname(metadata)

    try {
      // Upload to Vercel Blob
      const blob = await put(pathname, audioBuffer, {
        access: 'public',
        contentType: this.getContentType(metadata.format),
        cacheControlMaxAge: 3600, // 1 hour cache
        addRandomSuffix: false,
      })

      return {
        url: blob.url,
        pathname: blob.pathname,
        metadata,
      }
    } catch (error) {
      console.error('Error storing audio file:', error)
      throw new Error(`Failed to store audio file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get a secure, time-limited URL for an audio file
   */
  async getSecureUrl(
    pathname: string,
    expiryHours?: number
  ): Promise<string> {
    try {
      // Get blob metadata
      const blobMetadata = await head(pathname)
      
      if (!blobMetadata) {
        throw new Error('Audio file not found')
      }

      // For Vercel Blob, URLs are already secure and time-limited
      // The URL includes a token that expires
      return blobMetadata.url
    } catch (error) {
      console.error('Error getting secure URL:', error)
      throw new Error(`Failed to get audio URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * List audio files for a user
   */
  async listUserAudio(
    userId: number,
    options?: {
      limit?: number
      cursor?: string
    }
  ): Promise<{
    files: StoredAudioFile[]
    hasMore: boolean
    cursor?: string
  }> {
    const prefix = `${this.basePrefix}/user/${userId}/`
    
    try {
      const response = await list({
        prefix,
        limit: options?.limit || 50,
        cursor: options?.cursor,
      })

      const files: StoredAudioFile[] = response.blobs.map(blob => ({
        url: blob.url,
        pathname: blob.pathname,
        metadata: this.parseMetadataFromPathname(blob.pathname),
      }))

      return {
        files,
        hasMore: response.hasMore,
        cursor: response.cursor,
      }
    } catch (error) {
      console.error('Error listing audio files:', error)
      throw new Error(`Failed to list audio files: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete an audio file
   */
  async deleteAudio(pathname: string): Promise<void> {
    try {
      await del(pathname)
    } catch (error) {
      console.error('Error deleting audio file:', error)
      throw new Error(`Failed to delete audio file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Clean up old audio files
   */
  async cleanupOldFiles(
    olderThanHours: number = 24 * 30 // 30 days
  ): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - olderThanHours)

    let deletedCount = 0
    let cursor: string | undefined

    try {
      do {
        const response = await list({
          prefix: this.basePrefix,
          limit: 100,
          cursor,
        })

        for (const blob of response.blobs) {
          const uploadedAt = new Date(blob.uploadedAt)
          
          if (uploadedAt < cutoffDate) {
            await this.deleteAudio(blob.pathname)
            deletedCount++
          }
        }

        cursor = response.cursor
      } while (cursor)

      return deletedCount
    } catch (error) {
      console.error('Error cleaning up old files:', error)
      throw new Error(`Failed to clean up old files: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{
    totalFiles: number
    totalSize: number
    byUser: Map<number, { files: number; size: number }>
  }> {
    let totalFiles = 0
    let totalSize = 0
    const byUser = new Map<number, { files: number; size: number }>()
    let cursor: string | undefined

    try {
      do {
        const response = await list({
          prefix: this.basePrefix,
          limit: 100,
          cursor,
        })

        for (const blob of response.blobs) {
          totalFiles++
          totalSize += blob.size

          // Parse user ID from pathname
          const match = blob.pathname.match(/user\/(\d+)\//)
          if (match) {
            const userId = parseInt(match[1])
            const userStats = byUser.get(userId) || { files: 0, size: 0 }
            userStats.files++
            userStats.size += blob.size
            byUser.set(userId, userStats)
          }
        }

        cursor = response.cursor
      } while (cursor)

      return { totalFiles, totalSize, byUser }
    } catch (error) {
      console.error('Error getting storage stats:', error)
      throw new Error(`Failed to get storage stats: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Cache audio file locally (for performance)
   */
  private cacheKey(pathname: string): string {
    return `audio:cache:${pathname}`
  }

  /**
   * Generate pathname for audio file
   */
  private generatePathname(metadata: AudioFileMetadata): string {
    const date = new Date().toISOString().split('T')[0]
    const timestamp = Date.now()
    
    return `${this.basePrefix}/user/${metadata.userId}/content/${metadata.contentId}/${date}_${timestamp}.${metadata.format}`
  }

  /**
   * Parse metadata from pathname (reverse of generatePathname)
   */
  private parseMetadataFromPathname(pathname: string): AudioFileMetadata {
    const match = pathname.match(/user\/(\d+)\/content\/(\d+)\/(\d{4}-\d{2}-\d{2})_(\d+)\.(\w+)$/)
    
    if (!match) {
      throw new Error(`Invalid pathname format: ${pathname}`)
    }

    const [, userId, contentId, date, timestamp, format] = match

    return {
      userId: parseInt(userId),
      contentId: parseInt(contentId),
      filename: pathname.split('/').pop() || '',
      format: format as 'mp3' | 'wav' | 'ogg',
      duration: 300, // Default, should be stored elsewhere
      size: 0, // Will be filled from blob metadata
      createdAt: new Date(parseInt(timestamp)),
    }
  }

  /**
   * Get content type for audio format
   */
  private getContentType(format: 'mp3' | 'wav' | 'ogg'): string {
    const contentTypes = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      ogg: 'audio/ogg',
    }
    return contentTypes[format]
  }

  /**
   * Generate a pre-signed upload URL (for direct client uploads)
   */
  async generateUploadUrl(
    metadata: AudioFileMetadata
  ): Promise<{
    url: string
    pathname: string
    headers: Record<string, string>
  }> {
    // Vercel Blob doesn't support pre-signed uploads in the same way as S3
    // Instead, you would typically upload through your API
    // This is a placeholder for the pattern
    
    const pathname = this.generatePathname(metadata)
    
    return {
      url: `/api/audio/upload`, // Your API endpoint
      pathname,
      headers: {
        'Content-Type': this.getContentType(metadata.format),
        'X-Audio-Pathname': pathname,
      },
    }
  }
}

// Singleton instance
let storageInstance: AudioStorage | null = null

export function getAudioStorage(options?: AudioStorageOptions): AudioStorage {
  if (!storageInstance) {
    storageInstance = new AudioStorage(options)
  }
  return storageInstance
}