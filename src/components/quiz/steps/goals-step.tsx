'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GoalSchema, QUIZ_OPTIONS } from '@/lib/quiz'
import { useQuiz } from '@/hooks/use-quiz'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Plus, X, GripVertical } from 'lucide-react'
import type { z } from 'zod'

type GoalData = z.infer<typeof GoalSchema>

interface GoalsStepProps {
  onValidationChange: (isValid: boolean) => void
}

export function GoalsStep({ onValidationChange }: GoalsStepProps) {
  const { responses, updateResponse } = useQuiz()
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    responses.goals?.primaryGoals || []
  )
  const [selectedSpecificGoals, setSelectedSpecificGoals] = useState<string[]>(
    responses.goals?.specificGoals || []
  )
  const [showCustomGoal, setShowCustomGoal] = useState(false)
  const [customGoalTitle, setCustomGoalTitle] = useState('')
  const [customGoalDescription, setCustomGoalDescription] = useState('')

  const form = useForm<GoalData>({
    resolver: zodResolver(GoalSchema),
    defaultValues: responses.goals || {
      primaryGoals: [],
      specificGoals: [],
    },
  })

  useEffect(() => {
    const isValid = selectedGoals.length > 0 && selectedSpecificGoals.length > 0
    onValidationChange(isValid)
    
    if (isValid) {
      updateResponse('goals', {
        primaryGoals: selectedGoals,
        specificGoals: selectedSpecificGoals,
      })
    }
  }, [selectedGoals, selectedSpecificGoals, onValidationChange, updateResponse])

  const handleGoalToggle = (goalKey: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalKey)) {
        return prev.filter(g => g !== goalKey)
      } else {
        return [...prev, goalKey]
      }
    })
  }

  const handleSpecificGoalToggle = (goal: string) => {
    setSelectedSpecificGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    )
  }

  const handleAddCustomGoal = () => {
    if (customGoalTitle.trim()) {
      const customKey = `custom_${Date.now()}`
      setSelectedGoals(prev => [...prev, customKey])
      setCustomGoalTitle('')
      setCustomGoalDescription('')
      setShowCustomGoal(false)
    }
  }

  const moveGoal = (index: number, direction: 'up' | 'down') => {
    const newGoals = [...selectedGoals]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex >= 0 && newIndex < selectedGoals.length) {
      [newGoals[index], newGoals[newIndex]] = [newGoals[newIndex], newGoals[index]]
      setSelectedGoals(newGoals)
    }
  }

  // Get all possible specific goals from selected primary goals
  const availableSpecificGoals = selectedGoals
    .filter(goal => QUIZ_OPTIONS.goals[goal as keyof typeof QUIZ_OPTIONS.goals])
    .flatMap(goal => QUIZ_OPTIONS.goals[goal as keyof typeof QUIZ_OPTIONS.goals].specificGoals)
    .filter((goal, index, self) => self.indexOf(goal) === index) // Remove duplicates

  return (
    <div className="space-y-8">
      {/* Primary Goal Selection */}
      <div>
        <h2 className="text-xl font-semibold mb-2 text-center">
          What's your primary focus?
        </h2>
        <p className="text-muted-foreground text-center mb-6">
          Select all that apply. The order sets your priorities.
        </p>
        
        {/* Selected Goals with Priority Order */}
        {selectedGoals.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Your priorities (drag to reorder):</h3>
            <div className="space-y-2">
              {selectedGoals.map((goalKey, index) => {
                const goal = QUIZ_OPTIONS.goals[goalKey as keyof typeof QUIZ_OPTIONS.goals]
                const isCustom = goalKey.startsWith('custom_')
                return (
                  <div key={goalKey} className="flex items-center gap-2">
                    <Badge variant="secondary" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div className="flex-1 flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                      <span className="font-medium">
                        {isCustom ? customGoalTitle : goal?.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGoalToggle(goalKey)}
                        className="ml-auto"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveGoal(index, 'up')}
                        disabled={index === 0}
                        className="h-6 w-6 p-0"
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveGoal(index, 'down')}
                        disabled={index === selectedGoals.length - 1}
                        className="h-6 w-6 p-0"
                      >
                        ↓
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(QUIZ_OPTIONS.goals).map(([key, goal]) => (
            <Card
              key={key}
              className={cn(
                "p-6 cursor-pointer transition-all duration-200 hover:shadow-lg",
                selectedGoals.includes(key)
                  ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20 opacity-60" 
                  : "hover:shadow-md"
              )}
              onClick={() => handleGoalToggle(key)}
            >
              <div className="text-center">
                <div className="text-3xl mb-3">{goal.icon}</div>
                <h3 className="font-semibold mb-2">{goal.title}</h3>
                <p className="text-sm text-muted-foreground">{goal.description}</p>
                {selectedGoals.includes(key) && (
                  <Badge className="mt-2" variant="secondary">
                    Priority #{selectedGoals.indexOf(key) + 1}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
          
          {/* Add Custom Goal Card */}
          <Card
            className="p-6 cursor-pointer transition-all duration-200 hover:shadow-lg border-dashed"
            onClick={() => setShowCustomGoal(true)}
          >
            <div className="text-center">
              <div className="text-3xl mb-3">
                <Plus className="w-8 h-8 mx-auto" />
              </div>
              <h3 className="font-semibold mb-2">Add Custom Goal</h3>
              <p className="text-sm text-muted-foreground">Have something specific in mind?</p>
            </div>
          </Card>
        </div>
        
        {/* Custom Goal Input */}
        {showCustomGoal && (
          <div className="mt-4 p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Create your custom goal</h3>
            <div className="space-y-3">
              <Input
                placeholder="Goal title (e.g., 'Learn Spanish')"
                value={customGoalTitle}
                onChange={(e) => setCustomGoalTitle(e.target.value)}
              />
              <Textarea
                placeholder="Describe your goal (optional)"
                value={customGoalDescription}
                onChange={(e) => setCustomGoalDescription(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={handleAddCustomGoal} disabled={!customGoalTitle.trim()}>
                  Add Goal
                </Button>
                <Button variant="outline" onClick={() => setShowCustomGoal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Specific Goals Selection */}
      {selectedGoals.length > 0 && availableSpecificGoals.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">
            What specific outcomes do you want?
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            Select all that apply to your situation
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
            {availableSpecificGoals.map((goal) => (
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
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{goal}</span>
                  {selectedSpecificGoals.includes(goal) && (
                    <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedSpecificGoals.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Selected {selectedSpecificGoals.length} specific outcome{selectedSpecificGoals.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}