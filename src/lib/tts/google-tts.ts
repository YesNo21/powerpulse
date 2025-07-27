import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech'
import { z } from 'zod'

// Types for Google TTS
export const VoiceSettingsSchema = z.object({
  languageCode: z.string().default('en-US'),
  name: z.string().optional(), // e.g., 'en-US-Neural2-F'
  gender: z.enum(['MALE', 'FEMALE', 'NEUTRAL']).default('FEMALE'),
  speakingRate: z.number().min(0.25).max(4.0).default(1.0),
  pitch: z.number().min(-20).max(20).default(0),
  volumeGainDb: z.number().min(-96).max(16).default(0),
})

export type VoiceSettings = z.infer<typeof VoiceSettingsSchema>

export interface VoiceOption {
  name: string
  languageCode: string
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL'
  naturalSampleRateHertz: number
  description?: string
  category?: 'neural' | 'wavenet' | 'standard'
}

export interface TTSResult {
  audioContent: Buffer
  duration?: number
  format: 'mp3' | 'wav' | 'ogg'
}

// SSML utilities
export class SSMLBuilder {
  private content: string[] = []

  addText(text: string): this {
    this.content.push(text)
    return this
  }

  addPause(duration: string): this {
    this.content.push(`<break time="${duration}"/>`)
    return this
  }

  addEmphasis(text: string, level: 'strong' | 'moderate' | 'none' | 'reduced' = 'moderate'): this {
    this.content.push(`<emphasis level="${level}">${text}</emphasis>`)
    return this
  }

  addProsody(
    text: string,
    options: { rate?: string; pitch?: string; volume?: string }
  ): this {
    const attrs = Object.entries(options)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ')
    this.content.push(`<prosody ${attrs}>${text}</prosody>`)
    return this
  }

  addSayAs(text: string, interpretAs: string, format?: string): this {
    const formatAttr = format ? ` format="${format}"` : ''
    this.content.push(`<say-as interpret-as="${interpretAs}"${formatAttr}>${text}</say-as>`)
    return this
  }

  build(): string {
    return `<speak>${this.content.join(' ')}</speak>`
  }
}

export class GoogleTTSService {
  private client: TextToSpeechClient
  private defaultVoiceSettings: VoiceSettings

  constructor(
    credentials?: { projectId?: string; keyFilename?: string },
    defaultSettings?: Partial<VoiceSettings>
  ) {
    // Initialize Google Cloud TTS client
    this.client = new TextToSpeechClient(credentials)

    // Set default voice settings
    this.defaultVoiceSettings = VoiceSettingsSchema.parse(defaultSettings || {})
  }

  /**
   * Convert text to speech
   */
  async synthesizeSpeech(
    text: string,
    voiceSettings?: Partial<VoiceSettings>,
    options?: {
      ssml?: boolean
      audioEncoding?: 'MP3' | 'OGG_OPUS' | 'LINEAR16'
    }
  ): Promise<TTSResult> {
    const settings = { ...this.defaultVoiceSettings, ...voiceSettings }
    const audioEncoding = options?.audioEncoding || 'MP3'

    const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
      input: options?.ssml ? { ssml: text } : { text },
      voice: {
        languageCode: settings.languageCode,
        name: settings.name,
        ssmlGender: settings.gender as any,
      },
      audioConfig: {
        audioEncoding: audioEncoding as any,
        speakingRate: settings.speakingRate,
        pitch: settings.pitch,
        volumeGainDb: settings.volumeGainDb,
        effectsProfileId: ['headphone-class-device'], // Optimize for headphones
      },
    }

