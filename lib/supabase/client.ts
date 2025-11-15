import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Try to get from environment, with fallback for debugging
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('=== Supabase Client Debug ===')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING')
    console.log('All NEXT_PUBLIC_ vars:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_')))
  }

  // Fallback: try hardcoded values if env vars are missing (for debugging)
  if (!supabaseUrl) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL is missing, using fallback')
    supabaseUrl = 'https://ulgqdtcfhqvazpjfvplp.supabase.co'
  }
  
  if (!supabaseAnonKey) {
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing, using fallback')
    supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZ3FkdGNmaHF2YXpwamZ2cGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjQ4NTAsImV4cCI6MjA3ODgwMDg1MH0.tcxemCpFz3u6r1Jy4n0LnDthwM_r7swl07DpPiGYxLo'
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg = 'Missing Supabase environment variables. ' +
      'Please check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Vercel.'
    console.error(errorMsg, { supabaseUrl, supabaseAnonKey: supabaseAnonKey ? 'SET' : 'MISSING' })
    throw new Error(errorMsg)
  }

  // Validate URL format
  try {
    const url = new URL(supabaseUrl)
    console.log('Validated Supabase URL:', url.hostname)
  } catch (e) {
    const errorMsg = `Invalid Supabase URL format: ${supabaseUrl}`
    console.error(errorMsg)
    throw new Error(errorMsg)
  }

  console.log('Creating Supabase client with URL:', supabaseUrl)
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

