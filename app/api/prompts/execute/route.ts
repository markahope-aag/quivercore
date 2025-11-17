import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleError, ErrorCodes, ApplicationError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'
import { sanitizeInput } from '@/lib/utils/sanitize'
import { executeWithRetry } from '@/lib/utils/retry'
import Anthropic from '@anthropic-ai/sdk'
import { getUserPlanTier } from '@/lib/utils/subscriptions'
import { hasAvailablePrompts, incrementPromptUsage } from '@/lib/usage/usage-tracking'
import { getOverageRate } from '@/lib/constants/overage-pricing'
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
    const model = body.model || 'claude-3-5-sonnet-20241022'
    const maxTokens = Math.min(4096, Math.max(100, parseInt(body.maxTokens || '4096', 10)))

    if (!promptText || promptText.trim().length === 0) {
      throw new ApplicationError('Prompt text is required', ErrorCodes.VALIDATION_ERROR, 400)
    }

    // Check user's plan tier and prompt execution limits
    const planTier = await getUserPlanTier(user.id)
    const { remaining } = await hasAvailablePrompts(user.id, planTier, 1)

    // Note: We allow execution even if at limit, as this counts toward monthly overage
    // The overage will be tracked and billed at end of month
    logger.debug('Prompt execution usage check', {
      userId: user.id,
      planTier,
      remaining,
    })

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

    // Execute prompt using Anthropic SDK
    logger.debug('Executing prompt via server', {
      promptLength: promptText.length,
      systemPromptLength: systemPrompt.length,
      model,
    })

    const anthropic = new Anthropic({
      apiKey: apiKey,
    })

    try {
      const message = await executeWithRetry(
        async () => {
          return anthropic.messages.create({
            model: model as Anthropic.MessageCreateParams['model'],
            max_tokens: maxTokens,
            system: systemPrompt || undefined,
            messages: [
              {
                role: 'user',
                content: promptText,
              },
            ],
          })
        },
        {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 30000,
          retryableErrors: [429, 500, 502, 503, 504],
          onRetry: (attempt, error) => {
            logger.warn(`Retrying prompt execution (attempt ${attempt})`, { error })
          },
        }
      )

      // Validate response structure
      if (!message.content || !Array.isArray(message.content) || message.content.length === 0) {
        throw new ApplicationError(
          'Invalid API response: missing content',
          ErrorCodes.EXTERNAL_API_ERROR,
          502
        )
      }

      // Extract text from content blocks
      const textContent = message.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('')

      if (!textContent) {
        throw new ApplicationError(
          'Invalid API response: no text content',
          ErrorCodes.EXTERNAL_API_ERROR,
          502
        )
      }

      logger.debug('Prompt executed successfully', {
        model: message.model,
        stopReason: message.stop_reason,
        tokensUsed: message.usage,
      })

      // Increment prompt usage after successful execution
      await incrementPromptUsage(user.id, planTier, 1)

      return NextResponse.json({
        response: textContent,
        model: message.model,
        tokensUsed: message.usage,
      })
    } catch (error: unknown) {
      // Handle Anthropic SDK errors
      if (error instanceof Anthropic.APIError) {
        logger.error('Anthropic API error', {
          status: error.status,
          message: error.message,
          error: error.error,
        })

        if (error.status === 401) {
          throw new ApplicationError(
            'Invalid API key configuration',
            ErrorCodes.EXTERNAL_API_ERROR,
            502
          )
        } else if (error.status === 429) {
          throw new ApplicationError(
            'Rate limit exceeded. Please try again later.',
            ErrorCodes.RATE_LIMIT_EXCEEDED,
            429
          )
        } else {
          throw new ApplicationError(
            error.message || `API error: ${error.status}`,
            ErrorCodes.EXTERNAL_API_ERROR,
            502
          )
        }
      }
      // Re-throw if it's not an Anthropic error
      throw error
    }
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('POST /api/prompts/execute error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}

