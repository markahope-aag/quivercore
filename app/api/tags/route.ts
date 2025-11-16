import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all prompts for the user with only the tags field
    const { data: prompts, error } = await supabase
      .from('prompts')
      .select('tags')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching tags:', error)
      return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
    }

    // Extract all unique tags and count their usage
    const tagCounts = new Map<string, number>()

    prompts?.forEach((prompt) => {
      if (prompt.tags && Array.isArray(prompt.tags)) {
        prompt.tags.forEach((tag: string) => {
          const normalized = tag.toLowerCase().trim()
          if (normalized) {
            tagCounts.set(normalized, (tagCounts.get(normalized) || 0) + 1)
          }
        })
      }
    })

    // Convert to array and sort by usage count (most popular first)
    const tags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      tags: tags.map(t => t.tag),
      tagCounts: Object.fromEntries(tags.map(t => [t.tag, t.count])),
      total: tags.length,
    })
  } catch (error) {
    console.error('Error in GET /api/tags:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
