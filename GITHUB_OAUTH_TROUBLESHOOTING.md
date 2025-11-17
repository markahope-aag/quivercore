# GitHub OAuth Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "Redirect URI mismatch" Error

**Symptom:** Error message about redirect URI not matching

**Solution:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on your OAuth App
3. Check **Authorization callback URL** - it must be exactly:
   ```
   https://ulgqdtcfhqvazpjfvplp.supabase.co/auth/v1/callback
   ```
4. **Important:** The callback URL must be the Supabase callback URL, NOT your app's callback URL
5. Save changes
6. Wait 1-2 minutes for changes to propagate

### Issue 2: GitHub OAuth App Not Created

**Symptom:** Nothing happens when clicking "Continue with GitHub"

**Solution:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in:
   - **Application name**: `QuiverCore`
   - **Homepage URL**: `https://quivercore.app` (or your production domain)
   - **Authorization callback URL**: `https://ulgqdtcfhqvazpjfvplp.supabase.co/auth/v1/callback`
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** and copy it
7. Go to Supabase Dashboard → **Authentication** → **Providers** → **GitHub**
8. Enable GitHub provider
9. Paste **Client ID** and **Client Secret**
10. Click **Save**

### Issue 3: GitHub Provider Not Enabled in Supabase

**Symptom:** Button doesn't work or shows error

**Solution:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **GitHub** in the list
5. Toggle it to **Enabled**
6. Make sure **Client ID** and **Client Secret** are filled in
7. Click **Save**

### Issue 4: Wrong Callback URL in GitHub OAuth App

**Symptom:** Redirects fail or show errors

**Solution:**
The callback URL in GitHub OAuth App must be:
```
https://ulgqdtcfhqvazpjfvplp.supabase.co/auth/v1/callback
```

**NOT:**
- ❌ `https://quivercore.app/auth/callback`
- ❌ `http://localhost:3000/auth/callback` (for production)
- ❌ Any other URL

**Why?** Supabase handles the OAuth callback first, then redirects to your app.

### Issue 5: Client Secret Not Set or Expired

**Symptom:** Authentication fails silently

**Solution:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on your OAuth App
3. If you don't see a client secret, click **Generate a new client secret**
4. Copy the new secret immediately (you can only see it once)
5. Go to Supabase Dashboard → **Authentication** → **Providers** → **GitHub**
6. Paste the new **Client Secret**
7. Click **Save**

### Issue 6: Same Issues as Google OAuth

If GitHub has the same redirect loop or login issues as Google had:

**Check:**
1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. **Site URL** should be: `https://quivercore.app`
3. **Redirect URLs** should include: `https://quivercore.app/auth/callback`

The same fixes applied to Google OAuth should work for GitHub.

## Quick Verification Checklist

- [ ] GitHub OAuth App created at https://github.com/settings/developers
- [ ] Callback URL set to: `https://ulgqdtcfhqvazpjfvplp.supabase.co/auth/v1/callback`
- [ ] Client ID copied from GitHub
- [ ] Client Secret generated and copied from GitHub
- [ ] GitHub provider enabled in Supabase Dashboard
- [ ] Client ID and Client Secret entered in Supabase
- [ ] Supabase Site URL set to: `https://quivercore.app`
- [ ] Redirect URLs include: `https://quivercore.app/auth/callback`

## Testing

1. Go to `https://quivercore.app/login`
2. Click "Continue with GitHub"
3. You should be redirected to GitHub authorization page
4. After authorizing, you should be redirected back
5. Should end up at `/dashboard` logged in

## Still Not Working?

Check:
1. **Browser Console** - Look for JavaScript errors
2. **Network Tab** - Check the OAuth request/response
3. **Supabase Logs** - Check Authentication logs in Supabase Dashboard
4. **GitHub OAuth App Settings** - Verify callback URL is exactly correct

## Differences from Google OAuth

GitHub OAuth setup is similar to Google, but:
- Uses GitHub Developer Settings instead of Google Cloud Console
- Only needs one callback URL (the Supabase one)
- No "Authorized JavaScript origins" field needed
- Simpler setup overall

