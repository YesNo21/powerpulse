'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles, Trophy, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useQuizStore from '@/lib/stores/quiz-store'
import { api } from '@/lib/trpc/client'
import confetti from 'canvas-confetti'

export default function QuizCompletePage() {
  const router = useRouter()
  const { quizData, resetQuiz } = useQuizStore()
  const [isSubmitting, setIsSubmitting] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Complete quiz mutation
  const completeQuiz = api.user.completeQuiz.useMutation({
    onSuccess: () => {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      
      setIsSubmitting(false)
      
      // Reset quiz data after successful submission
      setTimeout(() => {
        resetQuiz()
      }, 2000)
    },
    onError: (error) => {
      setError(error.message)
      setIsSubmitting(false)
    },
  })

  useEffect(() => {
    // Convert quiz data to the format expected by the API
    const submitQuizData = async () => {
      try {
        const responses = [
          // Personal Info
          { questionId: 'name', answer: quizData.personalInfo.name },
          { questionId: 'email', answer: quizData.personalInfo.email },
          { questionId: 'age', answer: quizData.personalInfo.age },
          { questionId: 'gender', answer: quizData.personalInfo.gender },
          
          // Fitness Goals
          { questionId: 'primary-goal', answer: quizData.fitnessGoals.primaryGoal },
          { questionId: 'secondary-goals', answer: quizData.fitnessGoals.secondaryGoals },
          { questionId: 'timeline', answer: quizData.fitnessGoals.timeline },
          
          // Current Fitness
          { questionId: 'activity-level', answer: quizData.currentFitness.activityLevel },
          { questionId: 'workout-frequency', answer: quizData.currentFitness.workoutFrequency },
          { questionId: 'challenges', answer: quizData.currentFitness.currentChallenges },
          { questionId: 'injuries', answer: quizData.currentFitness.injuries },
          
          // Preferences
          { questionId: 'workout-duration', answer: quizData.preferences.workoutDuration },
          { questionId: 'preferred-time', answer: quizData.preferences.preferredTime },
          { questionId: 'equipment', answer: quizData.preferences.equipment },
          { questionId: 'workout-types', answer: quizData.preferences.workoutTypes },
        ]

        // Extract profile data for the user profile
        const profileData = {
          painPoints: quizData.currentFitness.currentChallenges || [],
          goals: [quizData.fitnessGoals.primaryGoal, ...quizData.fitnessGoals.secondaryGoals].filter(Boolean),
          learningStyle: 'gentle' as const, // Default for now, could be determined from quiz
          currentLevel: quizData.currentFitness.activityLevel === 'sedentary' ? 1 : 
                        quizData.currentFitness.activityLevel === 'lightly-active' ? 3 :
                        quizData.currentFitness.activityLevel === 'moderately-active' ? 5 : 7,
          triggers: [], // Could be expanded in future
          blockers: quizData.currentFitness.currentChallenges || [],
          preferredDeliveryTime: quizData.preferences.preferredTime === 'early-morning' ? '06:00' :
                                 quizData.preferences.preferredTime === 'morning' ? '08:00' :
                                 quizData.preferences.preferredTime === 'afternoon' ? '14:00' :
                                 quizData.preferences.preferredTime === 'evening' ? '18:00' :
                                 quizData.preferences.preferredTime === 'night' ? '21:00' : '08:00',
          deliveryMethod: 'email' as const, // Default for now
        }

        await completeQuiz.mutateAsync({
          responses,
          profileData,
        })
      } catch (error) {
        console.error('Error submitting quiz:', error)
      }
    }

    submitQuizData()
  }, [])

  const features = [
    { icon: '🎯', title: 'Personalized Goals', description: 'Tailored to your fitness level' },
    { icon: '📱', title: 'Daily Coaching', description: 'Right in your inbox' },
    { icon: '📊', title: 'Progress Tracking', description: 'Watch yourself improve' },
    { icon: '🏆', title: 'Achievement System', description: 'Celebrate your wins' },
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {isSubmitting ? (
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="inline-block mb-8"
            >
              <Sparkles className="w-16 h-16 text-brand-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-4">Creating Your Personalized Plan...</h1>
            <p className="text-muted-foreground mb-8">
              We're crafting the perfect fitness journey just for you
            </p>
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-primary" />
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <span className="text-3xl">😕</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">Oops! Something went wrong</h1>
            <p className="text-muted-foreground mb-8">{error}</p>
            <Button
              onClick={() => router.push('/quiz')}
              size="lg"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full mb-6">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold mb-4"
              >
                Welcome to PowerPulse! 🎉
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-muted-foreground"
              >
                Your personalized fitness journey starts now
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-4 mb-8"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-card border border-border rounded-lg p-4 text-center"
                >
                  <span className="text-3xl mb-2 block">{feature.icon}</span>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-lg p-6 mb-8"
            >
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="w-6 h-6 text-brand-primary" />
                <h3 className="font-semibold text-lg">What's Next?</h3>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-brand-primary mt-1">•</span>
                  <span>Check your email for your first personalized workout</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-primary mt-1">•</span>
                  <span>Explore your dashboard to track progress</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-primary mt-1">•</span>
                  <span>Join our community to connect with others</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <Button
                onClick={() => router.push('/dashboard')}
                size="lg"
                variant="glow"
                className="w-full group"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  )
}