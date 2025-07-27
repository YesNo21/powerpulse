'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Brain, 
  Zap, 
  Target, 
  Clock, 
  Heart, 
  TrendingUp,
  Sparkles,
  Shield,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'

const benefits = [
  {
    icon: Brain,
    title: 'AI-Powered Personalization',
    description: 'Every audio is uniquely crafted based on your specific pain points, goals, and progress.',
    color: 'text-brand-primary',
    gradient: 'from-brand-primary/20 to-brand-primary/5'
  },
  {
    icon: Zap,
    title: 'Just 5 Minutes Daily',
    description: 'Transform your life without overwhelming your schedule. Quick, powerful, and effective.',
    color: 'text-brand-accent',
    gradient: 'from-brand-accent/20 to-brand-accent/5'
  },
  {
    icon: Target,
    title: 'Goal-Focused Coaching',
    description: 'Whether it\'s fitness, confidence, or career - get targeted advice that actually works.',
    color: 'text-brand-secondary',
    gradient: 'from-brand-secondary/20 to-brand-secondary/5'
  },
  {
    icon: Clock,
    title: 'Perfect Timing',
    description: 'Delivered exactly when you need it. Morning motivation or evening reflection - you choose.',
    color: 'text-purple-500',
    gradient: 'from-purple-500/20 to-purple-500/5'
  },
  {
    icon: Heart,
    title: 'Emotional Intelligence',
    description: 'Adapts to your mood and energy levels. Gentle when you need support, tough when you need a push.',
    color: 'text-rose-500',
    gradient: 'from-rose-500/20 to-rose-500/5'
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Visual journey maps and achievement systems that celebrate every milestone.',
    color: 'text-emerald-500',
    gradient: 'from-emerald-500/20 to-emerald-500/5'
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
}

export function BenefitsGrid() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-brand-primary" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Why PowerPulse Works
            </span>
            <Sparkles className="w-5 h-5 text-brand-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Transform Your Life with
            <span className="text-gradient"> Intelligent Coaching</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the perfect blend of AI technology and human psychology, 
            designed to unlock your full potential in just 5 minutes a day.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Card className="h-full border-2 border-transparent hover:border-primary/20 transition-all duration-300 overflow-hidden">
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  benefit.gradient
                )} />
                <CardHeader className="relative">
                  <div className="mb-4">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                      "bg-gradient-to-br",
                      benefit.gradient
                    )}>
                      <benefit.icon className={cn("w-6 h-6", benefit.color)} />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    {benefit.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-base">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
            <Shield className="w-5 h-5 text-brand-primary" />
            <span className="text-sm font-medium">
              30-Day Money-Back Guarantee • Cancel Anytime • No Hidden Fees
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}