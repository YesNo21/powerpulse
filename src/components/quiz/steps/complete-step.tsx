'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuiz } from '@/hooks/use-quiz'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Clock, Target, MessageCircle, Shield, Users, Star, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '@/lib/trpc/client'

interface CompleteStepProps {
  onValidationChange: (isValid: boolean) => void
}

export function CompleteStep({ onValidationChange }: CompleteStepProps) {
  const router = useRouter()
  const { responses, completeQuiz } = useQuiz()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const completeQuizMutation = api.profile.completeQuiz.useMutation({
    onSuccess: () => {
      setIsComplete(true)
      completeQuiz()
      setTimeout(() => {
        router.push('/quiz/payment')
      }, 2000)
    },
    onError: (error) => {
      console.error('Quiz completion error:', error)
      setIsSubmitting(false)
    }
  })

  useEffect(() => {
    onValidationChange(true)
  }, [onValidationChange])

  const handleCompleteQuiz = async () => {
    if (!responses.identity || !responses.goals || !responses.painPoints || 
        !responses.currentLevel || !responses.idealOutcome || !responses.learningStyle || 
        !responses.schedule || !responses.delivery) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await completeQuizMutation.mutateAsync({
        identity: responses.identity,
        goals: responses.goals,
        painPoints: responses.painPoints,
        currentLevel: responses.currentLevel,
        idealOutcome: responses.idealOutcome,
        learningStyle: responses.learningStyle,
        schedule: responses.schedule,
        delivery: responses.delivery,
      })
    } catch (error) {
      console.error('Failed to complete quiz:', error)
      setIsSubmitting(false)
    }
  }

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
          <span className="text-3xl">✨</span>
        </div>
        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
          Your Personal Plan is Ready!
        </h2>
        <p className="text-muted-foreground">
          Redirecting you to complete your PowerPulse setup...
        </p>
      </motion.div>
    )
  }

  const personalizedSummary = {
    goals: responses.goals?.primaryGoals || [],
    painPoints: responses.painPoints?.painPoints?.slice(0, 2),
    styles: responses.learningStyle?.styles || [],
    time: responses.schedule?.preferredTime,
    method: responses.delivery?.method,
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your Personal Plan is Ready!</h2>
        <p className="text-muted-foreground">
          We've analyzed your responses and created a custom coaching experience just for you.
        </p>
      </div>

      {/* Personalized Summary */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <h3 className="font-semibold mb-4 text-center">Your PowerPulse Experience</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">Primary Focus</p>
              <div className="text-sm text-muted-foreground">
                {personalizedSummary.goals.map((goal, index) => (
                  <Badge key={goal} variant="secondary" className="mr-1 mb-1">
                    #{index + 1} {goal.charAt(0).toUpperCase() + goal.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">Daily Session</p>
              <p className="text-sm text-muted-foreground">
                {personalizedSummary.time} via {personalizedSummary.method}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">Coaching Styles</p>
              <div className="text-sm text-muted-foreground capitalize">
                {personalizedSummary.styles.map((style) => 
                  style.charAt(0).toUpperCase() + style.slice(1)
                ).join(' + ')} approach
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">Key Focus Areas</p>
              <p className="text-sm text-muted-foreground">
                {personalizedSummary.painPoints?.join(', ')}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Social Proof */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 text-center">
          <Users className="w-6 h-6 mx-auto mb-2 text-purple-500" />
          <div className="text-xl font-bold">10,000+</div>
          <div className="text-xs text-muted-foreground">Active Users</div>
        </Card>
        <Card className="p-4 text-center">
          <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
          <div className="text-xl font-bold">4.9/5</div>
          <div className="text-xs text-muted-foreground">User Rating</div>
        </Card>
        <Card className="p-4 text-center">
          <Shield className="w-6 h-6 mx-auto mb-2 text-green-500" />
          <div className="text-xl font-bold">30-Day</div>
          <div className="text-xs text-muted-foreground">Guarantee</div>
        </Card>
        <Card className="p-4 text-center">
          <CheckCircle className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <div className="text-xl font-bold">92%</div>
          <div className="text-xs text-muted-foreground">Success Rate</div>
        </Card>
      </div>

      {/* What Happens Next */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 text-center">What Happens Next</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">1</Badge>
            <span className="text-sm">Complete your subscription setup ($14.99/month)</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">2</Badge>
            <span className="text-sm">Your first PersonalPowerPulse will be ready within 5 minutes</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">3</Badge>
            <span className="text-sm">Start your transformation journey with daily 5-minute sessions</span>
          </div>
        </div>
      </Card>

      {/* Testimonial */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
            M
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">Maria S.</h4>
              <Badge variant="secondary" className="text-xs">Verified User</Badge>
            </div>
            <p className="text-sm text-muted-foreground italic">
              "PowerPulse changed my life! I've lost 25 pounds and finally have the confidence to pursue my dreams. The daily sessions keep me motivated and on track."
            </p>
            <div className="flex gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Pricing & Guarantee */}
      <Card className="p-6 border-2 border-purple-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 text-xs font-medium">
          LIMITED TIME OFFER
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">
            <span className="line-through text-muted-foreground text-lg">$29.99</span>
            {' '}
            <span className="text-purple-600 dark:text-purple-400">$14.99</span>
            <span className="text-base font-normal text-muted-foreground">/month</span>
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            50% OFF for early adopters - Lock in this price forever!
          </p>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Cancel anytime, no questions asked</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Star className="w-4 h-4 text-green-500" />
              <span>Instant access to your first session</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Call to Action */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={handleCompleteQuiz}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8 py-6"
        >
          {isSubmitting ? 'Creating Your Plan...' : 'Start My Transformation - $14.99/month'}
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          🔒 Secure checkout powered by Stripe • 256-bit SSL encryption
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}