# OAuth Configuration for Production

## Current Setup

✅ **Fallback handler is active** - Works for both dev and production
- If Supabase redirects to `/login?code=...`, it automatically redirects to `/auth/callback?code=...`
- This works regardless of environment

## Production Configuration (Recommended)

### Step 1: Configure Supabase for Production Only

1. Go to [Supabase Dashboard](https://app.supabase.com) → Your Project
2. Navigate to **Authentication** → **URL Configuration**
3. Set **Site URL** to your production domain:
   ```
   https://yourdomain.com
   ```
   (or your Vercel deployment URL like `https://your-app.vercel.app`)

4. Add **Redirect URLs**:
   ```
   https://yourdomain.com/auth/callback
   ```
   (or `https://your-app.vercel.app/auth/callback`)

5. **Do NOT add localhost URLs** - The fallback handler will handle local dev

6. Save changes

### Step 2: Verify Production Domain

Make sure your production domain matches what you set in Supabase:
- If using Vercel: Use your Vercel deployment URL
- If using custom domain: Use your custom domain

## How It Works

### Production Flow:
1. User clicks "Sign in with Google" on production
2. Supabase redirects to Google OAuth
3. Google redirects back to Supabase callback
4. Supabase redirects to: `https://yourdomain.com/auth/callback?code=...`
5. Callback route processes authentication
6. User redirected to `/dashboard`

### Development Flow (Local):
1. User clicks "Sign in with Google" on `localhost:3000`
2. Supabase redirects to Google OAuth
3. Google redirects back to Supabase callback
4. **Supabase may redirect to:** `http://localhost:3000/login?code=...` (because localhost isn't in redirect URLs)
5. **Fallback handler detects code** and redirects to `/auth/callback?code=...`
6. Callback route processes authentication
7. User redirected to `/dashboard`

## Why This Works

The fallback handler I added checks for the `code` parameter on the login page and automatically redirects to the callback route. This means:

✅ **Production:** Works correctly with Supabase configuration
✅ **Development:** Works via fallback handler (no Supabase config needed)
✅ **No localhost URLs in Supabase:** Keeps production config clean

## Testing

### Test Production:
1. Deploy to Vercel (or your hosting)
2. Visit production URL
3. Click "Sign in with Google"
4. Should redirect to `/auth/callback` then `/dashboard`

### Test Development:
1. Run `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Sign in with Google"
4. May redirect to `/login?code=...` first, then automatically to `/auth/callback`
5. Should end up at `/dashboard`

## Optional: Add Localhost for Easier Dev Testing

If you want Supabase to redirect directly to `/auth/callback` in development (without the fallback), you can temporarily add:

```
http://localhost:3000/auth/callback
```

To the Redirect URLs in Supabase. But this is **optional** - the fallback handler works fine.

## Summary

✅ **Configure Supabase for production only** (production domain + `/auth/callback`)
✅ **Fallback handler handles local dev** (no Supabase config needed)
✅ **Production will work correctly** with proper Supabase configuration
✅ **Development will work** via the fallback handler

This keeps your Supabase configuration clean and production-focused while still allowing local development to work seamlessly.

