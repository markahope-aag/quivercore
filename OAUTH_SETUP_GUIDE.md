# OAuth Authentication Setup Guide

This guide explains how to configure OAuth providers (Google, GitHub, etc.) for QuiverCore authentication.

## Overview

QuiverCore now supports OAuth authentication through Supabase, allowing users to sign in with:
- **Google**
- **GitHub**
- **Discord** (can be added)

OAuth authentication is integrated into both the login and signup pages.

## Prerequisites

1. A Supabase project (already configured)
2. OAuth provider accounts (Google Cloud Console, GitHub, etc.)
3. Access to your Supabase dashboard

## Setup Instructions

### 1. Configure OAuth in Supabase Dashboard

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Enable the providers you want to use (Google, GitHub, etc.)

### 2. Google OAuth Setup

#### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure the OAuth consent screen if prompted:
   - User Type: External (or Internal for Google Workspace)
   - App name: QuiverCore
   - User support email: Your email
   - Developer contact: Your email
6. Create OAuth client ID:
   - Application type: **Web application**
   - Name: QuiverCore
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `https://your-supabase-project.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)

#### Step 2: Add Credentials to Supabase

1. Copy the **Client ID** and **Client Secret** from Google Cloud Console
2. In Supabase Dashboard → **Authentication** → **Providers** → **Google**
3. Enable Google provider
4. Paste the **Client ID** and **Client Secret**
5. Click **Save**

### 3. GitHub OAuth Setup

#### Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in the form:
   - **Application name**: QuiverCore
   - **Homepage URL**: `https://yourdomain.com` (or `http://localhost:3000` for dev)
   - **Authorization callback URL**: 
     - `https://your-supabase-project.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** and copy it

#### Step 2: Add Credentials to Supabase

1. In Supabase Dashboard → **Authentication** → **Providers** → **GitHub**
2. Enable GitHub provider
3. Paste the **Client ID** and **Client Secret**
4. Click **Save**

### 4. Discord OAuth Setup (Optional)

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to **OAuth2** section
4. Add redirect URI: `https://your-supabase-project.supabase.co/auth/v1/callback`
5. Copy **Client ID** and **Client Secret**
6. In Supabase Dashboard → **Authentication** → **Providers** → **Discord**
7. Enable and configure with credentials

### 5. Configure Redirect URLs

Make sure your redirect URLs are properly configured:

**Development:**
- `http://localhost:3000/auth/callback`

**Production:**
- `https://yourdomain.com/auth/callback`

These should be set in:
1. OAuth provider settings (Google, GitHub, etc.)
2. Supabase Dashboard → **Authentication** → **URL Configuration** → **Redirect URLs**

### 6. Environment Variables

No additional environment variables are needed! The OAuth configuration is handled entirely through Supabase.

## Testing OAuth

1. Start your development server: `npm run dev`
2. Navigate to `/login` or `/signup`
3. Click "Continue with Google" or "Continue with GitHub"
4. You should be redirected to the OAuth provider
5. After authorization, you'll be redirected back to your app

## Troubleshooting

### "Redirect URI mismatch" Error

- **Cause**: The redirect URI in your OAuth provider doesn't match Supabase's callback URL
- **Solution**: 
  1. Check Supabase callback URL: `https://your-project.supabase.co/auth/v1/callback`
  2. Ensure this exact URL is in your OAuth provider's authorized redirect URIs
  3. For local development, also add: `http://localhost:3000/auth/callback`

### OAuth Button Not Working

- Check browser console for errors
- Verify the provider is enabled in Supabase Dashboard
- Ensure credentials are correctly entered in Supabase

### User Not Redirected After OAuth

- Check that `/auth/callback` route exists (it's created in this setup)
- Verify the redirect URL in `handleOAuthLogin` matches your domain
- Check Supabase logs for authentication errors

## Security Considerations

1. **HTTPS in Production**: Always use HTTPS in production for OAuth
2. **Client Secrets**: Never expose client secrets in client-side code
3. **Redirect URLs**: Only whitelist trusted redirect URLs
4. **Session Management**: Supabase handles session management securely

## Additional Providers

Supabase supports many OAuth providers. To add more:

1. Enable the provider in Supabase Dashboard
2. Configure credentials from the provider
3. Add a button in `app/(auth)/login/page.tsx` and `app/(auth)/signup/page.tsx`
4. Update the `handleOAuthLogin` function type to include the new provider

Supported providers include:
- Google ✅
- GitHub ✅
- Discord
- Apple
- Azure
- Bitbucket
- Facebook
- GitLab
- Keycloak
- LinkedIn
- Notion
- Slack
- Spotify
- Twitch
- Twitter
- Zoom

## Next Steps

After setting up OAuth:

1. Test the authentication flow
2. Verify users can sign in with OAuth providers
3. Check that user profiles are created correctly
4. Test the logout functionality
5. Monitor authentication logs in Supabase Dashboard

## Support

For issues:
1. Check Supabase authentication logs
2. Review browser console for client-side errors
3. Verify OAuth provider configuration
4. Check Supabase documentation: https://supabase.com/docs/guides/auth

