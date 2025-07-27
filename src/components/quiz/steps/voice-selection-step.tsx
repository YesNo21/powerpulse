'use client'

import { useEffect, useState } from 'react'
import { useQuiz } from '@/hooks/use-quiz'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Play, Pause, Loader2, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface VoiceSelectionStepProps {
  onValidationChange: (isValid: boolean) => void
}

interface VoicePersona {
  id: string
  name: string
  title: string
  description: string
  personality: string[]
  bestFor: string[]
  age: string
  gender: 'male' | 'female'
  accent: string
  voiceId: string
  voiceType: 'Chirp3-HD' | 'Neural2' | 'Studio' | 'WaveNet'
  avatar: string
  sampleText?: string
}

const VOICE_PERSONAS: VoicePersona[] = [
  // Chirp 3 HD Voices - Latest Technology
  {
    id: 'callirrhoe',
    name: 'Callirrhoe',
    title: 'Energetic Fitness Enthusiast',
    description: 'Your personal cheerleader for physical transformation',
    personality: ['Dynamic', 'Encouraging', 'Vibrant'],
    bestFor: ['Workout motivation', 'Health goals', 'Morning energy'],
    age: '28-35',
    gender: 'female',
    accent: 'American',
    voiceId: 'chirp3-hd:Callirrhoe',
    voiceType: 'Chirp3-HD',
    avatar: '🌟',
    sampleText: "Hey there, superstar! Ready to make today amazing? Let's energize your journey!"
  },
  {
    id: 'fenrir',
    name: 'Fenrir',
    title: 'Fierce Warrior Coach',
    description: 'Unleash your inner warrior with intense motivation',
    personality: ['Fierce', 'Determined', 'Unstoppable'],
    bestFor: ['Intense challenges', 'Competition', 'Breaking limits'],
    age: '30-40',
    gender: 'male',
    accent: 'American',
    voiceId: 'chirp3-hd:Fenrir',
    voiceType: 'Chirp3-HD',
    avatar: '⚡',
    sampleText: "Time to unleash your power! No excuses, no limits. Let's conquer this together!"
  },
  {
    id: 'despina',
    name: 'Despina',
    title: 'Calming Meditation Guide',
    description: 'Like a gentle ocean wave, bringing peace and tranquility',
    personality: ['Soothing', 'Peaceful', 'Centered'],
    bestFor: ['Stress relief', 'Mindfulness', 'Relaxation'],
    age: '30-40',
    gender: 'female',
    accent: 'American',
    voiceId: 'chirp3-hd:Despina',
    voiceType: 'Chirp3-HD',
    avatar: '🕊️',
    sampleText: "Take a deep breath with me. Let's find your calm center and embrace this moment of peace."
  },
  {
    id: 'achernar',
    name: 'Achernar',
    title: 'Professional Success Mentor',
    description: 'Named after a bright star, she guides with clarity and purpose',
    personality: ['Confident', 'Inspiring', 'Articulate'],
    bestFor: ['Leadership coaching', 'Career growth', 'Professional development'],
    age: '35-45',
    gender: 'female',
    accent: 'American',
    voiceId: 'chirp3-hd:Achernar',
    voiceType: 'Chirp3-HD',
    avatar: '✨',
    sampleText: "Success starts with a single decision. Today, let's elevate your potential to new heights."
  },
  {
    id: 'algieba',
    name: 'Algieba',
    title: 'Wise Philosopher',
    description: 'Ancient wisdom meets modern challenges',
    personality: ['Thoughtful', 'Philosophical', 'Profound'],
    bestFor: ['Deep thinking', 'Life questions', 'Personal growth'],
    age: '50-60',
    gender: 'male',
    accent: 'American',
    voiceId: 'chirp3-hd:Algieba',
    voiceType: 'Chirp3-HD',
    avatar: '🦉',
    sampleText: "Life's greatest lessons often come from our deepest reflections. Let's explore your truth together."
  },
  // Premium Neural2 Voices
  {
    id: 'coach-mike',
    name: 'Coach Mike',
    title: 'Classic Fitness Coach',
    description: 'Traditional high-energy motivation',
    personality: ['Energetic', 'Motivational', 'Direct'],
    bestFor: ['Fitness goals', 'Morning motivation', 'Athletic performance'],
    age: '35-45',
    gender: 'male',
    accent: 'American',
    voiceId: 'en-US-Neural2-D',
    voiceType: 'Neural2',
    avatar: '💪',
    sampleText: "Hey there, champion! Ready to crush those goals today? Let's make it happen!"
  },
  {
    id: 'sarah',
    name: 'Sarah',
    title: 'Nurturing Wellness Coach',
    description: 'Gentle encouragement with a warm, supportive approach',
    personality: ['Warm', 'Nurturing', 'Supportive'],
    bestFor: ['Self-care', 'Stress relief', 'Gentle motivation'],
    age: '30-40',
    gender: 'female',
    accent: 'American',
    voiceId: 'en-US-Neural2-C',
    voiceType: 'Neural2',
    avatar: '🧘‍♀️',
    sampleText: "Hello, beautiful soul. Today is a new opportunity to nurture yourself and grow."
  },
  {
    id: 'dr-thomas',
    name: 'Dr. Thomas',
    title: 'Mindfulness Expert',
    description: 'Calm, professional guidance for inner peace',
    personality: ['Calm', 'Professional', 'Wise'],
    bestFor: ['Meditation', 'Stress management', 'Mental clarity'],
    age: '45-55',
    gender: 'male',
    accent: 'American',
    voiceId: 'en-US-Studio-Q',
    voiceType: 'Studio',
    avatar: '🧠',
    sampleText: "Welcome. Let's take a moment to center ourselves and focus on what truly matters."
  },
  {
    id: 'victoria',
    name: 'Victoria',
    title: 'Success Mentor',
    description: 'Professional excellence and leadership coaching',
    personality: ['Confident', 'Articulate', 'Inspiring'],
    bestFor: ['Career growth', 'Leadership', 'Professional development'],
    age: '35-45',
    gender: 'female',
    accent: 'American',
    voiceId: 'en-US-Studio-O',
    voiceType: 'Studio',
    avatar: '💼',
    sampleText: "Success is a choice you make every day. Let's elevate your potential together."
  },
  {
    id: 'james',
    name: 'James',
    title: 'Life Philosophy Guide',
    description: 'British wisdom for deep personal growth',
    personality: ['Thoughtful', 'Refined', 'Philosophical'],
    bestFor: ['Personal growth', 'Life wisdom', 'Mindfulness'],
    age: '40-50',
    gender: 'male',
    accent: 'British',
    voiceId: 'en-GB-Studio-B',
    voiceType: 'Studio',
    avatar: '📚',
    sampleText: "Good day. Let's explore the deeper meaning behind your journey today."
  },
  {
    id: 'emma',
    name: 'Emma',
    title: 'Dynamic Personal Trainer',
    description: 'Upbeat energy to power your transformation',
    personality: ['Upbeat', 'Dynamic', 'Motivating'],
    bestFor: ['Weight loss', 'Habit building', 'Daily energy'],
    age: '25-30',
    gender: 'female',
    accent: 'American',
    voiceId: 'en-US-Neural2-E',
    voiceType: 'Neural2',
    avatar: '🏃‍♀️',
    sampleText: "Yes! You've got this! Every step forward is a victory worth celebrating!"
  }
]

