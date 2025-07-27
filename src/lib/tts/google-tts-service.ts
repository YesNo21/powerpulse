import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { google } from '@google-cloud/text-to-speech/build/protos/protos'

interface VoiceSettings {
  languageCode: string
  name: string
  speakingRate: number
  pitch: number
}

interface TTSResult {
  success: boolean
  audioBuffer?: Buffer
  error?: string
}

// Initialize the client
let ttsClient: TextToSpeechClient | null = null

function getTTSClient(): TextToSpeechClient {
  if (!ttsClient) {
    // Initialize with credentials from environment
    ttsClient = new TextToSpeechClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    })
  }
  return ttsClient
}

export async function generateAudioFromScript({
  script,
  userId,
  voiceSettings,
}: {
  script: string
  userId: string
  voiceSettings: VoiceSettings
}): Promise<TTSResult> {
  try {
    const client = getTTSClient()

    // Construct the request
    const request: google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
      input: { text: script },
      voice: {
        languageCode: voiceSettings.languageCode,
        name: voiceSettings.name,
        ssmlGender: 'NEUTRAL' as const,
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        speakingRate: voiceSettings.speakingRate,
        pitch: voiceSettings.pitch,
        volumeGainDb: 0,
      },
    }

    // Perform the text-to-speech request
    const [response] = await client.synthesizeSpeech(request)

    if (!response.audioContent) {
      throw new Error('No audio content received from TTS service')
    }

    // Convert audio content to Buffer
    const audioBuffer = Buffer.from(response.audioContent as Uint8Array)

    return {
      success: true,
      audioBuffer,
    }
  } catch (error) {
    console.error('TTS generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown TTS error',
    }
  }
}

// Get available voices for a language
export async function getAvailableVoices(languageCode: string = 'en-US') {
  try {
    const client = getTTSClient()
    const [response] = await client.listVoices({ languageCode })

    return response.voices || []
  } catch (error) {
    console.error('Failed to list voices:', error)
    return []
  }
}

// Batch audio generation for efficiency
export async function generateBatchAudio(
  requests: Array<{
    script: string
    userId: string
    voiceSettings: VoiceSettings
  }>
): Promise<Map<string, TTSResult>> {
  const results = new Map<string, TTSResult>()

  // Process in smaller batches to avoid rate limits
  const batchSize = 5
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize)
    
    const batchPromises = batch.map(async (request) => {
      const result = await generateAudioFromScript(request)
      return { userId: request.userId, result }
    })

    const batchResults = await Promise.all(batchPromises)
    batchResults.forEach(({ userId, result }) => {
      results.set(userId, result)
    })

    // Add delay between batches to respect rate limits
    if (i + batchSize < requests.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return results
}

// Voice presets for different coaching styles
export const VOICE_PRESETS = {
  direct: {
    female: 'en-US-Neural2-A', // Authoritative female voice
    male: 'en-US-Neural2-D',   // Authoritative male voice
    speakingRate: 1.1,
    pitch: -1,
  },
  gentle: {
    female: 'en-US-Neural2-C', // Warm female voice
    male: 'en-US-Neural2-I',   // Warm male voice
    speakingRate: 0.95,
    pitch: 1,
  },
  tough: {
    female: 'en-US-Neural2-F', // Strong female voice
    male: 'en-US-Neural2-J',   // Strong male voice
    speakingRate: 1.15,
    pitch: -2,
  },
  story: {
    female: 'en-US-Neural2-E', // Expressive female voice
    male: 'en-US-Neural2-G',   // Expressive male voice
    speakingRate: 1.0,
    pitch: 0,
  },
}

// Helper to select voice based on user preferences
export function selectVoiceForUser(
  learningStyle: string,
  preferredGender: 'male' | 'female' = 'female'
): VoiceSettings {
  const preset = VOICE_PRESETS[learningStyle as keyof typeof VOICE_PRESETS] || VOICE_PRESETS.gentle
  
  return {
    languageCode: 'en-US',
    name: preset[preferredGender],
    speakingRate: preset.speakingRate,
    pitch: preset.pitch,
  }
}

// Estimate audio duration from text
export function estimateAudioDuration(text: string, speakingRate: number = 1.0): number {
  // Average speaking rate is ~150 words per minute
  const words = text.split(/\s+/).length
  const baseMinutes = words / 150
  const adjustedMinutes = baseMinutes / speakingRate
  return Math.round(adjustedMinutes * 60) // Return seconds
}

// Validate script length for 5-minute target
export function validateScriptLength(script: string, speakingRate: number = 1.0): {
  valid: boolean
  estimatedDuration: number
  message: string
} {
  const duration = estimateAudioDuration(script, speakingRate)
  const targetDuration = 300 // 5 minutes in seconds
  const tolerance = 30 // 30 seconds tolerance

  const valid = duration >= (targetDuration - tolerance) && duration <= (targetDuration + tolerance)
  
  return {
    valid,
    estimatedDuration: duration,
    message: valid 
      ? 'Script length is optimal' 
      : `Script is ${duration < targetDuration ? 'too short' : 'too long'} (${duration}s vs target ${targetDuration}s)`,
  }
}