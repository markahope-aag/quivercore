# Fix OAuth Branding - Professional Domain Display

## Problem

When users click "Sign in with Google", they see:
- **"Sign in to continue to ulgqdtcfhqvazpjfvplp.supabase.co"**

This looks unprofessional and potentially suspicious to users.

## Solutions

### Solution 1: Configure Site URL in Supabase (Recommended)

This tells Supabase to use your production domain instead of the project URL.

1. **Go to Supabase Dashboard:**
   - Navigate to **Authentication** → **URL Configuration**
   - Find **Site URL** field

2. **Set Site URL:**
   - **Production:** `https://yourdomain.com` (or your Vercel domain)
   - **Development:** `http://localhost:3000`

3. **Add Redirect URLs:**
   - Add: `https://yourdomain.com/auth/callback`
   - Add: `http://localhost:3000/auth/callback` (for dev)

4. **Save Changes**

**Result:** Google OAuth will show your domain instead of the Supabase URL.

### Solution 2: Update Google OAuth App Name

Make the OAuth consent screen more professional:

1. **Go to Google Cloud Console:**
   - Navigate to **APIs & Services** → **OAuth consent screen**

2. **Update App Information:**
   - **App name:** `QuiverCore` (or your preferred name)
   - **User support email:** Your email
   - **App logo:** Upload your logo (optional but recommended)
   - **App domain:** Your production domain

3. **Save Changes**

**Result:** Users will see "Sign in to QuiverCore" instead of the raw Supabase URL.

### Solution 3: Use Custom Domain with Supabase (Advanced)

If you have a custom domain, you can configure it in Supabase:

1. **Supabase Dashboard** → **Settings** → **Custom Domains**
2. Add your custom domain
3. Configure DNS records as instructed
4. Update OAuth redirect URIs to use your custom domain

**Note:** This requires DNS access and may take time to propagate.

## Quick Fix (Immediate)

The fastest improvement is **Solution 2** (Update Google OAuth App Name):

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **OAuth consent screen**
3. Update:
   - **App name:** `QuiverCore`
   - **User support email:** Your email
   - **Developer contact:** Your email
4. Save

**Result:** Users will see "Sign in to QuiverCore" which is much more professional.

## Best Practice: Combine Solutions

For the best user experience:

1. ✅ **Set Site URL in Supabase** (Solution 1)
2. ✅ **Update OAuth App Name** (Solution 2)
3. ⭐ **Add Custom Domain** (Solution 3 - if you have one)

## Current Configuration Check

To check your current setup:

1. **Supabase Dashboard:**
   - **Authentication** → **URL Configuration**
   - Check **Site URL** and **Redirect URLs**

2. **Google Cloud Console:**
   - **APIs & Services** → **OAuth consent screen**
   - Check **App name** and branding

3. **Vercel (if deployed):**
   - Check your production domain
   - Ensure it's added to Supabase redirect URLs

## Testing

After making changes:

1. Wait 1-5 minutes for changes to propagate
2. Try signing in with Google
3. Verify the OAuth screen shows your app name/domain
4. Complete the sign-in flow
5. Verify redirect works correctly

