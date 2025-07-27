import { NextResponse } from 'next/server'
import { db } from '@/db'
import { users, dailyContent, deliveryChannels } from '@/db/schema'
import { eq, and, gte, lte, isNotNull } from 'drizzle-orm'
import { sendGridService } from '@/lib/email/sendgrid-service'
import { headers } from 'next/headers'

// Vercel Cron authentication
async function verifyCronRequest() {
  const headersList = await headers()
  const authHeader = headersList.get('authorization')
  
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return false
  }
  
  return true
}

export async function GET() {
  try {
    // Verify cron request
    if (!await verifyCronRequest()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current date boundaries
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get users with email delivery preference and content for today
    const usersWithContent = await db
      .select({
        user: users,
        content: dailyContent,
        delivery: deliveryChannels,
      })
      .from(users)
      .innerJoin(
        dailyContent,
        and(
          eq(dailyContent.userId, users.id),
          gte(dailyContent.createdAt, today),
          lte(dailyContent.createdAt, tomorrow),
          isNotNull(dailyContent.audioUrl)
        )
      )
      .innerJoin(
        deliveryChannels,
        and(
          eq(deliveryChannels.userId, users.id),
          eq(deliveryChannels.channel, 'email'),
          eq(deliveryChannels.isActive, true)
        )
      )
      .where(
        and(
          eq(users.subscriptionStatus, 'active'),
          isNotNull(users.email)
        )
      )

    console.log(`Found ${usersWithContent.length} users with content to deliver`)

    // Send emails in batches
    const batchSize = 50
    const results = []
    
    for (let i = 0; i < usersWithContent.length; i += batchSize) {
      const batch = usersWithContent.slice(i, i + batchSize)
      
      const emailBatch = batch.map(({ user, content }) => ({
        to: user.email!,
        type: 'daily_audio' as const,
        data: {
          name: user.firstName || 'there',
          title: content.title,
          description: content.description,
          audioUrl: content.audioUrl,
          duration: content.duration || '5 minutes',
          dayNumber: content.dayNumber,
        },
      }))

      const batchResult = await sendGridService.sendBatch(emailBatch)
      results.push(batchResult)

      // Update delivery status
      for (let j = 0; j < batch.length; j++) {
        const { content } = batch[j]
        const emailResult = batchResult.results[j]
        
        if (emailResult.success) {
          await db
            .update(dailyContent)
            .set({
              deliveredAt: new Date(),
              deliveryStatus: 'sent',
            })
            .where(eq(dailyContent.id, content.id))
        }
      }

      // Rate limiting between batches
      if (i + batchSize < usersWithContent.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Calculate totals
    const totalSent = results.reduce((sum, r) => sum + r.successful, 0)
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0)

    console.log(`Email delivery complete: ${totalSent} sent, ${totalFailed} failed`)

    return NextResponse.json({
      success: true,
      sent: totalSent,
      failed: totalFailed,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Daily email cron error:', error)
    
    return NextResponse.json(
      { error: 'Failed to send daily emails' },
      { status: 500 }
    )
  }
}

// Vercel cron configuration
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes