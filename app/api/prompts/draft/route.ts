import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleError, ErrorCodes, ApplicationError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'
import { sanitizeInput } from '@/lib/utils/sanitize'
import { executeWithRetry } from '@/lib/utils/retry'
import Anthropic from '@anthropic-ai/sdk'

/**
 * API route for generating prompt drafts using AI
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new ApplicationError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401)
    }

    const body = await request.json()

    // Validate inputs
    const targetOutcome = sanitizeInput(body.targetOutcome || '', 1000)
    const domain = sanitizeInput(body.domain || '', 100)
    const framework = sanitizeInput(body.framework || '', 100)

    if (!framework) {
      throw new ApplicationError('Framework is required', ErrorCodes.VALIDATION_ERROR, 400)
    }

    if (!targetOutcome) {
      throw new ApplicationError('Target outcome is required', ErrorCodes.VALIDATION_ERROR, 400)
    }

    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      logger.error('ANTHROPIC_API_KEY not configured')
      throw new ApplicationError(
        'API key not configured. Please contact support.',
        ErrorCodes.INTERNAL_ERROR,
        500
      )
    }

    // Build the prompt for draft generation
    const frameworkName = framework
    const domainText = domain ? ` in the ${domain} domain` : ''
    const draftRequest = `Write a well-structured ${frameworkName} prompt for: ${targetOutcome}${domainText}.

The prompt should:
- Follow ${frameworkName} framework best practices
- Be clear, specific, and actionable
- Include relevant context and constraints
- Be ready to use as a starting point (user will customize it)

Generate only the prompt text, no explanations or meta-commentary.`

    logger.debug('Generating prompt draft', {
      framework,
      domain,
      targetOutcomeLength: targetOutcome.length,
    })

    const anthropic = new Anthropic({
      apiKey: apiKey,
    })

    try {
      const message = await executeWithRetry(
        async () => {
          return anthropic.messages.create({
            model: 'claude-3-sonnet-20240229' as Anthropic.MessageCreateParams['model'],
            max_tokens: 2000,
            messages: [
              {
                role: 'user',
                content: draftRequest,
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
            logger.warn(`Retrying draft generation (attempt ${attempt})`, { error })
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

      logger.debug('Draft generated successfully', {
        model: message.model,
        draftLength: textContent.length,
      })

      return NextResponse.json({
        draft: textContent.trim(),
        model: message.model,
      })
    } catch (error: unknown) {
      // Handle Anthropic SDK errors
      if (error instanceof Anthropic.APIError) {
        logger.error('Anthropic API error', {
          status: error.status,
          message: error.message,
        })
        throw new ApplicationError(
          `AI service error: ${error.message}`,
          ErrorCodes.EXTERNAL_API_ERROR,
          error.status || 502
        )
      }
      throw error
    }
  } catch (error: unknown) {
    const appError = handleError(error)
    return NextResponse.json(
      {
        error: appError.message,
        code: appError.code,
      },
      { status: appError.statusCode || 500 }
    )
  }
}

