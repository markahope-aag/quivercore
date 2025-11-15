// Claude API client for prompt execution

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

export async function executePrompt(
  promptText: string,
  systemPrompt: string,
  config: ClaudeAPIConfig
): Promise<{ response: string; model: string; tokensUsed?: any }> {
  // Check rate limit
  await rateLimiter.checkLimit()

  // Validate API key
  if (!config.apiKey) {
    throw new Error('API key is required')
  }

  console.log('[API] Executing prompt:', {
    promptLength: promptText.length,
    systemPromptLength: systemPrompt.length,
    model: config.model || 'claude-3-sonnet-20240229',
    timestamp: new Date().toISOString(),
  })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-sonnet-20240229',
        max_tokens: config.maxTokens || 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: promptText,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[API] Error response:', errorData)

      if (response.status === 401) {
        throw new Error('Invalid API key')
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.')
      } else {
        throw new Error(errorData.error?.message || `API error: ${response.status}`)
      }
    }

    const data = await response.json()

    console.log('[API] Response received:', {
      model: data.model,
      stopReason: data.stop_reason,
      tokensUsed: data.usage,
      timestamp: new Date().toISOString(),
    })

    return {
      response: data.content[0].text,
      model: data.model,
      tokensUsed: data.usage,
    }
  } catch (error: any) {
    console.error('[API] Execution error:', error)

    if (error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.')
    }

    throw error
  }
}

export async function* streamResponse(
  promptText: string,
  systemPrompt: string,
  config: ClaudeAPIConfig
): AsyncGenerator<string> {
  await rateLimiter.checkLimit()

  if (!config.apiKey) {
    throw new Error('API key is required')
  }

  console.log('[API] Streaming prompt:', {
    promptLength: promptText.length,
    timestamp: new Date().toISOString(),
  })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-sonnet-20240229',
        max_tokens: config.maxTokens || 4096,
        system: systemPrompt,
        stream: true,
        messages: [
          {
            role: 'user',
            content: promptText,
          },
        ],
      }),
    })

    if (!response.ok || !response.body) {
      throw new Error(`API error: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter((line) => line.trim())

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              yield parsed.delta.text
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }
  } catch (error) {
    console.error('[API] Streaming error:', error)
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
  console.log(`[API] Rate limited. Waiting ${delay} seconds...`)
  await new Promise((resolve) => setTimeout(resolve, delay * 1000))
}
