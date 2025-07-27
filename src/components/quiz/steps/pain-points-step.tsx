'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PainPointsSchema, QUIZ_OPTIONS } from '@/lib/quiz'
import { useQuiz } from '@/hooks/use-quiz'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { z } from 'zod'

type PainPointsData = z.infer<typeof PainPointsSchema>

interface PainPointsStepProps {
  onValidationChange: (isValid: boolean) => void
}

export function PainPointsStep({ onValidationChange }: PainPointsStepProps) {
  const { responses, updateResponse } = useQuiz()
  const [selectedPainPoints, setSelectedPainPoints] = useState<string[]>(
    responses.painPoints?.painPoints || []
  )

  const form = useForm<PainPointsData>({
    resolver: zodResolver(PainPointsSchema),
    defaultValues: responses.painPoints || {
      painPoints: [],
    },
  })

  useEffect(() => {
    const isValid = selectedPainPoints.length > 0
    onValidationChange(isValid)
    
    if (isValid) {
      updateResponse('painPoints', {
        painPoints: selectedPainPoints,
      })
    }
  }, [selectedPainPoints, onValidationChange, updateResponse])

  const handlePainPointToggle = (painPoint: string) => {
    setSelectedPainPoints(prev => 
      prev.includes(painPoint) 
        ? prev.filter(p => p !== painPoint)
        : [...prev, painPoint]
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🎯</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">What challenges you most?</h2>
        <p className="text-muted-foreground">
          Be honest - this helps us create content that addresses your specific struggles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
        {QUIZ_OPTIONS.painPoints.map((painPoint) => (
          <Card
            key={painPoint}
            className={cn(
              "p-4 cursor-pointer transition-all duration-200",
              selectedPainPoints.includes(painPoint)
                ? "ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20"
                : "hover:shadow-md"
            )}
            onClick={() => handlePainPointToggle(painPoint)}
          >
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={selectedPainPoints.includes(painPoint)}
                onChange={() => handlePainPointToggle(painPoint)}
              />
              <span className="text-sm font-medium">{painPoint}</span>
            </div>
          </Card>
        ))}
      </div>

      {selectedPainPoints.length > 0 && (
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Selected {selectedPainPoints.length} challenge{selectedPainPoints.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Don't worry - we'll help you overcome these together! 💪
          </p>
        </div>
      )}
    </div>
  )
}