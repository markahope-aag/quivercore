import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/openai/client'
import { handleError, ErrorCodes, ApplicationError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'
import { withQueryPerformance, measureDuration } from '@/lib/utils/query-performance'
// Search results are cached via HTTP headers only due to dynamic nature

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new ApplicationError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401)
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const searchType = searchParams.get('type') || 'hybrid' // 'keyword', 'semantic', or 'hybrid'

    if (!query || query.trim().length === 0) {
      throw new ApplicationError(
        'Query parameter is required',
        ErrorCodes.VALIDATION_ERROR,
        400
      )
    }

    // Sanitize query to prevent injection
    const sanitizedQuery = query.trim().slice(0, 500) // Limit length

    // For search, we'll use HTTP header caching since search results are highly dynamic
    let results: Array<Record<string, unknown>> = []

    // Keyword search
    if (searchType === 'keyword' || searchType === 'hybrid') {
      const { result: keywordResult } = await measureDuration('keyword search', async () => {
        return await withQueryPerformance(
          'GET /api/search (keyword)',
          'select',
          'prompts',
          async () => {
            const { data, error } = await supabase
              .from('prompts')
              .select('id, title, description, tags, use_case, framework, created_at, updated_at, similarity')
              .eq('user_id', user.id)
              .or(`title.ilike.%${sanitizedQuery}%,content.ilike.%${sanitizedQuery}%,description.ilike.%${sanitizedQuery}%`)
              .order('created_at', { ascending: false })
              .limit(20)

            if (error) {
              throw error
            }
            return data
          }
        )
      })

      if (keywordResult) {
        results = keywordResult
      }
    }

    // Semantic search
    if (searchType === 'semantic' || searchType === 'hybrid') {
      try {
        const { result: embedding, duration: embeddingDuration } = await measureDuration(
          'generate embedding',
          () => generateEmbedding(sanitizedQuery)
        )

        if (embeddingDuration > 1000) {
          logger.warn('Slow embedding generation', { duration: embeddingDuration })
        }

        const { result: semanticResult } = await measureDuration('semantic search', async () => {
          return await withQueryPerformance(
            'GET /api/search (semantic)',
            'rpc',
            'prompts',
            async () => {
              const { data, error } = await supabase.rpc(
                'match_prompts',
                {
                  query_embedding: embedding,
                  match_threshold: 0.5,
                  match_count: 20,
                  user_filter: user.id,
                }
              )

              if (error) {
                throw error
              }
              return data
            }
          )
        })

        if (semanticResult) {
          if (searchType === 'hybrid') {
            // Merge and deduplicate results
            const existingIds = new Set(results.map((r) => (r as { id: string }).id))
            const newResults = semanticResult.filter(
              (r: Record<string, unknown>) => !existingIds.has((r.id as string) || '')
            )
            results = [...results, ...newResults]
            // Sort by similarity if available, otherwise by date
            results.sort((a, b) => {
              const aSim = (a.similarity as number) || 0
              const bSim = (b.similarity as number) || 0
              if (aSim > 0 && bSim > 0) {
                return bSim - aSim
              }
              const aDate = new Date((a.created_at as string) || 0).getTime()
              const bDate = new Date((b.created_at as string) || 0).getTime()
              return bDate - aDate
            })
          } else {
            results = semanticResult
          }
        }
      } catch (error) {
        logger.error('Semantic search error:', error)
        // Fall back to keyword search if semantic fails
        if (searchType === 'semantic') {
          const { result: keywordResult } = await measureDuration('keyword fallback', async () => {
            return await withQueryPerformance(
              'GET /api/search (fallback)',
              'select',
              'prompts',
              async () => {
                const { data } = await supabase
                  .from('prompts')
                  .select('id, title, description, tags, use_case, framework, created_at, updated_at')
                  .eq('user_id', user.id)
                  .or(`title.ilike.%${sanitizedQuery}%,content.ilike.%${sanitizedQuery}%`)
                  .order('created_at', { ascending: false })
                  .limit(20)

                return data
              }
            )
          })

          if (keywordResult) {
            results = keywordResult
          }
        }
      }
    }

    return NextResponse.json(results.slice(0, 20), {
      headers: {
        'Cache-Control': 'private, s-maxage=15, stale-while-revalidate=30',
      },
    })
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('GET /api/search error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}

