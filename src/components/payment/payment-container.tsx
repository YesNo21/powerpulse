'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useQuiz } from '@/hooks/use-quiz'
import { useSubscription } from '@/hooks/use-subscription'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Check, Shield, Clock, ArrowRight, Sparkles } from 'lucide-react'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe/subscription-service'

export function PaymentContainer() {
  const router = useRouter()
  const { isLoaded, userId } = useAuth()
  const { responses } = useQuiz()
  const { createCheckoutSession, isActive } = useSubscription()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Get the PowerPulse plan
  const plan = SUBSCRIPTION_PLANS[0]

  useEffect(() => {
    // Redirect if already subscribed
    if (isActive) {
      router.push('/dashboard')
    }
  }, [isActive, router])

  useEffect(() => {
    // Redirect if quiz not completed
    if (!responses.identity || !responses.delivery) {
      router.push('/quiz')
    }
  }, [responses, router])

  if (!isLoaded || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading payment options...</p>
        </div>
      </div>
    )
  }

  const handleStartSubscription = async () => {
    try {
      setIsLoading(true)
      setError('')
      await createCheckoutSession(plan.priceId)
    } catch (err) {
      setError('Failed to start payment process. Please try again.')
      setIsLoading(false)
    }
  }

  const personalData = {
    name: responses.identity?.name || 'Friend',
    goal: responses.goals?.primaryGoal || 'transformation',
    time: responses.schedule?.preferredTime || '7:00 AM',
    method: responses.delivery?.method || 'email',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge variant="secondary" className="mb-4">
            Final Step
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {personalData.name}, Your PowerPulse Journey Awaits
          </h1>
          <p className="text-lg text-muted-foreground">
            Start your transformation with personalized daily coaching
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Plan Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">PowerPulse Daily Coaching</h2>
                <Badge variant="success">Popular</Badge>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$14.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Cancel anytime • 30-day guarantee
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t pt-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium">Secure payment via Stripe</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">First audio ready in 5 minutes</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Personalized Summary & CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Personal Summary */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-teal-50 dark:from-purple-900/20 dark:to-teal-900/20">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Your Personalized Plan
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Daily delivery:</span>
                  <p className="font-medium">{personalData.time} via {personalData.method}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Focus area:</span>
                  <p className="font-medium capitalize">
                    {personalData.goal.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">What happens next:</span>
                  <p className="font-medium">
                    Your first personalized audio will be ready within 5 minutes of signup
                  </p>
                </div>
              </div>
            </Card>

            {/* Guarantee */}
            <Card className="p-6 border-green-200 bg-green-50 dark:bg-green-900/20">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                30-Day Money-Back Guarantee
              </h3>
              <p className="text-sm text-green-700 dark:text-green-400">
                Try PowerPulse risk-free. If you're not completely satisfied within 
                your first 30 days, we'll refund your payment—no questions asked.
              </p>
            </Card>

            {/* CTA */}
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600"
                onClick={handleStartSubscription}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Start Your Journey
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <p className="text-xs text-center text-muted-foreground">
                By subscribing, you agree to our terms of service and privacy policy.
                You can cancel or pause your subscription at any time.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>2,847+ Happy Members</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}