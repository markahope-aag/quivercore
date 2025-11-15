/**
 * Claude API client for prompt execution
 * 
 * Provides functions for executing prompts with the Anthropic Claude API,
 * including retry logic, rate limiting, and error handling.
 * 
 * @module lib/utils/api-client
 */

import Anthropic from '@anthropic-ai/sdk'
import { logger } from './logger'
import { executeWithRetry } from './retry'

interface ClaudeAPIConfig {
  apiKey: string
  model?: string
  maxTokens?: number
}

interface VSResponse {
  responses: Array<{
    content: string
    probability?: number
    rationale?: string
    category?: string
  }>
  rawResponse: string
}

class RateLimiter {
  private requests: number[] = []
  private maxRequests = 50
  private timeWindow = 60000 // 1 minute

  async checkLimit(): Promise<void> {
    const now = Date.now()
    this.requests = this.requests.filter((time) => now - time < this.timeWindow)

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0]
      const waitTime = this.timeWindow - (now - oldestRequest)
      throw new Error(`Rate limit exceeded. Retry after ${Math.ceil(waitTime / 1000)} seconds.`)
    }

    this.requests.push(now)
  }
}

const rateLimiter = new RateLimiter()

/**
 * Executes a prompt using the Anthropic Claude API with retry logic.
 * 
 * @param promptText - The user's prompt text to send to Claude
 * @param systemPrompt - Optional system prompt for context and instructions
 * @param config - API configuration including API key, model, and max tokens
 * @returns Promise resolving to the API response with text content, model used, and token usage
 * @throws {Error} If API key is missing, rate limit exceeded, or API call fails
 * 
 * @example
 * ```typescript
 * const result = await executePrompt(
 *   'Write a blog post about AI',
 *   'You are a professional writer',
 *   {
 *     apiKey: 'sk-ant-...',
 *     model: 'claude-3-sonnet-20240229',
 *     maxTokens: 4096
 *   }
 * )
 * console.log(result.response) // The generated text
 * ```
 */
export async function executePrompt(
  promptText: string,
  systemPrompt: string,
  config: ClaudeAPIConfig
): Promise<{ response: string; model: string; tokensUsed?: { input_tokens: number; output_tokens: number } }> {
  // Check rate limit
  await rateLimiter.checkLimit()

  // Validate API key
  if (!config.apiKey) {
    throw new Error('API key is required')
  }

  logger.debug('Executing prompt', {
    promptLength: promptText.length,
    systemPromptLength: systemPrompt.length,
    model: config.model || 'claude-3-sonnet-20240229',
  })

  return executeWithRetry(
    async () => {
      const anthropic = new Anthropic({
        apiKey: config.apiKey,
      })

      const message = await anthropic.messages.create({
        model: (config.model || 'claude-3-sonnet-20240229') as Anthropic.MessageCreateParams['model'],
        max_tokens: config.maxTokens || 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: promptText,
          },
        ],
      })

      logger.debug('API response received', {
        model: message.model,
        stopReason: message.stop_reason,
        tokensUsed: message.usage,
      })

      // Validate response structure
      if (!message.content || !Array.isArray(message.content) || message.content.length === 0) {
        throw new Error('Invalid API response: missing content')
      }

      // Extract text from content blocks
      const textContent = message.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('')

      if (!textContent) {
        throw new Error('Invalid API response: no text content')
      }

      return {
        response: textContent,
        model: message.model,
        tokensUsed: message.usage,
      }
    },
    {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      retryableErrors: [429, 500, 502, 503, 504],
      onRetry: (attempt, error) => {
        logger.warn(`Retrying API call (attempt ${attempt})`, { error })
      },
    }
  ).catch((error: unknown) => {
    logger.error('API execution error', error)

    // Handle Anthropic SDK errors
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        throw new Error('Invalid API key')
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.')
      } else {
        throw new Error(error.message || `API error: ${error.status}`)
      }
    }

    if (error instanceof Error && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.')
    }

    throw error
  })
}

