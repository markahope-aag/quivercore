import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/openai/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const searchType = searchParams.get('type') || 'hybrid' // 'keyword', 'semantic', or 'hybrid'

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
    }

    let results: any[] = []

    // Keyword search
    if (searchType === 'keyword' || searchType === 'hybrid') {
      const { data: keywordResults, error: keywordError } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!keywordError && keywordResults) {
        results = keywordResults
      }
    }

    // Semantic search
    if (searchType === 'semantic' || searchType === 'hybrid') {
      try {
        const queryEmbedding = await generateEmbedding(query)

        const { data: semanticResults, error: semanticError } = await supabase.rpc(
          'match_prompts',
          {
            query_embedding: queryEmbedding,
            match_threshold: 0.5,
            match_count: 20,
            user_filter: user.id,
          }
        )

        if (!semanticError && semanticResults) {
          if (searchType === 'hybrid') {
            // Merge and deduplicate results
            const existingIds = new Set(results.map((r) => r.id))
            const newResults = semanticResults.filter((r: any) => !existingIds.has(r.id))
            results = [...results, ...newResults]
            // Sort by similarity if available, otherwise by date
            results.sort((a, b) => {
              if (a.similarity && b.similarity) {
                return b.similarity - a.similarity
              }
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            })
          } else {
            results = semanticResults
          }
        }
      } catch (error) {
        console.error('Semantic search error:', error)
        // Fall back to keyword search if semantic fails
        if (searchType === 'semantic') {
          const { data: keywordResults } = await supabase
            .from('prompts')
            .select('*')
            .eq('user_id', user.id)
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
            .order('created_at', { ascending: false })
            .limit(20)

          if (keywordResults) {
            results = keywordResults
          }
        }
      }
    }

    return NextResponse.json(results.slice(0, 20))
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

