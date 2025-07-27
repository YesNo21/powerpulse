import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sendGridService, EmailType } from '@/lib/email/sendgrid-service'
import { z } from 'zod'

const TestEmailSchema = z.object({
  type: z.enum([
    'welcome',
    'daily_audio',
    'payment_success',
    'streak_milestone',
  ] as const),
  email: z.string().email().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow in development or for admin users
    if (process.env.NODE_ENV === 'production' && !session.sessionClaims?.metadata?.role?.includes('admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { type, email } = TestEmailSchema.parse(body)

    // Get user email from session if not provided
    const toEmail = email || session.sessionClaims?.email

    if (!toEmail) {
      return NextResponse.json({ error: 'No email address available' }, { status: 400 })
    }

    // Prepare test data based on email type
    let testData: Record<string, any> = {
      name: session.sessionClaims?.firstName || 'Test User',
    }

    switch (type) {
      case 'daily_audio':
        testData = {
          ...testData,
          title: 'Unlock Your Inner Champion',
          description: 'Today, we\'re focusing on building unshakeable confidence and crushing self-doubt.',
          audioUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/audio/sample`,
          duration: '5 minutes',
          dayNumber: 7,
        }
        break

      case 'streak_milestone':
        testData = {
          ...testData,
          days: 7,
        }
        break

      case 'payment_success':
        testData = {
          ...testData,
          planName: 'Monthly Subscription',
          amount: '$14.99',
        }
        break
    }

    // Send test email
    const result = await sendGridService.sendEmail({
      to: toEmail,
      type: type as EmailType,
      data: testData,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Test ${type} email sent to ${toEmail}`,
      messageId: result.messageId,
    })
  } catch (error: any) {
    console.error('Test email error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to send test email' },
      { status: 500 }
    )
  }
}