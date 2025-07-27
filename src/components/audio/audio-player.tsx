'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  SkipBack,
  SkipForward,
  Loader2
} from 'lucide-react'

interface AudioPlayerProps {
  src: string
  title?: string
  artist?: string
  className?: string
}

const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2] as const

export function AudioPlayer({ 
  src, 
  title = 'Unknown Title', 
  artist = 'Unknown Artist',
  className 
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [previousVolume, setPreviousVolume] = useState(1)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  // Format time to MM:SS
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Handle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Handle seeking
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressBarRef.current) return
    
    const bounds = progressBarRef.current.getBoundingClientRect()
    const x = e.clientX - bounds.left
    const width = bounds.width
    const percentage = x / width
    const newTime = percentage * duration
    
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (volume > 0) {
      setPreviousVolume(volume)
      setVolume(0)
      if (audioRef.current) audioRef.current.volume = 0
    } else {
      setVolume(previousVolume)
      if (audioRef.current) audioRef.current.volume = previousVolume
    }
  }

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds))
  }

  // Cycle playback speed
  const cyclePlaybackSpeed = () => {
    const currentIndex = playbackSpeeds.indexOf(playbackSpeed)
    const nextIndex = (currentIndex + 1) % playbackSpeeds.length
    const newSpeed = playbackSpeeds[nextIndex]
    setPlaybackSpeed(newSpeed)
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed
    }
  }

  // Setup audio event listeners
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
  }, [])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={cn(
      'relative w-full max-w-2xl mx-auto p-6 rounded-2xl overflow-hidden',
      'bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-orange-600/20',
      'backdrop-blur-xl border border-white/10',
      'shadow-2xl shadow-purple-900/20',
      'transition-all duration-300 hover:shadow-purple-900/30',
      className
    )}>
      {/* Background gradient animation */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-orange-600/10 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-indigo-600/10 to-purple-600/10 animate-pulse animation-delay-2000" />
      </div>

      {/* Audio element */}
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Track info */}
      <div className="mb-6 text-center">
        <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-white/60">{artist}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div 
          ref={progressBarRef}
          className="relative h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer group"
          onClick={handleSeek}
        >
          {/* Progress fill */}
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          >
            {/* Animated glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 blur-sm animate-pulse" />
          </div>
          
          {/* Hover indicator */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>

        {/* Time display */}
        <div className="flex justify-between mt-2 text-sm text-white/60">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {/* Skip backward */}
        <button
          onClick={() => skip(-10)}
          className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
          title="Skip backward 10s"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className={cn(
            'p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500',
            'text-white shadow-lg hover:shadow-xl transition-all duration-200',
            'hover:scale-105 active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
        </button>

        {/* Skip forward */}
        <button
          onClick={() => skip(10)}
          className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
          title="Skip forward 10s"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-between">
        {/* Playback speed */}
        <button
          onClick={cyclePlaybackSpeed}
          className={cn(
            'px-3 py-1 rounded-full text-sm font-medium',
            'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white',
            'transition-all duration-200'
          )}
        >
          {playbackSpeed}x
        </button>

        {/* Volume control */}
        <div 
          className="flex items-center gap-2"
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <button
            onClick={toggleMute}
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            {volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          
          {/* Volume slider */}
          <div className={cn(
            'overflow-hidden transition-all duration-300',
            showVolumeSlider ? 'w-24' : 'w-0'
          )}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AudioPlayer