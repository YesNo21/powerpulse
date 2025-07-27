'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RippleGrid } from '@/components/ui/ripple-grid'
import { ArrowRight, Sparkles, Users, Zap } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Ripple Grid Background */}
      <div className="absolute inset-0 overflow-hidden">
        <RippleGrid />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Personal Coaching
            </Badge>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold leading-tight"
          >
            Your AI Personal Coach
            <br />
            <span className="text-gradient">in 5 Minutes Daily</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto"
          >
            Transform your life with personalized daily audio coaching. 
            AI-powered motivation tailored to your unique journey, 
            delivered exactly when you need it.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8"
          >
            <Link href="/sign-up">
              <Button size="lg" variant="glow" className="group">
                Start Your Journey - Risk Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline">
                See How It Works
              </Button>
            </Link>
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-8"
          >
            <Badge variant="success" className="px-6 py-3 text-base">
              ✓ 30-Day Money-Back Guarantee
            </Badge>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-12"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-primary" />
              <span className="text-lg font-semibold">2,847+ Active Members</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-accent" />
              <span className="text-lg font-semibold">97% Keep Their Membership</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute top-20 left-10 text-brand-primary opacity-20"
        >
          <Sparkles size={40} />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute bottom-20 right-10 text-brand-secondary opacity-20"
        >
          <Zap size={40} />
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-muted-foreground/50 rounded-full p-1"
        >
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full mx-auto" />
        </motion.div>
      </motion.div>
    </section>
  )
}