    try {
      const [response] = await this.client.synthesizeSpeech(request)
      
      if (!response.audioContent) {
        throw new Error('No audio content received from Google TTS')
      }

      const audioBuffer = Buffer.from(response.audioContent as string, 'base64')
      
      return {
        audioContent: audioBuffer,
        format: audioEncoding.toLowerCase() as 'mp3' | 'wav' | 'ogg',
      }
    } catch (error) {
      console.error('Error synthesizing speech:', error)
      throw new Error(`Failed to synthesize speech: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * List available voices
   */
  async listVoices(languageCode?: string): Promise<VoiceOption[]> {
    try {
      const [response] = await this.client.listVoices({ languageCode })
      
      if (!response.voices) {
        return []
      }

      return response.voices.map((voice) => {
        const category = this.categorizeVoice(voice.name || '')
        
        return {
          name: voice.name || '',
          languageCode: voice.languageCodes?.[0] || '',
          ssmlGender: voice.ssmlGender as 'MALE' | 'FEMALE' | 'NEUTRAL',
          naturalSampleRateHertz: voice.naturalSampleRateHertz || 24000,
          description: this.generateVoiceDescription(voice),
          category,
        }
      })
    } catch (error) {
      console.error('Error listing voices:', error)
      throw new Error(`Failed to list voices: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate a preview of a voice
   */
  async generateVoicePreview(
    voiceName: string,
    sampleText?: string
  ): Promise<TTSResult> {
    const previewText = sampleText || 
      "Hello! This is a preview of my voice. I'll be guiding you through your daily motivation sessions."

    const voiceSettings: Partial<VoiceSettings> = {
      name: voiceName,
    }

    return this.synthesizeSpeech(previewText, voiceSettings)
  }

  /**
   * Batch process multiple texts
   */
  async batchSynthesize(
    texts: Array<{ id: string; text: string; voiceSettings?: Partial<VoiceSettings> }>,
    options?: {
      ssml?: boolean
      audioEncoding?: 'MP3' | 'OGG_OPUS' | 'LINEAR16'
      maxConcurrent?: number
    }
  ): Promise<Map<string, TTSResult>> {
    const results = new Map<string, TTSResult>()
    const maxConcurrent = options?.maxConcurrent || 3

    // Process in batches to avoid rate limiting
    for (let i = 0; i < texts.length; i += maxConcurrent) {
      const batch = texts.slice(i, i + maxConcurrent)
      
      const batchResults = await Promise.all(
        batch.map(async ({ id, text, voiceSettings }) => {
          try {
            const result = await this.synthesizeSpeech(text, voiceSettings, options)
            return { id, result }
          } catch (error) {
            console.error(`Error processing text ${id}:`, error)
            return { id, error }
          }
        })
      )

      for (const { id, result, error } of batchResults) {
        if (result && !error) {
          results.set(id, result)
        }
      }
    }

    return results
  }

  /**
   * Convert script with SSML markup for better speech
   */
  enhanceScriptWithSSML(script: string, options?: {
    pauseAfterSentence?: string
    pauseAfterParagraph?: string
    emphasisKeywords?: string[]
  }): string {
    const builder = new SSMLBuilder()
    const pauseAfterSentence = options?.pauseAfterSentence || '300ms'
    const pauseAfterParagraph = options?.pauseAfterParagraph || '1s'
    const emphasisKeywords = options?.emphasisKeywords || []

    // Split into paragraphs
    const paragraphs = script.split(/\n\n+/)

    paragraphs.forEach((paragraph, pIndex) => {
      // Split into sentences
      const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph]

      sentences.forEach((sentence, sIndex) => {
        let processedSentence = sentence.trim()

        // Add emphasis to keywords
        emphasisKeywords.forEach(keyword => {
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
          processedSentence = processedSentence.replace(
            regex,
            `<emphasis level="moderate">${keyword}</emphasis>`
          )
        })

        builder.addText(processedSentence)

        // Add pause after sentence
        if (sIndex < sentences.length - 1) {
          builder.addPause(pauseAfterSentence)
        }
      })

      // Add pause after paragraph
      if (pIndex < paragraphs.length - 1) {
        builder.addPause(pauseAfterParagraph)
      }
    })

    return builder.build()
  }

  /**
   * Estimate speech duration (rough estimate)
   */
  estimateDuration(text: string, speakingRate: number = 1.0): number {
    // Average speaking rate is ~150 words per minute at 1.0x speed
    const words = text.split(/\s+/).length
    const baseMinutes = words / 150
    const adjustedMinutes = baseMinutes / speakingRate
    return Math.round(adjustedMinutes * 60) // Return seconds
  }

  /**
   * Categorize voice by type
   */
  private categorizeVoice(voiceName: string): 'neural' | 'wavenet' | 'standard' {
    if (voiceName.includes('Neural')) return 'neural'
    if (voiceName.includes('Wavenet')) return 'wavenet'
    return 'standard'
  }

  /**
   * Generate a user-friendly voice description
   */
  private generateVoiceDescription(voice: protos.google.cloud.texttospeech.v1.IVoice): string {
    const name = voice.name || ''
    const gender = voice.ssmlGender || ''
    
    const parts = name.split('-')
    const voiceType = parts[parts.length - 2] || ''
    const voiceVariant = parts[parts.length - 1] || ''

    let description = `${gender.toLowerCase()} voice`

    if (voiceType.includes('Neural')) {
      description = `Natural ${description} with enhanced clarity`
    } else if (voiceType.includes('Wavenet')) {
      description = `High-quality ${description}`
    } else {
      description = `Standard ${description}`
    }

    // Add variant info
    if (voiceVariant.match(/[A-Z]/)) {
      const variantLetter = voiceVariant.match(/[A-Z]/)?.[0]
      description += ` (variant ${variantLetter})`
    }

    return description
  }
}

// Singleton instance for the application
let ttsInstance: GoogleTTSService | null = null

export function getGoogleTTS(
  credentials?: { projectId?: string; keyFilename?: string },
  defaultSettings?: Partial<VoiceSettings>
): GoogleTTSService {
  if (!ttsInstance) {
    ttsInstance = new GoogleTTSService(credentials, defaultSettings)
  }
  return ttsInstance
}