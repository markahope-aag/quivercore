import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase browser client with proper environment variable validation.
 * 
 * @throws {Error} If required environment variables are missing or invalid
 * @returns {ReturnType<typeof createBrowserClient>} Configured Supabase client
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Strict validation - no fallbacks in production
  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg = 
      'Missing Supabase environment variables. ' +
      'Please check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set. ' +
      'These must be configured in your deployment environment (Vercel, etc.).'
    throw new Error(errorMsg)
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch {
    throw new Error(`Invalid Supabase URL format: ${supabaseUrl}`)
  }

  // Validate key format (basic JWT structure check)
  if (!supabaseAnonKey.startsWith('eyJ')) {
    throw new Error('Invalid Supabase anon key format. Expected JWT token.')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

