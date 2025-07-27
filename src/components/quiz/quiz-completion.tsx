'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

interface QuizResponse {
  questionId: string
  answer: any
}

interface ProfileData {
  painPoints: string[]
  goals: string[]
  learningStyle: 'direct' | 'gentle' | 'tough' | 'story'
  currentLevel: number
  triggers: string[]
  blockers: string[]
  preferredDeliveryTime: string
  deliveryMethod: 'email' | 'whatsapp' | 'telegram' | 'sms'
}

export function QuizCompletion() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Complete quiz mutation
  const completeQuiz = api.user.completeQuiz.useMutation({
    onSuccess: () => {
      alert('Quiz completed successfully!')
      router.push('/dashboard')
    },
    onError: (error) => {
      alert(`Error completing quiz: ${error.message}`)
      setIsSubmitting(false)
    },
  })

  const handleQuizSubmit = async () => {
    setIsSubmitting(true)
    
    // Example quiz responses - in a real app, these would come from quiz state
    const responses: QuizResponse[] = [
      { questionId: 'pain-points', answer: ['lack-of-energy', 'procrastination'] },
      { questionId: 'goals', answer: ['increase-confidence', 'better-habits'] },
      { questionId: 'current-level', answer: 5 },
      { questionId: 'learning-style', answer: 'gentle' },
      { questionId: 'triggers', answer: ['morning-routine', 'work-stress'] },
      { questionId: 'blockers', answer: ['self-doubt', 'lack-of-time'] },
      { questionId: 'delivery-time', answer: '08:00' },
      { questionId: 'delivery-method', answer: 'email' },
    ]
    
    // Profile data extracted from quiz responses
    const profileData: ProfileData = {
      painPoints: ['lack-of-energy', 'procrastination'],
      goals: ['increase-confidence', 'better-habits'],
      learningStyle: 'gentle',
      currentLevel: 5,
      triggers: ['morning-routine', 'work-stress'],
      blockers: ['self-doubt', 'lack-of-time'],
      preferredDeliveryTime: '08:00',
      deliveryMethod: 'email',
    }
    
    await completeQuiz.mutateAsync({
      responses,
      profileData,
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Quiz</CardTitle>
        <CardDescription>
          Review your answers and submit to get started with PowerPulse
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Your Quiz Summary</h3>
            <p className="text-sm text-gray-600">
              This is a demo component showing how to complete the quiz.
              In a real implementation, this would show the user's actual responses.
            </p>
          </div>
          
          <Button 
            onClick={handleQuizSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Complete Quiz & Start Journey'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}