/**
 * Streams a prompt response from the Anthropic Claude API.
 * 
 * Yields text chunks as they are generated, allowing for real-time display
 * of the AI's response.
 * 
 * @param promptText - The user's prompt text to send to Claude
 * @param systemPrompt - Optional system prompt for context and instructions
 * @param config - API configuration including API key, model, and max tokens
 * @yields {string} Text chunks as they are generated
 * @throws {Error} If API key is missing, rate limit exceeded, or API call fails
 * 
 * @example
 * ```typescript
 * for await (const chunk of streamResponse(
 *   'Write a story',
 *   'You are a creative writer',
 *   { apiKey: 'sk-ant-...', model: 'claude-3-sonnet-20240229' }
 * )) {
 *   console.log(chunk) // Display each chunk as it arrives
 * }
 * ```
 */
export async function* streamResponse(
  promptText: string,
  systemPrompt: string,
  config: ClaudeAPIConfig
): AsyncGenerator<string> {
  await rateLimiter.checkLimit()

  if (!config.apiKey) {
    throw new Error('API key is required')
  }

  logger.debug('Streaming prompt', {
    promptLength: promptText.length,
  })

  try {
    const anthropic = new Anthropic({
      apiKey: config.apiKey,
    })

    const stream = await anthropic.messages.stream({
      model: (config.model || 'claude-3-sonnet-20240229') as Anthropic.MessageStreamParams['model'],
      max_tokens: config.maxTokens || 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: promptText,
        },
      ],
    })

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text
      }
    }
  } catch (error: unknown) {
    logger.error('API streaming error', error)

    // Handle Anthropic SDK errors
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        throw new Error('Invalid API key')
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.')
      } else {
        throw new Error(error.message || `API error: ${error.status}`)
      }
    }

    throw error
  }
}

export function parseVSResponse(response: string): VSResponse {
  const lines = response.split('\n').filter((line) => line.trim())
  const responses: VSResponse['responses'] = []

  // Regex patterns for different VS formats
  const patterns = {
    // [Response] (Probability: 0.XX - Rationale: [explanation])
    fullFormat: /^(.+?)\s*\(Probability:\s*(0\.\d+)\s*-\s*(?:Rationale|Why rare):\s*(.+?)\)$/i,
    // [Response] (Probability: 0.XX)
    simpleFormat: /^(.+?)\s*\(Probability:\s*(0\.\d+)\)$/i,
    // Category: [X] | [Response] (Probability: 0.XX - Category fit: [explanation])
    categoryFormat:
      /^Category:\s*(.+?)\s*\|\s*(.+?)\s*\(Probability:\s*(0\.\d+)(?:\s*-\s*Category fit:\s*(.+?))?\)$/i,
  }

  for (const line of lines) {
    // Try category format first
    let match = line.match(patterns.categoryFormat)
    if (match) {
      responses.push({
        content: match[2].trim(),
        probability: parseFloat(match[3]),
        rationale: match[4]?.trim(),
        category: match[1].trim(),
      })
      continue
    }

    // Try full format
    match = line.match(patterns.fullFormat)
    if (match) {
      responses.push({
        content: match[1].trim(),
        probability: parseFloat(match[2]),
        rationale: match[3].trim(),
      })
      continue
    }

    // Try simple format
    match = line.match(patterns.simpleFormat)
    if (match) {
      responses.push({
        content: match[1].trim(),
        probability: parseFloat(match[2]),
      })
      continue
    }

    // Fallback: treat as plain content if no match
    if (line.trim().length > 10) {
      // Only add substantial lines
      responses.push({
        content: line.trim(),
      })
    }
  }

  return {
    responses,
    rawResponse: response,
  }
}

export function validatePromptConfiguration(config: {
  basePrompt: string
  framework: string
  vsEnabled: boolean
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.basePrompt || config.basePrompt.trim().length === 0) {
    errors.push('Base prompt is required')
  }

  if (config.basePrompt && config.basePrompt.length > 50000) {
    errors.push('Base prompt is too long (max 50,000 characters)')
  }

  if (!config.framework) {
    errors.push('Framework selection is required')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export async function handleRateLimit(retryAfter?: number): Promise<void> {
  const delay = retryAfter || 60
  logger.warn(`Rate limited. Waiting ${delay} seconds...`)
  await new Promise((resolve) => setTimeout(resolve, delay * 1000))
}
