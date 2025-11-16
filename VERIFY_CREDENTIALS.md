# Verify Redis Credentials Setup

**Date:** 2025-01-16  
**Topic:** Checking if Upstash Redis credentials are properly configured

---

## ✅ Good News: Vercel Should Auto-Inject Credentials

When you add Upstash Redis through Vercel Marketplace, Vercel **automatically** injects the credentials as environment variables. You typically **don't need to add them manually**.

---

## 🔍 How to Verify Credentials Are Set

### Step 1: Check Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Look for:
   - ✅ `UPSTASH_REDIS_REST_URL`
   - ✅ `UPSTASH_REDIS_REST_TOKEN`

**If you see them:** ✅ You're all set! No action needed.

**If you DON'T see them:** ⚠️ They might need to be added manually (see below).

---

## ⚠️ If Credentials Are Missing

### Option 1: Check Upstash Integration

1. Go to Vercel Dashboard → Your Project → **Storage**
2. Find your Upstash Redis database
3. Click on it
4. Check if it shows as "Connected" or "Linked"
5. If not connected, try re-linking it

### Option 2: Get Credentials from Upstash

If Vercel didn't auto-inject them, you can get them from Upstash:

1. Go to [Upstash Console](https://console.upstash.com)
2. Select your Redis database
3. Go to **Details** or **REST API** section
4. Copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REST_API_TOKEN`

### Option 3: Add Manually to Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click **"Add New"**
3. Add:
   - **Name:** `UPSTASH_REDIS_REST_URL`
   - **Value:** (paste from Upstash console)
   - **Environment:** Production, Preview, Development (select all)
4. Click **"Add"**
5. Repeat for `UPSTASH_REDIS_REST_TOKEN`

---

## 🧪 Test If Credentials Work

### After Deployment:

1. **Check Logs:**
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for errors like:
     - ❌ "Failed to create Upstash Redis client"
     - ❌ "UPSTASH_REDIS_REST_URL is not set"
   - If you see these, credentials aren't set

2. **Test API:**
   - Make a request to your API
   - Check if rate limiting works
   - If you get errors, credentials might be missing

3. **Check Code Detection:**
   - The code checks: `process.env.UPSTASH_REDIS_REST_URL`
   - If this is undefined, it falls back to in-memory
   - Check logs for "Rate limit exceeded (in-memory)" vs "(KV)"

---

## 📋 What the Code Checks

The code automatically detects if credentials are available:

```typescript
// lib/redis/client.ts
export function isUpstashAvailable(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}
```

**If credentials are set:**
- ✅ Uses Upstash Redis
- ✅ Distributed rate limiting works
- ✅ Logs show "Rate limit exceeded (KV)"

**If credentials are NOT set:**
- ⚠️ Falls back to in-memory rate limiting
- ⚠️ Logs show "Rate limit exceeded (in-memory)"
- ⚠️ Still works, but not distributed

---

## ✅ Quick Checklist

- [ ] Check Vercel Dashboard → Settings → Environment Variables
- [ ] Verify `UPSTASH_REDIS_REST_URL` exists
- [ ] Verify `UPSTASH_REDIS_REST_TOKEN` exists
- [ ] Check if Upstash integration is connected in Storage tab
- [ ] After deployment, check logs for Redis errors
- [ ] Test rate limiting to verify it's working

---

## 🚨 Common Issues

### Issue 1: Credentials Not Auto-Injected

**Symptom:** Environment variables missing in Vercel

**Solution:**
1. Check if Upstash integration is properly linked
2. Try disconnecting and reconnecting
3. Or add credentials manually (see Option 3 above)

### Issue 2: Credentials Set But Not Working

**Symptom:** Variables exist but Redis doesn't connect

**Solution:**
1. Verify values are correct (no extra spaces)
2. Check if they're set for the right environment (Production/Preview)
3. Redeploy after adding variables
4. Check logs for specific error messages

### Issue 3: Works Locally But Not in Production

**Symptom:** Works with `.env.local` but not on Vercel

**Solution:**
1. Ensure variables are set in Vercel (not just locally)
2. Check environment scope (Production vs Development)
3. Redeploy after adding variables

---

## 📝 Summary

**Most Likely:** ✅ Credentials are auto-injected by Vercel - no action needed

**If Missing:** 
1. Check Vercel → Storage → Upstash integration
2. Get credentials from Upstash Console
3. Add manually to Vercel Environment Variables

**To Verify:**
1. Check Vercel Dashboard → Settings → Environment Variables
2. After deployment, check logs
3. Test rate limiting

---

**Bottom Line:** Vercel should have auto-injected the credentials. Just verify they're there in the Environment Variables section. If not, add them manually using the steps above.

