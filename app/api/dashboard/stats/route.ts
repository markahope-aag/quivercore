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
    const cacheKey = `dashboard-stats:${user.id}`
    
    // Use Next.js cache for read operations (30 seconds TTL)
    const getCachedStats = unstable_cache(
      async () => {
        return await withQueryPerformance(
          'GET /api/dashboard/stats',
          'select',
          'dashboard',
          async () => {
            // Get total prompts
            const { count: totalPrompts } = await supabase
              .from('prompts')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('archived', false)

            // Get prompts this month
            const startOfMonth = new Date()
            startOfMonth.setDate(1)
            startOfMonth.setHours(0, 0, 0, 0)

            const { count: promptsThisMonth } = await supabase
              .from('prompts')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('archived', false)
              .gte('created_at', startOfMonth.toISOString())

            // Get most used prompt
            const { data: mostUsedPrompt } = await supabase
              .from('prompts')
              .select('id, title, usage_count')
              .eq('user_id', user.id)
              .eq('archived', false)
              .gt('usage_count', 0)
              .order('usage_count', { ascending: false })
              .limit(1)
              .single()

            // Get subscription info
            const { data: subscription } = await supabase
              .from('user_subscriptions')
              .select(`
                id,
                status,
                subscription_plans (
                  id,
                  display_name,
                  price_monthly,
                  features
                )
              `)
              .eq('user_id', user.id)
              .in('status', ['active', 'trialing'])
              .order('created_at', { ascending: false })
              .limit(1)
              .single()

            // Get usage stats for current month
            const { data: usageStats } = await supabase
              .from('usage_tracking')
              .select('metric_type, count')
              .eq('user_id', user.id)
              .gte('period_start', startOfMonth.toISOString())

            const usageByType: Record<string, number> = {}
            if (usageStats) {
              usageStats.forEach((stat) => {
                usageByType[stat.metric_type] = (usageByType[stat.metric_type] || 0) + stat.count
              })
            }

            return {
              totalPrompts: totalPrompts || 0,
              promptsThisMonth: promptsThisMonth || 0,
              mostUsedPrompt: mostUsedPrompt || null,
              subscription: subscription || null,
              usage: {
                promptExecutions: usageByType['prompt_execution'] || 0,
                promptsCreated: usageByType['prompt_created'] || 0,
                apiCalls: usageByType['api_call'] || 0,
              },
            }
          }
        )
      },
      [cacheKey],
      {
        revalidate: 30, // 30 seconds
        tags: [`dashboard-stats-${user.id}`],
      }
    )

    const stats = await getCachedStats()
    return NextResponse.json(stats)
  } catch (error) {
    logger.error('Dashboard stats error', error)
    return NextResponse.json(handleError(error), { status: 500 })
  }
}
