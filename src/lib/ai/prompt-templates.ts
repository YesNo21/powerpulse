export interface PromptTemplate {
  name: string
  description: string
  systemPrompt: string
  userPromptTemplate: string
  variables: string[]
  tone: 'motivational' | 'educational' | 'celebratory' | 'supportive'
  minWordCount: number
  maxWordCount: number
}

export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  // Initial assessment based on quiz responses
  initial_assessment: {
    name: 'Initial Assessment',
    description: 'First content after completing the quiz',
    systemPrompt: `You are a compassionate and knowledgeable personal development coach creating a personalized welcome message for someone starting their energy transformation journey. Your tone should be warm, understanding, and inspiring.`,
    userPromptTemplate: `Create a 775-word motivational welcome script for {{name}} who just completed their assessment.

Their primary pain points are: {{painPoints}}
Their main goals are: {{goals}}
Their preferred learning style is: {{learningStyle}}
Their current energy level is: {{currentLevel}}/10

Structure:
1. Warm welcome and acknowledgment of taking the first step (100 words)
2. Empathetic reflection on their pain points showing you understand (150 words)
3. Vision of what's possible - paint a picture of achieving their goals (150 words)
4. Introduction to the PowerPulse method and how it addresses their specific needs (150 words)
5. Their first simple exercise to try today based on their learning style (150 words)
6. Encouraging close with excitement about their journey ahead (75 words)

Make it personal, hopeful, and actionable. Use their name at least 3 times.`,
    variables: ['name', 'painPoints', 'goals', 'learningStyle', 'currentLevel'],
    tone: 'supportive',
    minWordCount: 750,
    maxWordCount: 800,
  },

  // Daily motivational content templates
  standard_daily: {
    name: 'Standard Daily Content',
    description: 'Regular daily motivational content',
    systemPrompt: `You are an energetic and supportive daily coach providing practical motivation and techniques. Your content should feel like advice from a trusted friend who genuinely cares about their progress.`,
    userPromptTemplate: `Create a 775-word daily motivational script for {{name}}.

Context:
- Day {{currentStreak}} of their journey
- Time of day: {{timeOfDay}}
- Energy level: {{currentLevel}}/10
- Working on: {{primaryGoal}}
- Main challenge: {{primaryPainPoint}}

Structure:
1. Personal greeting acknowledging the time of day and their streak (75 words)
2. Check-in on how they might be feeling based on their stage (100 words)
3. Today's main teaching or insight related to their goal (200 words)
4. Practical exercise or technique to try (200 words)
5. Story or example that illustrates the concept (125 words)
6. Closing motivation and reminder of their "why" (75 words)

Keep it conversational, practical, and encouraging.`,
    variables: ['name', 'currentStreak', 'timeOfDay', 'currentLevel', 'primaryGoal', 'primaryPainPoint'],
    tone: 'motivational',
    minWordCount: 750,
    maxWordCount: 800,
  },

  // Building habits (days 3-7)
  building_habits: {
    name: 'Building Habits',
    description: 'Focus on establishing consistent practice',
    systemPrompt: `You are a habit formation expert helping someone establish sustainable energy practices. Focus on small wins and consistency over perfection.`,
    userPromptTemplate: `Create a 775-word script about building energy habits for {{name}} on day {{currentStreak}}.

Their focus: {{primaryGoal}}
Their challenge: {{primaryPainPoint}}
Learning style: {{learningStyle}}

Structure:
1. Celebrate showing up for day {{currentStreak}} (75 words)
2. The science of habit formation in simple terms (150 words)
3. How their specific pain point ({{primaryPainPoint}}) relates to habits (125 words)
4. One keystone habit to focus on this week (175 words)
5. Making it stupidly easy - the 2-minute version (150 words)
6. Encouragement about compound effects over time (100 words)

Use examples and make it feel achievable, not overwhelming.`,
    variables: ['name', 'currentStreak', 'primaryGoal', 'primaryPainPoint', 'learningStyle'],
    tone: 'educational',
    minWordCount: 750,
    maxWordCount: 800,
  },

  // Achievement celebration messages
  weekly_milestone: {
    name: 'Weekly Milestone',
    description: 'Celebrate completing a full week',
    systemPrompt: `You are a celebratory coach acknowledging a significant milestone. Be genuinely excited about their progress while providing reflection and forward momentum.`,
    userPromptTemplate: `Create a 775-word celebration script for {{name}} completing {{currentStreak}} days!

Their journey so far:
- Started at energy level: {{startingLevel}}/10
- Current energy level: {{currentLevel}}/10
- Main goal: {{primaryGoal}}
- Biggest win: Consistency for {{currentStreak}} days

Structure:
1. Enthusiastic celebration of their {{currentStreak}}-day achievement (100 words)
2. Reflection on what they've learned about themselves (150 words)
3. Specific progress they've likely noticed by now (150 words)
4. The compounding effect - what the next week will bring (150 words)
5. A slightly more advanced technique to try this week (150 words)
6. Proud acknowledgment and motivation for the week ahead (75 words)

Make them feel proud and excited to continue!`,
    variables: ['name', 'currentStreak', 'startingLevel', 'currentLevel', 'primaryGoal'],
    tone: 'celebratory',
    minWordCount: 750,
    maxWordCount: 800,
  },

  monthly_milestone: {
    name: 'Monthly Milestone',
    description: 'Major milestone - 30 days of consistency',
    systemPrompt: `You are celebrating a transformational milestone with someone who has shown remarkable commitment. Acknowledge the profound changes while inspiring continued growth.`,
    userPromptTemplate: `Create a 775-word transformational celebration for {{name}} reaching {{currentStreak}} days!

Their transformation:
- Energy improvement: {{startingLevel}} → {{currentLevel}}/10
- Consistency: {{currentStreak}} days without breaking
- Original pain point: {{primaryPainPoint}}
- Main goal: {{primaryGoal}}

Structure:
1. Powerful celebration of this major milestone (100 words)
2. Concrete changes they've likely experienced (150 words)
3. The identity shift - from someone who tries to someone who does (150 words)
4. Advanced strategies for the next level of growth (150 words)
5. Vision for the next 30 days based on their trajectory (125 words)
6. Honor their commitment and future potential (100 words)

Make this feel like a graduation to a new level of mastery.`,
    variables: ['name', 'currentStreak', 'startingLevel', 'currentLevel', 'primaryPainPoint', 'primaryGoal'],
    tone: 'celebratory',
    minWordCount: 750,
    maxWordCount: 800,
  },

  // Comeback messages for broken streaks
  comeback_encouragement: {
    name: 'Comeback Encouragement',
    description: 'Supportive message after a broken streak',
    systemPrompt: `You are a compassionate coach helping someone restart after a setback. Focus on self-compassion, learning, and the ease of beginning again.`,
    userPromptTemplate: `Create a 775-word comeback script for {{name}} who is restarting after a break.

Context:
- Previous streak: {{longestStreak}} days
- Total days on journey: {{totalDaysActive}}
- Main goal: {{primaryGoal}}
- Likely feeling: disappointed, discouraged, or frustrated

Structure:
1. Warm, non-judgmental welcome back (100 words)
2. Normalize setbacks as part of every transformation journey (150 words)
3. Focus on what they've already built (not lost) in {{totalDaysActive}} days (125 words)
4. The power of restarting - often stronger than before (150 words)
5. One tiny action to take today to rebuild momentum (150 words)
6. Encouragement about their resilience and commitment to return (100 words)

Make them feel supported, not ashamed. Focus on progress, not perfection.`,
    variables: ['name', 'longestStreak', 'totalDaysActive', 'primaryGoal'],
    tone: 'supportive',
    minWordCount: 750,
    maxWordCount: 800,
  },

  // Progress-specific content
  deepening_practice: {
    name: 'Deepening Practice',
    description: 'For users in the decision stage (7-30 days)',
    systemPrompt: `You are an expert coach helping someone deepen their energy practice. They have basic consistency - now it's time for nuanced growth.`,
    userPromptTemplate: `Create a 775-word deepening practice script for {{name}} on day {{currentStreak}}.

Their status:
- Consistent for {{currentStreak}} days
- Energy level: {{currentLevel}}/10
- Ready for: deeper techniques
- Focus area: {{primaryGoal}}

Structure:
1. Acknowledge their solid foundation (75 words)
2. Introduction to energy optimization vs. just management (150 words)
3. Advanced technique for their specific goal ({{primaryGoal}}) (200 words)
4. How to track subtle improvements at this stage (125 words)
5. Dealing with plateaus and micro-adjustments (150 words)
6. Inspiration for the journey of mastery ahead (75 words)

Provide sophisticated insights while maintaining accessibility.`,
    variables: ['name', 'currentStreak', 'currentLevel', 'primaryGoal'],
    tone: 'educational',
    minWordCount: 750,
    maxWordCount: 800,
  },

  mastery_refinement: {
    name: 'Mastery Refinement',
    description: 'For advanced users (30+ days)',
    systemPrompt: `You are a master coach working with someone who has established strong habits. Focus on refinement, optimization, and helping others.`,
    userPromptTemplate: `Create a 775-word mastery script for {{name}}, a PowerPulse veteran with {{currentStreak}} days.

Their mastery journey:
- Consistency: {{currentStreak}} days
- Energy level: {{currentLevel}}/10
- Original pain point: {{primaryPainPoint}} (now managed)
- Current focus: {{primaryGoal}}

Structure:
1. Honor their incredible consistency and transformation (75 words)
2. The shift from fixing problems to optimizing potential (150 words)
3. Advanced biohacking or energy technique to experiment with (175 words)
4. How to mentor others or share their transformation (150 words)
5. Preventing complacency - setting new horizons (125 words)
6. Celebrating who they've become through this practice (100 words)

Treat them as the energy master they've become.`,
    variables: ['name', 'currentStreak', 'currentLevel', 'primaryPainPoint', 'primaryGoal'],
    tone: 'motivational',
    minWordCount: 750,
    maxWordCount: 800,
  },

  // Time-specific templates
  morning_energizer: {
    name: 'Morning Energizer',
    description: 'Specific morning content to start the day',
    systemPrompt: `You are an energizing morning coach helping someone start their day with power and purpose. Be uplifting and action-oriented.`,
    userPromptTemplate: `Create a 775-word morning energizer script for {{name}}.

Morning context:
- Day {{currentStreak}} of their journey
- Energy focus: {{primaryGoal}}
- Wants to overcome: {{primaryPainPoint}}

Structure:
1. Energizing morning greeting and appreciation for showing up (75 words)
2. Morning energy activation technique (physical) (150 words)
3. Mental clarity exercise for the day ahead (150 words)
4. Setting a powerful intention for today (125 words)
5. Practical integration with their morning routine (150 words)
6. Launching into their day with confidence (125 words)

Make it energizing and actionable for morning implementation.`,
    variables: ['name', 'currentStreak', 'primaryGoal', 'primaryPainPoint'],
    tone: 'motivational',
    minWordCount: 750,
    maxWordCount: 800,
  },

  evening_reflection: {
    name: 'Evening Reflection',
    description: 'Evening content for reflection and rest',
    systemPrompt: `You are a calming evening coach helping someone reflect on their day and prepare for restorative rest. Be soothing yet insightful.`,
    userPromptTemplate: `Create a 775-word evening reflection script for {{name}}.

Evening context:
- Completing day {{currentStreak}}
- Working on: {{primaryGoal}}
- Energy level: {{currentLevel}}/10

Structure:
1. Calm evening greeting and transition from day (75 words)
2. Guided reflection on today's energy moments (150 words)
3. Releasing tension or stress from the day (150 words)
4. Gratitude practice specific to their journey (125 words)
5. Preparing body and mind for restorative sleep (150 words)
6. Peaceful close with tomorrow's possibility (125 words)

Create a calming, reflective experience perfect for evening.`,
    variables: ['name', 'currentStreak', 'primaryGoal', 'currentLevel'],
    tone: 'supportive',
    minWordCount: 750,
    maxWordCount: 800,
  },
}

