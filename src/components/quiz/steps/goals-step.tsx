'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GoalSchema, QUIZ_OPTIONS } from '@/lib/quiz'
import { useQuiz } from '@/hooks/use-quiz'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { z } from 'zod'

type GoalData = z.infer<typeof GoalSchema>

interface GoalsStepProps {
  onValidationChange: (isValid: boolean) => void
}

export function GoalsStep({ onValidationChange }: GoalsStepProps) {
  const { responses, updateResponse } = useQuiz()
  const [selectedGoal, setSelectedGoal] = useState<string>(responses.goals?.primaryGoal || '')
  const [selectedSpecificGoals, setSelectedSpecificGoals] = useState<string[]>(
    responses.goals?.specificGoals || []
  )

  const form = useForm<GoalData>({
    resolver: zodResolver(GoalSchema),
    defaultValues: responses.goals || {
      primaryGoal: 'fitness',
      specificGoals: [],
    },
  })

  useEffect(() => {
    const isValid = selectedGoal && selectedSpecificGoals.length > 0
    onValidationChange(isValid)
    
    if (isValid) {
      updateResponse('goals', {
        primaryGoal: selectedGoal as any,
        specificGoals: selectedSpecificGoals,
      })
    }
  }, [selectedGoal, selectedSpecificGoals, onValidationChange, updateResponse])

  const handleGoalSelect = (goalKey: string) => {
    setSelectedGoal(goalKey)
    setSelectedSpecificGoals([]) // Reset specific goals when primary goal changes
  }

  const handleSpecificGoalToggle = (goal: string) => {
    setSelectedSpecificGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    )
  }

  const currentGoalOptions = selectedGoal ? QUIZ_OPTIONS.goals[selectedGoal as keyof typeof QUIZ_OPTIONS.goals] : null

  return (
    <div className="space-y-8">
      {/* Primary Goal Selection */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-center">
          Choose your primary area of focus
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(QUIZ_OPTIONS.goals).map(([key, goal]) => (
            <Card
              key={key}
              className={cn(
                "p-6 cursor-pointer transition-all duration-200 hover:shadow-lg",
                selectedGoal === key 
                  ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                  : "hover:shadow-md"
              )}
              onClick={() => handleGoalSelect(key)}
            >
              <div className="text-center">
                <div className="text-3xl mb-3">{goal.icon}</div>
                <h3 className="font-semibold mb-2">{goal.title}</h3>
                <p className="text-sm text-muted-foreground">{goal.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Specific Goals Selection */}
      {currentGoalOptions && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">
            What specific outcomes do you want?
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            Select all that apply to your situation
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
            {currentGoalOptions.specificGoals.map((goal) => (
              <Card
                key={goal}
                className={cn(
                  "p-4 cursor-pointer transition-all duration-200",
                  selectedSpecificGoals.includes(goal)
                    ? "ring-2 ring-teal-500 bg-teal-50 dark:bg-teal-900/20"
                    : "hover:shadow-md"
                )}
                onClick={() => handleSpecificGoalToggle(goal)}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedSpecificGoals.includes(goal)}
                    onChange={() => handleSpecificGoalToggle(goal)}
                  />
                  <span className="text-sm font-medium">{goal}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedSpecificGoals.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Selected {selectedSpecificGoals.length} goal{selectedSpecificGoals.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}