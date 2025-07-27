'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Timer, Home, Sparkles, CheckCircle2 } from 'lucide-react'
import useQuizStore from '@/lib/stores/quiz-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const workoutDurations = [
  { id: '15-30', label: '15-30 minutes', icon: '⚡' },
  { id: '30-45', label: '30-45 minutes', icon: '💪' },
  { id: '45-60', label: '45-60 minutes', icon: '🔥' },
  { id: '60+', label: '60+ minutes', icon: '🏆' }
]

const preferredTimes = [
  { id: 'early-morning', label: 'Early Morning', time: '5AM - 8AM', icon: '🌅' },
  { id: 'morning', label: 'Morning', time: '8AM - 12PM', icon: '☀️' },
  { id: 'afternoon', label: 'Afternoon', time: '12PM - 5PM', icon: '🌤️' },
  { id: 'evening', label: 'Evening', time: '5PM - 9PM', icon: '🌆' },
  { id: 'night', label: 'Night', time: '9PM - 12AM', icon: '🌙' },
  { id: 'flexible', label: 'Flexible', time: 'Varies daily', icon: '🔄' }
]

const equipmentOptions = [
  { id: 'none', label: 'No equipment', icon: '🤸' },
  { id: 'basic', label: 'Basic (dumbbells, bands)', icon: '🏋️' },
  { id: 'home-gym', label: 'Home gym setup', icon: '🏠' },
  { id: 'full-gym', label: 'Full gym access', icon: '🏢' }
]

const workoutTypes = [
  { id: 'strength', label: 'Strength Training', icon: '💪' },
  { id: 'cardio', label: 'Cardio', icon: '🏃' },
  { id: 'hiit', label: 'HIIT', icon: '⚡' },
  { id: 'yoga', label: 'Yoga', icon: '🧘' },
  { id: 'pilates', label: 'Pilates', icon: '🤸' },
  { id: 'crossfit', label: 'CrossFit', icon: '🏋️' },
  { id: 'bodyweight', label: 'Bodyweight', icon: '🤾' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'dancing', label: 'Dancing', icon: '💃' },
  { id: 'martial-arts', label: 'Martial Arts', icon: '🥋' }
]

