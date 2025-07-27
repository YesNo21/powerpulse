import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { GoogleTTSService } from '@/lib/tts/google-tts-service'

const PreviewSchema = z.object({
  text: z.string().min(1).max(500),
  voiceId: z.string(),
  languageCode: z.string().default('en-US')
})

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { text, voiceId, languageCode } = PreviewSchema.parse(body)

    // Initialize TTS service
    const ttsService = new GoogleTTSService()

    // Generate audio with specific voice
    const audioBuffer = await ttsService.synthesizeSpeech({
      text,
      voice: {
        languageCode,
        name: voiceId,
        ssmlGender: voiceId.includes('FEMALE') || voiceId.includes('-C') || voiceId.includes('-E') || voiceId.includes('-O') ? 'FEMALE' : 'MALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0,
        volumeGainDb: 0,
        sampleRateHertz: 24000,
        effectsProfileId: ['headphone-class-device']
      }
    })

    // For preview, we'll return a data URL (base64) for immediate playback
    // In production, you might want to upload to CDN instead
    const base64Audio = audioBuffer.toString('base64')
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`

    return NextResponse.json({
      audioUrl,
      duration: Math.ceil(text.length / 150) // Rough estimate: 150 chars per second
    })

  } catch (error) {
    console.error('Voice preview error:', error)
    
    // If Google TTS fails, return a fallback response
    if (error instanceof Error && error.message.includes('Google Cloud')) {
      return NextResponse.json({
        audioUrl: null,
        fallback: true,
        message: 'Voice preview temporarily unavailable'
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to generate voice preview' },
      { status: 500 }
    )
  }
}