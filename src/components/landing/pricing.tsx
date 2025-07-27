'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Check, 
  Shield, 
  Zap, 
  Heart, 
  Sparkles,
  ArrowRight,
  Clock,
  RefreshCw,
  Users,
  Headphones
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: Zap,
    text: 'Daily 5-minute personalized audio coaching'
  },
  {
    icon: Heart,
    text: 'AI-powered content tailored to your goals'
  },
  {
    icon: Clock,
    text: 'Delivered at your preferred time'
  },
  {
    icon: RefreshCw,
    text: 'Adaptive coaching that evolves with you'
  },
  {
    icon: Users,
    text: 'Access to exclusive community'
  },
  {
    icon: Headphones,
    text: 'Download audios for offline listening'
  }
]

export function Pricing() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-secondary/5" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-brand-primary" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Simple Pricing
            </span>
            <Sparkles className="w-5 h-5 text-brand-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Start Your Transformation
            <span className="text-gradient"> Today</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            One simple price, unlimited potential. Join thousands who are already transforming their lives.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto"
        >
          <Card className="relative border-2 border-primary/20 shadow-2xl overflow-hidden">
            {/* Popular badge */}
            <div className="absolute top-0 right-0">
              <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-sm font-medium px-4 py-1 rounded-bl-lg">
                MOST POPULAR
              </div>
            </div>

            <CardHeader className="text-center pb-8 pt-12">
              <CardTitle className="text-3xl mb-2">PowerPulse Premium</CardTitle>
              <CardDescription className="text-lg">
                Your personalized daily coach
              </CardDescription>
              
              <div className="mt-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold">$14</span>
                  <span className="text-2xl text-muted-foreground">.99</span>
                  <span className="text-lg text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Billed monthly • Cancel anytime
                </p>
              </div>

              {/* Money back guarantee badge */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mt-6"
              >
                <Badge variant="success" className="px-6 py-3 text-base font-medium">
                  <Shield className="w-5 h-5 mr-2" />
                  30-Day Money-Back Guarantee
                </Badge>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-4 pb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-3">
                    <feature.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-base">{feature.text}</span>
                  </div>
                </motion.div>
              ))}
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pb-8">
              <Link href="/sign-up" className="w-full">
                <Button 
                  size="lg" 
                  variant="glow" 
                  className="w-full group text-lg py-6"
                >
                  Start Your Journey Risk-Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              
              <p className="text-xs text-center text-muted-foreground">
                No credit card required for signup • Instant access after payment
              </p>
            </CardFooter>

            {/* Decorative gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent" />
          </Card>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center space-y-4"
        >
          <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              <span>97% Keep Their Membership</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            "I was skeptical about another subscription, but the 30-day guarantee convinced me to try. 
            Now 90 days later, it's the best $15 I spend each month!" - David K.
          </p>
        </motion.div>

        {/* FAQ teaser */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground">
            Have questions? Check out our{' '}
            <Link href="#faq" className="text-primary hover:underline">
              frequently asked questions
            </Link>{' '}
            or{' '}
            <Link href="/contact" className="text-primary hover:underline">
              contact our support team
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  )
}