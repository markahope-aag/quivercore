import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/admin'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin() // Check admin access

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const plan = searchParams.get('plan')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const supabase = await createClient()

    // Build query
    let usersQuery = supabase
      .from('user_profiles')
      .select(`
        *,
        user_subscriptions!inner (
          id,
          status,
          current_period_end,
          plan_id,
          subscription_plans!inner (
            name,
            display_name
          )
        )
      `, { count: 'exact' })

    // Filter by email search
    if (query) {
      usersQuery = usersQuery.ilike('email', `%${query}%`)
    }

    // Filter by plan
    if (plan) {
      usersQuery = usersQuery.eq('user_subscriptions.subscription_plans.name', plan)
    }

    // Filter by subscription status
    if (status) {
      usersQuery = usersQuery.eq('user_subscriptions.status', status)
    }

    // Pagination
    usersQuery = usersQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    const { data: users, error, count } = await usersQuery

    if (error) {
      console.error('User search error:', error)
      return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
    }

    return NextResponse.json({
      users: users || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error: any) {
    console.error('User search API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to search users' },
      { status: error.message === 'Unauthorized: Admin access required' ? 403 : 500 }
    )
  }
}
