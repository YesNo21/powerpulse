import { z } from 'zod'
import { type UserProfile, type UserProgress } from '@/db/schema'

// Schema for generated script
export const generatedScriptSchema = z.object({
  greeting: z.string().min(10).max(200),
  mainContent: z.string().min(500).max(2000),
  actionItems: z.array(z.string()).min(2).max(3),
  affirmation: z.string().min(20).max(150),
  estimatedDuration: z.number().min(240).max(360), // 4-6 minutes in seconds
})

export type GeneratedScript = z.infer<typeof generatedScriptSchema>

// User journey stages with their characteristics
export const JOURNEY_STAGES = {
  foundation: {
    name: 'Foundation',
    dayRange: [1, 14],
    focus: 'Building basic habits and mindset',
    contentStyle: 'encouraging and educational',
  },
  momentum: {
    name: 'Momentum',
    dayRange: [15, 45],
    focus: 'Accelerating progress and overcoming obstacles',
    contentStyle: 'motivating and challenging',
  },
  transformation: {
    name: 'Transformation',
    dayRange: [46, 90],
    focus: 'Advanced strategies and peak performance',
    contentStyle: 'strategic and empowering',
  },
  mastery: {
    name: 'Mastery',
    dayRange: [91, Infinity],
    focus: 'Maintenance and continuous improvement',
    contentStyle: 'reflective and inspiring',
  },
}

// Learning style prompts
export const LEARNING_STYLE_PROMPTS = {
  direct: {
    tone: 'Direct and commanding',
    style: 'Give clear, specific instructions without sugar-coating',
    example: 'Do this. Stop that. No excuses.',
  },
  gentle: {
    tone: 'Warm and supportive',
    style: 'Use encouraging language and positive reinforcement',
    example: "You're doing great! Let's take the next step together.",
  },
  tough: {
    tone: 'Challenging and intense',
    style: 'Push hard, demand excellence, military-style motivation',
    example: 'Champions are made when no one is watching. Push harder!',
  },
  story: {
    tone: 'Narrative and metaphorical',
    style: 'Use stories, analogies, and examples to illustrate points',
    example: 'Imagine a mountain climber who...',
  },
}

// Goal-specific content templates
export const GOAL_TEMPLATES = {
  'weight-loss': {
    themes: ['calorie awareness', 'sustainable habits', 'metabolism boosting'],
    keywords: ['burn', 'lean', 'transform', 'energy'],
  },
  'muscle-gain': {
    themes: ['progressive overload', 'protein intake', 'recovery'],
    keywords: ['strength', 'growth', 'power', 'build'],
  },
  'endurance': {
    themes: ['cardiovascular health', 'stamina building', 'breathing techniques'],
    keywords: ['endure', 'persist', 'stamina', 'breathe'],
  },
  'flexibility': {
    themes: ['mobility', 'stretching routines', 'injury prevention'],
    keywords: ['flow', 'stretch', 'flexible', 'move'],
  },
  'general-fitness': {
    themes: ['balanced approach', 'overall health', 'consistency'],
    keywords: ['healthy', 'balanced', 'vitality', 'wellness'],
  },
  'sports-performance': {
    themes: ['sport-specific training', 'mental game', 'competition prep'],
    keywords: ['perform', 'compete', 'excel', 'dominate'],
  },
  'stress-relief': {
    themes: ['mindfulness', 'breathing exercises', 'recovery'],
    keywords: ['calm', 'peace', 'relax', 'balance'],
  },
  'energy': {
    themes: ['sleep quality', 'nutrition timing', 'active recovery'],
    keywords: ['energize', 'vitality', 'awake', 'alive'],
  },
  'confidence': {
    themes: ['body positivity', 'achievement celebration', 'self-talk'],
    keywords: ['confident', 'strong', 'capable', 'unstoppable'],
  },
  'discipline': {
    themes: ['habit formation', 'consistency', 'mental toughness'],
    keywords: ['disciplined', 'committed', 'focused', 'determined'],
  },
}

