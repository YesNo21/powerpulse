'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const testimonials = [
  {
    id: 1,
    name: 'Sarah Martinez',
    role: 'Fitness Enthusiast',
    avatar: 'https://i.pravatar.cc/150?img=1',
    content: 'I finally broke my on-off cycle! PowerPulse understood my consistency struggles and gave me exactly what I needed. 67 days strong and feeling amazing!',
    rating: 5,
    achievement: '67-day streak',
    stage: 'Momentum'
  },
  {
    id: 2,
    name: 'Marcus Chen',
    role: 'Entrepreneur',
    avatar: 'https://i.pravatar.cc/150?img=2',
    content: 'The AI personalization is mind-blowing. It\'s like having a coach who knows exactly when to push and when to support. Worth every penny!',
    rating: 5,
    achievement: '40% productivity increase',
    stage: 'Transformation'
  },
  {
    id: 3,
    name: 'Emma Thompson',
    role: 'Working Mom',
    avatar: 'https://i.pravatar.cc/150?img=3',
    content: 'Just 5 minutes a day? I was skeptical. But it actually works! The audio fits perfectly into my morning routine. Life-changing!',
    rating: 5,
    achievement: 'Stress reduced by 60%',
    stage: 'Mastery'
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'Software Engineer',
    avatar: 'https://i.pravatar.cc/150?img=4',
    content: 'As a skeptic, I appreciated the scientific approach. The progress tracking and data-driven insights won me over. My team is now using it too!',
    rating: 5,
    achievement: 'Team subscription',
    stage: 'Advocate'
  },
  {
    id: 5,
    name: 'Lisa Johnson',
    role: 'Yoga Instructor',
    avatar: 'https://i.pravatar.cc/150?img=5',
    content: 'PowerPulse adapts to my energy levels. On tough days, it\'s gentle. When I\'m ready, it pushes. It\'s like it reads my mind!',
    rating: 5,
    achievement: '90+ days active',
    stage: 'Mastery'
  }
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(nextTestimonial, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, currentIndex])

  return (
    <section className="py-24 px-4 overflow-hidden">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Quote className="w-5 h-5 text-brand-primary" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Real Success Stories
            </span>
            <Quote className="w-5 h-5 text-brand-primary scale-x-[-1]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Hear From Our
            <span className="text-gradient"> PowerPulse Members</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands who have transformed their lives with personalized daily coaching
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <Card className="border-2 border-primary/10 bg-gradient-to-br from-background to-background/50">
                <CardContent className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary/20">
                          <img
                            src={testimonials[currentIndex].avatar}
                            alt={testimonials[currentIndex].name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs px-3 py-1 rounded-full">
                          {testimonials[currentIndex].stage}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-1 mb-4">
                        {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-brand-accent text-brand-accent" />
                        ))}
                      </div>

                      <blockquote className="text-lg md:text-xl leading-relaxed mb-6">
                        "{testimonials[currentIndex].content}"
                      </blockquote>

                      <div className="space-y-2">
                        <div className="font-semibold text-lg">
                          {testimonials[currentIndex].name}
                        </div>
                        <div className="text-muted-foreground">
                          {testimonials[currentIndex].role}
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm">
                          <span className="text-primary">✨</span>
                          {testimonials[currentIndex].achievement}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    currentIndex === index
                      ? "w-8 bg-primary"
                      : "bg-muted hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-brand-accent text-brand-accent" />
            <span className="font-medium">4.9/5 Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">1,000+ Reviews</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">97% Keep Their Membership</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}