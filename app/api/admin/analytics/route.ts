import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/admin'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin() // Check admin access

    const supabase = await createClient()

    // Get user growth (signups per month for last 12 months)
    const { data: users } = await supabase
      .from('user_profiles')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())

    const signupsByMonth: Record<string, number> = {}
    if (users) {
      users.forEach((u) => {
        const month = new Date(u.created_at).toISOString().slice(0, 7)
        signupsByMonth[month] = (signupsByMonth[month] || 0) + 1
      })
    }

    // Get retention cohorts (simplified - users still active after 30 days)
    const { data: cohortData } = await supabase
      .from('user_profiles')
      .select('created_at, last_sign_in_at')
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

    const cohorts: Record<string, { total: number; retained: number }> = {}
    if (cohortData) {
      cohortData.forEach((u) => {
        const cohortMonth = new Date(u.created_at).toISOString().slice(0, 7)
        if (!cohorts[cohortMonth]) {
          cohorts[cohortMonth] = { total: 0, retained: 0 }
        }
        cohorts[cohortMonth].total++

        if (u.last_sign_in_at) {
          const daysSinceSignup = (new Date(u.last_sign_in_at).getTime() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24)
          if (daysSinceSignup >= 30) {
            cohorts[cohortMonth].retained++
          }
        }
      })
    }

    // Calculate retention rates
    const retentionRates: Record<string, number> = {}
    Object.entries(cohorts).forEach(([month, data]) => {
      retentionRates[month] = data.total > 0 ? (data.retained / data.total) * 100 : 0
    })

    // Get conversion funnel (signup -> first prompt -> subscription)
    const { data: allUsers, count: totalUsers } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact' })

    const { data: usersWithPrompts, count: usersCreatedPrompt } = await supabase
      .from('prompts')
      .select('user_id', { count: 'exact', head: true })

    const { data: subscribedUsers, count: usersSubscribed } = await supabase
      .from('user_subscriptions')
      .select('user_id', { count: 'exact' })
      .in('status', ['active', 'trialing'])

    // Get average prompts per user by plan
    const { data: promptsByPlan } = await supabase
      .from('user_subscriptions')
      .select(`
        subscription_plans (display_name),
        user_id
      `)
      .in('status', ['active', 'trialing'])

    const planPromptCounts: Record<string, { users: Set<string>; totalPrompts: number }> = {}
    if (promptsByPlan) {
      for (const sub of promptsByPlan) {
        const planName = (sub.subscription_plans as any)?.display_name || 'Unknown'
        if (!planPromptCounts[planName]) {
          planPromptCounts[planName] = { users: new Set(), totalPrompts: 0 }
        }
        planPromptCounts[planName].users.add(sub.user_id)

        const { count } = await supabase
          .from('prompts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', sub.user_id)

        planPromptCounts[planName].totalPrompts += count || 0
      }
    }

    const avgPromptsByPlan: Record<string, number> = {}
    Object.entries(planPromptCounts).forEach(([plan, data]) => {
      avgPromptsByPlan[plan] = data.users.size > 0 ? data.totalPrompts / data.users.size : 0
    })

    // Calculate engagement metrics
    // 1. Average assets per user (all users)
    const { data: allPrompts, count: totalPromptsCount } = await supabase
      .from('prompts')
      .select('user_id', { count: 'exact', head: true })
      .eq('archived', false)

    const avgAssetsPerUser = totalUsers && totalUsers > 0 ? (totalPromptsCount || 0) / totalUsers : 0

    // 2. Average assets per user by plan
    const avgAssetsByPlan: Record<string, number> = {}
    Object.entries(planPromptCounts).forEach(([plan, data]) => {
      avgAssetsByPlan[plan] = data.users.size > 0 ? data.totalPrompts / data.users.size : 0
    })

    // 3. Active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { count: activeUsers30d } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .gte('last_sign_in_at', thirtyDaysAgo)

    // 4. Active users (logged in within last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: activeUsers7d } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .gte('last_sign_in_at', sevenDaysAgo)

    // 5. Users with assets (have at least one prompt) - get distinct user_ids
    const { data: usersWithAssetsData } = await supabase
      .from('prompts')
      .select('user_id')
      .eq('archived', false)
    
    const uniqueUsersWithAssets = new Set(usersWithAssetsData?.map((p: any) => p.user_id) || [])
    const usersWithAssets = uniqueUsersWithAssets.size

    // 6. Average assets per user who has assets
    const avgAssetsPerActiveUser = usersWithAssets && usersWithAssets > 0 
      ? (totalPromptsCount || 0) / usersWithAssets 
      : 0

    // 7. Distribution of asset counts (how many users have 1, 2-5, 6-10, 11-20, 21+ assets)
    const { data: userAssetCounts } = await supabase
      .from('prompts')
      .select('user_id')
      .eq('archived', false)

    const assetDistribution: Record<string, number> = {
      '1': 0,
      '2-5': 0,
      '6-10': 0,
      '11-20': 0,
      '21+': 0,
    }

    if (userAssetCounts) {
      const countsByUser: Record<string, number> = {}
      userAssetCounts.forEach((p: any) => {
        countsByUser[p.user_id] = (countsByUser[p.user_id] || 0) + 1
      })

      Object.values(countsByUser).forEach((count) => {
        if (count === 1) assetDistribution['1']++
        else if (count >= 2 && count <= 5) assetDistribution['2-5']++
        else if (count >= 6 && count <= 10) assetDistribution['6-10']++
        else if (count >= 11 && count <= 20) assetDistribution['11-20']++
        else assetDistribution['21+']++
      })
    }

    // 8. Session frequency (users by last sign-in recency)
    const { data: allUserProfiles } = await supabase
      .from('user_profiles')
      .select('last_sign_in_at')

    const sessionFrequency = {
      last24h: 0,
      last7d: 0,
      last30d: 0,
      last90d: 0,
      never: 0,
    }

    if (allUserProfiles) {
      const now = Date.now()
      const oneDayAgo = now - (24 * 60 * 60 * 1000)
      const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000)
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)
      const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000)

      allUserProfiles.forEach((profile: any) => {
        if (!profile.last_sign_in_at) {
          sessionFrequency.never++
        } else {
          const lastSignIn = new Date(profile.last_sign_in_at).getTime()
          if (lastSignIn >= oneDayAgo) {
            sessionFrequency.last24h++
          } else if (lastSignIn >= sevenDaysAgo) {
            sessionFrequency.last7d++
          } else if (lastSignIn >= thirtyDaysAgo) {
            sessionFrequency.last30d++
          } else if (lastSignIn >= ninetyDaysAgo) {
            sessionFrequency.last90d++
          } else {
            // More than 90 days ago - could add to "never" or create another category
            // For now, we'll count it as inactive but not "never"
          }
        }
      })
    }

    return NextResponse.json({
      signupsByMonth,
      retentionRates,
      conversionFunnel: {
        totalSignups: totalUsers || 0,
        createdFirstPrompt: usersCreatedPrompt || 0,
        convertedToSubscription: usersSubscribed || 0,
        signupToPromptRate: totalUsers ? ((usersCreatedPrompt || 0) / totalUsers) * 100 : 0,
        promptToSubscriptionRate: usersCreatedPrompt ? ((usersSubscribed || 0) / usersCreatedPrompt) * 100 : 0,
      },
      avgPromptsByPlan,
      engagement: {
        avgAssetsPerUser: avgAssetsPerUser,
        avgAssetsPerActiveUser: avgAssetsPerActiveUser,
        activeUsers7d: activeUsers7d || 0,
        activeUsers30d: activeUsers30d || 0,
        usersWithAssets: usersWithAssets || 0,
        totalAssets: totalPromptsCount || 0,
        assetDistribution: assetDistribution,
        sessionFrequency: sessionFrequency,
        avgAssetsByPlan: avgAssetsByPlan,
      },
    })
  } catch (error: any) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: error.message === 'Unauthorized: Admin access required' ? 403 : 500 }
    )
  }
}
