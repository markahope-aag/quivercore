# Fix OAuth Redirect to Localhost in Production

## Problem

When signing in with Google on production (`https://quivercore.app`), you're redirected to `http://localhost:3000/login` instead of staying on the production domain.

## Root Cause

Supabase is using the **Site URL** (which is set to `http://localhost:3000`) instead of respecting the `redirectTo` parameter. This happens when:

1. **Site URL** in Supabase is set to `http://localhost:3000`
2. **Redirect URLs** doesn't include `https://quivercore.app/auth/callback`
3. Supabase falls back to the Site URL when the redirect URL isn't in the allowed list

## Solution: Update Supabase Configuration

### Step 1: Go to Supabase Dashboard

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**

### Step 2: Update Site URL

Change **Site URL** from:
```
http://localhost:3000
```

To:
```
https://quivercore.app
```

### Step 3: Update Redirect URLs

In the **Redirect URLs** section, make sure you have:

**Production (Required):**
```
https://quivercore.app/auth/callback
```

**Optional - For local development:**
```
http://localhost:3000/auth/callback
```

**Important:** The production URL (`https://quivercore.app/auth/callback`) **must** be in the list, otherwise Supabase will ignore the `redirectTo` parameter and use the Site URL.

### Step 4: Save Changes

Click **Save** and wait 1-2 minutes for changes to propagate.

## Why This Happens

Supabase has a security feature that only allows redirects to URLs in the **Redirect URLs** whitelist. If your `redirectTo` URL (`https://quivercore.app/auth/callback`) is not in this list, Supabase will:

1. Ignore the `redirectTo` parameter
2. Fall back to the **Site URL** (`http://localhost:3000`)
3. Redirect to `http://localhost:3000/login` (default redirect path)

## Verification

After updating:

1. **Site URL** should be: `https://quivercore.app`
2. **Redirect URLs** should include: `https://quivercore.app/auth/callback`
3. Try signing in with Google on production
4. Should redirect to: `https://quivercore.app/auth/callback`
5. Then redirect to: `https://quivercore.app/dashboard`

## Current Code

The code is already correct - it uses `window.location.origin` which will be `https://quivercore.app` in production:

```typescript
redirectTo: `${window.location.origin}/auth/callback`
```

The issue is purely in the Supabase configuration.

## Summary

✅ **Update Site URL** to `https://quivercore.app`
✅ **Add Redirect URL** `https://quivercore.app/auth/callback`
✅ **Code is correct** - no changes needed
✅ **Production will work** after Supabase config is updated

