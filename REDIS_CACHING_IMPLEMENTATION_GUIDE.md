# Redis Caching Implementation Guide

**Date:** 2025-01-16  
**Topic:** What's involved in adding Redis caching to QuiverCore

---

## Executive Summary

**Current State:** Using Next.js `unstable_cache` (in-memory, per-instance)  
**Redis Benefit:** Shared cache across all server instances, better for production  
**When to Add:** When you have >1 server instance or >1,000 active users

---

## 1. WHY REDIS CACHING?

### Current Limitations

**Next.js `unstable_cache`:**
- ✅ Works well for single-instance deployments
- ❌ **Not shared** across multiple server instances
- ❌ Lost on server restart
- ❌ Each Vercel serverless function has its own cache
- ❌ Can't invalidate cache from other instances

**Redis Benefits:**
- ✅ **Shared cache** across all server instances
- ✅ **Persistent** (survives restarts)
- ✅ **Distributed** invalidation
- ✅ **Better for production** with multiple instances
- ✅ Can also be used for rate limiting (replacing in-memory store)

---

## 2. REDIS SERVICE OPTIONS

### Option 1: Upstash Redis (Recommended for Vercel)

**Why Upstash:**
- ✅ **Serverless** - perfect for Vercel
- ✅ **Pay-per-use** pricing
- ✅ **Global edge locations**
- ✅ **Free tier:** 10K commands/day
- ✅ **Easy integration** with Vercel

**Pricing:**
- Free: 10K commands/day
- Pay-as-you-go: $0.20 per 100K commands
- **Estimated cost:** $5-20/month for typical usage

**Setup:**
```bash
npm install @upstash/redis
```

### Option 2: Vercel KV (Vercel's Redis)

**Why Vercel KV:**
- ✅ **Native Vercel integration**
- ✅ **Simple setup** (built into Vercel)
- ✅ **Edge-compatible**

**Pricing:**
- Free: 30K reads/day, 30K writes/day
- Pro: $0.20 per 100K reads, $0.20 per 100K writes
- **Estimated cost:** $10-30/month

**Setup:**
```bash
npm install @vercel/kv
```

### Option 3: Redis Cloud (Traditional)

**Why Redis Cloud:**
- ✅ **Full Redis features**
- ✅ **Dedicated instances**
- ✅ **Better for high-traffic**

**Pricing:**
- Free: 30MB
- Paid: $5-50+/month depending on size
- **Estimated cost:** $10-50/month

**Setup:**
```bash
npm install redis
```

### Recommendation: **Upstash Redis**

Best balance of:
- Cost (pay-per-use)
- Ease of setup
- Vercel compatibility
- Serverless-friendly

---

## 3. IMPLEMENTATION STEPS

### Step 1: Install Dependencies

```bash
npm install @upstash/redis
npm install --save-dev @types/node
```

### Step 2: Set Up Environment Variables

**`.env.local` (development):**
```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

**Vercel Environment Variables:**
- Add same variables in Vercel dashboard
- Available in all environments

### Step 3: Create Redis Client Utility

**New File: `lib/redis/client.ts`**

```typescript
import { Redis } from '@upstash/redis'

let redis: Redis | null = null

export function getRedisClient(): Redis {
  if (redis) {
    return redis
  }

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    throw new Error(
      'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set'
    )
  }

  redis = new Redis({
    url,
    token,
  })

  return redis
}

// Helper to check if Redis is available
export function isRedisAvailable(): boolean {
  try {
    return !!(
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    )
  } catch {
    return false
  }
}
```

### Step 4: Create Caching Utility

**New File: `lib/utils/redis-cache.ts`**

```typescript
import { getRedisClient, isRedisAvailable } from '@/lib/redis/client'
import { logger } from './logger'

interface CacheOptions {
  ttl?: number // Time to live in seconds
  tags?: string[] // Tags for invalidation
}

/**
 * Get value from Redis cache
 */
export async function getCache<T>(
  key: string
): Promise<T | null> {
  if (!isRedisAvailable()) {
    return null
  }

  try {
    const redis = getRedisClient()
    const value = await redis.get<T>(key)
    return value
  } catch (error) {
    logger.warn('Redis get error', { key, error })
    return null
  }
}

/**
 * Set value in Redis cache
 */
