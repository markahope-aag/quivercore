import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/admin'

export async function GET() {
  try {
    // Check admin access
    await requireAdmin()

    const supabase = await createClient()

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('prompts')
      .select('user_id', { count: 'exact', head: true })

    // Get total prompts
    const { count: totalPrompts } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })

    // Get total templates
    const { count: totalTemplates } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .eq('is_template', true)

    // Get unique users who created prompts (approximation of active users)
    const { data: uniqueUsers } = await supabase
      .from('prompts')
      .select('user_id')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const activeUsers30d = new Set(uniqueUsers?.map(u => u.user_id) || []).size

    const avgPromptsPerUser = totalUsers && totalUsers > 0
      ? (totalPrompts || 0) / totalUsers
      : 0

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalPrompts: totalPrompts || 0,
      totalTemplates: totalTemplates || 0,
      activeUsers30d,
      avgPromptsPerUser,
    })
  } catch (error: any) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: error.message || 'Unauthorized' },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    )
  }
}
