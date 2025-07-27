import { z } from 'zod'

// Types for AI content generation
export interface UserContext {
  userId: number
  name?: string
  painPoints: string[]
  goals: string[]
  learningStyle?: 'direct' | 'gentle' | 'tough' | 'story'
  currentLevel: number
  progressStage: 'beginner' | 'intermediate' | 'advanced' | 'mastery'
  currentStreak: number
  longestStreak: number
  totalDaysActive: number
  lastActiveDate?: Date
  recentAchievements?: string[]
  timeOfDay: 'morning' | 'afternoon' | 'evening'
  personalityType?: string
  triggers: string[]
  blockers: string[]
}

export interface GeneratedContent {
  script: string
  title: string
  duration: number // in seconds
  keyPoints: string[]
  stage: 'awareness' | 'consideration' | 'decision' | 'retention'
  tone: 'motivational' | 'educational' | 'celebratory' | 'supportive'
}

export interface AIProvider {
  generateContent(context: UserContext, promptType: string): Promise<GeneratedContent>
  validateContent(content: string): Promise<boolean>
}

// Base class for AI providers
abstract class BaseAIProvider implements AIProvider {
  protected apiKey: string
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
  }
  
  abstract generateContent(context: UserContext, promptType: string): Promise<GeneratedContent>
  
  async validateContent(content: string): Promise<boolean> {
    // Validate that content is approximately 5 minutes when read aloud
    // Average reading speed is 150-160 words per minute
    const wordCount = content.split(/\s+/).length
    const estimatedMinutes = wordCount / 155
    return estimatedMinutes >= 4.5 && estimatedMinutes <= 5.5
  }
  
  protected getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 18) return 'afternoon'
    return 'evening'
  }
  
  protected getUserStage(context: UserContext): 'awareness' | 'consideration' | 'decision' | 'retention' {
    if (context.totalDaysActive < 3) return 'awareness'
    if (context.totalDaysActive < 7) return 'consideration'
    if (context.totalDaysActive < 30) return 'decision'
    return 'retention'
  }
  
  protected calculateWordTarget(): number {
    // Target 5 minutes of content at 155 words per minute
    return 775
  }
}

// OpenAI implementation
export class OpenAIProvider extends BaseAIProvider {
  private baseURL = 'https://api.openai.com/v1'
  
  async generateContent(context: UserContext, promptType: string): Promise<GeneratedContent> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: this.buildPrompt(context, promptType),
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
    })
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    const content = JSON.parse(data.choices[0].message.content)
    
    return this.formatGeneratedContent(content, context)
  }
  
  private getSystemPrompt(): string {
    return `You are a professional motivational content creator specializing in personal development and energy management. 
    You create exactly 5-minute audio scripts (775 words) that are engaging, actionable, and personalized.
    Always respond in JSON format with the following structure:
    {
      "title": "string",
      "script": "string (exactly 775 words)",
      "keyPoints": ["string", "string", "string"],
      "tone": "motivational | educational | celebratory | supportive"
    }`
  }
  
  private buildPrompt(context: UserContext, promptType: string): string {
    const stage = this.getUserStage(context)
    const wordTarget = this.calculateWordTarget()
    
    return `Create a ${wordTarget}-word motivational audio script for:
    - Name: ${context.name || 'Friend'}
    - Stage: ${stage}
    - Pain Points: ${context.painPoints.join(', ')}
    - Goals: ${context.goals.join(', ')}
    - Learning Style: ${context.learningStyle}
    - Current Level: ${context.currentLevel}/10
    - Progress Stage: ${context.progressStage}
    - Current Streak: ${context.currentStreak} days
    - Time of Day: ${context.timeOfDay}
    - Prompt Type: ${promptType}
    
    The script should:
    1. Start with a warm, personalized greeting
    2. Acknowledge their current situation and progress
    3. Provide actionable advice tailored to their pain points
    4. Include specific exercises or techniques
    5. End with an encouraging call to action
    
    Make it conversational, engaging, and exactly ${wordTarget} words.`
  }
  
  private formatGeneratedContent(content: any, context: UserContext): GeneratedContent {
    return {
      script: content.script,
      title: content.title,
      duration: 300, // 5 minutes
      keyPoints: content.keyPoints,
      stage: this.getUserStage(context),
      tone: content.tone,
    }
  }
}

// Anthropic Claude implementation
export class AnthropicProvider extends BaseAIProvider {
  private baseURL = 'https://api.anthropic.com/v1'
  
  async generateContent(context: UserContext, promptType: string): Promise<GeneratedContent> {
    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        messages: [
          {
            role: 'user',
            content: this.buildPrompt(context, promptType),
          },
        ],
        system: this.getSystemPrompt(),
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    const content = JSON.parse(data.content[0].text)
    
    return this.formatGeneratedContent(content, context)
  }
  
