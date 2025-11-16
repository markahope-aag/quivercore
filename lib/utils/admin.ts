import { createClient } from '@/lib/supabase/server'

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  // Check if user exists in admin_users table
  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return false
  }

  return true
}

/**
 * Require admin access - throws error if user is not admin
 * Returns the admin user object
 */
export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized: Admin access required')
  }

  // Check if user exists in admin_users table
  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    throw new Error('Unauthorized: Admin access required')
  }

  return { id: user.id, email: user.email || '' }
}

/**
 * Get current user's ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}
