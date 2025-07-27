'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  FileQuestion, 
  Search, 
  Music, 
  Users,
  Trophy,
  Calendar,
  Heart,
  type LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon | 'sparkles' | 'file' | 'search' | 'music' | 'users' | 'trophy' | 'calendar' | 'heart'
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

const iconMap = {
  sparkles: Sparkles,
  file: FileQuestion,
  search: Search,
  music: Music,
  users: Users,
  trophy: Trophy,
  calendar: Calendar,
  heart: Heart,
}

export function EmptyState({ 
  icon = 'sparkles', 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  const Icon = typeof icon === 'string' ? iconMap[icon] : icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center space-y-4',
        className
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          delay: 0.1, 
          type: 'spring',
          stiffness: 200,
          damping: 15
        }}
        className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
      >
        <Icon className="w-10 h-10 text-primary" />
      </motion.div>

      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-semibold">{title}</h3>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>

      {action && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  )
}

// Pre-configured empty states for common scenarios
export function NoContentEmptyState() {
  return (
    <EmptyState
      icon="music"
      title="No content yet"
      description="Your personalized audio content will appear here once generated"
    />
  )
}

export function NoResultsEmptyState({ searchTerm }: { searchTerm?: string }) {
  return (
    <EmptyState
      icon="search"
      title="No results found"
      description={
        searchTerm 
          ? `We couldn't find anything matching "${searchTerm}"`
          : "Try adjusting your search criteria"
      }
    />
  )
}

export function NoAchievementsEmptyState() {
  return (
    <EmptyState
      icon="trophy"
      title="Your achievements await!"
      description="Complete your daily PowerPulse sessions to unlock achievements"
      action={
        <Button variant="default">
          Start Today's Session
        </Button>
      }
    />
  )
}

export function NoStreakEmptyState() {
  return (
    <EmptyState
      icon="calendar"
      title="Start your streak today!"
      description="Listen to your daily PowerPulse to begin building your streak"
      action={
        <Button variant="glow">
          Play Today's Audio
        </Button>
      }
    />
  )
}

export function OnboardingEmptyState() {
  return (
    <EmptyState
      icon="sparkles"
      title="Your journey begins today!"
      description="Complete the quiz to receive your first personalized PowerPulse"
      action={
        <Button size="lg" variant="default">
          Start Quiz
        </Button>
      }
    />
  )
}

export function NoCommunityPostsEmptyState() {
  return (
    <EmptyState
      icon="users"
      title="Be the first to share!"
      description="Share your success story and inspire others on their journey"
      action={
        <Button variant="outline">
          Share Your Story
        </Button>
      }
    />
  )
}