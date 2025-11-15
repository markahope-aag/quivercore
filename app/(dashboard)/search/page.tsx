import { Suspense } from 'react'
import { PromptList } from '@/components/prompts/prompt-list'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/openai/client'

interface SearchPageProps {
  searchParams: Promise<{ q?: string; type?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const params = await searchParams
  const query = params.q || ''
  const searchType = params.type || 'hybrid'

  let prompts: any[] = []

  if (query) {
    // Keyword search
    if (searchType === 'keyword' || searchType === 'hybrid') {
      const { data: keywordResults } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20)

      if (keywordResults) {
        prompts = keywordResults
      }
    }

    // Semantic search
    if (searchType === 'semantic' || searchType === 'hybrid') {
      try {
        const queryEmbedding = await generateEmbedding(query)

        const { data: semanticResults } = await supabase.rpc(
          'match_prompts',
          {
            query_embedding: queryEmbedding,
            match_threshold: 0.5,
            match_count: 20,
            user_filter: user.id,
          }
        )

        if (semanticResults) {
          if (searchType === 'hybrid') {
            const existingIds = new Set(prompts.map((r) => r.id))
            const newResults = semanticResults.filter((r: any) => !existingIds.has(r.id))
            prompts = [...prompts, ...newResults]
            prompts.sort((a, b) => {
              if (a.similarity && b.similarity) {
                return b.similarity - a.similarity
              }
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            })
          } else {
            prompts = semanticResults
          }
        }
      } catch (error) {
        console.error('Semantic search error:', error)
        if (searchType === 'semantic' && prompts.length === 0) {
          const { data: keywordResults } = await supabase
            .from('prompts')
            .select('*')
            .eq('user_id', user.id)
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
            .order('created_at', { ascending: false })
            .limit(20)

          if (keywordResults) {
            prompts = keywordResults
          }
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
        <p className="text-muted-foreground">
          {query ? `Found ${prompts.length} result${prompts.length !== 1 ? 's' : ''} for "${query}"` : 'Enter a search query'}
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <PromptList initialPrompts={prompts.slice(0, 20)} />
      </Suspense>
    </div>
  )
}

