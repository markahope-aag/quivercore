import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOpenAIClient } from '@/lib/openai/client'
import { substituteVariables } from '@/lib/utils/prompt'
import { handleError, ErrorCodes, ApplicationError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'

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
    const { variables, model = 'gpt-3.5-turbo' } = body

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

    // Call OpenAI API
    const openai = createOpenAIClient()
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

    const response = completion.choices[0]?.message?.content || ''

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

    return NextResponse.json({ response })
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('POST /api/prompts/[id]/test error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}