  private getSystemPrompt(): string {
    return `You are a professional motivational content creator specializing in personal development and energy management. 
    You create exactly 5-minute audio scripts (775 words) that are engaging, actionable, and personalized.
    Always respond in valid JSON format with the following structure:
    {
      "title": "string",
      "script": "string (exactly 775 words)",
      "keyPoints": ["string", "string", "string"],
      "tone": "motivational | educational | celebratory | supportive"
    }
    
    Your content should be warm, personal, and actionable. Use the user's name when provided.
    Focus on practical advice and specific techniques they can implement immediately.`
  }
  
  private buildPrompt(context: UserContext, promptType: string): string {
    const stage = this.getUserStage(context)
    const wordTarget = this.calculateWordTarget()
    
    return `Create a ${wordTarget}-word motivational audio script for:
    - Name: ${context.name || 'Friend'}
    - Stage: ${stage}
    - Pain Points: ${context.painPoints.join(', ')}
    - Goals: ${context.goals.join(', ')}
    - Learning Style: ${context.learningStyle}
    - Current Level: ${context.currentLevel}/10
    - Progress Stage: ${context.progressStage}
    - Current Streak: ${context.currentStreak} days
    - Time of Day: ${context.timeOfDay}
    - Prompt Type: ${promptType}
    ${context.triggers.length > 0 ? `- Triggers to address: ${context.triggers.join(', ')}` : ''}
    ${context.blockers.length > 0 ? `- Blockers to overcome: ${context.blockers.join(', ')}` : ''}
    
    The script should:
    1. Start with a warm, personalized greeting acknowledging the time of day
    2. Celebrate their ${context.currentStreak}-day streak if > 0
    3. Address their specific pain points with empathy
    4. Provide 2-3 actionable techniques tailored to their learning style
    5. Include a specific challenge or exercise for today
    6. End with an encouraging message about their goals
    
    Style guidelines for ${context.learningStyle} learning:
    ${context.learningStyle === 'direct' ? '- Be concise and action-oriented. Get straight to the point.' : ''}
    ${context.learningStyle === 'gentle' ? '- Use encouraging language and gradual progression. Be supportive.' : ''}
    ${context.learningStyle === 'tough' ? '- Challenge them directly. Use strong, motivating language.' : ''}
    ${context.learningStyle === 'story' ? '- Include metaphors and stories. Make it narrative-driven.' : ''}
    
    The script must be exactly ${wordTarget} words. Count carefully.`
  }
  
  private formatGeneratedContent(content: any, context: UserContext): GeneratedContent {
    return {
      script: content.script,
      title: content.title,
      duration: 300, // 5 minutes
      keyPoints: content.keyPoints,
      stage: this.getUserStage(context),
      tone: content.tone,
    }
  }
}

// Factory function to create the appropriate provider
export function createAIProvider(provider: 'openai' | 'anthropic', apiKey: string): AIProvider {
  switch (provider) {
    case 'openai':
      return new OpenAIProvider(apiKey)
    case 'anthropic':
      return new AnthropicProvider(apiKey)
    default:
      throw new Error(`Unsupported AI provider: ${provider}`)
  }
}

// Content generator service
export class ContentGenerator {
  private provider: AIProvider
  
  constructor(provider: AIProvider) {
    this.provider = provider
  }
  
  async generateDailyContent(context: UserContext): Promise<GeneratedContent> {
    // Determine the appropriate prompt type based on user context
    const promptType = this.determinePromptType(context)
    
    // Generate content
    const content = await this.provider.generateContent(context, promptType)
    
    // Validate content length
    const isValid = await this.provider.validateContent(content.script)
    if (!isValid) {
      throw new Error('Generated content does not meet duration requirements')
    }
    
    return content
  }
  
  async regenerateContent(context: UserContext, feedback?: string): Promise<GeneratedContent> {
    // Use feedback to adjust the prompt type
    const promptType = feedback === 'negative' ? 'supportive_recovery' : 'standard_daily'
    
    return this.provider.generateContent(context, promptType)
  }
  
  async previewContent(context: UserContext, promptType: string): Promise<GeneratedContent> {
    return this.provider.generateContent(context, promptType)
  }
  
  private determinePromptType(context: UserContext): string {
    // Broken streak - needs encouragement
    if (context.currentStreak === 0 && context.longestStreak > 0) {
      return 'comeback_encouragement'
    }
    
    // Milestone achievements
    if (context.currentStreak % 7 === 0 && context.currentStreak > 0) {
      return 'weekly_milestone'
    }
    
    if (context.currentStreak % 30 === 0 && context.currentStreak > 0) {
      return 'monthly_milestone'
    }
    
    // Stage-based content
    const stage = this.getUserStage(context)
    switch (stage) {
      case 'awareness':
        return 'initial_assessment'
      case 'consideration':
        return 'building_habits'
      case 'decision':
        return 'deepening_practice'
      case 'retention':
        return 'mastery_refinement'
      default:
        return 'standard_daily'
    }
  }
  
  private getUserStage(context: UserContext): 'awareness' | 'consideration' | 'decision' | 'retention' {
    if (context.totalDaysActive < 3) return 'awareness'
    if (context.totalDaysActive < 7) return 'consideration'
    if (context.totalDaysActive < 30) return 'decision'
    return 'retention'
  }
}