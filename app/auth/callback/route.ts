import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/utils/logger'

/**
 * OAuth Callback Route
 * Handles OAuth redirects from providers (Google, GitHub, etc.)
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        logger.error('OAuth callback error', error)
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
        )
      }

      // Successful authentication - redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
    } catch (error) {
      logger.error('OAuth callback exception', error)
      return NextResponse.redirect(
        new URL('/login?error=Authentication failed', requestUrl.origin)
      )
    }
  }

  // No code parameter - redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}

