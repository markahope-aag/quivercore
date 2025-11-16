/**
 * Vercel KV (Redis) client utilities
 * Uses Vercel's native KV integration for caching and rate limiting
 */

import { kv } from '@vercel/kv'
import { logger } from '@/lib/utils/logger'

/**
 * Check if Vercel KV is available
 */
export function isKVAvailable(): boolean {
  try {
    // Vercel KV is available if environment variables are set
    // Vercel automatically injects KV_URL and KV_REST_API_URL
    return !!(process.env.KV_URL || process.env.KV_REST_API_URL)
  } catch {
    return false
  }
}

/**
 * Get value from Vercel KV
 */
export async function getKV<T>(key: string): Promise<T | null> {
  if (!isKVAvailable()) {
    return null
  }

  try {
    const value = await kv.get<T>(key)
    return value
  } catch (error) {
    logger.warn('Vercel KV get error', { key, error })
    return null
  }
}

/**
 * Set value in Vercel KV with optional TTL
 */
export async function setKV<T>(
  key: string,
  value: T,
  options?: { ttl?: number }
): Promise<boolean> {
  if (!isKVAvailable()) {
    return false
  }

  try {
    if (options?.ttl) {
      await kv.set(key, value, { ex: options.ttl })
    } else {
      await kv.set(key, value)
    }
    return true
  } catch (error) {
    logger.warn('Vercel KV set error', { key, error })
    return false
  }
}

/**
 * Delete value from Vercel KV
 */
export async function deleteKV(key: string): Promise<boolean> {
  if (!isKVAvailable()) {
    return false
  }

  try {
    await kv.del(key)
    return true
  } catch (error) {
    logger.warn('Vercel KV delete error', { key, error })
    return false
  }
}

/**
 * Increment a numeric value in Vercel KV
 */
export async function incrementKV(key: string, by: number = 1): Promise<number | null> {
  if (!isKVAvailable()) {
    return null
  }

  try {
    const result = await kv.incrby(key, by)
    return result
  } catch (error) {
    logger.warn('Vercel KV increment error', { key, error })
    return null
  }
}

/**
 * Set expiration on a key
 */
export async function expireKV(key: string, seconds: number): Promise<boolean> {
  if (!isKVAvailable()) {
    return false
  }

  try {
    await kv.expire(key, seconds)
    return true
  } catch (error) {
    logger.warn('Vercel KV expire error', { key, error })
    return false
  }
}

/**
 * Get time to live for a key
 */
export async function ttlKV(key: string): Promise<number | null> {
  if (!isKVAvailable()) {
    return null
  }

  try {
    const ttl = await kv.ttl(key)
    return ttl
  } catch (error) {
    logger.warn('Vercel KV ttl error', { key, error })
    return null
  }
}

/**
 * Add member to a set
 */
export async function saddKV(key: string, ...members: string[]): Promise<number | null> {
  if (!isKVAvailable()) {
    return null
  }

  try {
    // TypeScript workaround: cast members array to satisfy sadd signature
    const result = await kv.sadd(key, ...(members as [string, ...string[]]))
    return result
  } catch (error) {
    logger.warn('Vercel KV sadd error', { key, error })
    return null
  }
}

/**
 * Get all members of a set
 */
export async function smembersKV(key: string): Promise<string[] | null> {
  if (!isKVAvailable()) {
    return null
  }

  try {
    const members = await kv.smembers<string[]>(key)
    return members
  } catch (error) {
    logger.warn('Vercel KV smembers error', { key, error })
    return null
  }
}

