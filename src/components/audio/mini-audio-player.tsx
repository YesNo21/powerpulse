'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Play, Pause, Loader2 } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

interface MiniAudioPlayerProps {
  audioUrl: string
  duration?: number
  onPlay?: () => void
  onComplete?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function MiniAudioPlayer({
  audioUrl,
  duration: totalDuration = 0,
  onPlay,
  onComplete,
  className,
  size = 'md',
}: MiniAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(totalDuration)
  const [isLoading, setIsLoading] = useState(true)

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
      onPlay?.()
    }
    setIsPlaying(!isPlaying)
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      onComplete?.()
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('canplay', handleCanPlay)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [onComplete])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="relative">
        <Button
          variant="default"
          size="icon"
          onClick={togglePlayPause}
          disabled={isLoading}
          className={cn(
            sizeClasses[size],
            'rounded-full relative overflow-hidden'
          )}
        >
          {/* Progress ring */}
          <svg
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-white/20"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="text-white transition-all duration-100"
            />
          </svg>

          {/* Icon */}
          <div className="relative z-10">
            {isLoading ? (
              <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
            ) : isPlaying ? (
              <Pause className={iconSizes[size]} />
            ) : (
              <Play className={cn(iconSizes[size], 'ml-0.5')} />
            )}
          </div>
        </Button>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm text-muted-foreground">
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </div>
      </div>
    </div>
  )
}