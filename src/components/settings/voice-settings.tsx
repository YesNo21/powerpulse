'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { api } from '@/trpc/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Loading } from '@/components/ui/loading'
import { VoiceSelector } from '@/components/audio/voice-selector'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Volume2,
  Play,
  Pause,
  Download,
  Music,
  Headphones,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import type { VoiceOption } from '@/lib/tts/google-tts'

export function VoiceSettings() {
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  
  // Fetch user voice preferences
  const { data: voicePreferences, isLoading } = api.user.getVoicePreferences.useQuery()
  
  // Mutations
  const updatePreferences = api.user.updateVoicePreferences.useMutation({
    onSuccess: () => {
      toast.success('Voice preferences updated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update preferences')
    },
  })
  
  const generatePreview = api.audio.generateVoicePreview.useMutation({
    onSuccess: (data) => {
      if (data.audioUrl) {
        playPreview(data.audioUrl)
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate preview')
    },
  })

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioElement) {
        audioElement.pause()
        audioElement.src = ''
      }
    }
  }, [audioElement])

  const playPreview = (url: string) => {
    if (audioElement) {
      audioElement.pause()
    }
    
    const audio = new Audio(url)
    audio.addEventListener('ended', () => setIsPlaying(false))
    audio.addEventListener('error', () => {
      setIsPlaying(false)
      toast.error('Failed to play preview')
    })
    
    setAudioElement(audio)
    audio.play()
    setIsPlaying(true)
  }

  const handlePausePreview = () => {
    if (audioElement) {
      audioElement.pause()
      setIsPlaying(false)
    }
  }

  const handleVoiceSelect = (voice: VoiceOption) => {
    setSelectedVoice(voice)
    updatePreferences.mutate({
      voiceName: voice.name,
      voiceGender: voice.ssmlGender,
    })
  }

  const handleSpeakingRateChange = (value: number[]) => {
    updatePreferences.mutate({
      speakingRate: value[0],
    })
  }

  const handlePitchChange = (value: number[]) => {
    updatePreferences.mutate({
      pitch: value[0],
    })
  }

  const handleVolumeChange = (value: number[]) => {
    updatePreferences.mutate({
      volumeGainDb: value[0],
    })
  }

  const handleQualityChange = (quality: string) => {
    updatePreferences.mutate({
      audioQuality: quality as 'standard' | 'premium' | 'ultra',
    })
  }

  const handleBackgroundMusicToggle = (enabled: boolean) => {
    updatePreferences.mutate({
      backgroundMusicEnabled: enabled,
    })
  }

  const handleBackgroundVolumeChange = (value: number[]) => {
    updatePreferences.mutate({
      backgroundMusicVolume: value[0],
    })
  }

  const handleGeneratePreview = () => {
    if (!selectedVoice) {
      toast.error('Please select a voice first')
      return
    }

    generatePreview.mutate({
      voiceName: selectedVoice.name,
      text: "Welcome to your daily PowerPulse session. Today, we're going to focus on building the momentum that will transform your life. Remember, every small step forward is progress worth celebrating.",
      speakingRate: voicePreferences?.speakingRate || 1,
      pitch: voicePreferences?.pitch || 0,
      volumeGainDb: voicePreferences?.volumeGainDb || 0,
    })
  }

  if (isLoading) {
    return <Loading />
  }

  const preferences = voicePreferences?.preferences

  return (
    <div className="space-y-6">
      {/* Voice Selection */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Voice Selection</CardTitle>
          <CardDescription>
            Choose the voice that resonates with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <VoiceSelector
            selectedVoice={preferences?.voiceName}
            onVoiceSelect={handleVoiceSelect}
          />
          
          {/* Preview Button */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              onClick={handleGeneratePreview}
              disabled={generatePreview.isLoading || !selectedVoice}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {generatePreview.isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Generate Preview
            </Button>
            
            {isPlaying && (
              <Button
                onClick={handlePausePreview}
                variant="outline"
                size="icon"
                className="border-white/10 hover:bg-white/5"
              >
                <Pause className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Voice Adjustments */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Voice Adjustments</CardTitle>
          <CardDescription>
            Fine-tune the voice to your preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Speaking Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="speaking-rate">Speaking Rate</Label>
              <span className="text-sm text-white/60">
                {preferences?.speakingRate || 1}x
              </span>
            </div>
            <Slider
              id="speaking-rate"
              min={0.5}
              max={2}
              step={0.1}
              value={[preferences?.speakingRate || 1]}
              onValueChange={handleSpeakingRateChange}
              className="[&_[role=slider]]:bg-emerald-500"
              disabled={updatePreferences.isLoading}
            />
            <p className="text-xs text-white/60">
              Adjust how fast the voice speaks (0.5x - 2x)
            </p>
          </div>

          {/* Pitch */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="pitch">Pitch</Label>
              <span className="text-sm text-white/60">
                {preferences?.pitch || 0} semitones
              </span>
            </div>
            <Slider
              id="pitch"
              min={-10}
              max={10}
              step={0.5}
              value={[preferences?.pitch || 0]}
              onValueChange={handlePitchChange}
              className="[&_[role=slider]]:bg-emerald-500"
              disabled={updatePreferences.isLoading}
            />
            <p className="text-xs text-white/60">
              Make the voice higher or lower (-10 to +10 semitones)
            </p>
          </div>

          {/* Volume Gain */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="volume" className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Volume Gain
              </Label>
              <span className="text-sm text-white/60">
                {preferences?.volumeGainDb || 0} dB
              </span>
            </div>
            <Slider
              id="volume"
              min={-10}
              max={10}
              step={0.5}
              value={[preferences?.volumeGainDb || 0]}
              onValueChange={handleVolumeChange}
              className="[&_[role=slider]]:bg-emerald-500"
              disabled={updatePreferences.isLoading}
            />
            <p className="text-xs text-white/60">
              Boost or reduce the overall volume (-10 to +10 dB)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Audio Quality */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Audio Quality</CardTitle>
          <CardDescription>
            Choose your preferred audio quality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quality" className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              Quality Setting
            </Label>
            <Select
              value={preferences?.audioQuality || 'premium'}
              onValueChange={handleQualityChange}
              disabled={updatePreferences.isLoading}
            >
              <SelectTrigger id="quality" className="bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/10">
                <SelectItem value="standard">
                  <div className="flex items-center gap-2">
                    <span>Standard</span>
                    <span className="text-xs text-white/60">(Smaller files, faster delivery)</span>
                  </div>
                </SelectItem>
                <SelectItem value="premium">
                  <div className="flex items-center gap-2">
                    <span>Premium</span>
                    <span className="text-xs text-white/60">(Balanced quality)</span>
                  </div>
                </SelectItem>
                <SelectItem value="ultra">
                  <div className="flex items-center gap-2">
                    <span>Ultra</span>
                    <span className="text-xs text-white/60">(Best quality, larger files)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Download Format */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-white/60" />
              <div>
                <Label htmlFor="download-enabled" className="text-base">Enable Downloads</Label>
                <p className="text-sm text-white/60">Save audio files for offline listening</p>
              </div>
            </div>
            <Switch
              id="download-enabled"
              checked={preferences?.downloadEnabled ?? true}
              onCheckedChange={(checked) => 
                updatePreferences.mutate({ downloadEnabled: checked })
              }
              disabled={updatePreferences.isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Background Music */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Background Music</CardTitle>
          <CardDescription>
            Add ambient music to your coaching sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Background Music */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-white/60" />
              <div>
                <Label htmlFor="music-enabled" className="text-base">Enable Background Music</Label>
                <p className="text-sm text-white/60">Soft ambient music during sessions</p>
              </div>
            </div>
            <Switch
              id="music-enabled"
              checked={preferences?.backgroundMusicEnabled ?? false}
              onCheckedChange={handleBackgroundMusicToggle}
              disabled={updatePreferences.isLoading}
            />
          </div>

          {preferences?.backgroundMusicEnabled && (
            <>
              {/* Music Style */}
              <div className="space-y-2">
                <Label htmlFor="music-style">Music Style</Label>
                <Select
                  value={preferences?.backgroundMusicStyle || 'calm'}
                  onValueChange={(style) => 
                    updatePreferences.mutate({ backgroundMusicStyle: style })
                  }
                  disabled={updatePreferences.isLoading}
                >
                  <SelectTrigger id="music-style" className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/10">
                    <SelectItem value="calm">Calm & Peaceful</SelectItem>
                    <SelectItem value="energetic">Energetic & Uplifting</SelectItem>
                    <SelectItem value="nature">Nature Sounds</SelectItem>
                    <SelectItem value="binaural">Binaural Beats</SelectItem>
                    <SelectItem value="ambient">Ambient Electronic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Music Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="music-volume">Music Volume</Label>
                  <span className="text-sm text-white/60">
                    {Math.round((preferences?.backgroundMusicVolume || 0.3) * 100)}%
                  </span>
                </div>
                <Slider
                  id="music-volume"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[preferences?.backgroundMusicVolume || 0.3]}
                  onValueChange={handleBackgroundVolumeChange}
                  className="[&_[role=slider]]:bg-emerald-500"
                  disabled={updatePreferences.isLoading}
                />
                <p className="text-xs text-white/60">
                  Adjust background music volume relative to voice
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Voice Training */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Voice Training</CardTitle>
          <CardDescription>
            Help us personalize the voice even more
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm text-blue-500 font-medium">
                  Coming Soon: Voice Cloning
                </p>
                <p className="text-sm text-white/60">
                  Soon you'll be able to upload a voice sample of someone who inspires you, 
                  and we'll create a custom voice just for your coaching sessions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}