/**
 * Rate limiting middleware for API routes
 * Prevents abuse by limiting requests per IP address
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/utils/logger'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Custom error message
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (use Redis in production)
const store: RateLimitStore = {}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 60000) // Clean up every minute

/**
 * Gets the client identifier (IP address)
 */
function getClientId(request: NextRequest): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare
  
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown'
  
  return ip
}

/**
 * Rate limiting middleware
 */
export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = config

  return async (request: NextRequest): Promise<NextResponse | null> => {
    const clientId = getClientId(request)
    const now = Date.now()
    const key = `${clientId}:${request.nextUrl.pathname}`

    // Get or create rate limit entry
    let entry = store[key]

    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired one
      entry = {
        count: 0,
        resetTime: now + windowMs,
      }
      store[key] = entry
    }

    // Increment count
    entry.count++

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
      
      logger.warn('Rate limit exceeded', {
        clientId,
        path: request.nextUrl.pathname,
        count: entry.count,
        maxRequests,
      })

      return NextResponse.json(
        {
          error: message,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
          },
        }
      )
    }

    // Return null to continue with the request
    // The actual response will be modified by the handler
    return null
  }
}

/**
 * Creates a rate limiter with default settings
 */
export function createRateLimiter(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
  return rateLimit({
    windowMs,
    maxRequests,
    message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${Math.ceil(windowMs / 60000)} minutes.`,
  })
}

/**
 * Standard rate limiters for different use cases
 */
export const rateLimiters = {
  // Strict rate limiter for authentication endpoints
  auth: createRateLimiter(5, 15 * 60 * 1000), // 5 requests per 15 minutes
  
  // Standard rate limiter for API endpoints
  api: createRateLimiter(100, 15 * 60 * 1000), // 100 requests per 15 minutes
  
  // Lenient rate limiter for read operations
  read: createRateLimiter(200, 15 * 60 * 1000), // 200 requests per 15 minutes
  
  // Strict rate limiter for write operations
  write: createRateLimiter(50, 15 * 60 * 1000), // 50 requests per 15 minutes
}

/**
 * Helper to apply rate limiting to an API route handler
 */
export async function withRateLimit(
  request: NextRequest,
  limiter: (req: NextRequest) => Promise<NextResponse | null>,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const rateLimitResponse = await limiter(request)
  
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const response = await handler(request)

  // Add rate limit headers to successful responses
  const clientId = getClientId(request)
  const key = `${clientId}:${request.nextUrl.pathname}`
  const entry = store[key]

  if (entry) {
    response.headers.set('X-RateLimit-Limit', entry.count.toString())
    response.headers.set('X-RateLimit-Remaining', Math.max(0, 100 - entry.count).toString())
    response.headers.set('X-RateLimit-Reset', entry.resetTime.toString())
  }

  return response
}

