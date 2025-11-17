import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Mistral } from '@mistralai/mistralai'
import { substituteVariables } from '@/lib/utils/prompt'
import { handleError, ErrorCodes, ApplicationError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'
import { decrypt } from '@/lib/utils/encryption'
import { getUserPlanTier } from '@/lib/utils/subscriptions'
import { hasAvailablePrompts, incrementPromptUsage } from '@/lib/usage/usage-tracking'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new ApplicationError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401)
    }

    const { id } = await params

    // Validate ID format
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new ApplicationError('Invalid prompt ID', ErrorCodes.VALIDATION_ERROR, 400)
    }

    const body = await request.json()
    const { variables, model = 'gpt-3.5-turbo', session_api_key } = body

    // Check user's plan tier and test execution limits
    const planTier = await getUserPlanTier(user.id)
    const { remaining } = await hasAvailablePrompts(user.id, planTier, 1)

    // Note: Test executions count toward monthly prompt usage
    // We allow testing even if at limit (overage will be tracked)
    logger.debug('Test execution usage check', {
      userId: user.id,
      planTier,
      remaining,
    })

    // Determine which provider is needed based on model
    let provider: string
    if (model.startsWith('claude-')) {
      provider = 'anthropic'
    } else if (model.startsWith('gemini-')) {
      provider = 'google'
    } else if (model.startsWith('mistral-') || model.startsWith('open-mistral-')) {
      provider = 'mistral'
    } else {
      provider = 'openai'
    }

    // Get API key - either from session or database
    let apiKey: string | null = null

    if (session_api_key) {
      // Use session-provided key (not saved)
      apiKey = session_api_key
    } else {
      // Try to get saved key from database
      const { data: keyData, error: keyError } = await supabase
        .from('user_api_keys')
        .select('encrypted_key')
        .eq('user_id', user.id)
        .eq('provider', provider)
        .single()

      if (keyError && keyError.code !== 'PGRST116') {
        logger.error('Failed to fetch API key', keyError)
        throw new ApplicationError('Failed to fetch API key', ErrorCodes.DATABASE_ERROR, 500, keyError)
      }

      if (keyData) {
        try {
          apiKey = decrypt(keyData.encrypted_key)
        } catch (error) {
          logger.error('Failed to decrypt API key', error)
          throw new ApplicationError(
            'Failed to decrypt API key. Please re-save your API key in settings.',
            ErrorCodes.INTERNAL_ERROR,
            500
          )
        }
      }
    }

    if (!apiKey) {
      throw new ApplicationError(
        `No ${provider} API key found. Please add your API key in Settings or provide it when testing.`,
        ErrorCodes.VALIDATION_ERROR,
        400
      )
    }

    // Get prompt
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select('id, content, user_id, usage_count')
      .eq('id', id.trim())
      .eq('user_id', user.id)
      .single()

    if (promptError || !prompt) {
      if (promptError?.code === 'PGRST116') {
        throw new ApplicationError('Prompt not found', ErrorCodes.NOT_FOUND, 404)
      }
      logger.error('Supabase query error in POST /api/prompts/[id]/test', promptError)
      throw new ApplicationError(
        'Failed to fetch prompt',
        ErrorCodes.DATABASE_ERROR,
        500,
        promptError
      )
    }

    // Substitute variables
    const finalPrompt = substituteVariables(prompt.content, variables || {})

    let response: string

    // Call appropriate API based on provider
    if (provider === 'anthropic') {
      const anthropic = new Anthropic({ apiKey })

      const completion = await anthropic.messages.create({
        model,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: finalPrompt,
          },
        ],
      })

      response = completion.content[0].type === 'text'
        ? completion.content[0].text
        : ''
    } else if (provider === 'google') {
      const genAI = new GoogleGenerativeAI(apiKey)
      const geminiModel = genAI.getGenerativeModel({ model })

      const result = await geminiModel.generateContent(finalPrompt)
      const geminiResponse = await result.response
      response = geminiResponse.text()
    } else if (provider === 'mistral') {
      const mistral = new Mistral({ apiKey })

      const completion = await mistral.chat.complete({
        model,
        messages: [
          {
            role: 'user',
            content: finalPrompt,
          },
        ],
      })

      const content = completion.choices?.[0]?.message?.content
      if (typeof content === 'string') {
        response = content
      } else if (Array.isArray(content)) {
        response = content
          .filter((chunk): chunk is { type: 'text'; text: string } => 
            typeof chunk === 'object' && chunk !== null && 'type' in chunk && chunk.type === 'text'
          )
          .map(chunk => chunk.text)
          .join('')
      } else {
        response = ''
      }
    } else {
      // OpenAI
      const openai = new OpenAI({ apiKey })

      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: finalPrompt,
          },
        ],
        temperature: 0.7,
      })

      response = completion.choices[0]?.message?.content || ''
    }

    // Save test result
    await supabase.from('prompt_tests').insert({
      prompt_id: id,
      test_input: variables || null,
      response,
      model,
    })

    // Increment usage count
    await supabase
      .from('prompts')
      .update({ usage_count: (prompt.usage_count || 0) + 1 })
      .eq('id', id)

    // Increment prompt usage after successful test execution
    await incrementPromptUsage(user.id, planTier, 1)

    return NextResponse.json({ response })
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('POST /api/prompts/[id]/test error', appError)

    // Provide helpful error messages for API key issues
    let errorMessage = appError.message
    if (appError.message.includes('API key')) {
      errorMessage = appError.message
    } else if (error instanceof Error && error.message.includes('401')) {
      errorMessage = 'Invalid API key. Please check your API key and try again.'
    }

    return NextResponse.json(
      { error: errorMessage, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}
