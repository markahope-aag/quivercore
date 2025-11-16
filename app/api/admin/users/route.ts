import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/admin'

export async function GET() {
  try {
    // Check admin access
    await requireAdmin()

    const supabase = await createClient()

    // Get users from auth.users (admin query)
    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
      throw error
    }

    const users = data.users.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
    }))

    return NextResponse.json({ users })
  } catch (error: any) {
    console.error('Admin users error:', error)
    return NextResponse.json(
      { error: error.message || 'Unauthorized' },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    )
  }
}
