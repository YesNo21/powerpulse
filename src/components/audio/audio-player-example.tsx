'use client'

import { AudioPlayer } from './audio-player'

export function AudioPlayerExample() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <AudioPlayer
        src="/path-to-your-audio-file.mp3"
        title="Beautiful Song"
        artist="Amazing Artist"
        className="w-full max-w-xl"
      />
    </div>
  )
}

export default AudioPlayerExample