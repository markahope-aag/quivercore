import { createClient } from '@/lib/supabase/server'
import { PromptList } from '@/components/prompts/prompt-list'
import { PromptFilters } from '@/components/prompts/prompt-filters'
import { Suspense } from 'react'

interface PromptsPageProps {
  searchParams: Promise<{ 
    favorite?: string
    recent?: string
    type?: string
    category?: string
    tag?: string
    q?: string
    view?: string
  }>
}

export default async function PromptsPage({ searchParams }: PromptsPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const params = await searchParams
  const favorite = params.favorite === 'true'
  const recent = params.recent === 'true'
  const type = params.type
  const category = params.category
  const tag = params.tag
  const searchQuery = params.q

  // Get all prompts for filters (we'll filter client-side for search)
  let query = supabase
    .from('prompts')
    .select('*')
    .eq('user_id', user.id)

  if (favorite) {
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

  if (recent) {
    query = query.order('updated_at', { ascending: false }).limit(20)
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: prompts } = await query

  // Filter by search query if provided
  let filteredPrompts = prompts || []
  if (searchQuery) {
    const queryLower = searchQuery.toLowerCase()
    filteredPrompts = filteredPrompts.filter(
      (p) =>
        p.title.toLowerCase().includes(queryLower) ||
        p.content.toLowerCase().includes(queryLower) ||
        p.description?.toLowerCase().includes(queryLower) ||
        p.tags?.some((t) => t.toLowerCase().includes(queryLower))
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {favorite ? 'Favorite Prompts' : recent ? 'Recent Prompts' : 'All Prompts'}
        </h1>
        <p className="text-muted-foreground">
          {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>
      
      <Suspense fallback={<div>Loading...</div>}>
        <PromptFilters prompts={prompts || []} />
      </Suspense>
      
      <Suspense fallback={<div>Loading...</div>}>
        <PromptList 
          initialPrompts={filteredPrompts} 
          viewMode={(params.view as 'grid' | 'list') || 'grid'}
        />
      </Suspense>
    </div>
  )
}

