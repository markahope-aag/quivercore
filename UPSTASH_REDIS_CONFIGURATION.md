# Upstash Redis Configuration Guide

**Date:** 2025-01-16  
**Topic:** Eviction Policy and Prod Pack options for Upstash Redis

---

## Eviction Policy

### What is Eviction?

**Eviction** determines what happens when your Redis database reaches its memory limit. When Redis is full, it needs to decide which keys to remove to make room for new data.

### Eviction Policy Options

#### 1. **noeviction** (Recommended for Rate Limiting)

**What it does:**
- Redis **refuses** to add new keys when memory is full
- Returns an error instead of deleting existing keys
- Best for: Rate limiting, critical data that must not be lost

**When to use:**
- ✅ **Rate limiting** (your use case)
- ✅ Critical counters
- ✅ Data that must never be deleted

**Example:**
```
Memory full → New request comes in → Error: "OOM command not allowed when used memory > 'maxmemory'"
```

#### 2. **allkeys-lru** (Least Recently Used)

**What it does:**
- Deletes the **least recently used** keys when memory is full
- Removes keys that haven't been accessed recently
- Best for: Caching, non-critical data

**When to use:**
- ✅ Caching API responses
- ✅ Non-critical data
- ✅ When you want automatic cleanup

**Example:**
```
Memory full → New request comes in → Deletes oldest unused key → Adds new key
```

#### 3. **allkeys-lfu** (Least Frequently Used)

**What it does:**
- Deletes the **least frequently used** keys when memory is full
- Removes keys that are accessed least often
- Best for: Caching with access patterns

**When to use:**
- ✅ Caching with known access patterns
- ✅ When frequency matters more than recency

#### 4. **volatile-lru** / **volatile-lfu**

**What it does:**
- Only evicts keys with an expiration (TTL)
- Never deletes keys without expiration
- Best for: Mixed critical and cache data

**When to use:**
- ✅ Mix of critical data (no TTL) and cache (with TTL)
- ✅ Want to protect some keys from eviction

---

## Recommendation for Your Use Case

### For Rate Limiting: **noeviction** ✅

**Why:**
- Rate limiting counters are **critical** - you don't want them deleted
- Rate limits are short-lived (15 minutes) - they expire naturally
- Better to get an error than lose rate limit data
- Prevents accidental data loss

**Configuration:**
```
Eviction Policy: noeviction
```

**What happens:**
- If Redis gets full, you'll get an error
- This is **rare** because rate limit keys expire quickly (15 min)
- Better than losing rate limit data

### For Caching (Future): **allkeys-lru** ✅

**If you add caching later:**
- Use `allkeys-lru` for cache keys
- Cache data can be regenerated
- Automatic cleanup is helpful

---

## Prod Pack

### What is Prod Pack?

**Prod Pack** is Upstash's production-ready plan that includes:
- ✅ **Higher memory limits** (256MB - 1GB+)
- ✅ **Better performance** (lower latency)
- ✅ **More commands** (higher limits)
- ✅ **Priority support**
- ✅ **SLA guarantees**

### Do You Need Prod Pack?

#### ❌ **No, Not Yet**

**Why:**
- Free tier is sufficient for most use cases
- Rate limiting uses minimal memory
- You can upgrade later if needed

**Free Tier Limits:**
- 10,000 commands/day
- 256MB memory (plenty for rate limiting)
- Sufficient for: ~500-1,000 users

**When to Upgrade:**
- ✅ >1,000 active users
- ✅ >10K commands/day
- ✅ Need more memory
- ✅ Need better performance

#### ✅ **Consider Prod Pack If:**

1. **High Traffic:**
   - >1,000 active users
   - >100K API requests/day
   - Need more than 10K commands/day

2. **Memory Needs:**
   - Using Redis for caching (not just rate limiting)
   - Storing large amounts of data
   - Need >256MB memory

3. **Performance Requirements:**
   - Need lower latency
   - Need SLA guarantees
   - Production-critical application

---

## Configuration Recommendations

### For Rate Limiting (Current Setup)

**Recommended Settings:**
```
Eviction Policy: noeviction
Plan: Free Tier (or Pay-as-you-go)
Memory: 256MB (default, sufficient)
Region: Closest to your users
```

**Why:**
- `noeviction` protects rate limit data
- Free tier is sufficient for most use cases
- Can upgrade later if needed

### For Production (High Traffic)

**Recommended Settings:**
```
Eviction Policy: noeviction (for rate limiting)
Plan: Prod Pack (if >1K users)
Memory: 512MB - 1GB (depending on usage)
Region: Closest to your users
```

---

## Cost Comparison

### Free Tier
- **Cost:** $0
- **Commands:** 10K/day
- **Memory:** 256MB
- **Good for:** <1K users, development, testing

### Pay-as-you-go
- **Cost:** $0.20 per 100K commands
- **Commands:** Unlimited
- **Memory:** 256MB
- **Good for:** 1K-10K users, moderate traffic

### Prod Pack
- **Cost:** $10-50+/month
- **Commands:** Higher limits
- **Memory:** 512MB - 1GB+
- **Good for:** >10K users, high traffic, production

---

## Step-by-Step Configuration

### When Setting Up Upstash Redis:

1. **Eviction Policy:**
   - Select: **"noeviction"** ✅
   - Reason: Protects rate limiting data

2. **Plan:**
   - Start with: **Free Tier** or **Pay-as-you-go** ✅
   - Upgrade to Prod Pack later if needed

3. **Memory:**
   - Default: **256MB** ✅
   - Sufficient for rate limiting
   - Can increase later if needed

4. **Region:**
   - Select: **Closest to your users** ✅
   - Lower latency = better performance

---

## What Happens If You Choose Wrong?

### Wrong Eviction Policy:

**If you choose `allkeys-lru` for rate limiting:**
- ⚠️ Rate limit counters might be deleted
- ⚠️ Rate limiting might not work correctly
- ✅ Can change later in settings

**If you choose `noeviction` for caching:**
- ⚠️ Might get errors when cache is full
- ⚠️ Need to manually manage cache size
- ✅ Can change later in settings

### Wrong Plan:

**If you choose Free Tier but need more:**
- ✅ Can upgrade anytime
- ✅ Pay-as-you-go charges only for usage
- ✅ No lock-in

**If you choose Prod Pack but don't need it:**
- ⚠️ Paying for unused resources
- ✅ Can downgrade later
- ✅ Better to start small and scale up

---

## Final Recommendation

### For Your Current Setup:

```
✅ Eviction Policy: noeviction
✅ Plan: Free Tier (or Pay-as-you-go)
✅ Memory: 256MB (default)
✅ Region: Closest to your users
```

### Why:

1. **`noeviction`** protects rate limiting data
2. **Free tier** is sufficient for most use cases
3. **Can upgrade later** if needed
4. **No risk** - can change settings anytime

---

## Summary

**Eviction Policy:**
- ✅ Choose **"noeviction"** for rate limiting
- Protects critical data from deletion
- Can change later if needed

**Prod Pack:**
- ❌ **Not needed yet** - start with Free Tier
- ✅ Upgrade later if you have >1K users
- ✅ Can change anytime

**Bottom Line:**
- Start simple: `noeviction` + Free Tier
- Upgrade when you need it
- No risk - all settings can be changed later

---

**Quick Answer:**
- **Eviction:** Choose **"noeviction"**
- **Prod Pack:** **Skip it** for now (use Free Tier)

