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
    })
  } catch (error: any) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: error.message === 'Unauthorized: Admin access required' ? 403 : 500 }
    )
  }
}
