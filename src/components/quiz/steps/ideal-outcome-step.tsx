'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IdealOutcomeSchema } from '@/lib/quiz'
import { useQuiz } from '@/hooks/use-quiz'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import type { z } from 'zod'

type IdealOutcomeData = z.infer<typeof IdealOutcomeSchema>

interface IdealOutcomeStepProps {
  onValidationChange: (isValid: boolean) => void
}

const inspirationPrompts = [
  "Imagine waking up 6 months from now, completely transformed...",
  "Picture yourself having overcome your biggest challenges...",
  "Visualize the person you'll become after this journey...",
  "Think about how your life will look when you've achieved your goals...",
]

export function IdealOutcomeStep({ onValidationChange }: IdealOutcomeStepProps) {
  const { responses, updateResponse } = useQuiz()
  const [dreamTransformation, setDreamTransformation] = useState(
    responses.idealOutcome?.dreamTransformation || ''
  )
  const [currentPrompt] = useState(
    inspirationPrompts[Math.floor(Math.random() * inspirationPrompts.length)]
  )

  const form = useForm<IdealOutcomeData>({
    resolver: zodResolver(IdealOutcomeSchema),
    defaultValues: responses.idealOutcome || {
      dreamTransformation: '',
    },
  })

  useEffect(() => {
    const isValid = dreamTransformation.length >= 20
    onValidationChange(isValid)
    
    if (isValid) {
      updateResponse('idealOutcome', {
        dreamTransformation,
      })
    }
  }, [dreamTransformation, onValidationChange, updateResponse])

  const exampleResponses = [
    "I wake up every morning with energy and excitement. I've lost 30 pounds, feel confident in my body, and my friends ask me for fitness advice. I never miss workouts because I genuinely enjoy them, and I sleep deeply every night.",
    "I speak up confidently in meetings, take on leadership roles without second-guessing myself, and have started the side business I always dreamed about. My anxiety is manageable, and I trust my decisions.",
    "I have a loving relationship built on trust and communication. I've learned to set boundaries, express my needs clearly, and I attract people who value and respect me. My social circle is supportive and genuine.",
  ]

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✨</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">Paint your dream picture</h2>
        <p className="text-muted-foreground">
          The more vivid and specific you are, the better we can guide you there.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="dream" className="text-base font-medium">
                Describe your ideal transformation in 6 months *
              </Label>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-2 italic">
                {currentPrompt}
              </p>
            </div>

            <Textarea
              id="dream"
              placeholder="Be specific and paint a vivid picture of your transformed life..."
              value={dreamTransformation}
              onChange={(e) => setDreamTransformation(e.target.value)}
              className="min-h-[150px] resize-none text-base"
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Minimum 20 characters</span>
              <span>{dreamTransformation.length}/1000</span>
            </div>

            {dreamTransformation.length < 20 && dreamTransformation.length > 0 && (
              <p className="text-sm text-red-500">
                Please provide more detail - paint a vivid picture! (at least 20 characters)
              </p>
            )}
          </div>
        </Card>

        {/* Example responses for inspiration */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">
            Need inspiration? Here are some examples:
          </h3>
          <div className="space-y-4">
            {exampleResponses.map((example, index) => (
              <Card 
                key={index} 
                className="p-4 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => setDreamTransformation(example)}
              >
                <p className="text-sm italic">&quot;{example}&quot;</p>
                <p className="text-xs text-muted-foreground mt-2">Click to use as starting point</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}