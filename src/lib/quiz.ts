import { z } from 'zod'

// Quiz question types and schemas
export const QuizStep = z.enum([
  'identity',
  'goals',
  'painPoints',
  'currentLevel',
  'idealOutcome',
  'learningStyle',
  'voiceSelection',
  'schedule',
  'delivery',
  'analyzing',
  'complete'
])

export type QuizStepType = z.infer<typeof QuizStep>

// Quiz response schemas
export const IdentitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  pronouns: z.string().optional(),
})

export const GoalSchema = z.object({
  primaryGoals: z.array(z.string()).min(1, 'Please select at least one focus area'),
  specificGoals: z.array(z.string()).min(1, 'Please select at least one specific goal'),
})

export const PainPointsSchema = z.object({
  painPoints: z.array(z.string()).min(1, 'Please select at least one challenge'),
})

export const CurrentLevelSchema = z.object({
  level: z.number().min(1).max(10),
  biggestFrustration: z.string().min(10, 'Please describe your biggest frustration'),
})

export const IdealOutcomeSchema = z.object({
  dreamTransformation: z.string().min(20, 'Please describe your ideal transformation in detail'),
})

export const LearningStyleSchema = z.object({
  styles: z.array(z.string()).min(1, 'Please select at least one coaching style'),
  intensity: z.number().min(1).max(5),
})

export const ScheduleSchema = z.object({
  preferredTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time'),
  timezone: z.string(),
})

export const VoiceSelectionSchema = z.object({
  voiceId: z.string().min(1, 'Please select a voice'),
  voiceName: z.string(),
  persona: z.any().optional()
})

export const DeliverySchema = z.object({
  method: z.enum(['email', 'whatsapp', 'telegram']),
  contact: z.string().min(1, 'Contact information is required'),
})

// Complete quiz response type
export type QuizResponse = {
  identity: z.infer<typeof IdentitySchema>
  goals: z.infer<typeof GoalSchema>
  painPoints: z.infer<typeof PainPointsSchema>
  currentLevel: z.infer<typeof CurrentLevelSchema>
  idealOutcome: z.infer<typeof IdealOutcomeSchema>
  learningStyle: z.infer<typeof LearningStyleSchema>
  voiceSelection: z.infer<typeof VoiceSelectionSchema>
  schedule: z.infer<typeof ScheduleSchema>
  delivery: z.infer<typeof DeliverySchema>
}

// Quiz options data
export const QUIZ_OPTIONS = {
  goals: {
    fitness: {
      title: 'Physical Fitness & Energy',
      description: 'Build strength, improve health, and boost energy levels',
      icon: '💪',
      specificGoals: [
        'Lose weight and get in shape',
        'Build muscle and strength',
        'Improve cardiovascular health',
        'Increase daily energy levels',
        'Develop consistent workout habits',
        'Improve sleep quality',
        'Reduce physical pain and tension'
      ]
    },
    mindset: {
      title: 'Mental Confidence & Mindset',
      description: 'Develop confidence, overcome limiting beliefs',
      icon: '🧠',
      specificGoals: [
        'Build unshakeable confidence',
        'Overcome imposter syndrome',
        'Develop growth mindset',
        'Improve self-discipline',
        'Manage anxiety and stress',
        'Increase motivation and drive',
        'Break negative thought patterns'
      ]
    },
    career: {
      title: 'Career & Financial Success',
      description: 'Advance your career and improve financial situation',
      icon: '💼',
      specificGoals: [
        'Get promoted or find better job',
        'Start a side business',
        'Improve leadership skills',
        'Build professional network',
        'Increase income and savings',
        'Develop entrepreneurial mindset',
        'Master productivity and time management'
      ]
    },
    relationships: {
      title: 'Relationships & Social Life',
      description: 'Improve connections and communication skills',
      icon: '❤️',
      specificGoals: [
        'Find meaningful romantic relationship',
        'Improve communication skills',
        'Build stronger friendships',
        'Resolve family conflicts',
        'Become more socially confident',
        'Develop emotional intelligence',
        'Create work-life balance'
      ]
    },
    stress: {
      title: 'Stress & Emotional Balance',
      description: 'Manage stress and find inner peace',
      icon: '🧘',
      specificGoals: [
        'Reduce daily stress and overwhelm',
        'Develop emotional regulation',
        'Practice mindfulness and meditation',
        'Improve work-life boundaries',
        'Build resilience and coping skills',
        'Find inner peace and calm',
        'Overcome burnout and exhaustion'
      ]
    }
  },
  painPoints: [
    'Low motivation and energy',
    'Consistency struggles',
    'Time management issues',
    'Self-doubt and confidence',
    'Overwhelm and stress',
    'Past failures and setbacks',
    'Perfectionism and fear',
    'Lack of clear direction',
    'Procrastination habits',
    'Negative self-talk',
    'Social anxiety',
    'Work-life imbalance'
  ],
  learningStyles: {
    direct: {
      title: 'Direct Coaching',
      description: 'Straightforward advice and clear action steps',
      icon: '🎯'
    },
    gentle: {
      title: 'Gentle Encouragement',
      description: 'Supportive guidance with compassionate approach',
      icon: '🤗'
    },
    tough: {
      title: 'Tough Love',
      description: 'Challenging push with accountability focus',
      icon: '💥'
    },
    story: {
      title: 'Story-Based Inspiration',
      description: 'Learn through examples and inspiring narratives',
      icon: '📚'
    }
  },
  deliveryMethods: {
    email: {
      title: 'Email',
      description: 'Daily audio delivered to your inbox',
      icon: '📧',
      available: true
    },
    whatsapp: {
      title: 'WhatsApp',
      description: 'Personal messages with audio content',
      icon: '💬',
      available: false
    },
    telegram: {
      title: 'Telegram',
      description: 'Private bot delivers your content',
      icon: '✈️',
      available: false
    }
  } as const
}