export async function setCache<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<boolean> {
  if (!isRedisAvailable()) {
    return false
  }

  try {
    const redis = getRedisClient()
    const { ttl = 60, tags = [] } = options

    // Set with TTL
    if (ttl > 0) {
      await redis.setex(key, ttl, value)
    } else {
      await redis.set(key, value)
    }

    // Store tags for invalidation
    if (tags.length > 0) {
      for (const tag of tags) {
        await redis.sadd(`tag:${tag}`, key)
        await redis.expire(`tag:${tag}`, ttl || 3600)
      }
    }

    return true
  } catch (error) {
    logger.warn('Redis set error', { key, error })
    return false
  }
}

/**
 * Delete value from cache
 */
export async function deleteCache(key: string): Promise<boolean> {
  if (!isRedisAvailable()) {
    return false
  }

  try {
    const redis = getRedisClient()
    await redis.del(key)
    return true
  } catch (error) {
    logger.warn('Redis delete error', { key, error })
    return false
  }
}

/**
 * Invalidate cache by tag
 */
export async function invalidateByTag(tag: string): Promise<number> {
  if (!isRedisAvailable()) {
    return 0
  }

  try {
    const redis = getRedisClient()
    const keys = await redis.smembers<string[]>(`tag:${tag}`)
    
    if (keys.length === 0) {
      return 0
    }

    // Delete all keys with this tag
    const deleted = await redis.del(...keys)
    
    // Delete the tag set
    await redis.del(`tag:${tag}`)
    
    return deleted
  } catch (error) {
    logger.warn('Redis invalidate tag error', { tag, error })
    return 0
  }
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateByPattern(pattern: string): Promise<number> {
  if (!isRedisAvailable()) {
    return 0
  }

  try {
    const redis = getRedisClient()
    // Note: Upstash REST API doesn't support SCAN
    // Use tags for invalidation instead
    logger.warn('Pattern invalidation not supported in Upstash REST API')
    return 0
  } catch (error) {
    logger.warn('Redis invalidate pattern error', { pattern, error })
    return 0
  }
}
```

### Step 5: Update API Routes to Use Redis

**Example: `app/api/prompts/route.ts`**

```typescript
import { getCache, setCache, invalidateByTag } from '@/lib/utils/redis-cache'

export async function GET(request: NextRequest) {
  // ... existing code ...

  const cacheKey = `prompts:${user.id}:${favorite || ''}:${useCase || ''}:${framework || ''}:${enhancementTechnique || ''}:${tag || ''}:${page}:${limit}`
  
  // Try Redis cache first
  const cached = await getCache<{ data: Prompt[]; count: number }>(cacheKey)
  if (cached) {
    const totalPages = Math.ceil((cached.count || 0) / limit)
    return NextResponse.json({
      data: cached.data,
      pagination: {
        page,
        limit,
        total: cached.count || 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
        'X-Cache': 'HIT',
      },
    })
  }

  // Cache miss - fetch from database
  const { data, error, count } = await query
  
  if (error) {
    throw error
  }

  const result = { data: data || [], count: count || 0 }
  
  // Store in Redis cache
  await setCache(cacheKey, result, {
    ttl: 30, // 30 seconds
    tags: [`prompts:${user.id}`],
  })

  const totalPages = Math.ceil((count || 0) / limit)
  
  return NextResponse.json({
    data: result.data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  }, {
    headers: {
      'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
      'X-Cache': 'MISS',
    },
  })
}

// In POST route - invalidate cache
export async function POST(request: NextRequest) {
  // ... create prompt ...
  
  // Invalidate user's prompt cache
  await invalidateByTag(`prompts:${user.id}`)
  
  return NextResponse.json(prompt)
}
```

### Step 6: Update Rate Limiting to Use Redis

**Update: `lib/middleware/rate-limit.ts`**

```typescript
import { getRedisClient, isRedisAvailable } from '@/lib/redis/client'

// Replace in-memory store with Redis
export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const clientId = getClientId(request)
    const now = Date.now()
    const key = `ratelimit:${clientId}:${request.nextUrl.pathname}`

    if (isRedisAvailable()) {
      // Use Redis for rate limiting
      const redis = getRedisClient()
      
      // Get current count
      const count = await redis.get<number>(key) || 0
      
      if (count >= config.maxRequests) {
        // Rate limit exceeded
        const ttl = await redis.ttl(key)
        const retryAfter = Math.ceil(ttl / 1000)
        
        return NextResponse.json(
          { error: config.message, retryAfter },
          { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
        )
      }
      
      // Increment count
      await redis.incr(key)
      if (count === 0) {
        await redis.expire(key, Math.ceil(config.windowMs / 1000))
      }
      
      return null
    } else {
      // Fallback to in-memory (existing code)
      // ... existing in-memory logic ...
    }
  }
}
```

---

## 4. COST ESTIMATION

### Upstash Redis Costs

**Free Tier:**
- 10,000 commands/day
- Sufficient for: ~500-1,000 users

**Pay-as-you-go:**
- $0.20 per 100K commands
- **Example usage:**
  - 1,000 users
  - 50 API requests/user/day
  - 2 Redis commands per request (get + set)
  - = 100K commands/day
  - = **$6/month**

**Typical Costs:**
- Small (<1K users): Free tier
- Medium (1K-10K users): $5-20/month
- Large (10K+ users): $20-100/month

---

## 5. WHEN TO ADD REDIS

### Add Redis When:

1. **Multiple Server Instances**
   - Vercel serverless functions (multiple instances)
   - Need shared cache across instances

2. **High Traffic**
   - >1,000 active users
   - >100K API requests/day
   - Cache hits would save significant database load

3. **Rate Limiting Needs**
   - Current in-memory rate limiting won't work
   - Need distributed rate limiting

4. **Cost Savings**
   - Database queries cost more than Redis
   - Cache hit rate >50% would save money

### Don't Add Redis Yet If:

- ✅ Single instance deployment
- ✅ <1,000 users
- ✅ Current Next.js cache works fine
- ✅ Budget constraints

**Recommendation:** Add Redis when you have >1,000 active users or multiple server instances.

---

## 6. IMPLEMENTATION COMPLEXITY

### Effort Required

| Task | Time | Complexity |
|------|------|------------|
| **Setup Upstash account** | 15 min | Easy |
| **Install dependencies** | 5 min | Easy |
| **Create Redis client** | 30 min | Easy |
| **Create cache utilities** | 1-2 hours | Medium |
| **Update API routes** | 2-3 hours | Medium |
| **Update rate limiting** | 1 hour | Medium |
| **Testing** | 1-2 hours | Medium |
| **Total** | **6-9 hours** | **Medium** |

### Code Changes Required

**New Files (3):**
- `lib/redis/client.ts` - Redis client
- `lib/utils/redis-cache.ts` - Cache utilities
- `.env.example` - Environment variables

**Modified Files (~8):**
- `app/api/prompts/route.ts`
- `app/api/prompts/[id]/route.ts`
- `app/api/search/route.ts`
- `lib/middleware/rate-limit.ts`
- Other API routes that use caching

---

## 7. ALTERNATIVES TO REDIS

### Option 1: Keep Next.js Cache (Current)

**Pros:**
- ✅ No additional cost
- ✅ Already implemented
- ✅ Works for single instance

**Cons:**
- ❌ Not shared across instances
- ❌ Lost on restart

**When:** Good enough for <1,000 users, single instance

### Option 2: Vercel KV (Vercel's Redis)

**Pros:**
- ✅ Native Vercel integration
- ✅ Easy setup
- ✅ Edge-compatible

**Cons:**
- ⚠️ Slightly more expensive than Upstash
- ⚠️ Vercel-specific (less portable)

**When:** Already using Vercel, want native integration

### Option 3: Database Query Caching

**Pros:**
- ✅ No additional service
- ✅ Use Supabase connection pooling
- ✅ Simpler architecture

**Cons:**
- ❌ Still hits database
- ❌ Less efficient than Redis

**When:** Database is fast enough, want to avoid Redis

---

## 8. STEP-BY-STEP IMPLEMENTATION PLAN

### Phase 1: Setup (1 hour)

1. Create Upstash account
2. Create Redis database
3. Get REST URL and token
4. Add to environment variables
5. Install `@upstash/redis`

### Phase 2: Core Infrastructure (2-3 hours)

1. Create `lib/redis/client.ts`
2. Create `lib/utils/redis-cache.ts`
3. Add fallback to Next.js cache if Redis unavailable
4. Test basic get/set operations

### Phase 3: Update API Routes (3-4 hours)

1. Update `GET /api/prompts` to use Redis
2. Update `GET /api/prompts/[id]` to use Redis
3. Update `GET /api/search` to use Redis
4. Add cache invalidation on writes
5. Test cache hits/misses

### Phase 4: Rate Limiting (1 hour)

1. Update `lib/middleware/rate-limit.ts`
2. Replace in-memory store with Redis
3. Test rate limiting across instances

### Phase 5: Testing & Monitoring (1-2 hours)

1. Test cache behavior
2. Monitor Redis usage
3. Verify cache invalidation
4. Check costs

---

## 9. MONITORING & MAINTENANCE

### What to Monitor

1. **Cache Hit Rate**
   - Target: >50% hit rate
   - Monitor: Redis GET operations vs database queries

2. **Redis Usage**
   - Commands per day
   - Memory usage
   - Cost tracking

3. **Performance**
   - Cache response times
   - Database query reduction
   - API response times

### Maintenance Tasks

1. **Weekly:**
   - Check Redis usage/costs
   - Review cache hit rates

2. **Monthly:**
   - Optimize TTL values
   - Review cache keys
   - Clean up unused keys

---

## 10. MIGRATION STRATEGY

### Gradual Rollout

1. **Phase 1:** Add Redis alongside Next.js cache
   - Try Redis first, fallback to Next.js cache
   - Monitor both

2. **Phase 2:** Make Redis primary
   - Use Redis for all caching
   - Keep Next.js cache as fallback

3. **Phase 3:** Remove Next.js cache
   - Once Redis is stable
   - Simplify code

### Code Pattern

```typescript
// Try Redis first, fallback to Next.js cache
const cached = await getCache(key)
if (cached) {
  return cached
}

