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
    const cacheKey = `dashboard-recent-activity:${user.id}`
    
    // Use Next.js cache for read operations (60 seconds TTL)
    const getCachedActivity = unstable_cache(
      async () => {
        return await withQueryPerformance(
          'GET /api/dashboard/recent-activity',
          'select',
          'dashboard',
          async () => {
            // Get recent prompts (created or updated)
            const { data: recentPrompts } = await supabase
              .from('prompts')
              .select('id, title, created_at, updated_at, usage_count')
              .eq('user_id', user.id)
              .eq('archived', false)
              .order('updated_at', { ascending: false })
              .limit(10)

            // Format activity items
            const activities = (recentPrompts || []).map((prompt) => {
              const isNew = new Date(prompt.created_at).getTime() > new Date(prompt.updated_at).getTime() - 60000 // Created within 1 min of update
              return {
                id: prompt.id,
                title: prompt.title,
                type: isNew ? 'created' : 'updated',
                timestamp: isNew ? prompt.created_at : prompt.updated_at,
                usageCount: prompt.usage_count,
              }
            })

            return { activities }
          }
        )
      },
      [cacheKey],
      {
        revalidate: 60, // 60 seconds
        tags: [`dashboard-activity-${user.id}`],
      }
    )

    const result = await getCachedActivity()
    return NextResponse.json(result)
  } catch (error) {
    logger.error('Dashboard recent activity error', error)
    return NextResponse.json(handleError(error), { status: 500 })
  }
}