// Quiz step configuration
export const QUIZ_STEPS: Array<{
  id: QuizStepType
  title: string
  description: string
  component: string
}> = [
  {
    id: 'identity',
    title: 'Welcome! Let\'s get to know you',
    description: 'What should we call you?',
    component: 'IdentityStep'
  },
  {
    id: 'goals',
    title: 'What\'s your primary focus?',
    description: 'Choose the area you want to transform most',
    component: 'GoalsStep'
  },
  {
    id: 'painPoints',
    title: 'What challenges you most?',
    description: 'Select all that apply to your situation',
    component: 'PainPointsStep'
  },
  {
    id: 'currentLevel',
    title: 'Where are you today?',
    description: 'Help us understand your starting point',
    component: 'CurrentLevelStep'
  },
  {
    id: 'idealOutcome',
    title: 'Paint your dream picture',
    description: 'Describe your ideal transformation',
    component: 'IdealOutcomeStep'
  },
  {
    id: 'learningStyle',
    title: 'How do you prefer guidance?',
    description: 'Choose your ideal coaching style',
    component: 'LearningStyleStep'
  },
  {
    id: 'voiceSelection',
    title: 'Choose Your Coach',
    description: 'Select a voice that motivates you',
    component: 'VoiceSelectionStep'
  },
  {
    id: 'schedule',
    title: 'When do you want your daily boost?',
    description: 'Set your perfect delivery time',
    component: 'ScheduleStep'
  },
  {
    id: 'delivery',
    title: 'How should we reach you?',
    description: 'Choose your preferred delivery method',
    component: 'DeliveryStep'
  },
  {
    id: 'analyzing',
    title: 'Creating Your PowerPulse Plan',
    description: 'Analyzing your responses...',
    component: 'AnalyzingStep'
  },
  {
    id: 'complete',
    title: 'Your personal plan is ready!',
    description: 'Let\'s complete your PowerPulse setup',
    component: 'CompleteStep'
  }
]

// Helper functions
export function getStepIndex(step: QuizStepType): number {
  return QUIZ_STEPS.findIndex(s => s.id === step)
}

export function getStepProgress(step: QuizStepType): number {
  const index = getStepIndex(step)
  return Math.round(((index + 1) / QUIZ_STEPS.length) * 100)
}

export function getNextStep(currentStep: QuizStepType): QuizStepType | null {
  const currentIndex = getStepIndex(currentStep)
  if (currentIndex < QUIZ_STEPS.length - 1) {
    return QUIZ_STEPS[currentIndex + 1].id
  }
  return null
}

export function getPreviousStep(currentStep: QuizStepType): QuizStepType | null {
  const currentIndex = getStepIndex(currentStep)
  if (currentIndex > 0) {
    return QUIZ_STEPS[currentIndex - 1].id
  }
  return null
}