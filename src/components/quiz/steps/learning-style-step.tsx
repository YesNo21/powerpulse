'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LearningStyleSchema, QUIZ_OPTIONS } from '@/lib/quiz'
import { useQuiz } from '@/hooks/use-quiz'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { z } from 'zod'

type LearningStyleData = z.infer<typeof LearningStyleSchema>

interface LearningStyleStepProps {
  onValidationChange: (isValid: boolean) => void
}

const intensityLevels = [
  { value: 1, label: "Very Gentle", description: "Soft encouragement, lots of compassion" },
  { value: 2, label: "Gentle", description: "Supportive but with some challenges" },
  { value: 3, label: "Balanced", description: "Mix of support and direct guidance" },
  { value: 4, label: "Direct", description: "Clear expectations with firm guidance" },
  { value: 5, label: "Intense", description: "High expectations, push to excel" },
]

export function LearningStyleStep({ onValidationChange }: LearningStyleStepProps) {
  const { responses, updateResponse } = useQuiz()
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    responses.learningStyle?.styles || []
  )
  const [intensity, setIntensity] = useState(responses.learningStyle?.intensity || 3)

  const form = useForm<LearningStyleData>({
    resolver: zodResolver(LearningStyleSchema),
    defaultValues: responses.learningStyle || {
      styles: [],
      intensity: 3,
    },
  })

  useEffect(() => {
    const isValid = selectedStyles.length > 0 && intensity >= 1 && intensity <= 5
    onValidationChange(isValid)
    
    if (isValid) {
      updateResponse('learningStyle', {
        styles: selectedStyles,
        intensity,
      })
    }
  }, [selectedStyles, intensity, onValidationChange, updateResponse])

  const handleStyleToggle = (styleKey: string) => {
    setSelectedStyles(prev => {
      if (prev.includes(styleKey)) {
        return prev.filter(s => s !== styleKey)
      } else {
        return [...prev, styleKey]
      }
    })
  }

  const currentIntensity = intensityLevels.find(level => level.value === intensity)

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🎓</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">How do you prefer guidance?</h2>
        <p className="text-muted-foreground">
          Choose the coaching styles that motivate you most effectively.
        </p>
      </div>

      {/* Learning Style Selection */}
      <div>
        <h3 className="text-lg font-medium mb-2 text-center">Coaching Approaches</h3>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Select all that resonate with you. We'll mix these styles in your daily sessions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {Object.entries(QUIZ_OPTIONS.learningStyles).map(([key, style]) => (
            <Card
              key={key}
              className={cn(
                "p-6 cursor-pointer transition-all duration-200 hover:shadow-lg relative",
                selectedStyles.includes(key)
                  ? "ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" 
                  : "hover:shadow-md"
              )}
              onClick={() => handleStyleToggle(key)}
            >
              <div className="text-center">
                <div className="text-3xl mb-3">{style.icon}</div>
                <h4 className="font-semibold mb-2">{style.title}</h4>
                <p className="text-sm text-muted-foreground">{style.description}</p>
                {selectedStyles.includes(key) && (
                  <Badge className="absolute top-2 right-2" variant="secondary">
                    Selected
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
        {selectedStyles.length > 0 && (
          <p className="text-sm text-center mt-4 text-muted-foreground">
            Selected {selectedStyles.length} style{selectedStyles.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Intensity Selection */}
      {selectedStyles.length > 0 && (
        <div className="max-w-xl mx-auto">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">
                  How intense should your coaching be?
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Even within your preferred style, how much push do you want?
                </p>
              </div>

              <div className="space-y-4">
                <Slider
                  value={[intensity]}
                  onValueChange={(value) => setIntensity(value[0])}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl font-bold">{intensity}</span>
                    <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                      {currentIntensity?.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentIntensity?.description}
                  </p>
                </div>

                {/* Intensity markers */}
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>Gentle</span>
                  <span>Balanced</span>
                  <span>Intense</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Preview */}
      {selectedStyles.length > 0 && (
        <div className="max-w-xl mx-auto">
          <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
            <h3 className="font-semibold mb-3 text-center">Your Coaching Preview</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="italic">
                {selectedStyles.includes('direct') && intensity >= 4 && 
                  '"You said you wanted to change. Today\'s the day you prove it to yourself. Here\'s exactly what you need to do..."'
                }
                {selectedStyles.includes('gentle') && intensity <= 2 && 
                  '"Remember, you\'re doing amazing just by being here. Today, let\'s take one gentle step forward together..."'
                }
                {selectedStyles.includes('tough') && intensity >= 4 && 
                  '"Excuses got you where you are. Excellence will get you where you want to be. Time to step up..."'
                }
                {selectedStyles.includes('story') && 
                  '"Let me tell you about someone who faced the exact same challenge you\'re facing..."'
                }
                {(selectedStyles.length === 0 || (selectedStyles.includes('direct') && intensity < 4) || (selectedStyles.includes('gentle') && intensity > 2) || (selectedStyles.includes('tough') && intensity < 4)) &&
                  '"You\'ve made it this far because you have strength inside you. Let\'s build on that today..."'
                }
              </p>
              {selectedStyles.length > 1 && (
                <p className="text-xs text-center mt-3">
                  We'll vary between these {selectedStyles.length} styles to keep your sessions fresh and engaging.
                </p>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}