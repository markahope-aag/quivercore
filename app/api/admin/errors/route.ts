import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/admin'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const resolved = searchParams.get('resolved') === 'true'
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    const supabase = await createClient()

    let query = supabase
      .from('error_logs')
      .select('*', { count: 'exact' })

    if (resolved !== null) {
      query = query.eq('resolved', resolved)
    }

    if (type) {
      query = query.eq('error_type', type)
    }

    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      console.error('Errors fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch errors' }, { status: 500 })
    }

    // Get error counts by type
    const { data: errorCounts } = await supabase
      .from('error_logs')
      .select('error_type')
      .eq('resolved', false)

    const countsByType: Record<string, number> = {}
    if (errorCounts) {
      errorCounts.forEach((e) => {
        countsByType[e.error_type] = (countsByType[e.error_type] || 0) + 1
      })
    }

    return NextResponse.json({
      errors: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      countsByType,
    })
  } catch (error: any) {
    console.error('Errors API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch errors' },
      { status: error.message === 'Unauthorized: Admin access required' ? 403 : 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminUser = await requireAdmin()
    const supabase = await createClient()
    const body = await request.json()
    const { errorId, resolved } = body

    const { error } = await supabase
      .from('error_logs')
      .update({
        resolved,
        resolved_by: adminUser.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', errorId)

    if (error) {
      console.error('Error update error:', error)
      return NextResponse.json({ error: 'Failed to update error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error update API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update error' },
      { status: error.message === 'Unauthorized: Admin access required' ? 403 : 500 }
    )
  }
}
