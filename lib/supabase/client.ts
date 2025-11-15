import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Debug logging (remove in production if needed)
  if (typeof window !== 'undefined') {
    console.log('Supabase URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING')
    console.log('Supabase Key:', supabaseAnonKey ? 'SET' : 'MISSING')
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg = 'Missing Supabase environment variables. ' +
      'Please check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Vercel.'
    console.error(errorMsg, { supabaseUrl, supabaseAnonKey: supabaseAnonKey ? 'SET' : 'MISSING' })
    throw new Error(errorMsg)
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch (e) {
    const errorMsg = `Invalid Supabase URL format: ${supabaseUrl}`
    console.error(errorMsg)
    throw new Error(errorMsg)
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

