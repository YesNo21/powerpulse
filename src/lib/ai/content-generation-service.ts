import { db } from '@/db'
import { users, userProfiles, userProgress, dailyContent } from '@/db/schema'
import { eq, and, gte, isNull } from 'drizzle-orm'
import { generateScript, generateBatchScripts, getScriptTopic } from './script-generator'
import { generateAudioFromScript } from '../tts/google-tts-service'
import { uploadAudioFile } from '../storage/audio-storage'
import { addDays, startOfDay } from 'date-fns'

interface ContentGenerationResult {
  userId: string
  success: boolean
  error?: string
  contentId?: number
}

// Generate content for a single user
export async function generateDailyContentForUser(
  userId: string,
  targetDate: Date = new Date()
): Promise<ContentGenerationResult> {
  try {
    // Get user profile
    const userWithProfile = await db
      .select()
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .leftJoin(userProgress, eq(users.id, userProgress.userId))
      .where(eq(users.id, userId))
      .limit(1)

    const userData = userWithProfile[0]
    if (!userData || !userData.user_profiles || !userData.user_progress) {
      return {
        userId,
        success: false,
        error: 'User profile or progress not found',
      }
    }

    // Check if content already exists for this date
    const existingContent = await db
      .select()
      .from(dailyContent)
      .where(
        and(
          eq(dailyContent.userId, userId),
          eq(dailyContent.scheduledFor, startOfDay(targetDate))
        )
      )
      .limit(1)

    if (existingContent.length > 0) {
      return {
        userId,
        success: true,
        contentId: existingContent[0].id,
      }
    }

    // Get previous topics to avoid repetition
    const previousContent = await db
      .select({ title: dailyContent.title })
      .from(dailyContent)
      .where(eq(dailyContent.userId, userId))
      .orderBy(dailyContent.scheduledFor)
      .limit(7) // Last week's topics

    const previousTopics = previousContent.map(c => c.title)

    // Calculate day number
    const dayNumber = userData.user_progress.totalDaysActive + 1

    // Generate script
    const script = await generateScript({
      profile: userData.user_profiles,
      progress: userData.user_progress,
      dayNumber,
      previousTopics,
    })

    // Generate title based on the day's topic
    const todaysTopic = getScriptTopic(dayNumber)
    const title = generateTitle(todaysTopic, userData.user_profiles.goals[0])

    // Convert script to full text for TTS
    const fullScript = `${script.greeting}

${script.mainContent}

Here are your action items for today:
${script.actionItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

${script.affirmation}`

    // Generate audio
    const audioResult = await generateAudioFromScript({
      script: fullScript,
      userId,
      voiceSettings: {
        languageCode: userData.user_profiles.preferredLanguage || 'en-US',
        name: userData.user_profiles.preferredVoice || 'en-US-Neural2-F',
        speakingRate: 1.0,
        pitch: 0,
      },
    })

    if (!audioResult.success || !audioResult.audioBuffer) {
      throw new Error('Failed to generate audio')
    }

    // Upload audio to storage
    const audioUrl = await uploadAudioFile({
      buffer: audioResult.audioBuffer,
      userId,
      filename: `${userId}-${targetDate.toISOString().split('T')[0]}.mp3`,
    })

    // Create database entry
    const [newContent] = await db
      .insert(dailyContent)
      .values({
        userId,
        title,
        description: script.mainContent.substring(0, 200) + '...',
        audioUrl,
        duration: script.estimatedDuration,
        scriptContent: fullScript,
        scheduledFor: startOfDay(targetDate),
        stage: userData.user_progress.currentStage,
        dayNumber,
        goals: userData.user_profiles.goals,
        painPoints: userData.user_profiles.painPoints,
      })
      .returning()

    return {
      userId,
      success: true,
      contentId: newContent.id,
    }
  } catch (error) {
    console.error(`Failed to generate content for user ${userId}:`, error)
    return {
      userId,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Generate content for all active users
export async function generateDailyContentForAllUsers(
  targetDate: Date = new Date()
): Promise<ContentGenerationResult[]> {
  try {
    // Get all active users with complete profiles
    const activeUsers = await db
      .select()
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .leftJoin(userProgress, eq(users.id, userProgress.userId))
      .where(
        and(
          eq(users.subscriptionStatus, 'active'),
          isNull(users.pausedUntil)
        )
      )

    const results: ContentGenerationResult[] = []

    // Process users in batches
    const batchSize = 10
    for (let i = 0; i < activeUsers.length; i += batchSize) {
      const batch = activeUsers.slice(i, i + batchSize)
      
      const batchPromises = batch.map(userData => 
        generateDailyContentForUser(userData.users.id, targetDate)
      )

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // Add delay between batches
      if (i + batchSize < activeUsers.length) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    // Log results
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    
    console.log(`Content generation complete: ${successful} successful, ${failed} failed`)

    return results
  } catch (error) {
    console.error('Failed to generate content for all users:', error)
    throw error
  }
}

// Generate content for the next N days
export async function generateUpcomingContent(
  userId: string,
  daysAhead: number = 7
): Promise<ContentGenerationResult[]> {
  const results: ContentGenerationResult[] = []
  const today = new Date()

  for (let i = 0; i < daysAhead; i++) {
    const targetDate = addDays(today, i)
    const result = await generateDailyContentForUser(userId, targetDate)
    results.push(result)

    // Add delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return results
}

// Helper function to generate engaging titles
function generateTitle(topic: string, primaryGoal: string): string {
  const titleTemplates = {
    'form and technique': [
      'Master Your Form: The Key to {goal}',
      'Perfect Technique for Perfect Results',
      'Form First: Your Path to {goal}',
    ],
    'nutrition basics': [
      'Fuel Your {goal} Journey',
      'Nutrition Secrets for Success',
      'Eat to Achieve: {goal} Edition',
    ],
    'recovery importance': [
      'Recovery: Your Secret Weapon',
      'Rest, Recover, and Rise',
      'The Power of Strategic Recovery',
    ],
    'goal setting': [
      'Setting Smarter {goal} Goals',
      'Your Roadmap to {goal}',
      'Goals That Get Results',
    ],
    'mindset training': [
      'The Champion Mindset',
      'Think Strong, Be Strong',
      'Mental Game for {goal}',
    ],
    'habit formation': [
      'Building Unbreakable Habits',
      'Small Habits, Big {goal} Results',
      'The Habit Advantage',
    ],
    'progress tracking': [
      'Track Your Way to {goal}',
      'Measuring What Matters',
      'Progress Over Perfection',
    ],
    'workout variety': [
      'Mix It Up for Maximum Results',
      'Variety: The Spice of Fitness',
      'New Workouts, New You',
    ],
    'stress management': [
      'Stress Less, Achieve More',
      'Finding Balance in Your Journey',
      'Calm Mind, Strong Body',
    ],
    'sleep optimization': [
      'Sleep Your Way to {goal}',
      'The Recovery You\'re Missing',
      'Better Sleep, Better Performance',
    ],
    'hydration tips': [
      'Hydration for Peak Performance',
      'Water: Your {goal} Ally',
      'Drink Up for Success',
    ],
    'motivation strategies': [
      'Staying Fired Up for {goal}',
      'Motivation That Lasts',
      'Your Daily Dose of Drive',
    ],
    'overcoming obstacles': [
      'Breaking Through Barriers',
      'Obstacles to Opportunities',
      'Nothing Can Stop You Now',
    ],
    'celebrating wins': [
      'Celebrate Your {goal} Victories',
      'Every Win Counts',
      'Success Stories Start Here',
    ],
    'community support': [
      'Together Towards {goal}',
      'The Power of Community',
      'You\'re Not Alone',
    ],
  }

  const templates = titleTemplates[topic as keyof typeof titleTemplates] || ['Your Daily PowerPulse']
  const template = templates[Math.floor(Math.random() * templates.length)]
  
  // Replace {goal} placeholder with actual goal
  const goalMap: Record<string, string> = {
    'weight-loss': 'Weight Loss',
    'muscle-gain': 'Muscle Building',
    'endurance': 'Endurance',
    'flexibility': 'Flexibility',
    'general-fitness': 'Fitness',
    'sports-performance': 'Performance',
    'stress-relief': 'Stress Relief',
    'energy': 'Energy',
    'confidence': 'Confidence',
    'discipline': 'Discipline',
  }

  const goalText = goalMap[primaryGoal] || 'Success'
  return template.replace('{goal}', goalText)
}

// Check and generate missing content
export async function checkAndGenerateMissingContent(): Promise<void> {
  const today = startOfDay(new Date())
  const tomorrow = addDays(today, 1)

  // Get users who need content for tomorrow
  const usersNeedingContent = await db
    .select({ userId: users.id })
    .from(users)
    .leftJoin(
      dailyContent,
      and(
        eq(users.id, dailyContent.userId),
        eq(dailyContent.scheduledFor, tomorrow)
      )
    )
    .where(
      and(
        eq(users.subscriptionStatus, 'active'),
        isNull(users.pausedUntil),
        isNull(dailyContent.id)
      )
    )

  console.log(`Found ${usersNeedingContent.length} users needing content for tomorrow`)

  // Generate content for each user
  for (const { userId } of usersNeedingContent) {
    await generateDailyContentForUser(userId, tomorrow)
    // Add delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}