'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useVoiceList, useVoicePreview } from '@/hooks/use-audio-generation'
import { Volume2, Play, Loader2 } from 'lucide-react'
import type { VoiceOption } from '@/lib/tts/google-tts'

interface VoiceSelectorProps {
  languageCode?: string
  selectedVoice?: string
  onVoiceSelect: (voice: VoiceOption) => void
}

export function VoiceSelector({
  languageCode = 'en-US',
  selectedVoice,
  onVoiceSelect,
}: VoiceSelectorProps) {
  const { data, isLoading } = useVoiceList(languageCode)
  const { preview, isGenerating } = useVoicePreview()
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!data?.grouped) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No voices available
      </div>
    )
  }

  const handlePreview = async (voice: VoiceOption) => {
    setPreviewingVoice(voice.name)
    await preview(voice.name)
    setPreviewingVoice(null)
  }

  return (
    <div className="space-y-4">
      {data.grouped.map((group) => (
        <div key={`${group.languageCode}-${group.gender}`}>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            {group.gender} Voices
          </h3>
          <div className="grid gap-2">
            {group.voices.map((voice) => (
              <Card
                key={voice.name}
                className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedVoice === voice.name ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onVoiceSelect(voice)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">
                        {voice.name.split('-').slice(-2).join(' ')}
                      </h4>
                      {voice.category && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            voice.category === 'neural'
                              ? 'bg-green-100 text-green-700'
                              : voice.category === 'wavenet'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {voice.category}
                        </span>
                      )}
                    </div>
                    {voice.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {voice.description}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePreview(voice)
                    }}
                    disabled={isGenerating}
                  >
                    {isGenerating && previewingVoice === voice.name ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function VoiceSettingsCard({
  voiceSettings,
  onUpdate,
}: {
  voiceSettings: any
  onUpdate: (settings: any) => void
}) {
  const [selectedVoice, setSelectedVoice] = useState(voiceSettings?.name)

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Voice Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Voice Selection
          </label>
          <VoiceSelector
            selectedVoice={selectedVoice}
            onVoiceSelect={(voice) => {
              setSelectedVoice(voice.name)
              onUpdate({
                ...voiceSettings,
                name: voice.name,
                gender: voice.ssmlGender,
              })
            }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Speaking Rate
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceSettings?.speakingRate || 1}
              onChange={(e) =>
                onUpdate({
                  ...voiceSettings,
                  speakingRate: parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
            <span className="text-xs text-muted-foreground">
              {voiceSettings?.speakingRate || 1}x
            </span>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Pitch
            </label>
            <input
              type="range"
              min="-10"
              max="10"
              step="1"
              value={voiceSettings?.pitch || 0}
              onChange={(e) =>
                onUpdate({
                  ...voiceSettings,
                  pitch: parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
            <span className="text-xs text-muted-foreground">
              {voiceSettings?.pitch || 0}
            </span>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Volume
            </label>
            <input
              type="range"
              min="-10"
              max="10"
              step="1"
              value={voiceSettings?.volumeGainDb || 0}
              onChange={(e) =>
                onUpdate({
                  ...voiceSettings,
                  volumeGainDb: parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
            <span className="text-xs text-muted-foreground">
              {voiceSettings?.volumeGainDb || 0} dB
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}