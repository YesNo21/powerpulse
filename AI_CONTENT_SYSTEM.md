# AI Content Generation System

## Overview

The PowerPulse AI Content Generation System creates personalized, motivational 5-minute audio scripts for users based on their journey stage, pain points, goals, and progress. The system supports both OpenAI and Anthropic APIs.

## Configuration

Add these environment variables to your `.env` file:

```env
# AI Content Generation
AI_PROVIDER=openai  # Options: openai, anthropic
AI_API_KEY=your_api_key_here
```

## Architecture

### Core Components

1. **Content Generator** (`/src/lib/ai/content-generator.ts`)
   - Main service for generating AI content
   - Supports multiple AI providers (OpenAI, Anthropic)
   - Validates content length (targets 775 words for 5-minute audio)
   - Personalizes based on user context

2. **Prompt Templates** (`/src/lib/ai/prompt-templates.ts`)
   - Pre-defined templates for different user stages
   - Templates for special situations (milestones, comebacks)
   - Time-specific content (morning energizer, evening reflection)

3. **Content Router** (`/src/server/api/routers/content.ts`)
   - tRPC endpoints for content operations
   - Handles generation, regeneration, and feedback

## User Journey Stages

The system adapts content based on the user's journey stage:

1. **Awareness** (Days 0-3): Initial assessment and introduction
2. **Consideration** (Days 3-7): Building habits and consistency
3. **Decision** (Days 7-30): Deepening practice and commitment
4. **Retention** (Days 30+): Mastery and optimization

## Content Types

### By User Stage
- `initial_assessment`: First content after quiz completion
- `building_habits`: Focus on establishing routines (days 3-7)
- `deepening_practice`: Advanced techniques (days 7-30)
- `mastery_refinement`: Optimization for veterans (30+ days)

### By Occasion
- `weekly_milestone`: Celebrate 7-day achievements
- `monthly_milestone`: Major 30-day transformation milestone
- `comeback_encouragement`: Support after broken streaks

### By Time of Day
- `morning_energizer`: Energizing start to the day
- `evening_reflection`: Calming end-of-day content
- `standard_daily`: Regular motivational content

## API Endpoints

### Generate Daily Content
```typescript
// Generate or retrieve today's content
const content = await trpc.content.generateDailyContent.mutate({
  promptType: 'optional_specific_template',
  regenerate: false
})
```

### Regenerate Content
```typescript
// Regenerate content for a specific date
const content = await trpc.content.regenerateContent.mutate({
  date: '2024-01-15',
  reason: 'feedback' // or 'preference', 'error'
})
```

### Preview Content
```typescript
// Preview content with custom context
const preview = await trpc.content.previewContent.mutate({
  promptType: 'morning_energizer',
  customContext: {
    painPoints: ['fatigue', 'lack_of_focus'],
    goals: ['increase_energy', 'improve_productivity']
  }
})
```

### Get Content History
```typescript
// Retrieve recent content
const recentContent = await trpc.content.getRecentContent.query({
  limit: 7
})

// Get specific date's content
const content = await trpc.content.getContent.query({
  date: '2024-01-15'
})
```

### Submit Feedback
```typescript
// Submit user feedback on content
await trpc.content.submitFeedback.mutate({
  contentId: 123,
  feedback: 'positive' // or 'neutral', 'negative'
})
```

### Mark as Listened
```typescript
// Mark content as listened (updates streak)
await trpc.content.markAsListened.mutate({
  contentId: 123
})
```

## Content Personalization

The system personalizes content based on:

1. **User Profile**
   - Pain points (fatigue, confidence, motivation)
   - Goals (specific objectives)
   - Learning style (direct, gentle, tough, story)
   - Current energy level (1-10 scale)
   - Progress stage (beginner to mastery)

2. **Progress Data**
   - Current streak length
   - Total days active
   - Recent achievements
   - Broken streak recovery

3. **Contextual Factors**
   - Time of day
   - Day of week
   - Recent feedback
   - Milestone achievements

## Content Structure

Each generated script follows this structure:

1. **Personal Greeting** (75-100 words)
   - Acknowledge time of day
   - Celebrate streak/progress
   - Set positive tone

2. **Main Content** (500-600 words)
   - Address specific pain points
   - Provide actionable techniques
   - Include relevant examples/stories
   - Offer practical exercises

3. **Closing Motivation** (75-100 words)
   - Reinforce key message
   - Provide call to action
   - End with encouragement

## Database Schema

The `dailyContent` table stores:
- `title`: Content title
- `script`: Full 5-minute script
- `duration`: Length in seconds (typically 300)
- `keyPoints`: Array of main takeaways
- `stage`: User journey stage
- `tone`: Content tone (motivational, educational, etc.)
- `promptType`: Template used for generation
- `feedback`: User feedback (positive/neutral/negative)

## Error Handling

The system handles:
- Missing API keys (graceful degradation)
- API failures (retry logic)
- Content validation (length requirements)
- User context errors (default values)

## Best Practices

1. **API Key Security**
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly

2. **Content Quality**
   - Monitor user feedback
   - Regularly review generated content
   - Update templates based on user engagement

3. **Performance**
   - Cache generated content
   - Implement rate limiting
   - Use background jobs for generation

## Future Enhancements

1. **Voice Generation**
   - Integrate with TTS services
   - Support multiple voice options
   - Optimize for different accents

2. **Advanced Personalization**
   - ML-based content optimization
   - A/B testing different styles
   - Dynamic template selection

3. **Multi-language Support**
   - Translate templates
   - Localize content
   - Cultural adaptations