// Helper function to get template by name
export function getPromptTemplate(templateName: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES[templateName]
}

// Helper function to fill template variables
export function fillTemplate(template: string, variables: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match
  })
}

// Get all template names for a specific tone
export function getTemplatesByTone(tone: 'motivational' | 'educational' | 'celebratory' | 'supportive'): string[] {
  return Object.entries(PROMPT_TEMPLATES)
    .filter(([_, template]) => template.tone === tone)
    .map(([name, _]) => name)
}

// Get appropriate template based on user context
export function selectTemplate(context: {
  currentStreak: number
  longestStreak: number
  totalDaysActive: number
  timeOfDay: 'morning' | 'afternoon' | 'evening'
  isReturning: boolean
}): string {
  // Returning user after break
  if (context.isReturning) {
    return 'comeback_encouragement'
  }
  
  // First time user
  if (context.totalDaysActive === 0) {
    return 'initial_assessment'
  }
  
  // Milestone celebrations
  if (context.currentStreak === 30) {
    return 'monthly_milestone'
  }
  
  if (context.currentStreak === 7 || context.currentStreak === 14 || context.currentStreak === 21) {
    return 'weekly_milestone'
  }
  
  // Time-based selection
  if (context.timeOfDay === 'morning' && Math.random() > 0.7) {
    return 'morning_energizer'
  }
  
  if (context.timeOfDay === 'evening' && Math.random() > 0.7) {
    return 'evening_reflection'
  }
  
  // Stage-based selection
  if (context.totalDaysActive < 7) {
    return 'building_habits'
  }
  
  if (context.totalDaysActive < 30) {
    return 'deepening_practice'
  }
  
  if (context.totalDaysActive >= 30) {
    return 'mastery_refinement'
  }
  
  // Default
  return 'standard_daily'
}