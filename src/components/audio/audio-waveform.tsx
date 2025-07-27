'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface AudioWaveformProps {
  audioUrl: string
  isPlaying: boolean
  currentTime: number
  duration: number
  className?: string
  barCount?: number
  barColor?: string
  progressColor?: string
}

export function AudioWaveform({
  audioUrl,
  isPlaying,
  currentTime,
  duration,
  className,
  barCount = 50,
  barColor = 'rgba(255, 255, 255, 0.3)',
  progressColor = 'rgba(168, 85, 247, 0.8)',
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const audioContextRef = useRef<AudioContext | null>(null)
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)
  const [peaks, setPeaks] = useState<number[]>([])

  // Load and analyze audio
  useEffect(() => {
    const loadAudio = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }

        const response = await fetch(audioUrl)
        const arrayBuffer = await response.arrayBuffer()
        const buffer = await audioContextRef.current.decodeAudioData(arrayBuffer)
        
        setAudioBuffer(buffer)
        
        // Calculate peaks for visualization
        const sampleSize = Math.floor(buffer.length / barCount)
        const sampleStep = Math.floor(sampleSize / 10) || 1
        const newPeaks: number[] = []

        for (let i = 0; i < barCount; i++) {
          const start = i * sampleSize
          const end = Math.min(start + sampleSize, buffer.length)
          
          let max = 0
          for (let j = start; j < end; j += sampleStep) {
            const value = Math.abs(buffer.getChannelData(0)[j])
            if (value > max) max = value
          }
          
          newPeaks.push(max)
        }

        setPeaks(newPeaks)
      } catch (error) {
        console.error('Failed to load audio for waveform:', error)
      }
    }

    loadAudio()

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [audioUrl, barCount])

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || peaks.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = canvas.width / barCount
      const barGap = 2
      const progress = duration > 0 ? currentTime / duration : 0

      // Draw bars
      peaks.forEach((peak, i) => {
        const barHeight = peak * canvas.height * 0.8
        const x = i * barWidth
        const y = (canvas.height - barHeight) / 2

        // Determine if this bar is in the played section
        const barProgress = i / barCount
        const isPlayed = barProgress <= progress

        // Set color based on progress
        ctx.fillStyle = isPlayed ? progressColor : barColor

        // Add animation for playing state
        let animationOffset = 0
        if (isPlaying && Math.abs(barProgress - progress) < 0.02) {
          animationOffset = Math.sin(Date.now() * 0.005) * 5
        }

        // Draw bar
        ctx.fillRect(
          x + barGap / 2,
          y - animationOffset,
          barWidth - barGap,
          barHeight + animationOffset * 2
        )
      })

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw)
      }
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [peaks, isPlaying, currentTime, duration, barCount, barColor, progressColor])

  return (
    <div className={cn('relative w-full', className)}>
      <canvas
        ref={canvasRef}
        width={800}
        height={100}
        className="w-full h-full"
      />
    </div>
  )
}

// Simplified static waveform for loading states
export function StaticWaveform({
  className,
  barCount = 50,
  barColor = 'rgba(255, 255, 255, 0.1)',
}: {
  className?: string
  barCount?: number
  barColor?: string
}) {
  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      {Array.from({ length: barCount }).map((_, i) => {
        const height = Math.random() * 40 + 10
        return (
          <div
            key={i}
            className="animate-pulse"
            style={{
              width: `${100 / barCount}%`,
              height: `${height}px`,
              backgroundColor: barColor,
              animationDelay: `${i * 50}ms`,
            }}
          />
        )
      })}
    </div>
  )
}