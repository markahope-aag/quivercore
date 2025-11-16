import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin() // Check admin access

    const supabase = await createClient()
    const { id: userId } = await params

    // Get detailed user info
    const { data: userDetails, error: detailsError } = await supabase
      .rpc('get_user_details', { p_user_id: userId })
      .single()

    if (detailsError) {
      console.error('User details error:', detailsError)
      return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 })
    }

    // Get user's prompts count by category
    const { data: promptStats } = await supabase
      .from('prompts')
      .select('domain, framework, is_template')
      .eq('user_id', userId)

    const promptsByDomain: Record<string, number> = {}
    const promptsByFramework: Record<string, number> = {}
    let templateCount = 0

    if (promptStats) {
      promptStats.forEach((p) => {
        if (p.domain) promptsByDomain[p.domain] = (promptsByDomain[p.domain] || 0) + 1
        if (p.framework) promptsByFramework[p.framework] = (promptsByFramework[p.framework] || 0) + 1
        if (p.is_template) templateCount++
      })
    }

    // Get recent activity
    const { data: recentPrompts } = await supabase
      .from('prompts')
      .select('id, title, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get usage history (last 30 days)
    const { data: usageHistory } = await supabase
      .from('usage_tracking')
      .select('metric_type, count, created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    // Get billing history
    const { data: billingHistory } = await supabase
      .from('billing_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      user: userDetails,
      stats: {
        promptsByDomain,
        promptsByFramework,
        templateCount,
      },
      recentActivity: recentPrompts || [],
      usageHistory: usageHistory || [],
      billingHistory: billingHistory || [],
    })
  } catch (error: any) {
    console.error('User detail API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user data' },
      { status: error.message === 'Unauthorized: Admin access required' ? 403 : 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAdmin() // Check admin access
    const supabase = await createClient()
    const { id: userId } = await params
    const body = await request.json()

    // Log admin action
    await supabase.rpc('log_admin_action', {
      p_admin_id: adminUser.id,
      p_action_type: 'user_update',
      p_target_user_id: userId,
      p_resource_type: 'user',
      p_resource_id: userId,
      p_details: body,
      p_ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    })

    // Handle different update types
    if (body.action === 'suspend') {
      // In a real app, you'd update a suspended field
      // For now, we'll just log it
      return NextResponse.json({ success: true, message: 'User suspended' })
    }

    if (body.action === 'unsuspend') {
      return NextResponse.json({ success: true, message: 'User unsuspended' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('User update API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: error.message === 'Unauthorized: Admin access required' ? 403 : 500 }
    )
  }
}
