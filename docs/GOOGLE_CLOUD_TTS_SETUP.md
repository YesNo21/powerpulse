# Google Cloud Text-to-Speech API Setup

## Prerequisites
- Google Cloud account
- Credit card for billing (free tier available)
- gcloud CLI (optional but recommended)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Create Project"
3. Name it: `powerpulse-production`
4. Note your Project ID

## Step 2: Enable Text-to-Speech API

1. In Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Cloud Text-to-Speech API"
3. Click on it and press "Enable"
4. Wait for activation

## Step 3: Create Service Account

1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Details:
   - Name: `powerpulse-tts`
   - ID: `powerpulse-tts`
   - Description: `Service account for TTS API access`
4. Grant roles:
   - `Cloud Text-to-Speech User`
   - `Cloud Storage Object Creator` (if using GCS for audio storage)
5. Click "Done"

## Step 4: Generate Service Account Key

1. Click on the created service account
2. Go to "Keys" tab
3. Add Key > Create new key
4. Choose JSON format
5. Download the key file
6. **IMPORTANT**: Keep this file secure!

## Step 5: Set up Authentication

### Option A: Environment Variable (Recommended)
```bash
# Add to .env.local
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
```

### Option B: Base64 Encoded (For Vercel)
```bash
# Encode the JSON file
base64 -i service-account-key.json | tr -d '\n' > encoded-key.txt

# Add to .env.local
GOOGLE_CLOUD_CREDENTIALS_BASE64=<contents of encoded-key.txt>
```

Then in your code:
```typescript
// src/lib/tts/google-tts-service.ts
const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_CLOUD_CREDENTIALS_BASE64!, 'base64').toString()
)
```

## Step 6: Configure Billing

1. Go to "Billing" in Cloud Console
2. Create or link billing account
3. Set up budget alerts:
   - Monthly budget: $50 (adjust based on usage)
   - Alert at 50%, 90%, 100%

### Pricing (as of 2025):
- **Chirp 3 HD**: $24 per 1 million characters
- **Neural2/WaveNet**: $16 per 1 million characters  
- **Standard**: $4 per 1 million characters
- **Free tier**: 1M characters WaveNet, 4M Standard per month

## Step 7: Set up Audio Storage

### Option A: Google Cloud Storage
```bash
# Create bucket
gsutil mb -l us-central1 gs://powerpulse-audio

# Set CORS for web access
echo '[{"origin": ["*"], "method": ["GET"], "maxAgeSeconds": 3600}]' > cors.json
gsutil cors set cors.json gs://powerpulse-audio

# Add to .env.local
GOOGLE_CLOUD_STORAGE_BUCKET=powerpulse-audio
```

### Option B: Vercel Blob Storage (Simpler)
```bash
# Install Vercel Blob
pnpm add @vercel/blob

# Get token from Vercel Dashboard
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

## Step 8: Test TTS Integration

Create test script:
```typescript
// scripts/test-tts.ts
import { GoogleTTSService } from '../src/lib/tts/google-tts-service'

async function testTTS() {
  const tts = new GoogleTTSService()
  
  const audio = await tts.synthesizeSpeech({
    text: 'Hello! This is a test of PowerPulse audio generation.',
    voice: {
      languageCode: 'en-US',
      name: 'chirp3-hd:Achernar',
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 1.0,
      pitch: 0,
      volumeGainDb: 0,
    }
  })
  
  console.log('Audio generated:', audio.byteLength, 'bytes')
}

testTTS()
```

Run: `pnpm tsx scripts/test-tts.ts`

## Step 9: Production Configuration

### Environment Variables:
```env
# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
# OR
GOOGLE_CLOUD_CREDENTIALS_BASE64=base64-encoded-json

# Audio Storage
GOOGLE_CLOUD_STORAGE_BUCKET=powerpulse-audio
# OR
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

### API Quotas:
1. Go to "APIs & Services" > "Quotas"
2. Find Text-to-Speech API
3. Request increases if needed:
   - Characters per minute: 1,000,000 (default)
   - Requests per minute: 1000 (default)

