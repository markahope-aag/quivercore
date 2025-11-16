import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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
    const { rating, comment } = body

    if (!rating || !comment || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating or comment' },
        { status: 400 }
      )
    }

    // Get user profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', user.id)
      .single()

    const userName = profile?.full_name || profile?.username || 'Anonymous'

    // Get template metadata ID
    const { data: metadata } = await supabase
      .from('template_metadata')
      .select('id')
      .eq('prompt_id', id)
      .single()

    if (!metadata) {
      return NextResponse.json(
        { error: 'Template metadata not found' },
        { status: 404 }
      )
    }

    // Insert comment
    const { data: newComment, error } = await supabase
      .from('template_comments')
      .insert({
        template_metadata_id: metadata.id,
        user_id: user.id,
        user_name: userName,
        content: comment,
        rating: rating,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to insert comment:', error)
      return NextResponse.json(
        { error: 'Failed to submit review' },
        { status: 500 }
      )
    }

    // Update usage count
    await supabase.rpc('increment_template_usage', {
      template_metadata_id: metadata.id,
    })

    return NextResponse.json(newComment, { status: 201 })
  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Get template metadata ID
    const { data: metadata } = await supabase
      .from('template_metadata')
      .select('id')
      .eq('prompt_id', id)
      .single()

    if (!metadata) {
      return NextResponse.json(
        { error: 'Template metadata not found' },
        { status: 404 }
      )
    }

    // Get comments
    const { data: comments, error } = await supabase
      .from('template_comments')
      .select('*')
      .eq('template_metadata_id', metadata.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch comments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      )
    }

    return NextResponse.json(comments || [])
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

