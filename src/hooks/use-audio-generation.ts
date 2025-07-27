import { useState, useCallback } from 'react'
import { api } from '@/lib/trpc/client'
import { toast } from 'sonner'
import type { VoiceSettings } from '@/lib/tts/google-tts'

export interface UseAudioGenerationOptions {
  onSuccess?: (audioUrl: string) => void
  onError?: (error: Error) => void
  autoPlay?: boolean
}

export function useAudioGeneration(options?: UseAudioGenerationOptions) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState<number | null>(null)

  const generateAudio = api.audio.generateAudio.useMutation({
    onSuccess: (data) => {
      setAudioUrl(data.audioUrl)
      setDuration(data.duration)
      
      if (data.cached) {
        toast.success('Audio loaded from cache')
      } else {
        toast.success('Audio generated successfully')
      }

      options?.onSuccess?.(data.audioUrl)

      if (options?.autoPlay && data.audioUrl) {
        const audio = new Audio(data.audioUrl)
        audio.play().catch(console.error)
      }
    },
    onError: (error) => {
      toast.error('Failed to generate audio')
      console.error('Audio generation error:', error)
      options?.onError?.(error as Error)
    },
  })

  const generate = useCallback(
    async (contentId: number, voiceSettings?: VoiceSettings) => {
      setIsGenerating(true)
      try {
        await generateAudio.mutateAsync({
          contentId,
          voiceSettings,
          useSSML: true,
        })
      } finally {
        setIsGenerating(false)
      }
    },
    [generateAudio]
  )

  const regenerate = useCallback(
    async (contentId: number, voiceSettings?: VoiceSettings) => {
      setIsGenerating(true)
      try {
        await generateAudio.mutateAsync({
          contentId,
          voiceSettings,
          useSSML: true,
          regenerate: true,
        })
      } finally {
        setIsGenerating(false)
      }
    },
    [generateAudio]
  )

  return {
    generate,
    regenerate,
    isGenerating,
    audioUrl,
    duration,
  }
}

export function useVoiceList(languageCode?: string) {
  return api.audio.listVoices.useQuery(
    { languageCode },
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    }
  )
}

export function useVoicePreview() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const previewVoice = api.audio.previewVoice.useMutation({
    onSuccess: (data) => {
      setPreviewUrl(data.previewUrl)
      
      // Auto-play preview
      const audio = new Audio(data.previewUrl)
      audio.play().catch(console.error)
    },
    onError: (error) => {
      toast.error('Failed to generate voice preview')
      console.error('Voice preview error:', error)
    },
  })

  const preview = useCallback(
    async (voiceName: string, sampleText?: string) => {
      setIsGenerating(true)
      try {
        await previewVoice.mutateAsync({
          voiceName,
          sampleText,
        })
      } finally {
        setIsGenerating(false)
      }
    },
    [previewVoice]
  )

  return {
    preview,
    isGenerating,
    previewUrl,
  }
}

export function useAudioQueue() {
  const { data, isLoading, refetch } = api.audio.getQueueStatus.useQuery(
    undefined,
    {
      refetchInterval: 5000, // Poll every 5 seconds
    }
  )

  return {
    queue: data?.items || [],
    summary: data?.summary || {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      total: 0,
    },
    isLoading,
    refetch,
  }
}