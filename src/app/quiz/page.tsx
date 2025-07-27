'use client'

import { useAuth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QuizProgress } from '@/components/quiz/quiz-progress'
import { QuizStepPersonal } from '@/components/quiz/quiz-step-personal'
import { QuizStepGoals } from '@/components/quiz/quiz-step-goals'
import { QuizStepPainPoints } from '@/components/quiz/quiz-step-pain-points'
import { QuizStepPreferences } from '@/components/quiz/quiz-step-preferences'
import useQuizStore from '@/lib/stores/quiz-store'
import { Loader2 } from 'lucide-react'

export default function QuizPage() {
  const { isLoaded, userId } = useAuth()
  const { currentStep } = useQuizStore()
  
  // Hydrate the store on client side
  useEffect(() => {
    useQuizStore.persist.rehydrate()
  }, [])
  
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-primary" />
          <p className="text-muted-foreground">Loading your quiz...</p>
        </motion.div>
      </div>
    )
  }
  
  if (!userId) {
    redirect('/sign-in')
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <QuizStepPersonal />
      case 2:
        return <QuizStepGoals />
      case 3:
        return <QuizStepPainPoints />
      case 4:
        return <QuizStepPreferences />
      default:
        return <QuizStepPersonal />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-secondary/5 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Quiz Progress */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <QuizProgress />
        </motion.div>

        {/* Step Content */}
        <div className="pb-12">
          <AnimatePresence mode="wait">
            {renderCurrentStep()}
          </AnimatePresence>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-secondary/10 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  )
}