'use client'

import { motion } from 'framer-motion'
import { Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  return (
    <Loader2 className={cn(
      'animate-spin text-primary',
      sizeClasses[size],
      className
    )} />
  )
}

interface LoadingStateProps {
  message?: string
  className?: string
  children?: React.ReactNode
}

const loadingMessages = [
  "Crafting your perfect motivation...",
  "Analyzing your unique journey...",
  "Preparing something special for you...",
  "Almost there, champion...",
  "Loading your personalized experience...",
  "Getting things ready for you..."
]

export function LoadingState({ message, className, children }: LoadingStateProps) {
  const randomMessage = message || loadingMessages[Math.floor(Math.random() * loadingMessages.length)]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'flex flex-col items-center justify-center p-8 space-y-4',
        className
      )}
    >
      {children || <Spinner size="lg" />}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground animate-pulse"
      >
        {randomMessage}
      </motion.p>
    </motion.div>
  )
}

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn(
      'animate-pulse rounded-md bg-muted',
      className
    )} />
  )
}

interface CardSkeletonProps {
  showAvatar?: boolean
  lines?: number
}

export function CardSkeleton({ showAvatar = false, lines = 3 }: CardSkeletonProps) {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      {showAvatar && (
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      )}
      <div className="space-y-3">
        {[...Array(lines)].map((_, i) => (
          <Skeleton
            key={i}
            className="h-4"
            style={{ width: `${Math.random() * 40 + 60}%` }}
          />
        ))}
      </div>
    </div>
  )
}

interface LoadingDotsProps {
  className?: string
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn('flex space-x-1', className)}>
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-primary rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  )
}

interface MagicalLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function MagicalLoader({ size = 'md', className }: MagicalLoaderProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <motion.div
      className={cn(
        'relative',
        sizeClasses[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear'
      }}
    >
      <Sparkles className="w-full h-full text-brand-primary" />
      <motion.div
        className="absolute inset-0"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <Sparkles className="w-full h-full text-brand-secondary" />
      </motion.div>
    </motion.div>
  )
}