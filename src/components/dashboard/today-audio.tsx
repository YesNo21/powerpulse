"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, SkipForward, Volume2, Clock, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TodayAudioProps {
  audioTitle: string
  audioDescription: string
  duration: number // in seconds
  audioUrl?: string
  isCompleted?: boolean
}

export function TodayAudio({ 
  audioTitle, 
  audioDescription, 
  duration, 
  audioUrl,
  isCompleted = false 
}: TodayAudioProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    // In a real app, this would control the audio element
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Background Gradient Animation */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 via-transparent to-pink-600/20"
          animate={{
            x: ["0%", "100%", "0%"],
            y: ["0%", "100%", "0%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <CardHeader className="relative">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Today's Session
          </span>
          {isCompleted && (
            <span className="text-sm font-normal text-green-600 bg-green-100 px-2 py-1 rounded-full">
              Completed
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Audio Info */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{audioTitle}</h3>
          <p className="text-sm text-muted-foreground">{audioDescription}</p>
        </div>

        {/* Waveform Visualization */}
        <div className="relative h-16 flex items-center gap-1">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full",
                i < (progress / 100) * 30 ? "opacity-100" : "opacity-30"
              )}
              animate={{
                height: isPlaying ? [
                  `${20 + Math.random() * 40}%`,
                  `${30 + Math.random() * 40}%`,
                  `${20 + Math.random() * 40}%`,
                ] : "30%",
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.05,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500"
              style={{ width: `${progress}%` }}
              transition={{ type: "spring", bounce: 0 }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled
          >
            <Volume2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
            onClick={handlePlayPause}
          >
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.div
                  key="pause"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Pause className="h-5 w-5" fill="currentColor" />
                </motion.div>
              ) : (
                <motion.div
                  key="play"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Session Info */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{Math.ceil(duration / 60)} min session</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}