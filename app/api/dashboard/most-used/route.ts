import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'
import { unstable_cache } from 'next/cache'
import { withQueryPerformance } from '@/lib/utils/query-performance'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create cache key
    const cacheKey = `dashboard-most-used:${user.id}`
    
    // Use Next.js cache for read operations (5 minutes TTL)
    const getCachedMostUsed = unstable_cache(
      async () => {
        return await withQueryPerformance(
          'GET /api/dashboard/most-used',
          'select',
          'dashboard',
          async () => {
            const { data: mostUsed } = await supabase
              .from('prompts')
              .select('id, title, usage_count, updated_at, description')
              .eq('user_id', user.id)
              .eq('archived', false)
              .gt('usage_count', 0)
              .order('usage_count', { ascending: false })
              .limit(5)

            return { prompts: mostUsed || [] }
          }
        )
      },
      [cacheKey],
      {
        revalidate: 300, // 5 minutes
        tags: [`dashboard-most-used-${user.id}`],
      }
    )

    const result = await getCachedMostUsed()
    return NextResponse.json(result)
  } catch (error) {
    logger.error('Dashboard most used error', error)
    return NextResponse.json(handleError(error), { status: 500 })
  }
}
