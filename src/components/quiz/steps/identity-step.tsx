'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IdentitySchema } from '@/lib/quiz'
import { useQuiz } from '@/hooks/use-quiz'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { z } from 'zod'

type IdentityData = z.infer<typeof IdentitySchema>

interface IdentityStepProps {
  onValidationChange: (isValid: boolean) => void
}

export function IdentityStep({ onValidationChange }: IdentityStepProps) {
  const { responses, updateResponse } = useQuiz()

  const form = useForm<IdentityData>({
    resolver: zodResolver(IdentitySchema),
    defaultValues: responses.identity || {
      name: '',
      pronouns: '',
    },
  })

  const { watch, setValue } = form
  const watchedValues = watch()

  useEffect(() => {
    const isValid = form.formState.isValid && watchedValues.name.length > 0
    onValidationChange(isValid)
    
    if (isValid) {
      updateResponse('identity', watchedValues)
    }
  }, [watchedValues, form.formState.isValid, onValidationChange, updateResponse])

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">👋</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">Welcome to your transformation journey!</h2>
        <p className="text-muted-foreground">Let's start by getting to know you better.</p>
      </div>

      <div className="space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="name">What's your name? *</Label>
          <Input
            id="name"
            placeholder="Enter your first name"
            {...form.register('name')}
            className="text-lg"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pronouns">What are your preferred pronouns? (Optional)</Label>
          <Select
            value={watchedValues.pronouns}
            onValueChange={(value) => setValue('pronouns', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select pronouns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="he/him">He/Him</SelectItem>
              <SelectItem value="she/her">She/Her</SelectItem>
              <SelectItem value="they/them">They/Them</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            We'll use this information to personalize your daily coaching sessions.
          </p>
        </div>
      </div>
    </div>
  )
}