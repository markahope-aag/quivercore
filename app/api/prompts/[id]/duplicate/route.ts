import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the original prompt
    const { data: original, error: fetchError } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !original) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    // Create duplicate with modified title
    const duplicateTitle = `${original.title} (Copy)`

    const { data: duplicate, error: createError } = await supabase
      .from('prompts')
      .insert({
        user_id: user.id,
        title: duplicateTitle,
        content: original.content,
        description: original.description,
        use_case: original.use_case,
        framework: original.framework,
        enhancement_technique: original.enhancement_technique,
        type: original.type,
        category: original.category,
        tags: original.tags,
        variables: original.variables,
        // Reset usage stats for duplicate
        usage_count: 0,
        is_favorite: false,
        archived: false,
        last_used_at: null,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating duplicate:', createError)
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(duplicate)
  } catch (error) {
    console.error('Error in duplicate route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
