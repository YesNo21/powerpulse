'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useQuiz } from '@/hooks/use-quiz'
import { 
  Brain, 
  Sparkles, 
  Zap, 
  Target, 
  Clock, 
  Shield,
  Star,
  Users,
  CheckCircle,
  TrendingUp,
  Award,
  HeartHandshake
} from 'lucide-react'

interface AnalyzingStepProps {
  onComplete: () => void
}

const ANALYSIS_STEPS = [
  {
    id: 'analyzing',
    title: 'Analyzing your responses',
    description: 'Understanding your unique situation...',
    icon: Brain,
    duration: 3000
  },
  {
    id: 'matching',
    title: 'Matching coaching styles',
    description: 'Finding the perfect approach for you...',
    icon: HeartHandshake,
    duration: 3500
  },
  {
    id: 'personalizing',
    title: 'Personalizing your journey',
    description: 'Creating your custom transformation path...',
    icon: Target,
    duration: 4000
  },
  {
    id: 'optimizing',
    title: 'Optimizing delivery schedule',
    description: 'Aligning with your daily routine...',
    icon: Clock,
    duration: 3000
  },
  {
    id: 'generating',
    title: 'Generating your first session',
    description: 'Preparing your personalized content...',
    icon: Sparkles,
    duration: 4500
  },
  {
    id: 'finalizing',
    title: 'Finalizing your PowerPulse plan',
    description: 'Everything is coming together...',
    icon: Zap,
    duration: 3000
  }
]

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    role: "Marketing Manager",
    content: "I was skeptical at first, but PowerPulse changed my life. Lost 30 lbs and found my confidence!",
    rating: 5,
    days: 90
  },
  {
    name: "David L.",
    role: "Software Engineer",
    content: "The daily sessions keep me motivated. Finally broke through my career plateau!",
    rating: 5,
    days: 45
  },
  {
    name: "Jennifer K.",
    role: "Business Owner",
    content: "Best investment I've made in myself. My anxiety is gone and I'm crushing my goals!",
    rating: 5,
    days: 120
  }
]

const TRUST_BADGES = [
  { icon: Shield, text: "30-Day Money Back", subtext: "Risk-free guarantee" },
  { icon: Users, text: "10,000+ Users", subtext: "Transforming daily" },
  { icon: Star, text: "4.9/5 Rating", subtext: "From verified users" },
  { icon: Award, text: "Science-Backed", subtext: "Proven methodology" }
]

export function AnalyzingStep({ onComplete }: AnalyzingStepProps) {
  const { responses } = useQuiz()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showTestimonial, setShowTestimonial] = useState(0)

  useEffect(() => {
    const totalDuration = ANALYSIS_STEPS.reduce((acc, step) => acc + step.duration, 0)
    const stepStartTimes = ANALYSIS_STEPS.reduce((acc, step, index) => {
      const previousTotal = ANALYSIS_STEPS.slice(0, index).reduce((sum, s) => sum + s.duration, 0)
      acc[index] = previousTotal
      return acc
    }, {} as Record<number, number>)

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 500)
          return 100
        }
        return prev + (100 / (totalDuration / 100))
      })
    }, 100)

    // Update current step based on progress
    const progressInterval = setInterval(() => {
      const currentTime = (progress / 100) * totalDuration
      const newStep = ANALYSIS_STEPS.findIndex((step, index) => {
        const nextStepTime = stepStartTimes[index + 1] || totalDuration
        return currentTime >= stepStartTimes[index] && currentTime < nextStepTime
      })
      if (newStep !== -1 && newStep !== currentStep) {
        setCurrentStep(newStep)
      }
    }, 50)

    // Rotate testimonials
    const testimonialInterval = setInterval(() => {
      setShowTestimonial(prev => (prev + 1) % TESTIMONIALS.length)
    }, 4000)

    return () => {
      clearInterval(interval)
      clearInterval(progressInterval)
      clearInterval(testimonialInterval)
    }
  }, [progress, currentStep, onComplete])

  const currentStepData = ANALYSIS_STEPS[currentStep]
  const Icon = currentStepData?.icon || Brain

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated background particles */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              transition: {
                duration: Math.random() * 20 + 20,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        {/* Main analyzing card */}
        <Card className="p-8 md:p-12 bg-white/10 backdrop-blur-lg border-white/20">
          <div className="text-center mb-8">
            <motion.div
              key={currentStep}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 mx-auto mb-6 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full animate-pulse" />
              <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
                <Icon className="w-10 h-10 text-white" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, transparent, rgba(168, 85, 247, 0.5), transparent)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {currentStepData?.title}
                </h2>
                <p className="text-white/80 text-lg">
                  {currentStepData?.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-center text-white/60 text-sm mt-2">
              Creating your personalized experience... {Math.round(progress)}%
            </p>
          </div>

          {/* Analysis insights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Goals Analyzed", value: responses.goals?.primaryGoals?.length || 0 },
              { label: "Pain Points", value: responses.painPoints?.painPoints?.length || 0 },
              { label: "Custom Factors", value: "12+" },
              { label: "AI Models", value: "3" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {TRUST_BADGES.map((badge, index) => (
              <motion.div
                key={badge.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <badge.icon className="w-8 h-8 text-purple-400 mb-2" />
                <div className="text-sm font-semibold text-white">{badge.text}</div>
                <div className="text-xs text-white/60">{badge.subtext}</div>
              </motion.div>
            ))}
          </div>

          {/* Rotating testimonial */}
          <AnimatePresence mode="wait">
            <motion.div
              key={showTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 rounded-lg p-6 backdrop-blur"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {TESTIMONIALS[showTestimonial].name[0]}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-white">
                      {TESTIMONIALS[showTestimonial].name}
                    </h4>
                    <span className="text-white/60 text-sm">
                      {TESTIMONIALS[showTestimonial].role}
                    </span>
                    <Badge variant="secondary" className="ml-auto">
                      Day {TESTIMONIALS[showTestimonial].days}
                    </Badge>
                  </div>
                  <p className="text-white/80 italic">
                    "{TESTIMONIALS[showTestimonial].content}"
                  </p>
                  <div className="flex gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom benefits */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            {[
              "✓ Cancel anytime",
              "✓ 30-day guarantee",
              "✓ Instant access",
              "✓ Daily coaching"
            ].map((benefit, index) => (
              <motion.span
                key={benefit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="text-white/80"
              >
                {benefit}
              </motion.span>
            ))}
          </div>
        </Card>

        {/* Success rate banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-full">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">
              92% of users report positive changes within 14 days
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}