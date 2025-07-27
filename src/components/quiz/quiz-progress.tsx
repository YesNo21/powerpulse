'use client'

import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import useQuizStore from '@/lib/stores/quiz-store'
import { cn } from '@/lib/utils'

const steps = [
  { id: 1, name: 'Personal Info', icon: '👤' },
  { id: 2, name: 'Fitness Goals', icon: '🎯' },
  { id: 3, name: 'Current Fitness', icon: '💪' },
  { id: 4, name: 'Preferences', icon: '⚙️' }
]

export function QuizProgress() {
  const { currentStep, isStepComplete, goToStep } = useQuizStore()

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-muted rounded-full" />
        
        {/* Animated Progress Bar */}
        <motion.div
          className="absolute top-6 left-0 h-1 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep
            const isCompleted = step.id < currentStep || isStepComplete(step.id)
            const isClickable = step.id < currentStep || isCompleted

            return (
              <motion.button
                key={step.id}
                onClick={() => isClickable && goToStep(step.id)}
                disabled={!isClickable}
                className={cn(
                  'flex flex-col items-center gap-2 relative z-10',
                  isClickable && 'cursor-pointer hover:scale-105 transition-transform',
                  !isClickable && 'cursor-not-allowed'
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Step Circle */}
                <motion.div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all duration-300',
                    isActive && 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/25',
                    isCompleted && !isActive && 'bg-green-500 text-white',
                    !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                  )}
                  whileHover={isClickable ? { scale: 1.1 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                >
                  {isCompleted && !isActive ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <span className="text-xl">{step.icon}</span>
                  )}
                </motion.div>

                {/* Step Label */}
                <span
                  className={cn(
                    'text-sm font-medium transition-colors duration-300 whitespace-nowrap',
                    isActive && 'text-foreground',
                    !isActive && 'text-muted-foreground'
                  )}
                >
                  {step.name}
                </span>

                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-brand-primary" />
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}