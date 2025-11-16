import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { logger } from '@/lib/utils/logger'

/**
 * OAuth Callback Route
 * Handles OAuth redirects from providers (Google, GitHub, etc.)
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error('Missing Supabase environment variables')
      return NextResponse.redirect(
        new URL('/login?error=Server configuration error', requestUrl.origin)
      )
    }

    // Create a response object that we can modify
    const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin))

    // Create Supabase client with proper cookie handling
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        logger.error('OAuth callback error', error)
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
        )
      }

      if (!data.session) {
        logger.error('OAuth callback: No session created')
        return NextResponse.redirect(
          new URL('/login?error=Failed to create session', requestUrl.origin)
        )
      }

      // Verify user was created/retrieved
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        logger.error('OAuth callback: Failed to get user', userError)
        return NextResponse.redirect(
          new URL('/login?error=Failed to retrieve user', requestUrl.origin)
        )
      }

      logger.info('OAuth callback: Successfully authenticated user', { userId: user.id })

      // Return response with cookies set
      return response
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

