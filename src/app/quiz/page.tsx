'use client'

import { useAuth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const questions = [
  {
    id: 1,
    question: "What's your primary goal with PowerPulse?",
    options: [
      "Build better habits",
      "Improve fitness",
      "Boost productivity",
      "Enhance mental wellness"
    ]
  },
  {
    id: 2,
    question: "How much time can you dedicate daily?",
    options: [
      "5 minutes",
      "10-15 minutes",
      "20-30 minutes",
      "More than 30 minutes"
    ]
  },
  {
    id: 3,
    question: "What's your preferred coaching style?",
    options: [
      "Motivational and energetic",
      "Calm and supportive",
      "Direct and challenging",
      "Educational and informative"
    ]
  }
]

export default function QuizPage() {
  const { isLoaded, userId } = useAuth()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  
  if (!isLoaded) {
    return <div>Loading...</div>
  }
  
  if (!userId) {
    redirect('/sign-in')
  }

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Quiz completed - handle submission
      console.log('Quiz completed with answers:', newAnswers)
      // TODO: Save answers and redirect to dashboard
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Personalize Your Experience
          </h1>
          <p className="text-muted-foreground">
            Help us tailor your coaching journey
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        <Card className="p-8">
          <h2 className="text-xl font-semibold mb-6">
            {questions[currentQuestion].question}
          </h2>
          
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left p-4 h-auto"
                onClick={() => handleAnswer(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </Card>

        {currentQuestion > 0 && (
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
          >
            ← Back
          </Button>
        )}
      </div>
    </div>
  )
}