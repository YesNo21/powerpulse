'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Users, TrendingUp, Star, Award } from 'lucide-react'

interface CounterProps {
  from: number
  to: number
  duration?: number
  suffix?: string
  prefix?: string
}

function AnimatedCounter({ from, to, duration = 2, suffix = '', prefix = '' }: CounterProps) {
  const count = useMotionValue(from)
  const rounded = useTransform(count, Math.round)
  const [displayValue, setDisplayValue] = useState(from)

  useEffect(() => {
    const animation = animate(count, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest))
      }
    })

    return animation.stop
  }, [count, to, duration])

  return (
    <span>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  )
}

const stats = [
  {
    icon: Users,
    value: 2847,
    suffix: '+',
    label: 'Active Members',
    color: 'text-brand-primary',
    description: 'Growing daily'
  },
  {
    icon: TrendingUp,
    value: 97,
    suffix: '%',
    label: 'Keep Their Membership',
    color: 'text-brand-secondary',
    description: 'Love the results'
  },
  {
    icon: Star,
    value: 4.9,
    suffix: '/5',
    label: 'Average Rating',
    color: 'text-brand-accent',
    description: '1,000+ reviews',
    decimals: true
  },
  {
    icon: Award,
    value: 92,
    suffix: '%',
    label: 'Achieve Their Goals',
    color: 'text-emerald-500',
    description: 'Within 90 days'
  }
]

export function SocialProof() {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-background/50">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onViewportEnter={() => setIsVisible(true)}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Join Thousands of
            <span className="text-gradient"> Success Stories</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real people, real transformations. Our members are achieving 
            incredible results with just 5 minutes a day.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-4"
              >
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </motion.div>
              
              <div className="text-4xl font-bold mb-2">
                {isVisible && (
                  stat.decimals ? (
                    <span>4.9/5</span>
                  ) : (
                    <AnimatedCounter 
                      from={0} 
                      to={stat.value} 
                      suffix={stat.suffix}
                      duration={2.5}
                    />
                  )
                )}
              </div>
              
              <div className="text-lg font-semibold mb-1">
                {stat.label}
              </div>
              
              <div className="text-sm text-muted-foreground">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background"
                  style={{
                    backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 1})`,
                    backgroundSize: 'cover'
                  }}
                />
              ))}
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-muted-foreground">
                Join 2,847+ members who are transforming their lives
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ⭐⭐⭐⭐⭐ Rated 4.9/5 from 1,000+ reviews
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}