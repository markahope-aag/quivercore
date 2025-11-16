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

    // Increment usage_count and update last_used_at
    const { data, error } = await supabase.rpc('increment_prompt_usage', {
      prompt_id: params.id,
      user_id: user.id,
    })

    if (error) {
      // If RPC doesn't exist, fall back to direct update
      console.warn('RPC function not found, using direct update')

      const { data: prompt, error: fetchError } = await supabase
        .from('prompts')
        .select('usage_count')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

      if (fetchError || !prompt) {
        return NextResponse.json(
          { error: 'Prompt not found' },
          { status: 404 }
        )
      }

      const { data: updated, error: updateError } = await supabase
        .from('prompts')
        .update({
          usage_count: (prompt.usage_count || 0) + 1,
          last_used_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating prompt usage:', updateError)
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        )
      }

      return NextResponse.json(updated)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in use route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
