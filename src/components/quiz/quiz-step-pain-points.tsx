'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Dumbbell, AlertCircle, CheckSquare, Square } from 'lucide-react'
import useQuizStore from '@/lib/stores/quiz-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const activityLevels = [
  {
    id: 'sedentary',
    title: 'Sedentary',
    description: 'Little to no exercise',
    icon: '🪑',
    color: 'from-gray-500 to-gray-600'
  },
  {
    id: 'lightly-active',
    title: 'Lightly Active',
    description: 'Light exercise 1-3 days/week',
    icon: '🚶',
    color: 'from-blue-400 to-blue-500'
  },
  {
    id: 'moderately-active',
    title: 'Moderately Active',
    description: 'Moderate exercise 3-5 days/week',
    icon: '🏃',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'very-active',
    title: 'Very Active',
    description: 'Hard exercise 6-7 days/week',
    icon: '🏋️',
    color: 'from-orange-500 to-red-500'
  }
]

const workoutFrequencies = [
  { id: 'none', label: 'Not currently working out' },
  { id: '1-2', label: '1-2 times per week' },
  { id: '3-4', label: '3-4 times per week' },
  { id: '5-6', label: '5-6 times per week' },
  { id: 'daily', label: 'Every day' }
]

const challenges = [
  { id: 'motivation', label: 'Lack of motivation', icon: '😴' },
  { id: 'time', label: 'Not enough time', icon: '⏰' },
  { id: 'knowledge', label: "Don't know where to start", icon: '❓' },
  { id: 'consistency', label: 'Trouble staying consistent', icon: '📉' },
  { id: 'plateau', label: 'Hit a plateau', icon: '📊' },
  { id: 'boredom', label: 'Workouts are boring', icon: '😑' },
  { id: 'equipment', label: 'Limited equipment access', icon: '🏠' },
  { id: 'confidence', label: 'Gym intimidation', icon: '😰' },
  { id: 'recovery', label: 'Recovery issues', icon: '🤕' },
  { id: 'nutrition', label: 'Nutrition confusion', icon: '🍎' }
]

export function QuizStepPainPoints() {
  const { quizData, updateCurrentFitness, nextStep, previousStep } = useQuizStore()
  const [injuries, setInjuries] = useState(quizData.currentFitness.injuries || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleActivityLevelSelect = (levelId: string) => {
    updateCurrentFitness({ activityLevel: levelId })
    setErrors({ ...errors, activityLevel: '' })
  }

  const handleFrequencySelect = (frequencyId: string) => {
    updateCurrentFitness({ workoutFrequency: frequencyId })
    setErrors({ ...errors, workoutFrequency: '' })
  }

  const handleChallengeToggle = (challengeId: string) => {
    const currentChallenges = quizData.currentFitness.currentChallenges || []
    const updated = currentChallenges.includes(challengeId)
      ? currentChallenges.filter(c => c !== challengeId)
      : [...currentChallenges, challengeId]
    
    updateCurrentFitness({ currentChallenges: updated })
  }

  const handleInjuriesChange = (value: string) => {
    setInjuries(value)
    updateCurrentFitness({ injuries: value })
  }

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    
    if (!quizData.currentFitness.activityLevel) {
      newErrors.activityLevel = 'Please select your current activity level'
    }
    
    if (!quizData.currentFitness.workoutFrequency) {
      newErrors.workoutFrequency = 'Please select your workout frequency'
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
          Your Current Fitness Level 💪
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          Help us understand where you're starting from
        </motion.p>
      </div>

      <div className="space-y-8">
        {/* Activity Level */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-brand-primary" />
            <h3 className="text-lg font-semibold">Current Activity Level</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {activityLevels.map((level, index) => (
              <motion.button
                key={level.id}
                onClick={() => handleActivityLevelSelect(level.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'relative p-4 rounded-xl border-2 text-left transition-all duration-300',
                  'hover:shadow-lg',
                  quizData.currentFitness.activityLevel === level.id
                    ? 'border-brand-primary bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10'
                    : 'border-border bg-card hover:bg-accent/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center text-xl',
                    'bg-gradient-to-br', level.color
                  )}>
                    {level.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold">{level.title}</h4>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
          
          <AnimatePresence>
            {errors.activityLevel && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-red-500"
              >
                {errors.activityLevel}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Workout Frequency */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="w-5 h-5 text-brand-primary" />
            <h3 className="text-lg font-semibold">How often do you currently work out?</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workoutFrequencies.map((frequency, index) => (
              <motion.button
                key={frequency.id}
                onClick={() => handleFrequencySelect(frequency.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.03 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all duration-200',
                  'hover:shadow-md',
                  quizData.currentFitness.workoutFrequency === frequency.id
                    ? 'border-brand-primary bg-brand-primary/10'
                    : 'border-border bg-card hover:border-brand-primary/50'
                )}
              >
                <span className="font-medium">{frequency.label}</span>
              </motion.button>
            ))}
          </div>
          
          <AnimatePresence>
            {errors.workoutFrequency && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-red-500"
              >
                {errors.workoutFrequency}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Current Challenges */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-brand-secondary" />
            <h3 className="text-lg font-semibold">What challenges are you facing?</h3>
            <span className="text-sm text-muted-foreground">(Select all that apply)</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {challenges.map((challenge, index) => (
              <motion.button
                key={challenge.id}
                onClick={() => handleChallengeToggle(challenge.id)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.02 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200',
                  'hover:shadow-md text-left',
                  quizData.currentFitness.currentChallenges?.includes(challenge.id)
                    ? 'border-brand-secondary bg-brand-secondary/10'
                    : 'border-border bg-card hover:border-brand-secondary/50'
                )}
              >
                <div className="flex items-center justify-center w-6 h-6">
                  {quizData.currentFitness.currentChallenges?.includes(challenge.id) ? (
                    <CheckSquare className="w-5 h-5 text-brand-secondary" />
                  ) : (
                    <Square className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <span className="text-xl">{challenge.icon}</span>
                <span className="flex-1 font-medium">{challenge.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Injuries/Limitations */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            Any injuries or physical limitations we should know about?
            <span className="text-muted-foreground">(Optional)</span>
          </label>
          <motion.div whileTap={{ scale: 0.995 }}>
            <textarea
              value={injuries}
              onChange={(e) => handleInjuriesChange(e.target.value)}
              placeholder="e.g., bad knee, lower back pain, recovering from surgery..."
              rows={3}
              className={cn(
                'w-full px-4 py-3 rounded-lg border bg-background transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent',
                'resize-none'
              )}
            />
          </motion.div>
        </div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
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
            Continue to Preferences
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}