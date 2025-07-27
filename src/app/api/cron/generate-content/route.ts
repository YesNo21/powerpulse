import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { generateDailyContentForAllUsers } from '@/lib/ai/content-generation-service'

// This function runs as a Vercel Cron Job
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = headers().get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    console.log('Starting daily content generation...')
    
    // Generate content for tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const results = await generateDailyContentForAllUsers(tomorrow)
    
    // Count successes and failures
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    
    console.log(`Content generation complete: ${successful} successful, ${failed} failed`)
    
    // Log any failures for monitoring
    const failures = results.filter(r => !r.success)
    if (failures.length > 0) {
      console.error('Failed generations:', failures)
    }
    
    return NextResponse.json({
      success: true,
      generated: successful,
      failed: failed,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// Configure the cron job in vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/generate-content",
//     "schedule": "0 2 * * *"  // Run at 2 AM UTC daily
//   }]
// }