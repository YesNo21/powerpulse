'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuiz } from '@/hooks/use-quiz'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { QUIZ_STEPS, getNextStep, getPreviousStep } from '@/lib/quiz'
import { ArrowLeft, ArrowRight } from 'lucide-react'

// Import quiz step components
import { IdentityStep } from './steps/identity-step'
import { GoalsStep } from './steps/goals-step'
import { PainPointsStep } from './steps/pain-points-step'
import { CurrentLevelStep } from './steps/current-level-step'
import { IdealOutcomeStep } from './steps/ideal-outcome-step'
import { LearningStyleStep } from './steps/learning-style-step'
import { VoiceSelectionStep } from './steps/voice-selection-step'
import { ScheduleStep } from './steps/schedule-step'
import { DeliveryStep } from './steps/delivery-step'
import { AnalyzingStep } from './steps/analyzing-step'
import { CompleteStep } from './steps/complete-step'

const stepComponents = {
  IdentityStep,
  GoalsStep,
  PainPointsStep,
  CurrentLevelStep,
  IdealOutcomeStep,
  LearningStyleStep,
  VoiceSelectionStep,
  ScheduleStep,
  DeliveryStep,
  AnalyzingStep,
  CompleteStep,
}

export function QuizContainer() {
  const { currentStep, setCurrentStep, getProgress, responses } = useQuiz()
  const [isValid, setIsValid] = useState(false)

  const currentStepData = QUIZ_STEPS.find(step => step.id === currentStep)
  const progress = getProgress()
  const canGoNext = isValid && currentStep !== 'complete'
  const canGoBack = currentStep !== 'identity'
  
  const handleValidationChange = useCallback((valid: boolean) => {
    setIsValid(valid)
  }, [])

  const handleNext = () => {
    const nextStep = getNextStep(currentStep)
    if (nextStep) {
      setCurrentStep(nextStep)
      setIsValid(false)
    }
  }

  const handleBack = () => {
    const prevStep = getPreviousStep(currentStep)
    if (prevStep) {
      setCurrentStep(prevStep)
      setIsValid(true) // Previous steps should already be valid
    }
  }

  if (!currentStepData) {
    return <div>Loading...</div>
  }

  const StepComponent = stepComponents[currentStepData.component as keyof typeof stepComponents]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {currentStep === 'analyzing' ? (
        <StepComponent onComplete={handleNext} />
      ) : (
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-6">
              <Badge variant="secondary" className="px-3 py-1">
                PowerPulse Quiz
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                Step {QUIZ_STEPS.findIndex(s => s.id === currentStep) + 1} of {QUIZ_STEPS.length}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">{currentStepData.title}</h1>
              <p className="text-lg text-muted-foreground">{currentStepData.description}</p>
            </div>
          </div>

          {/* Quiz Content */}
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8">
                  <StepComponent onValidationChange={handleValidationChange} />
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={!canGoBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canGoNext}
                className="flex items-center gap-2"
              >
                {currentStep === 'delivery' ? 'Analyze My Responses' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}