export function VoiceSelectionStep({ onValidationChange }: VoiceSelectionStepProps) {
  const { responses, updateResponse } = useQuiz()
  const [selectedVoice, setSelectedVoice] = useState<string>(
    responses.voiceSelection?.voiceId || ''
  )
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [generatingAudio, setGeneratingAudio] = useState<string | null>(null)
  const [audioCache, setAudioCache] = useState<Record<string, string>>({})

  useEffect(() => {
    const isValid = !!selectedVoice
    onValidationChange(isValid)
    
    if (isValid) {
      const selectedPersona = VOICE_PERSONAS.find(p => p.id === selectedVoice)
      if (selectedPersona) {
        updateResponse('voiceSelection', {
          voiceId: selectedPersona.id,
          voiceName: selectedPersona.voiceId,
          persona: selectedPersona
        })
      }
    }
  }, [selectedVoice, onValidationChange, updateResponse])

  const generatePersonalizedSample = async (persona: VoicePersona) => {
    // Check cache first
    if (audioCache[persona.id]) {
      playAudio(audioCache[persona.id], persona.id)
      return
    }

    setGeneratingAudio(persona.id)
    
    try {
      // Generate personalized text based on user's quiz responses
      const userName = responses.identity?.name || 'there'
      const primaryGoals = responses.goals?.primaryGoals || []
      const painPoints = responses.painPoints?.painPoints || []
      
      let personalizedText = `Hello ${userName}! I'm ${persona.name}. `
      
      if (primaryGoals.length > 0) {
        const goalText = primaryGoals[0].replace(/([A-Z])/g, ' $1').toLowerCase().trim()
        personalizedText += `I understand you're focused on ${goalText}. `
      }
      
      if (painPoints.length > 0 && painPoints[0].toLowerCase().includes('motivation')) {
        personalizedText += `I'm here to help you stay motivated and consistent. `
      }
      
      personalizedText += persona.sampleText || `Together, we'll transform your daily 5 minutes into powerful moments of growth.`

      // Call TTS API
      const response = await fetch('/api/voice/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: personalizedText,
          voiceId: persona.voiceId,
          languageCode: persona.accent === 'British' ? 'en-GB' : 'en-US'
        })
      })

      if (!response.ok) throw new Error('Failed to generate audio')

      const { audioUrl } = await response.json()
      
      // Cache the audio URL
      setAudioCache(prev => ({ ...prev, [persona.id]: audioUrl }))
      
      // Play the audio
      playAudio(audioUrl, persona.id)
    } catch (error) {
      console.error('Error generating audio:', error)
      // Fallback to static sample
      playStaticSample(persona)
    } finally {
      setGeneratingAudio(null)
    }
  }

  const playAudio = (audioUrl: string, personaId: string) => {
    const audio = new Audio(audioUrl)
    setPlayingVoice(personaId)
    
    audio.addEventListener('ended', () => {
      setPlayingVoice(null)
    })
    
    audio.addEventListener('error', () => {
      setPlayingVoice(null)
      console.error('Audio playback error')
    })
    
    audio.play()
  }

  const playStaticSample = (persona: VoicePersona) => {
    // Fallback to pre-recorded samples or basic TTS
    const utterance = new SpeechSynthesisUtterance(persona.sampleText)
    utterance.rate = 0.9
    utterance.pitch = persona.gender === 'male' ? 0.8 : 1.1
    
    utterance.onend = () => setPlayingVoice(null)
    
    setPlayingVoice(persona.id)
    speechSynthesis.speak(utterance)
  }

  const stopAudio = () => {
    speechSynthesis.cancel()
    setPlayingVoice(null)
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Volume2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Choose Your Coach</h2>
        <p className="text-muted-foreground">
          Select a voice that resonates with you. Click to hear a personalized preview!
        </p>
        <Badge variant="secondary" className="mt-2">
          🌟 NEW: Chirp 3 HD voices with celestial names
        </Badge>
      </div>

      {/* Voice Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {VOICE_PERSONAS.map((persona) => (
          <motion.div
            key={persona.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={cn(
                "p-6 cursor-pointer transition-all duration-200 hover:shadow-lg relative overflow-hidden",
                selectedVoice === persona.id 
                  ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                  : "hover:shadow-md"
              )}
              onClick={() => setSelectedVoice(persona.id)}
            >
              {/* Voice Type Badge */}
              <Badge 
                variant={persona.voiceType === 'Chirp3-HD' ? 'default' : 'secondary'}
                className={cn(
                  "absolute top-4 right-4 text-xs",
                  persona.voiceType === 'Chirp3-HD' && "bg-gradient-to-r from-purple-500 to-pink-500"
                )}
              >
                {persona.voiceType === 'Chirp3-HD' ? '✨ ' + persona.voiceType : persona.voiceType}
              </Badge>

              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-pink-500">
                      {persona.avatar}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{persona.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{persona.title}</p>
                  <p className="text-sm mb-3">{persona.description}</p>
                  
                  {/* Personality Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {persona.personality.map((trait) => (
                      <Badge key={trait} variant="outline" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                  </div>

                  {/* Best For */}
                  <div className="text-xs text-muted-foreground mb-3">
                    <span className="font-medium">Best for: </span>
                    {persona.bestFor.join(', ')}
                  </div>

                  {/* Listen Button */}
                  <Button
                    size="sm"
                    variant={playingVoice === persona.id ? "destructive" : "secondary"}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (playingVoice === persona.id) {
                        stopAudio()
                      } else {
                        generatePersonalizedSample(persona)
                      }
                    }}
                    disabled={generatingAudio === persona.id}
                    className="w-full"
                  >
                    {generatingAudio === persona.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : playingVoice === persona.id ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Hear Preview
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Selection Indicator */}
              {selectedVoice === persona.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute bottom-4 right-4"
                >
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Selected Voice Summary */}
      {selectedVoice && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto"
        >
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <h3 className="font-semibold mb-3 text-center">Your Coach Selection</h3>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {VOICE_PERSONAS.find(p => p.id === selectedVoice)?.name} will be your daily companion,
                delivering personalized 5-minute sessions tailored to your goals and preferences.
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                💡 You can change your coach anytime in settings
              </p>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}