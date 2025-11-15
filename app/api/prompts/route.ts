import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/openai/client'
import { generateSearchableText, extractVariables } from '@/lib/utils/prompt'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const favorite = searchParams.get('favorite')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')

    let query = supabase
      .from('prompts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (favorite === 'true') {
      query = query.eq('is_favorite', true)
    }

    if (type) {
      query = query.eq('type', type)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (tag) {
      query = query.contains('tags', [tag])
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('GET /api/prompts error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, type, category, tags, description } = body

    // Extract variables from content
    const variables = extractVariables(content)
    const variablesObj = variables.reduce((acc, v) => {
      acc[v] = ''
      return acc
    }, {} as Record<string, string>)

    // Generate embedding for semantic search
    const searchableText = generateSearchableText(title, content, description, tags)
    let embedding: number[] | null = null

    try {
      embedding = await generateEmbedding(searchableText)
    } catch (error) {
      console.error('Failed to generate embedding:', error)
      // Continue without embedding - user can still use keyword search
    }

    // Create prompt
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .insert({
        user_id: user.id,
        title,
        content,
        type: type || 'ai_prompt',
        category: category || null,
        tags: tags || [],
        description: description || null,
        variables: Object.keys(variablesObj).length > 0 ? variablesObj : null,
        embedding: embedding || null,
      })
      .select()
      .single()

    if (promptError) {
      return NextResponse.json({ error: promptError.message }, { status: 500 })
    }

    // Create initial version
    await supabase.from('prompt_versions').insert({
      prompt_id: prompt.id,
      content,
      version_number: 1,
    })

    return NextResponse.json(prompt, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/prompts error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

