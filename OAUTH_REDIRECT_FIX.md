# Fix OAuth Redirect to Login Page

## Problem

After signing in with Google OAuth, you're redirected to:
- `http://localhost:3000/login?code=...` ❌

Instead of:
- `http://localhost:3000/auth/callback?code=...` ✅

## Immediate Fix (Already Applied)

I've added a fallback handler that detects the `code` parameter on the login/signup pages and automatically redirects to `/auth/callback`. This should work immediately.

## Root Cause

The issue is in your **Supabase Dashboard configuration**. Supabase is using the wrong redirect URL.

## Permanent Fix: Update Supabase Configuration

### Step 1: Go to Supabase Dashboard

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**

### Step 2: Update Site URL

Set the **Site URL** to:
- **Development:** `http://localhost:3000`
- **Production:** `https://yourdomain.com` (or your Vercel URL)

### Step 3: Add Redirect URLs

In the **Redirect URLs** section, add:

**Development:**
```
http://localhost:3000/auth/callback
```

**Production:**
```
https://yourdomain.com/auth/callback
```

**Important:** Make sure `/auth/callback` is in the list, not `/login`.

### Step 4: Save Changes

Click **Save** and wait 1-2 minutes for changes to propagate.

## Verify Configuration

After updating:

1. **Site URL** should be: `http://localhost:3000` (for dev)
2. **Redirect URLs** should include: `http://localhost:3000/auth/callback`
3. **Redirect URLs** should NOT include: `http://localhost:3000/login`

## Testing

1. Try signing in with Google again
2. You should be redirected to `/auth/callback?code=...`
3. Then automatically redirected to `/dashboard`
4. You should be logged in successfully

## Why This Happens

Supabase uses the **Site URL** as the default redirect destination if:
- The `redirectTo` parameter isn't properly configured
- The redirect URL isn't in the allowed list
- The Site URL is set incorrectly

By setting the Site URL to your app domain and adding `/auth/callback` to the redirect URLs, Supabase will know to redirect there instead of `/login`.

## Current Status

✅ **Fallback handler added** - Will redirect `/login?code=...` to `/auth/callback?code=...`
⚠️ **Supabase config needs update** - Follow steps above for permanent fix

The fallback will work, but updating Supabase configuration is the proper solution.

