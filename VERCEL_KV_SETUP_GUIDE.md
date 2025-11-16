# Vercel KV Setup Guide

**Date:** 2025-01-16  
**Purpose:** Step-by-step guide to set up Redis/KV for distributed rate limiting

**Note:** Vercel KV is now available through the Marketplace. We'll use **Upstash Redis** (recommended) or the **Redis** provider.

---

## Quick Setup (5 minutes)

### Option 1: Upstash Redis (Recommended)

**Why Upstash:**
- ✅ Serverless Redis (perfect for Vercel)
- ✅ Free tier: 10K commands/day
- ✅ Pay-per-use pricing
- ✅ Works with `@vercel/kv` package

#### Step 1: Add Upstash Redis from Marketplace

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** tab (or **Marketplace**)
4. Click **"Browse Marketplace"** or find **"Upstash"**
5. Click **"Add Integration"** on Upstash
6. Select **"Redis"** (not Vector, Queue, or Search)
7. Choose a name (e.g., "quivercore-redis")
8. Select region (choose closest to your users)
9. Click **"Create"**

#### Step 2: Verify Environment Variables

Vercel automatically injects these environment variables:
- `UPSTASH_REDIS_REST_URL` - REST API URL
- `UPSTASH_REDIS_REST_TOKEN` - Authentication token

**Note:** We need to update the code to use Upstash instead of Vercel KV.

### Option 2: Redis Provider (Alternative)

1. Go to Vercel Dashboard → Storage → Marketplace
2. Find **"Redis"** provider
3. Click **"Add Integration"**
4. Follow setup instructions
5. Environment variables will be auto-injected

#### Step 3: Update Code (Already Done!)

The code has been updated to support both Vercel KV and Upstash Redis. It will automatically:
- ✅ Try Vercel KV first (if available)
- ✅ Fall back to Upstash Redis (if available)
- ✅ Fall back to in-memory (for local dev)

#### Step 4: Deploy

That's it! Just deploy:

```bash
git push origin main
```

The code will automatically:
- ✅ Detect Upstash Redis environment variables
- ✅ Connect to your Redis database
- ✅ Enable distributed rate limiting

---

## How It Works

### Automatic Detection

The code automatically detects if Redis/KV is available:

```typescript
// lib/redis/client.ts
export function isKVAvailable(): boolean {
  return isVercelKVAvailable() || isUpstashAvailable()
}
```

It tries:
1. **Vercel KV** (if `KV_URL` or `KV_REST_API_URL` is set)
2. **Upstash Redis** (if `UPSTASH_REDIS_REST_URL` is set)
3. **In-memory fallback** (for local development)

### Fallback Behavior

- **With Vercel KV:** Uses distributed rate limiting (works across all instances)
- **Without Vercel KV:** Falls back to in-memory rate limiting (local development)

### Rate Limiting

The rate limiting middleware automatically uses Redis/KV when available:

```typescript
// lib/middleware/rate-limit.ts
if (isKVAvailable()) {
  // Use Redis/KV for distributed rate limiting
  // Tries Vercel KV first, then Upstash Redis
} else {
  // Fall back to in-memory (local dev)
}
```

---

## Pricing

### Upstash Redis Pricing

**Free Tier:**
- 10,000 commands/day
- Sufficient for: ~500-1,000 users

**Pay-as-you-go:**
- $0.20 per 100K commands
- **Estimated cost:** $5-20/month for typical usage

**Example:**
- 1,000 users
- 50 API requests/user/day
- 2 Redis operations per request (get + set)
- = 100K operations/day
- = **~$6/month**

**Note:** Upstash is more cost-effective than Vercel KV for most use cases.

---

## Verification

### Check if KV is Working

1. **Deploy to Vercel**
2. **Check logs** for rate limiting:
   - Look for "Rate limit exceeded (KV)" messages
   - Should see KV operations in logs

3. **Test rate limiting:**
   - Make multiple rapid requests to an API endpoint
   - Should get 429 (Too Many Requests) after limit
   - Check response headers for `X-RateLimit-*`

### Local Development

Vercel KV is **not available locally** by default. The code will:
- ✅ Automatically fall back to in-memory rate limiting
- ✅ Work perfectly for local development
- ✅ Use Vercel KV in production automatically

**To test with KV locally (optional):**
1. Get KV credentials from Vercel dashboard
2. Add to `.env.local`:
   ```
   KV_URL=your-kv-url
   KV_REST_API_URL=your-rest-api-url
   KV_REST_API_TOKEN=your-token
   ```

---

## Troubleshooting

### Redis Not Working?

1. **Check environment variables:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are present
   - These are auto-injected when you add Upstash from Marketplace

2. **Check deployment:**
   - Ensure latest code is deployed
   - Check build logs for errors

3. **Check logs:**
   - Look for "Upstash Redis" or "Vercel KV" in logs
   - Should fall back to in-memory if Redis fails
   - Check for "Rate limit exceeded (KV)" messages

### Rate Limiting Not Working?

1. **Verify Redis is set up:**
   - Check Vercel dashboard → Storage or Marketplace
   - Ensure Upstash Redis database exists
   - Verify environment variables are present

2. **Check code:**
   - Ensure `@upstash/redis` is installed (for Upstash)
   - Ensure `@vercel/kv` is installed (for Vercel KV)
   - Check `lib/middleware/rate-limit.ts` is using Redis

3. **Test locally:**
   - Should use in-memory fallback
   - Should work even without Redis
   - To test with Redis locally, add env vars to `.env.local`

---

## Next Steps

### Optional: Add Caching

Once Redis is set up, you can also use it for caching:

```typescript
import { getKV, setKV } from '@/lib/redis/client'

// Cache API responses
const cached = await getKV('prompts:user-123')
if (cached) {
  return cached
}

// Store in cache
await setKV('prompts:user-123', data, { ttl: 30 })
```

**Note:** The `lib/redis/client.ts` automatically supports both Vercel KV and Upstash Redis.

### Monitor Usage

1. Go to Vercel Dashboard → Storage → Your KV Database
2. View usage statistics
3. Monitor costs

---

## Summary

✅ **Setup:** 5 minutes in Vercel Marketplace  
✅ **Code:** Already implemented (supports both Vercel KV and Upstash)  
✅ **Cost:** Free tier covers most needs (Upstash: 10K commands/day)  
✅ **Fallback:** Works without Redis (local dev)  
✅ **Production:** Automatically uses Redis when available

**You're all set!** Just add Upstash Redis from the Vercel Marketplace and deploy.

---

## Quick Reference

**Environment Variables (Auto-injected by Vercel):**
- `UPSTASH_REDIS_REST_URL` - Upstash REST API URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash authentication token

**Packages Installed:**
- `@vercel/kv` - For Vercel KV (if available)
- `@upstash/redis` - For Upstash Redis (recommended)

**Files:**
- `lib/redis/client.ts` - Unified Redis client (supports both)
- `lib/middleware/rate-limit.ts` - Rate limiting using Redis