## Step 10: Monitoring & Logging

### Set up monitoring:
1. Go to "Operations" > "Monitoring"
2. Create dashboard for:
   - API usage by voice type
   - Error rates
   - Latency metrics
   - Cost tracking

### Enable logging:
```typescript
// Log all TTS requests
import { Logging } from '@google-cloud/logging'

const logging = new Logging()
const log = logging.log('tts-requests')

// In your TTS service
async function logRequest(request: any, response: any) {
  const entry = log.entry({
    resource: { type: 'global' },
    severity: 'INFO',
    jsonPayload: {
      request,
      response: {
        audioLength: response.audioContent.length,
        processingTime: response.processingTime,
      }
    }
  })
  
  await log.write(entry)
}
```

## Best Practices

### 1. Caching
```typescript
// Cache common phrases
const CACHED_PHRASES = new Map<string, Buffer>()

async function getAudio(text: string, voice: string) {
  const cacheKey = `${text}-${voice}`
  
  if (CACHED_PHRASES.has(cacheKey)) {
    return CACHED_PHRASES.get(cacheKey)!
  }
  
  const audio = await tts.synthesizeSpeech({ text, voice })
  CACHED_PHRASES.set(cacheKey, audio)
  
  return audio
}
```

### 2. Batch Processing
```typescript
// Process multiple users at once
async function batchGenerateAudio(users: User[]) {
  const batchSize = 10
  
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize)
    
    await Promise.all(
      batch.map(user => generateUserAudio(user))
    )
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}
```

### 3. Error Handling
```typescript
async function synthesizeWithRetry(request: any, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await tts.synthesizeSpeech(request)
    } catch (error: any) {
      if (error.code === 8) { // RESOURCE_EXHAUSTED
        await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000))
      } else {
        throw error
      }
    }
  }
  throw new Error('Max retries exceeded')
}
```

## Cost Optimization

### 1. Voice Selection Strategy
```javascript
// Use premium voices for key content only
function selectVoice(contentType: string) {
  switch (contentType) {
    case 'daily_coaching':
      return 'chirp3-hd:Achernar' // Premium
    case 'reminder':
      return 'en-US-Neural2-A' // Mid-tier
    case 'notification':
      return 'en-US-Standard-A' // Budget
  }
}
```

### 2. Character Optimization
```javascript
// Minimize character count
function optimizeText(text: string) {
  return text
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .replace(/[""]/g, '"') // Smart quotes to regular
    .trim()
}
```

### 3. Implement Caching
- Cache intro/outro phrases
- Store common motivational quotes
- Reuse generated audio when possible

## Troubleshooting

### Common Issues:

1. **Authentication Error**
   ```
   Error: Could not load the default credentials
   ```
   - Check GOOGLE_APPLICATION_CREDENTIALS path
   - Verify JSON file is valid
   - Ensure service account has correct permissions

2. **Quota Exceeded**
   ```
   Error: Resource exhausted
   ```
   - Check quotas in Cloud Console
   - Implement rate limiting
   - Request quota increase

3. **Voice Not Found**
   ```
   Error: Invalid voice name
   ```
   - Verify voice ID format
   - Check voice availability for language
   - Use correct voice type prefix

### Debug Mode:
```typescript
// Enable detailed logging
process.env.GRPC_VERBOSITY = 'DEBUG'
process.env.GRPC_TRACE = 'all'
```

## Security Checklist

- [ ] Service account key is encrypted at rest
- [ ] Key is not committed to version control
- [ ] Minimal permissions granted
- [ ] API key restrictions configured
- [ ] Budget alerts enabled
- [ ] Audit logging enabled
- [ ] Regular key rotation scheduled

## Support Resources

- [TTS Documentation](https://cloud.google.com/text-to-speech/docs)
- [Pricing Calculator](https://cloud.google.com/products/calculator)
- [Support](https://cloud.google.com/support)
- [Status Page](https://status.cloud.google.com)