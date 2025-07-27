import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { getAudioStorage } from '@/lib/storage/audio-storage'
import { getAudioProcessor } from '@/lib/tts/audio-processor'
import { db } from '@/db'
import { users, dailyContent } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get request data
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const contentId = formData.get('contentId') as string
    const format = formData.get('format') as 'mp3' | 'wav' | 'ogg'

    if (!audioFile || !contentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate content ownership
    const [content] = await db
      .select()
      .from(dailyContent)
      .where(eq(dailyContent.id, parseInt(contentId)))
      .limit(1)

    if (!content || content.userId !== user.id) {
      return NextResponse.json(
        { error: 'Content not found or unauthorized' },
        { status: 404 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Process audio
    const processor = getAudioProcessor()
    const processedAudio = await processor.processAudio(buffer, format || 'mp3')

    // Store audio
    const storage = getAudioStorage()
    const storedFile = await storage.storeAudio(processedAudio.buffer, {
      userId: user.id,
      contentId: content.id,
      filename: audioFile.name,
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

    return NextResponse.json({
      success: true,
      audioUrl: storedFile.url,
      duration: processedAudio.metadata.duration,
      format: processedAudio.metadata.format,
      size: processedAudio.metadata.size,
    })
  } catch (error) {
    console.error('Error uploading audio:', error)
    return NextResponse.json(
      { error: 'Failed to upload audio' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}