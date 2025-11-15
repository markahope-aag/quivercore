import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOpenAIClient } from '@/lib/openai/client'
import { substituteVariables } from '@/lib/utils/prompt'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { variables, model = 'gpt-3.5-turbo' } = body

    // Get prompt
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (promptError || !prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

