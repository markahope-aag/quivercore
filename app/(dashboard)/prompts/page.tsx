import { createClient } from '@/lib/supabase/server'
import { PromptList } from '@/components/prompts/prompt-list'
import { PromptFilters } from '@/components/prompts/prompt-filters'
import { PaginationControls } from '@/components/prompts/pagination-controls'
import { Suspense } from 'react'
import { logger } from '@/lib/utils/logger'
import { sanitizeInput } from '@/lib/utils/sanitize'

interface PromptsPageProps {
  searchParams: Promise<{ 
    favorite?: string
    recent?: string
    type?: string
    category?: string
    tag?: string
    q?: string
    view?: string
    page?: string
    limit?: string
  }>
}

export default async function PromptsPage({ searchParams }: PromptsPageProps) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const params = await searchParams
    const favorite = params.favorite === 'true'
    const recent = params.recent === 'true'
    const type = params.type ? sanitizeInput(params.type, 200) : undefined
    const category = params.category ? sanitizeInput(params.category, 200) : undefined
    const tag = params.tag ? sanitizeInput(params.tag, 100) : undefined
    const searchQuery = params.q ? sanitizeInput(params.q, 500) : undefined
    
    // Pagination
    const page = Math.max(1, parseInt(params.page || '1', 10))
    const limit = Math.min(50, Math.max(10, parseInt(params.limit || '20', 10)))
    const offset = (page - 1) * limit

    // Build server-side query with all filters
    // Select only fields needed for list/card display to optimize performance
    let query = supabase
      .from('prompts')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    // Apply filters
    if (favorite) {
      query = query.eq('is_favorite', true)
    }

    if (type) {
      query = query.eq('use_case', type)
    }

    if (category) {
      query = query.eq('framework', category)
    }

    if (tag) {
      query = query.contains('tags', [tag])
    }

    // Server-side search using Supabase text search
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
    }

    // Ordering
    if (recent) {
      query = query.order('updated_at', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data: prompts, error, count } = await query

    if (error) {
      logger.error('Error fetching prompts', error)
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Prompts</h1>
            <p className="text-muted-foreground text-destructive">
              Error loading prompts: {error.message}
            </p>
          </div>
        </div>
      )
    }

    const totalPrompts = count || 0
    const totalPages = Math.ceil(totalPrompts / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {favorite ? 'Favorite Prompts' : recent ? 'Recent Prompts' : 'All Prompts'}
        </h1>
        <p className="text-muted-foreground">
          {totalPrompts} prompt{totalPrompts !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>
      
      <Suspense fallback={<div>Loading...</div>}>
        <PromptFilters />
      </Suspense>
      
      <Suspense fallback={<div>Loading...</div>}>
        <PromptList 
          initialPrompts={prompts || []} 
          viewMode={(params.view as 'grid' | 'list') || 'grid'}
        />
      </Suspense>

      <PaginationControls 
        currentPage={page}
        totalPages={totalPages}
        totalPrompts={totalPrompts}
        limit={limit}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />
    </div>
  )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('PromptsPage error:', error)
    }
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Prompts</h1>
          <p className="text-muted-foreground text-destructive">
            An error occurred: {errorMessage}
          </p>
        </div>
      </div>
    )
  }
}

