# Google Text-to-Speech Integration

This document describes the Google Cloud Text-to-Speech integration for PowerPulse.

## Overview

The integration provides high-quality, natural-sounding speech synthesis for daily motivational content. It supports multiple voices, languages, and advanced features like SSML markup for better speech control.

## Setup

### 1. Google Cloud Configuration

1. Create a Google Cloud project
2. Enable the Text-to-Speech API
3. Create a service account with Text-to-Speech permissions
4. Download the service account key JSON file

### 2. Environment Variables

Add these to your `.env` file:

```env
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
GOOGLE_CLOUD_KEYFILE="./path/to/service-account-key.json"
```

### 3. Installation

The required dependencies are already installed:
- `@google-cloud/text-to-speech`: Google's official TTS SDK
- `@vercel/blob`: For audio file storage
- `sonner`: For toast notifications

## Architecture

### Components

1. **Google TTS Service** (`/src/lib/tts/google-tts.ts`)
   - Main integration with Google Cloud Text-to-Speech API
   - Voice synthesis with SSML support
   - Voice listing and preview generation
   - Batch processing capabilities

2. **Audio Processor** (`/src/lib/tts/audio-processor.ts`)
   - Audio validation and optimization
   - Duration checking (ensures ~5 minutes)
   - Format conversion placeholder
   - Quality analysis

3. **Audio Storage** (`/src/lib/storage/audio-storage.ts`)
   - Vercel Blob storage integration
   - Secure URL generation
   - File lifecycle management
   - Storage statistics

4. **API Router** (`/src/server/api/routers/audio.ts`)
   - tRPC endpoints for audio operations
   - Audio generation and retrieval
   - Voice management
   - Queue status monitoring

5. **Batch Processor** (`/src/lib/tts/batch-processor.ts`)
   - Scheduled audio generation
   - Retry logic for failed jobs
   - Bulk processing for efficiency

## Usage

### Generate Audio for Content

```typescript
import { api } from '@/lib/trpc/client'

// Generate audio for a content item
const { data } = await api.audio.generateAudio.mutate({
  contentId: 123,
  voiceSettings: {
    name: 'en-US-Neural2-F',
    speakingRate: 1.0,
    pitch: 0,
  },
  useSSML: true,
})

console.log(data.audioUrl) // URL to the generated audio
```

### List Available Voices

```typescript
const { data } = await api.audio.listVoices.query({
  languageCode: 'en-US',
  gender: 'FEMALE',
  category: 'neural',
})

// Returns grouped voices by language and gender
```

### Generate Voice Preview

```typescript
await api.audio.previewVoice.mutate({
  voiceName: 'en-US-Neural2-F',
  sampleText: 'Hello, this is a preview of my voice.',
})
```

### React Hooks

```typescript
import { useAudioGeneration, useVoiceList } from '@/hooks/use-audio-generation'

// In your component
const { generate, isGenerating, audioUrl } = useAudioGeneration({
  onSuccess: (url) => console.log('Audio ready:', url),
  autoPlay: true,
})

// Generate audio
await generate(contentId, voiceSettings)
```

## Voice Options

### Voice Categories

1. **Neural Voices**: Most natural-sounding, uses advanced neural networks
2. **Wavenet Voices**: High-quality voices using WaveNet technology
3. **Standard Voices**: Basic text-to-speech voices

### Voice Settings

- **Language Code**: e.g., 'en-US', 'en-GB', 'es-ES'
- **Gender**: MALE, FEMALE, or NEUTRAL
- **Speaking Rate**: 0.25 to 4.0 (1.0 is normal)
- **Pitch**: -20 to +20 semitones
- **Volume Gain**: -96 to +16 dB

## SSML Support

The system automatically enhances scripts with SSML for better speech:

```xml
<speak>
  Good morning, Sarah! <break time="400ms"/>
  <emphasis level="moderate">Today is a new opportunity</emphasis> 
  to move closer to your goals.
  <break time="1s"/>
  Let's start with a simple breathing exercise...
</speak>
```

### SSML Features Used

- **Pauses**: After sentences (400ms) and paragraphs (1s)
- **Emphasis**: On key points and important words
- **Prosody**: For varying speech rate and pitch
- **Say-as**: For dates, numbers, and special formats

## Audio Storage

Files are stored in Vercel Blob storage with the following structure:

```
audio/
  user/{userId}/
    content/{contentId}/
      {date}_{timestamp}.mp3
```

### Storage Features

- Automatic URL signing for security
- 1-week default expiry (configurable)
- Cleanup of old files
- Usage statistics tracking

## Batch Processing

For scheduled content generation:

```typescript
import { getAudioBatchProcessor } from '@/lib/tts/batch-processor'

const processor = getAudioBatchProcessor()

// Process pending jobs
const results = await processor.processPendingJobs()

// Generate missing audio for today
const generated = await processor.generateMissingAudio(new Date())
```

## Error Handling

The system includes comprehensive error handling:

1. **Retry Logic**: Failed generations are queued for retry
2. **Graceful Degradation**: Falls back to text if audio fails
3. **Error Logging**: All errors are logged with context
4. **User Feedback**: Toast notifications for success/failure

## Performance Considerations

1. **Caching**: Generated audio URLs are cached
2. **Batch Processing**: Multiple requests are processed together
3. **Compression**: Audio files are optimized for web delivery
4. **CDN**: Vercel Blob uses global CDN for fast delivery

## Security

1. **Authentication**: All endpoints require user authentication
2. **Authorization**: Users can only access their own audio
3. **Signed URLs**: Time-limited access to audio files
4. **Input Validation**: All inputs are validated with Zod schemas

## Monitoring

Track audio generation through:

1. **Queue Status**: Monitor pending/processing/failed jobs
2. **Storage Stats**: Track usage by user and total
3. **Error Logs**: Detailed error messages for debugging
4. **Duration Validation**: Ensures content meets 5-minute target

## Future Enhancements

1. **Multiple Language Support**: Expand beyond English
2. **Voice Cloning**: Custom voices for premium users
3. **Real-time Streaming**: Stream audio as it's generated
4. **Offline Support**: Download for offline listening
5. **Advanced SSML**: More sophisticated speech markup