import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleError, ErrorCodes, ApplicationError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'
import { sanitizeInput } from '@/lib/utils/sanitize'
// Rate limiting is handled by Next.js middleware, not needed here

/**
 * Server-side API route for executing prompts securely.
 * Uses server-side API keys from environment variables.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new ApplicationError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401)
    }

    const body = await request.json()
    
    // Validate and sanitize inputs
    const promptText = sanitizeInput(body.promptText || '', 50000)
    const systemPrompt = sanitizeInput(body.systemPrompt || '', 10000)
    const model = body.model || 'claude-3-sonnet-20240229'
    const maxTokens = Math.min(4096, Math.max(100, parseInt(body.maxTokens || '4096', 10)))

    if (!promptText || promptText.trim().length === 0) {
      throw new ApplicationError('Prompt text is required', ErrorCodes.VALIDATION_ERROR, 400)
    }

    // Get API key from environment (server-side only)
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      logger.error('ANTHROPIC_API_KEY not configured')
      throw new ApplicationError(
        'API key not configured. Please contact support.',
        ErrorCodes.INTERNAL_ERROR,
        500
      )
    }

    // Execute prompt using Anthropic API
    logger.debug('Executing prompt via server', {
      promptLength: promptText.length,
      systemPromptLength: systemPrompt.length,
      model,
    })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: systemPrompt || undefined,
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
      logger.error('Anthropic API error', { status: response.status, errorData })

      if (response.status === 401) {
        throw new ApplicationError(
          'Invalid API key configuration',
          ErrorCodes.EXTERNAL_API_ERROR,
          502
        )
      } else if (response.status === 429) {
        throw new ApplicationError(
          'Rate limit exceeded. Please try again later.',
          ErrorCodes.RATE_LIMIT_EXCEEDED,
          429
        )
      } else {
        throw new ApplicationError(
          errorData.error?.message || `API error: ${response.status}`,
          ErrorCodes.EXTERNAL_API_ERROR,
          502
        )
      }
    }

    const data = await response.json()

    // Validate response structure
    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      throw new ApplicationError(
        'Invalid API response: missing content',
        ErrorCodes.EXTERNAL_API_ERROR,
        502
      )
    }

    logger.debug('Prompt executed successfully', {
      model: data.model,
      stopReason: data.stop_reason,
      tokensUsed: data.usage,
    })

    return NextResponse.json({
      response: data.content[0].text,
      model: data.model,
      tokensUsed: data.usage,
    })
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('POST /api/prompts/execute error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}

