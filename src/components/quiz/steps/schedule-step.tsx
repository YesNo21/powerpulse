'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ScheduleSchema } from '@/lib/quiz'
import { useQuiz } from '@/hooks/use-quiz'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Clock } from 'lucide-react'
import type { z } from 'zod'

type ScheduleData = z.infer<typeof ScheduleSchema>

interface ScheduleStepProps {
  onValidationChange: (isValid: boolean) => void
}

const popularTimes = [
  { time: '06:00', label: 'Early Bird', description: 'Start your day with motivation' },
  { time: '07:00', label: 'Morning Boost', description: 'Perfect for commute or coffee' },
  { time: '08:00', label: 'Work Prep', description: 'Get energized before work' },
  { time: '12:00', label: 'Lunch Break', description: 'Midday motivation boost' },
  { time: '17:00', label: 'After Work', description: 'Transition from work to life' },
  { time: '20:00', label: 'Evening Wind-down', description: 'Reflect and prepare for tomorrow' },
]

export function ScheduleStep({ onValidationChange }: ScheduleStepProps) {
  const { responses, updateResponse } = useQuiz()
  const [preferredTime, setPreferredTime] = useState(responses.schedule?.preferredTime || '')
  const [timezone, setTimezone] = useState(
    responses.schedule?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  )
  const [customTime, setCustomTime] = useState('')

  const form = useForm<ScheduleData>({
    resolver: zodResolver(ScheduleSchema),
    defaultValues: responses.schedule || {
      preferredTime: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  })

  useEffect(() => {
    const timeToUse = preferredTime || customTime
    const isValid = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeToUse) && timezone
    onValidationChange(isValid)
    
    if (isValid) {
      updateResponse('schedule', {
        preferredTime: timeToUse,
        timezone,
      })
    }
  }, [preferredTime, customTime, timezone, onValidationChange, updateResponse])

  const handleTimeSelect = (time: string) => {
    setPreferredTime(time)
    setCustomTime('')
  }

  const handleCustomTimeChange = (time: string) => {
    setCustomTime(time)
    setPreferredTime('')
  }

  // Get common timezones
  const commonTimezones = [
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney',
  ]

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold mb-2">When do you want your daily boost?</h2>
        <p className="text-muted-foreground">
          Choose the perfect time for your 5-minute PowerPulse session.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          💡 You can change this anytime in your settings
        </p>
      </div>

      {/* Popular Times */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-center">Popular Times</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
          {popularTimes.map((timeOption) => (
            <Card
              key={timeOption.time}
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                preferredTime === timeOption.time 
                  ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20" 
                  : "hover:shadow-md"
              }`}
              onClick={() => handleTimeSelect(timeOption.time)}
            >
              <div className="text-center">
                <div className="text-lg font-bold mb-1">{timeOption.time}</div>
                <div className="text-sm font-medium mb-1">{timeOption.label}</div>
                <p className="text-xs text-muted-foreground">{timeOption.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Time */}
      <div className="max-w-md mx-auto">
        <Card className="p-6">
          <div className="space-y-4">
            <Label htmlFor="custom-time" className="text-base font-medium">
              Or choose your own time
            </Label>
            <Input
              id="custom-time"
              type="time"
              value={customTime}
              onChange={(e) => handleCustomTimeChange(e.target.value)}
              className="text-center text-lg"
            />
          </div>
        </Card>
      </div>

      {/* Timezone Selection */}
      <div className="max-w-md mx-auto">
        <Card className="p-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">Your Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue placeholder="Select your timezone" />
              </SelectTrigger>
              <SelectContent>
                {commonTimezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace('_', ' ')}
                  </SelectItem>
                ))}
                <SelectItem value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                  {Intl.DateTimeFormat().resolvedOptions().timeZone} (Auto-detected)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      {/* Preview */}
      {(preferredTime || customTime) && (
        <div className="max-w-md mx-auto">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
            <h3 className="font-semibold mb-3 text-center">Your Daily Schedule</h3>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                {preferredTime || customTime}
              </div>
              <p className="text-sm text-muted-foreground">
                You'll receive your personalized PowerPulse at this time daily in {timezone.replace('_', ' ')}.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}