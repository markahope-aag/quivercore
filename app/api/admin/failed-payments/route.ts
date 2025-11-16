import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/admin'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin() // Check admin access

    const { searchParams } = new URL(request.url)
    const daysBack = parseInt(searchParams.get('days') || '30')

    const supabase = await createClient()

    const { data, error } = await supabase
      .rpc('get_failed_payments', { days_back: daysBack })

    if (error) {
      console.error('Failed payments error:', error)
      return NextResponse.json({ error: 'Failed to fetch failed payments' }, { status: 500 })
    }

    return NextResponse.json({
      payments: data || [],
      count: data?.length || 0,
    })
  } catch (error: any) {
    console.error('Failed payments API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment data' },
      { status: error.message === 'Unauthorized: Admin access required' ? 403 : 500 }
    )
  }
}
