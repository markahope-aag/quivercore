import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/admin'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Feature flags fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch feature flags' }, { status: 500 })
    }

    return NextResponse.json({ featureFlags: data || [] })
  } catch (error: any) {
    console.error('Feature flags API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch feature flags' },
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
      .from('feature_flags')
      .insert({
        flag_key: body.flagKey,
        name: body.name,
        description: body.description,
        is_enabled: body.isEnabled !== false,
        rollout_percentage: body.rolloutPercentage || 0,
        enabled_for_plans: body.enabledForPlans || null,
        enabled_for_users: body.enabledForUsers || [],
      })
      .select()
      .single()

    if (error) {
      console.error('Feature flag create error:', error)
      return NextResponse.json({ error: 'Failed to create feature flag' }, { status: 500 })
    }

    // Log action
    await supabase.rpc('log_admin_action', {
      p_admin_id: adminUser.id,
      p_action_type: 'feature_flag_create',
      p_target_user_id: null,
      p_resource_type: 'feature_flag',
      p_resource_id: data.id,
      p_details: body,
      p_ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    })

    return NextResponse.json({ featureFlag: data })
  } catch (error: any) {
    console.error('Feature flag create API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create feature flag' },
      { status: error.message === 'Unauthorized: Admin access required' ? 403 : 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminUser = await requireAdmin()
    const supabase = await createClient()
    const body = await request.json()
    const { id, ...updates } = body

    const { data, error } = await supabase
      .from('feature_flags')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Feature flag update error:', error)
      return NextResponse.json({ error: 'Failed to update feature flag' }, { status: 500 })
    }

    // Log action
    await supabase.rpc('log_admin_action', {
      p_admin_id: adminUser.id,
      p_action_type: 'feature_flag_update',
      p_target_user_id: null,
      p_resource_type: 'feature_flag',
      p_resource_id: id,
      p_details: updates,
      p_ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    })

    return NextResponse.json({ featureFlag: data })
  } catch (error: any) {
    console.error('Feature flag update API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update feature flag' },
      { status: error.message === 'Unauthorized: Admin access required' ? 403 : 500 }
    )
  }
}
