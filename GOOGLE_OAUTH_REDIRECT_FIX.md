# Fix Google OAuth Redirect URI Mismatch

## Error
```
Error 400: redirect_uri_mismatch
redirect_uri=https://ulgqdtcfhqvazpjfvplp.supabase.co/auth/v1/callback
```

## Solution

You need to add the Supabase callback URL to your Google OAuth configuration.

### Step 1: Go to Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or the project where you created the OAuth credentials)
3. Navigate to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID (the one with Client ID: `905368858640-f2honmoru2ekb4l7ni75i50kflmfmjc7.apps.googleusercontent.com`)
5. Click on it to edit

### Step 2: Add the Redirect URI

In the **Authorized redirect URIs** section, add:

```
https://ulgqdtcfhqvazpjfvplp.supabase.co/auth/v1/callback
```

**Important:** Copy this URL exactly as shown above. It must match exactly.

### Step 3: Also Add Development URL (Optional but Recommended)

For local development, also add:

```
http://localhost:3000/auth/callback
```

### Step 4: Save

Click **Save** at the bottom of the page.

### Step 5: Wait a Few Minutes

Google's changes can take 1-5 minutes to propagate. Wait a moment, then try signing in again.

## Verify Your Supabase Project URL

If you're not sure what your Supabase project URL is:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Your project URL will be shown as: `https://[project-ref].supabase.co`
5. The callback URL is: `https://[project-ref].supabase.co/auth/v1/callback`

## Complete List of Redirect URIs

For a complete setup, add these redirect URIs in Google Cloud Console:

**Production:**
- `https://ulgqdtcfhqvazpjfvplp.supabase.co/auth/v1/callback`

**Development (if testing locally):**
- `http://localhost:3000/auth/callback`

**If you have a custom domain:**
- `https://yourdomain.com/auth/callback`

## After Adding the Redirect URI

1. Wait 1-5 minutes for Google to update
2. Try signing in with Google again
3. The OAuth flow should now work correctly

## Troubleshooting

### Still Getting the Error?

1. **Double-check the URL**: It must be exactly `https://ulgqdtcfhqvazpjfvplp.supabase.co/auth/v1/callback` (no trailing slash, exact case)
2. **Check you're editing the right OAuth client**: Make sure you're editing the one with Client ID `905368858640-f2honmoru2ekb4l7ni75i50kflmfmjc7.apps.googleusercontent.com`
3. **Wait longer**: Sometimes it takes up to 10 minutes for changes to propagate
4. **Clear browser cache**: Try clearing your browser cache or using an incognito window

### Verify in Supabase

Also verify in Supabase Dashboard:
1. Go to **Authentication** → **Providers** → **Google**
2. Make sure Google is **Enabled**
3. Verify the Client ID and Client Secret are correctly entered
4. Check **Site URL** in **Authentication** → **URL Configuration** is set correctly

