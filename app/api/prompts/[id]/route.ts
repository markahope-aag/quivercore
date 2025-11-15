import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/openai/client'
import { generateSearchableText, extractVariables } from '@/lib/utils/prompt'

export async function GET(
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

    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    const { title, content, type, category, tags, description, is_favorite } = body

    // Get current prompt to save version
    const { data: currentPrompt } = await supabase
      .from('prompts')
      .select('content, title, description, tags')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    // Get latest version number
    const { data: versions } = await supabase
      .from('prompt_versions')
      .select('version_number')
      .eq('prompt_id', id)
      .order('version_number', { ascending: false })
      .limit(1)

    const nextVersion = versions && versions.length > 0 
      ? versions[0].version_number + 1 
      : 1

    // Save previous version if content changed
    if (currentPrompt && content && content !== currentPrompt.content) {
      await supabase.from('prompt_versions').insert({
        prompt_id: id,
        content: currentPrompt.content,
        version_number: nextVersion - 1,
      })
    }

    // Extract variables from content
    const variables = extractVariables(content || currentPrompt?.content || '')
    const variablesObj = variables.reduce((acc, v) => {
      acc[v] = ''
      return acc
    }, {} as Record<string, string>)

    // Generate new embedding if content changed
    let embedding: number[] | null = null
    if (content || title || description || tags) {
      const searchableText = generateSearchableText(
        title || currentPrompt?.title || '',
        content || currentPrompt?.content || '',
        description,
        tags
      )
      try {
        embedding = await generateEmbedding(searchableText)
      } catch (error) {
        console.error('Failed to generate embedding:', error)
      }
    }

    // Update prompt
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (type !== undefined) updateData.type = type
    if (category !== undefined) updateData.category = category
    if (tags !== undefined) updateData.tags = tags
    if (description !== undefined) updateData.description = description
    if (is_favorite !== undefined) updateData.is_favorite = is_favorite
    if (embedding) updateData.embedding = embedding
    if (Object.keys(variablesObj).length > 0) {
      updateData.variables = variablesObj
    } else if (variables.length === 0) {
      updateData.variables = null
    }

    const { data, error } = await supabase
      .from('prompts')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