// Fallback to Next.js cache
const nextjsCache = await unstable_cache(...)

// Store in Redis for next time
await setCache(key, nextjsCache)
```

---

## 11. EXAMPLE: COMPLETE IMPLEMENTATION

### Full Example: Prompts List with Redis

```typescript
// app/api/prompts/route.ts
import { getCache, setCache, invalidateByTag } from '@/lib/utils/redis-cache'
import { unstable_cache } from 'next/cache' // Fallback

export async function GET(request: NextRequest) {
  // ... auth and query building ...

  const cacheKey = `prompts:${user.id}:${favorite || ''}:${useCase || ''}:${framework || ''}:${enhancementTechnique || ''}:${tag || ''}:${page}:${limit}`
  
  // Try Redis cache
  let result = await getCache<{ data: Prompt[]; count: number }>(cacheKey)
  let cacheSource = 'none'

  if (result) {
    cacheSource = 'redis'
  } else {
    // Fallback to Next.js cache
    const getCachedPrompts = unstable_cache(
      async () => {
        const { data, error, count } = await query
        if (error) throw error
        return { data: data || [], count: count || 0 }
      },
      [cacheKey],
      { revalidate: 30 }
    )
    
    result = await getCachedPrompts()
    cacheSource = 'nextjs'
    
    // Store in Redis for next time
    await setCache(cacheKey, result, {
      ttl: 30,
      tags: [`prompts:${user.id}`],
    })
  }

  return NextResponse.json({
    data: result.data,
    pagination: { /* ... */ },
  }, {
    headers: {
      'X-Cache': cacheSource,
    },
  })
}
```

---

## 12. COST-BENEFIT ANALYSIS

### Costs

**Upstash Redis:**
- Free tier: 0 (up to 10K commands/day)
- Paid: $5-20/month (typical usage)

**Development Time:**
- Initial setup: 6-9 hours
- Ongoing maintenance: ~1 hour/month

### Benefits

**Performance:**
- 50-90% reduction in database queries
- 10-50ms cache hits vs 50-200ms database queries
- Better user experience

**Scalability:**
- Shared cache across instances
- Handles high traffic better
- Reduces database load

**Cost Savings:**
- Fewer Supabase API requests
- Lower database costs
- Better resource utilization

**ROI:** Positive if >1,000 users or multiple instances

---

## 13. CONCLUSION

### Should You Add Redis?

**Yes, if:**
- ✅ Multiple server instances (Vercel serverless)
- ✅ >1,000 active users
- ✅ Need distributed rate limiting
- ✅ Want to reduce database load

**Not yet, if:**
- ✅ Single instance deployment
- ✅ <1,000 users
- ✅ Current caching works fine
- ✅ Budget is tight

### Recommendation

**Current State:** Next.js cache is sufficient for now  
**Add Redis When:** You have >1,000 users or multiple instances  
**Priority:** Medium (not critical, but beneficial at scale)

---

## 14. QUICK START CHECKLIST

- [ ] Create Upstash account
- [ ] Create Redis database
- [ ] Get REST URL and token
- [ ] Add environment variables
- [ ] Install `@upstash/redis`
- [ ] Create `lib/redis/client.ts`
- [ ] Create `lib/utils/redis-cache.ts`
- [ ] Update `GET /api/prompts` route
- [ ] Update `GET /api/prompts/[id]` route
- [ ] Add cache invalidation on writes
- [ ] Update rate limiting
- [ ] Test and monitor

**Estimated Time:** 6-9 hours  
**Difficulty:** Medium  
**Cost:** $0-20/month

---

**Ready to implement?** Start with Phase 1 (Setup) and work through each phase systematically.

