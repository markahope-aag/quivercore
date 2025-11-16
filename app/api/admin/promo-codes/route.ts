import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/admin'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active') === 'true'

    const supabase = await createClient()

    let query = supabase
      .from('promotional_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (active) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Promo codes fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 })
    }

    return NextResponse.json({ promoCodes: data || [] })
  } catch (error: any) {
    console.error('Promo codes API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch promo codes' },
      { status: error.message === 'Unauthorized: Admin access required' ? 403 : 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin()
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('promotional_codes')
      .insert({
        code: body.code.toUpperCase(),
        description: body.description,
        discount_type: body.discountType,
        discount_value: body.discountValue,
        max_uses: body.maxUses || null,
        valid_from: body.validFrom || new Date().toISOString(),
        valid_until: body.validUntil || null,
        plan_restrictions: body.planRestrictions || null,
        is_active: body.isActive !== false,
        created_by: adminUser.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Promo code create error:', error)
      return NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 })
    }

    // Log action
    await supabase.rpc('log_admin_action', {
      p_admin_id: adminUser.id,
      p_action_type: 'promo_code_create',
      p_target_user_id: null,
      p_resource_type: 'promo_code',
      p_resource_id: data.id,
      p_details: body,
      p_ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    })

    return NextResponse.json({ promoCode: data })
  } catch (error: any) {
    console.error('Promo code create API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create promo code' },
      { status: error.message === 'Unauthorized: Admin access required' ? 403 : 500 }
    )
  }
}
