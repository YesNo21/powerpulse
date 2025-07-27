'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CurrentLevelSchema } from '@/lib/quiz'
import { useQuiz } from '@/hooks/use-quiz'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { z } from 'zod'

type CurrentLevelData = z.infer<typeof CurrentLevelSchema>

interface CurrentLevelStepProps {
  onValidationChange: (isValid: boolean) => void
}

const levelDescriptions = {
  1: { label: "Just starting out", description: "I'm completely new to this area", color: "text-red-500" },
  2: { label: "Beginner", description: "I've tried a few things but struggle", color: "text-red-400" },
  3: { label: "Early progress", description: "I have some experience but inconsistent", color: "text-orange-500" },
  4: { label: "Developing", description: "I've made some progress but hit roadblocks", color: "text-orange-400" },
  5: { label: "Intermediate", description: "I'm making steady but slow progress", color: "text-yellow-500" },
  6: { label: "Good progress", description: "I've seen improvements but want more", color: "text-yellow-400" },
  7: { label: "Advanced", description: "I'm doing well but need fine-tuning", color: "text-green-400" },
  8: { label: "Very good", description: "I'm successful but want optimization", color: "text-green-500" },
  9: { label: "Near mastery", description: "I'm very successful, seeking perfection", color: "text-blue-500" },
  10: { label: "Expert level", description: "I'm excellent but want to maintain/grow", color: "text-purple-500" },
}

export function CurrentLevelStep({ onValidationChange }: CurrentLevelStepProps) {
  const { responses, updateResponse } = useQuiz()
  const [level, setLevel] = useState(responses.currentLevel?.level || 5)
  const [frustration, setFrustration] = useState(responses.currentLevel?.biggestFrustration || '')

  const form = useForm<CurrentLevelData>({
    resolver: zodResolver(CurrentLevelSchema),
    defaultValues: responses.currentLevel || {
      level: 5,
      biggestFrustration: '',
    },
  })

  useEffect(() => {
    const isValid = level >= 1 && level <= 10 && frustration.length >= 10
    onValidationChange(isValid)
    
    if (isValid) {
      updateResponse('currentLevel', {
        level,
        biggestFrustration: frustration,
      })
    }
  }, [level, frustration, onValidationChange, updateResponse])

  const currentLevelInfo = levelDescriptions[level as keyof typeof levelDescriptions]

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">Where are you today?</h2>
        <p className="text-muted-foreground">
          Help us understand your current situation so we can meet you where you are.
        </p>
      </div>

      {/* Level Slider */}
      <div className="max-w-xl mx-auto">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">
                Current level in your primary goal area (1-10)
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Be honest - this helps us create the right content for you
              </p>
            </div>

            <div className="space-y-4">
              <Slider
                value={[level]}
                onValueChange={(value) => setLevel(value[0])}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold">{level}</span>
                  <span className={cn("text-lg font-semibold", currentLevelInfo.color)}>
                    {currentLevelInfo.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentLevelInfo.description}
                </p>
              </div>

              {/* Level markers */}
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Advanced</span>
                <span>Expert</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Frustration textarea */}
      <div className="max-w-xl mx-auto">
        <Card className="p-6">
          <div className="space-y-4">
            <Label htmlFor="frustration" className="text-base font-medium">
              What's your biggest frustration right now? *
            </Label>
            <Textarea
              id="frustration"
              placeholder="e.g., I start strong but always give up after a few weeks..."
              value={frustration}
              onChange={(e) => setFrustration(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Minimum 10 characters</span>
              <span>{frustration.length}/500</span>
            </div>
            {frustration.length < 10 && frustration.length > 0 && (
              <p className="text-sm text-red-500">Please provide more detail (at least 10 characters)</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}