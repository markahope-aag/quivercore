/**
 * Redis client utilities
 * Supports both Vercel KV and Upstash Redis
 */

import { kv } from '@vercel/kv'
import { Redis } from '@upstash/redis'
import { logger } from '@/lib/utils/logger'

let upstashClient: Redis | null = null

/**
 * Check if Vercel KV is available
 */
export function isVercelKVAvailable(): boolean {
  try {
    return !!(process.env.KV_URL || process.env.KV_REST_API_URL)
  } catch {
    return false
  }
}

/**
 * Check if Upstash Redis is available
 */
export function isUpstashAvailable(): boolean {
  try {
    return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  } catch {
    return false
  }
}

/**
 * Get Upstash Redis client
 */
function getUpstashClient(): Redis | null {
  if (upstashClient) {
    return upstashClient
  }

  if (!isUpstashAvailable()) {
    return null
  }

  try {
    upstashClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    return upstashClient
  } catch (error) {
    logger.warn('Failed to create Upstash Redis client', { error })
    return null
  }
}

/**
 * Check if any Redis/KV is available
 */
export function isKVAvailable(): boolean {
  return isVercelKVAvailable() || isUpstashAvailable()
}

/**
 * Get value from Redis/KV
 */
export async function getKV<T>(key: string): Promise<T | null> {
  // Try Vercel KV first
  if (isVercelKVAvailable()) {
    try {
      const value = await kv.get<T>(key)
      return value
    } catch (error) {
      logger.warn('Vercel KV get error, trying Upstash', { key, error })
    }
  }

  // Try Upstash Redis
  if (isUpstashAvailable()) {
    try {
      const client = getUpstashClient()
      if (client) {
        const value = await client.get<T>(key)
        return value
      }
    } catch (error) {
      logger.warn('Upstash Redis get error', { key, error })
    }
  }

  return null
}

/**
 * Set value in Redis/KV with optional TTL
 */
export async function setKV<T>(
  key: string,
  value: T,
  options?: { ttl?: number }
): Promise<boolean> {
  // Try Vercel KV first
  if (isVercelKVAvailable()) {
    try {
      if (options?.ttl) {
        await kv.set(key, value, { ex: options.ttl })
      } else {
        await kv.set(key, value)
      }
      return true
    } catch (error) {
      logger.warn('Vercel KV set error, trying Upstash', { key, error })
    }
  }

  // Try Upstash Redis
  if (isUpstashAvailable()) {
    try {
      const client = getUpstashClient()
      if (client) {
        if (options?.ttl) {
          await client.set(key, value, { ex: options.ttl })
        } else {
          await client.set(key, value)
        }
        return true
      }
    } catch (error) {
      logger.warn('Upstash Redis set error', { key, error })
    }
  }

  return false
}

/**
 * Delete value from Redis/KV
 */
export async function deleteKV(key: string): Promise<boolean> {
  // Try Vercel KV first
  if (isVercelKVAvailable()) {
    try {
      await kv.del(key)
      return true
    } catch (error) {
      logger.warn('Vercel KV delete error, trying Upstash', { key, error })
    }
  }

  // Try Upstash Redis
  if (isUpstashAvailable()) {
    try {
      const client = getUpstashClient()
      if (client) {
        await client.del(key)
        return true
      }
    } catch (error) {
      logger.warn('Upstash Redis delete error', { key, error })
    }
  }

  return false
}

/**
 * Increment a numeric value in Redis/KV
 */
export async function incrementKV(key: string, by: number = 1): Promise<number | null> {
  // Try Vercel KV first
  if (isVercelKVAvailable()) {
    try {
      const result = await kv.incrby(key, by)
      return result
    } catch (error) {
      logger.warn('Vercel KV increment error, trying Upstash', { key, error })
    }
  }

  // Try Upstash Redis
  if (isUpstashAvailable()) {
    try {
      const client = getUpstashClient()
      if (client) {
        const result = await client.incrby(key, by)
        return result
      }
    } catch (error) {
      logger.warn('Upstash Redis increment error', { key, error })
    }
  }

  return null
}

/**
 * Set expiration on a key
 */
export async function expireKV(key: string, seconds: number): Promise<boolean> {
  // Try Vercel KV first
  if (isVercelKVAvailable()) {
    try {
      await kv.expire(key, seconds)
      return true
    } catch (error) {
      logger.warn('Vercel KV expire error, trying Upstash', { key, error })
    }
  }

  // Try Upstash Redis
  if (isUpstashAvailable()) {
    try {
      const client = getUpstashClient()
      if (client) {
        await client.expire(key, seconds)
        return true
      }
    } catch (error) {
      logger.warn('Upstash Redis expire error', { key, error })
    }
  }

  return false
}

/**
 * Get time to live for a key
 */
export async function ttlKV(key: string): Promise<number | null> {
  // Try Vercel KV first
  if (isVercelKVAvailable()) {
    try {
      const ttl = await kv.ttl(key)
      return ttl
    } catch (error) {
      logger.warn('Vercel KV ttl error, trying Upstash', { key, error })
    }
  }

  // Try Upstash Redis
  if (isUpstashAvailable()) {
    try {
      const client = getUpstashClient()
      if (client) {
        const ttl = await client.ttl(key)
        return ttl
      }
    } catch (error) {
      logger.warn('Upstash Redis ttl error', { key, error })
    }
  }

  return null
}