export function QuizStepPreferences() {
  const router = useRouter()
  const { quizData, updatePreferences, previousStep } = useQuizStore()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleDurationSelect = (durationId: string) => {
    updatePreferences({ workoutDuration: durationId })
    setErrors({ ...errors, workoutDuration: '' })
  }

  const handleTimeSelect = (timeId: string) => {
    updatePreferences({ preferredTime: timeId })
    setErrors({ ...errors, preferredTime: '' })
  }

  const handleEquipmentToggle = (equipmentId: string) => {
    const currentEquipment = quizData.preferences.equipment || []
    const updated = currentEquipment.includes(equipmentId)
      ? currentEquipment.filter(e => e !== equipmentId)
      : [...currentEquipment, equipmentId]
    
    updatePreferences({ equipment: updated })
  }

  const handleWorkoutTypeToggle = (typeId: string) => {
    const currentTypes = quizData.preferences.workoutTypes || []
    const updated = currentTypes.includes(typeId)
      ? currentTypes.filter(t => t !== typeId)
      : [...currentTypes, typeId]
    
    updatePreferences({ workoutTypes: updated })
  }

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {}
    
    if (!quizData.preferences.workoutDuration) {
      newErrors.workoutDuration = 'Please select your preferred workout duration'
    }
    
    if (!quizData.preferences.preferredTime) {
      newErrors.preferredTime = 'Please select your preferred workout time'
    }
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true)
      // Here you would normally submit the quiz data to your backend
      // For now, we'll just redirect to a completion page
      setTimeout(() => {
        router.push('/quiz/complete')
      }, 1000)
    } else {
      setErrors(newErrors)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto p-6"
    >
      <div className="text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold mb-2"
        >
          Your Workout Preferences ⚙️
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          Let's customize your fitness plan to fit your lifestyle
        </motion.p>
      </div>

      <div className="space-y-8">
        {/* Workout Duration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Timer className="w-5 h-5 text-brand-primary" />
            <h3 className="text-lg font-semibold">How long can you workout?</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {workoutDurations.map((duration, index) => (
              <motion.button
                key={duration.id}
                onClick={() => handleDurationSelect(duration.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all duration-200',
                  'hover:shadow-md',
                  quizData.preferences.workoutDuration === duration.id
                    ? 'border-brand-primary bg-brand-primary/10'
                    : 'border-border bg-card hover:border-brand-primary/50'
                )}
              >
                <div className="text-center">
                  <span className="text-2xl mb-1 block">{duration.icon}</span>
                  <span className="text-sm font-medium">{duration.label}</span>
                </div>
              </motion.button>
            ))}
          </div>
          
          <AnimatePresence>
            {errors.workoutDuration && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-red-500"
              >
                {errors.workoutDuration}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Preferred Time */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-brand-primary" />
            <h3 className="text-lg font-semibold">When do you prefer to workout?</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {preferredTimes.map((time, index) => (
              <motion.button
                key={time.id}
                onClick={() => handleTimeSelect(time.id)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.03 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all duration-200',
                  'hover:shadow-md',
                  quizData.preferences.preferredTime === time.id
                    ? 'border-brand-primary bg-brand-primary/10'
                    : 'border-border bg-card hover:border-brand-primary/50'
                )}
              >
                <div className="text-center">
                  <span className="text-2xl mb-1 block">{time.icon}</span>
                  <p className="font-medium text-sm">{time.label}</p>
                  <p className="text-xs text-muted-foreground">{time.time}</p>
                </div>
              </motion.button>
            ))}
          </div>
          
          <AnimatePresence>
            {errors.preferredTime && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-red-500"
              >
                {errors.preferredTime}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Equipment Access */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-5 h-5 text-brand-secondary" />
            <h3 className="text-lg font-semibold">What equipment do you have access to?</h3>
            <span className="text-sm text-muted-foreground">(Select all that apply)</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {equipmentOptions.map((equipment, index) => (
              <motion.button
                key={equipment.id}
                onClick={() => handleEquipmentToggle(equipment.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all duration-200',
                  'hover:shadow-md flex items-center gap-3',
                  quizData.preferences.equipment?.includes(equipment.id)
                    ? 'border-brand-secondary bg-brand-secondary/10'
                    : 'border-border bg-card hover:border-brand-secondary/50'
                )}
              >
                <span className="text-2xl">{equipment.icon}</span>
                <span className="font-medium text-sm text-left">{equipment.label}</span>
                {quizData.preferences.equipment?.includes(equipment.id) && (
                  <CheckCircle2 className="w-5 h-5 text-brand-secondary ml-auto" />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Workout Types */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-brand-secondary" />
            <h3 className="text-lg font-semibold">What types of workouts do you enjoy?</h3>
            <span className="text-sm text-muted-foreground">(Select all that apply)</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {workoutTypes.map((type, index) => (
              <motion.button
                key={type.id}
                onClick={() => handleWorkoutTypeToggle(type.id)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.02 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all duration-200',
                  'hover:shadow-md',
                  quizData.preferences.workoutTypes?.includes(type.id)
                    ? 'border-brand-secondary bg-brand-secondary/10'
                    : 'border-border bg-card hover:border-brand-secondary/50'
                )}
              >
                <div className="text-center">
                  <span className="text-2xl mb-1 block">{type.icon}</span>
                  <span className="text-xs font-medium">{type.label}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4 pt-6"
        >
          <Button
            onClick={previousStep}
            size="lg"
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            size="lg"
            variant="glow"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                Creating Your Plan...
              </motion.div>
            ) : (
              'Complete Quiz'
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}