// Pain point specific content
export const PAIN_POINT_SOLUTIONS = {
  motivation: {
    solutions: ['visualization techniques', 'reward systems', 'accountability'],
    mantras: ['Your future self is counting on you', 'Start where you are'],
  },
  time: {
    solutions: ['micro-workouts', 'time-blocking', 'efficiency hacks'],
    mantras: ['5 minutes is better than 0 minutes', 'Make time, not excuses'],
  },
  knowledge: {
    solutions: ['education snippets', 'simple explanations', 'clear guidance'],
    mantras: ['Every expert was once a beginner', 'Learn by doing'],
  },
  consistency: {
    solutions: ['habit stacking', 'streak tracking', 'routine building'],
    mantras: ['Progress over perfection', 'Show up, no matter what'],
  },
  plateau: {
    solutions: ['variation techniques', 'progressive overload', 'deload strategies'],
    mantras: ['Plateaus are launchpads', 'Trust the process'],
  },
  boredom: {
    solutions: ['variety in workouts', 'gamification', 'new challenges'],
    mantras: ['Make fitness fun', 'Every workout is an adventure'],
  },
  equipment: {
    solutions: ['bodyweight exercises', 'creative alternatives', 'minimal equipment'],
    mantras: ['Your body is your gym', 'Creativity over equipment'],
  },
  confidence: {
    solutions: ['small wins celebration', 'progress photos', 'affirmations'],
    mantras: ['You belong here', 'Confidence is earned daily'],
  },
  recovery: {
    solutions: ['active recovery', 'sleep optimization', 'nutrition timing'],
    mantras: ['Rest is part of the process', 'Recovery makes you stronger'],
  },
  nutrition: {
    solutions: ['simple meal ideas', 'portion guidance', 'macro basics'],
    mantras: ['Fuel your body right', 'Nutrition is self-care'],
  },
}

interface GenerateScriptParams {
  profile: UserProfile
  progress: UserProgress
  dayNumber: number
  previousTopics?: string[]
}

export async function generateScript({
  profile,
  progress,
  dayNumber,
  previousTopics = [],
}: GenerateScriptParams): Promise<GeneratedScript> {
  // Determine current stage
  const stage = Object.values(JOURNEY_STAGES).find(
    s => dayNumber >= s.dayRange[0] && dayNumber <= s.dayRange[1]
  ) || JOURNEY_STAGES.mastery

  // Get learning style configuration
  const learningStyle = LEARNING_STYLE_PROMPTS[profile.learningStyle as keyof typeof LEARNING_STYLE_PROMPTS] || LEARNING_STYLE_PROMPTS.gentle

  // Get primary goal template
  const primaryGoal = profile.goals[0]
  const goalTemplate = GOAL_TEMPLATES[primaryGoal as keyof typeof GOAL_TEMPLATES] || GOAL_TEMPLATES['general-fitness']

  // Get primary pain point solution
  const primaryPainPoint = profile.painPoints[0]
  const painPointSolution = PAIN_POINT_SOLUTIONS[primaryPainPoint as keyof typeof PAIN_POINT_SOLUTIONS]

  // Build the prompt for AI
  const systemPrompt = `You are PowerPulse, an AI fitness coach creating personalized 5-minute audio scripts.
Your tone is ${learningStyle.tone}. ${learningStyle.style}

User Profile:
- Name: ${profile.name}
- Pronouns: ${profile.pronouns || 'they/them'}
- Current Stage: ${stage.name} (Day ${dayNumber})
- Stage Focus: ${stage.focus}
- Primary Goal: ${primaryGoal}
- Primary Challenge: ${primaryPainPoint}
- All Goals: ${profile.goals.join(', ')}
- All Challenges: ${profile.painPoints.join(', ')}

Script Requirements:
1. Total duration: 5 minutes when spoken
2. Structure:
   - Greeting (30 seconds): Personal, acknowledging their progress
   - Main Content (3 minutes): ${stage.contentStyle} content addressing their goals and pain points
   - Action Items (1 minute): 2-3 specific, achievable tasks for today
   - Affirmation (30 seconds): Powerful closing statement

Focus on: ${goalTemplate.themes.join(', ')}
Use keywords: ${goalTemplate.keywords.join(', ')}
Address: ${painPointSolution?.solutions.join(', ') || 'general fitness improvement'}

Previous topics to avoid repetition: ${previousTopics.join(', ')}

Remember to:
- Use ${profile.pronouns || 'they/them'} pronouns
- Be specific and actionable
- Match the user's learning style preference
- Build on their ${dayNumber} days of progress`

  const userPrompt = `Generate a 5-minute motivational fitness coaching script for ${profile.name}'s Day ${dayNumber} PowerPulse session.`

  try {
    // Here you would call your AI service (OpenAI, Anthropic, etc.)
    // For now, we'll create a mock response
    const mockScript = await generateMockScript({
      profile,
      stage,
      dayNumber,
      learningStyle,
      goalTemplate,
      painPointSolution,
    })

    // Validate the generated script
    const validatedScript = generatedScriptSchema.parse(mockScript)
    return validatedScript
  } catch (error) {
    console.error('Failed to generate script:', error)
    // Return a fallback script
    return generateFallbackScript({ profile, dayNumber })
  }
}

