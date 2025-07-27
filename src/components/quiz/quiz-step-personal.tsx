'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Calendar, Users } from 'lucide-react'
import useQuizStore from '@/lib/stores/quiz-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const genderOptions = [
  { value: 'male', label: 'Male', icon: '👨' },
  { value: 'female', label: 'Female', icon: '👩' },
  { value: 'non-binary', label: 'Non-binary', icon: '🧑' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say', icon: '🤐' }
]

export function QuizStepPersonal() {
  const { quizData, updatePersonalInfo, nextStep, canProceed } = useQuizStore()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInputChange = (field: string, value: string) => {
    updatePersonalInfo({ [field]: value })
    setTouched({ ...touched, [field]: true })
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    
    if (!quizData.personalInfo.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!quizData.personalInfo.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(quizData.personalInfo.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!quizData.personalInfo.age) {
      newErrors.age = 'Age is required'
    } else if (parseInt(quizData.personalInfo.age) < 13 || parseInt(quizData.personalInfo.age) > 120) {
      newErrors.age = 'Please enter a valid age'
    }
    
    if (!quizData.personalInfo.gender) {
      newErrors.gender = 'Please select your gender'
    }
    
    if (Object.keys(newErrors).length === 0) {
      nextStep()
    } else {
      setErrors(newErrors)
      setTouched({
        name: true,
        email: true,
        age: true,
        gender: true
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto p-6"
    >
      <div className="text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold mb-2"
        >
          Let's Get to Know You! 👋
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          Tell us a bit about yourself so we can personalize your fitness journey
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        {/* Name Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4" />
            What's your name?
          </label>
          <motion.div whileTap={{ scale: 0.995 }}>
            <input
              type="text"
              value={quizData.personalInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your name"
              className={cn(
                'w-full px-4 py-3 rounded-lg border bg-background transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent',
                errors.name && touched.name && 'border-red-500 focus:ring-red-500'
              )}
            />
          </motion.div>
          <AnimatePresence>
            {errors.name && touched.name && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-red-500"
              >
                {errors.name}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email address
          </label>
          <motion.div whileTap={{ scale: 0.995 }}>
            <input
              type="email"
              value={quizData.personalInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your@email.com"
              className={cn(
                'w-full px-4 py-3 rounded-lg border bg-background transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent',
                errors.email && touched.email && 'border-red-500 focus:ring-red-500'
              )}
            />
          </motion.div>
          <AnimatePresence>
            {errors.email && touched.email && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-red-500"
              >
                {errors.email}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Age Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            How old are you?
          </label>
          <motion.div whileTap={{ scale: 0.995 }}>
            <input
              type="number"
              value={quizData.personalInfo.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              placeholder="Enter your age"
              min="13"
              max="120"
              className={cn(
                'w-full px-4 py-3 rounded-lg border bg-background transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent',
                errors.age && touched.age && 'border-red-500 focus:ring-red-500'
              )}
            />
          </motion.div>
          <AnimatePresence>
            {errors.age && touched.age && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-red-500"
              >
                {errors.age}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Gender Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Gender
          </label>
          <div className="grid grid-cols-2 gap-3">
            {genderOptions.map((option, index) => (
              <motion.button
                key={option.value}
                onClick={() => handleInputChange('gender', option.value)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all duration-200',
                  'hover:shadow-md hover:border-brand-primary/50',
                  quizData.personalInfo.gender === option.value
                    ? 'border-brand-primary bg-brand-primary/10 shadow-md'
                    : 'border-border bg-background'
                )}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </div>
              </motion.button>
            ))}
          </div>
          <AnimatePresence>
            {errors.gender && touched.gender && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-red-500"
              >
                {errors.gender}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-6"
        >
          <Button
            onClick={handleSubmit}
            size="lg"
            variant="glow"
            className="w-full"
          >
            Continue to Fitness Goals
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}