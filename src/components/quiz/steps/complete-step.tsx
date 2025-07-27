'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuiz } from '@/hooks/use-quiz'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Clock, Target, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '@/trpc/react'

interface CompleteStepProps {
  onValidationChange: (isValid: boolean) => void
}

export function CompleteStep({ onValidationChange }: CompleteStepProps) {
  const router = useRouter()
  const { responses, completeQuiz } = useQuiz()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const completeQuizMutation = api.profile.completeQuiz.useMutation({
    onSuccess: () => {
      setIsComplete(true)
      completeQuiz()
      setTimeout(() => {
        router.push('/quiz/payment')
      }, 2000)
    },
    onError: (error) => {
      console.error('Quiz completion error:', error)
      setIsSubmitting(false)
    }
  })

  useEffect(() => {
    onValidationChange(true)
  }, [onValidationChange])

  const handleCompleteQuiz = async () => {
    if (!responses.identity || !responses.goals || !responses.painPoints || 
        !responses.currentLevel || !responses.idealOutcome || !responses.learningStyle || 
        !responses.schedule || !responses.delivery) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await completeQuizMutation.mutateAsync({
        identity: responses.identity,
        goals: responses.goals,
        painPoints: responses.painPoints,
        currentLevel: responses.currentLevel,
        idealOutcome: responses.idealOutcome,
        learningStyle: responses.learningStyle,
        schedule: responses.schedule,
        delivery: responses.delivery,
      })
    } catch (error) {
      console.error('Failed to complete quiz:', error)
      setIsSubmitting(false)
    }
  }

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
          <span className="text-3xl">✨</span>
        </div>
        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
          Your Personal Plan is Ready!
        </h2>
        <p className="text-muted-foreground">
          Redirecting you to complete your PowerPulse setup...
        </p>
      </motion.div>
    )
  }

  const personalizedSummary = {
    goal: responses.goals?.primaryGoal,
    painPoints: responses.painPoints?.painPoints?.slice(0, 2),
    style: responses.learningStyle?.style,
    time: responses.schedule?.preferredTime,
    method: responses.delivery?.method,
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your Personal Plan is Ready!</h2>
        <p className="text-muted-foreground">
          We've analyzed your responses and created a custom coaching experience just for you.
        </p>
      </div>

      {/* Personalized Summary */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <h3 className="font-semibold mb-4 text-center">Your PowerPulse Experience</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">Primary Focus</p>
              <p className="text-sm text-muted-foreground capitalize">
                {personalizedSummary.goal?.replace(/([A-Z])/g, ' $1').trim()}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">Daily Session</p>
              <p className="text-sm text-muted-foreground">
                {personalizedSummary.time} via {personalizedSummary.method}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">Coaching Style</p>
              <p className="text-sm text-muted-foreground capitalize">
                {personalizedSummary.style} approach
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">Key Focus Areas</p>
              <p className="text-sm text-muted-foreground">
                {personalizedSummary.painPoints?.join(', ')}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* What Happens Next */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 text-center">What Happens Next</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">1</Badge>
            <span className="text-sm">Complete your subscription setup ($14.99/month)</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">2</Badge>
            <span className="text-sm">Your first PersonalPowerPulse will be ready within 5 minutes</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">3</Badge>
            <span className="text-sm">Start your transformation journey with daily 5-minute sessions</span>
          </div>
        </div>
      </Card>

      {/* Call to Action */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={handleCompleteQuiz}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {isSubmitting ? 'Creating Your Plan...' : 'Complete Setup - $14.99/month'}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          ✓ 30-Day Money-Back Guarantee • Cancel Anytime
        </p>
      </div>
    </div>
  )
}