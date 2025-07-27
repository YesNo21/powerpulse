'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Clock, CheckCircle2 } from 'lucide-react'
import useQuizStore from '@/lib/stores/quiz-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const primaryGoals = [
  {
    id: 'weight-loss',
    title: 'Lose Weight',
    description: 'Burn fat and achieve a healthier body composition',
    icon: '🔥',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'muscle-gain',
    title: 'Build Muscle',
    description: 'Increase strength and muscle mass',
    icon: '💪',
    color: 'from-blue-500 to-purple-500'
  },
  {
    id: 'endurance',
    title: 'Improve Endurance',
    description: 'Boost stamina and cardiovascular fitness',
    icon: '🏃',
    color: 'from-green-500 to-teal-500'
  },
  {
    id: 'flexibility',
    title: 'Increase Flexibility',
    description: 'Enhance mobility and reduce injury risk',
    icon: '🧘',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'general-fitness',
    title: 'General Fitness',
    description: 'Overall health and wellness improvement',
    icon: '⭐',
    color: 'from-brand-primary to-brand-secondary'
  },
  {
    id: 'sports-performance',
    title: 'Sports Performance',
    description: 'Excel in your specific sport or activity',
    icon: '🏆',
    color: 'from-yellow-500 to-orange-500'
  }
]

const secondaryGoals = [
  { id: 'stress-relief', label: 'Reduce stress', icon: '😌' },
  { id: 'energy', label: 'Boost energy levels', icon: '⚡' },
  { id: 'confidence', label: 'Build confidence', icon: '💫' },
  { id: 'discipline', label: 'Develop discipline', icon: '🎯' },
  { id: 'social', label: 'Meet fitness community', icon: '👥' },
  { id: 'fun', label: 'Have fun exercising', icon: '🎉' }
]

const timelines = [
  { id: '1-month', label: '1 month', description: 'Quick results' },
  { id: '3-months', label: '3 months', description: 'Noticeable changes' },
  { id: '6-months', label: '6 months', description: 'Significant transformation' },
  { id: '1-year', label: '1 year+', description: 'Long-term lifestyle' }
]

export function QuizStepGoals() {
  const { quizData, updateFitnessGoals, nextStep, previousStep } = useQuizStore()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handlePrimaryGoalSelect = (goalId: string) => {
    updateFitnessGoals({ primaryGoal: goalId })
    setErrors({ ...errors, primaryGoal: '' })
  }

  const handleSecondaryGoalToggle = (goalId: string) => {
    const currentGoals = quizData.fitnessGoals.secondaryGoals || []
    const updated = currentGoals.includes(goalId)
      ? currentGoals.filter(g => g !== goalId)
      : [...currentGoals, goalId]
    
    updateFitnessGoals({ secondaryGoals: updated })
  }

  const handleTimelineSelect = (timelineId: string) => {
    updateFitnessGoals({ timeline: timelineId })
    setErrors({ ...errors, timeline: '' })
  }

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    
    if (!quizData.fitnessGoals.primaryGoal) {
      newErrors.primaryGoal = 'Please select your primary fitness goal'
    }
    
    if (!quizData.fitnessGoals.timeline) {
      newErrors.timeline = 'Please select your target timeline'
    }
    
    if (Object.keys(newErrors).length === 0) {
      nextStep()
    } else {
      setErrors(newErrors)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto p-6"
    >
      <div className="text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold mb-2"
        >
          What Are Your Fitness Goals? 🎯
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          Let's understand what you want to achieve on your fitness journey
        </motion.p>
      </div>

      <div className="space-y-8">
        {/* Primary Goal Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-brand-primary" />
            <h3 className="text-lg font-semibold">Primary Goal</h3>
            <span className="text-sm text-muted-foreground">(Choose one)</span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {primaryGoals.map((goal, index) => (
              <motion.button
                key={goal.id}
                onClick={() => handlePrimaryGoalSelect(goal.id)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'relative p-6 rounded-xl border-2 text-left transition-all duration-300',
                  'hover:shadow-lg hover:border-opacity-50',
                  quizData.fitnessGoals.primaryGoal === goal.id
                    ? 'border-brand-primary bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10'
                    : 'border-border bg-card hover:bg-accent/50'
                )}
              >
                {/* Selected Indicator */}
                <AnimatePresence>
                  {quizData.fitnessGoals.primaryGoal === goal.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-3 right-3"
                    >
                      <CheckCircle2 className="w-6 h-6 text-brand-primary" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-start gap-4">
                  <div className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center text-2xl',
                    'bg-gradient-to-br', goal.color
                  )}>
                    {goal.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{goal.title}</h4>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
          
          <AnimatePresence>
            {errors.primaryGoal && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-red-500"
              >
                {errors.primaryGoal}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Secondary Goals */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-brand-secondary" />
            <h3 className="text-lg font-semibold">Additional Goals</h3>
            <span className="text-sm text-muted-foreground">(Optional)</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {secondaryGoals.map((goal, index) => (
              <motion.button
                key={goal.id}
                onClick={() => handleSecondaryGoalToggle(goal.id)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.03 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all duration-200',
                  'hover:shadow-md',
                  quizData.fitnessGoals.secondaryGoals?.includes(goal.id)
                    ? 'border-brand-secondary bg-brand-secondary/10'
                    : 'border-border bg-card hover:border-brand-secondary/50'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{goal.icon}</span>
                  <span className="text-sm font-medium">{goal.label}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Timeline Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-brand-primary" />
            <h3 className="text-lg font-semibold">Target Timeline</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {timelines.map((timeline, index) => (
              <motion.button
                key={timeline.id}
                onClick={() => handleTimelineSelect(timeline.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all duration-200',
                  'hover:shadow-md',
                  quizData.fitnessGoals.timeline === timeline.id
                    ? 'border-brand-primary bg-brand-primary/10'
                    : 'border-border bg-card hover:border-brand-primary/50'
                )}
              >
                <div className="text-center">
                  <p className="font-semibold">{timeline.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{timeline.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
          
          <AnimatePresence>
            {errors.timeline && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-red-500"
              >
                {errors.timeline}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex gap-4 pt-6"
        >
          <Button
            onClick={previousStep}
            size="lg"
            variant="outline"
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            size="lg"
            variant="glow"
            className="flex-1"
          >
            Continue to Current Fitness
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}