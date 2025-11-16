import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/admin'

export async function GET(request: NextRequest) {
  try {
    const _ = await requireAdmin() // Check admin access

    const supabase = await createClient()

    // Get MRR
    const { data: mrrData, error: mrrError } = await supabase
      .rpc('calculate_mrr')
      .single() as { data: any; error: any }

    if (mrrError) {
      console.error('MRR calculation error:', mrrError)
    }

    // Get 30-day churn
    const { data: churnData, error: churnError } = await supabase
      .rpc('calculate_churn_rate', { days_back: 30 })
      .single() as { data: any; error: any }

    if (churnError) {
      console.error('Churn calculation error:', churnError)
    }

    // Get total revenue (all time)
    const { data: totalRevenue, error: revenueError } = await supabase
      .from('billing_history')
      .select('amount')
      .eq('status', 'paid')

    let totalRevenueAmount = 0
    if (!revenueError && totalRevenue) {
      totalRevenueAmount = totalRevenue.reduce((sum, item) => sum + item.amount, 0)
    }

    // Get revenue for last 12 months (for chart)
    const { data: monthlyRevenue, error: monthlyError } = await supabase
      .from('billing_history')
      .select('amount, paid_at')
      .eq('status', 'paid')
      .gte('paid_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      .order('paid_at', { ascending: true })

    // Group by month
    const revenueByMonth: Record<string, number> = {}
    if (!monthlyError && monthlyRevenue) {
      monthlyRevenue.forEach((item) => {
        if (item.paid_at) {
          const month = new Date(item.paid_at).toISOString().slice(0, 7) // YYYY-MM
          revenueByMonth[month] = (revenueByMonth[month] || 0) + item.amount
        }
      })
    }

    // Calculate ARR (Annual Recurring Revenue)
    const mrr = mrrData?.mrr_cents || 0
    const arr = mrr * 12

    return NextResponse.json({
      mrr: mrr,
      arr: arr,
      totalRevenue: totalRevenueAmount,
      activeSubscriptions: mrrData?.active_subscriptions || 0,
      churnRate: churnData?.churn_rate || 0,
      churnedCount: churnData?.canceled_count || 0,
      revenueByPlan: mrrData?.by_plan || {},
      revenueByMonth: revenueByMonth,
    })
  } catch (error: any) {
    console.error('Revenue API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch revenue data' },
      { status: error.message === 'Unauthorized: Admin access required' ? 403 : 500 }
    )
  }
}
