import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'
import { unstable_cache } from 'next/cache'
import { withQueryPerformance } from '@/lib/utils/query-performance'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const limit = Math.min(10, Math.max(1, parseInt(searchParams.get('limit') || '5', 10)))
    const featured = searchParams.get('featured') === 'true'

    // Create cache key
    const cacheKey = `dashboard-news:${category || 'all'}:${limit}:${featured}`
    
    // Use Next.js cache for read operations (5 minutes TTL)
    const getCachedNews = unstable_cache(
      async () => {
        return await withQueryPerformance(
          'GET /api/dashboard/news',
          'select',
          'news_items',
          async () => {
            let query = supabase
              .from('news_items')
              .select('id, title, excerpt, category, image_url, link_url, published_at, featured, tags')
              .eq('published', true)
              .lte('published_at', new Date().toISOString())
              .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
              .order('featured', { ascending: false })
              .order('published_at', { ascending: false })
              .limit(limit)

            if (category) {
              query = query.eq('category', category)
            }

            if (featured) {
              query = query.eq('featured', true)
            }

            const { data: newsItems } = await query

            return { news: newsItems || [] }
          }
        )
      },
      [cacheKey],
      {
        revalidate: 300, // 5 minutes
        tags: ['dashboard-news'],
      }
    )

    const result = await getCachedNews()
    return NextResponse.json(result)
  } catch (error) {
    logger.error('Dashboard news error', error)
    // If news_items table doesn't exist yet, return empty array
    if (error instanceof Error && error.message.includes('relation "news_items" does not exist')) {
      return NextResponse.json({ news: [] })
    }
    return NextResponse.json(handleError(error), { status: 500 })
  }
}