// Mock script generator for development
async function generateMockScript({
  profile,
  stage,
  dayNumber,
  learningStyle,
  goalTemplate,
  painPointSolution,
}: any): Promise<GeneratedScript> {
  const greeting = `Good morning, ${profile.name}! Welcome to Day ${dayNumber} of your PowerPulse journey. You've shown incredible commitment by being here in the ${stage.name} stage.`

  const mainContent = `Today, we're focusing on ${goalTemplate.themes[0]}. ${learningStyle.example}

As someone working towards ${profile.goals[0]}, it's important to understand that ${stage.focus.toLowerCase()} is crucial at this stage of your journey.

${painPointSolution?.mantras[0] || 'You have what it takes.'}

Let's dive into today's focus. ${goalTemplate.themes.map((theme: string) => 
    `When it comes to ${theme}, remember that consistency is key. Small actions compound into remarkable results.`
  ).join(' ')}

You mentioned struggling with ${profile.painPoints[0]}. Here's what I want you to know: ${painPointSolution?.solutions[0] || 'Every challenge is an opportunity to grow stronger.'}

The path to ${profile.goals.join(' and ')} isn't always linear, but every step forward counts. Today, we're going to build on what you've already accomplished and push just a little bit further.

Remember, ${painPointSolution?.mantras[1] || 'Progress is progress, no matter how small.'}`

  const actionItems = [
    `Complete a ${dayNumber < 14 ? '10-minute' : '20-minute'} workout focusing on ${goalTemplate.keywords[0]}`,
    `Practice ${painPointSolution?.solutions[1] || 'mindful breathing'} for 5 minutes`,
    `Write down one thing you're proud of accomplishing today`,
  ]

  const affirmation = `${profile.name}, you are ${goalTemplate.keywords.slice(1, 4).join(', ')}. You've got this, and I'll be here with you tomorrow for Day ${dayNumber + 1}. Until then, make today count!`

  return {
    greeting,
    mainContent,
    actionItems,
    affirmation,
    estimatedDuration: 300, // 5 minutes
  }
}

// Fallback script for error cases
function generateFallbackScript({
  profile,
  dayNumber,
}: {
  profile: UserProfile
  dayNumber: number
}): GeneratedScript {
  return {
    greeting: `Welcome back, ${profile.name}! It's Day ${dayNumber} of your fitness journey.`,
    mainContent: `Today is about progress, not perfection. Whether you're working on ${profile.goals[0]} or simply staying active, every effort counts. 

Remember why you started this journey. You wanted to overcome ${profile.painPoints[0]}, and you're doing exactly that by showing up today.

Focus on what you can control: your effort, your attitude, and your commitment. The results will follow.

Take a moment to appreciate how far you've come. ${dayNumber} days of dedication is no small feat.`,
    actionItems: [
      'Complete any form of physical activity for at least 15 minutes',
      'Drink an extra glass of water',
      'Take 5 deep breaths and set an intention for the day',
    ],
    affirmation: `You are stronger than you think, ${profile.name}. Keep going!`,
    estimatedDuration: 300,
  }
}

// Function to get script topics for variety
export function getScriptTopic(dayNumber: number): string {
  const topics = [
    'form and technique',
    'nutrition basics',
    'recovery importance',
    'goal setting',
    'mindset training',
    'habit formation',
    'progress tracking',
    'workout variety',
    'stress management',
    'sleep optimization',
    'hydration tips',
    'motivation strategies',
    'overcoming obstacles',
    'celebrating wins',
    'community support',
  ]

  // Rotate through topics
  return topics[dayNumber % topics.length]
}

// Batch script generation for efficiency
export async function generateBatchScripts(
  users: Array<{ profile: UserProfile; progress: UserProgress }>,
  dayNumber: number
): Promise<Map<string, GeneratedScript>> {
  const scripts = new Map<string, GeneratedScript>()

  // Process in batches of 10 for rate limiting
  const batchSize = 10
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize)
    const batchPromises = batch.map(async ({ profile, progress }) => {
      const script = await generateScript({
        profile,
        progress,
        dayNumber,
      })
      return { userId: profile.userId, script }
    })

    const results = await Promise.all(batchPromises)
    results.forEach(({ userId, script }) => {
      scripts.set(userId, script)
    })

    // Add delay between batches to respect rate limits
    if (i + batchSize < users.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return scripts
}