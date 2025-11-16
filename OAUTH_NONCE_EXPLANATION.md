# OAuth Nonce Checks - Explanation

## What is a Nonce?

A **nonce** (number used once) is a security mechanism used in OAuth flows to prevent replay attacks. It's a random value that's generated for each authentication request and verified when the user returns from the OAuth provider.

## "Skip nonce checks?" Setting

When configuring OAuth providers in Supabase, you'll see a "Skip nonce checks?" option. Here's what it means:

### ✅ Recommended: Keep Nonce Checks ENABLED (Unchecked)

**Default behavior (nonce checks enabled):**
- ✅ More secure - prevents replay attacks
- ✅ Standard OAuth 2.0 security practice
- ✅ Recommended for production use
- ✅ Works with all modern OAuth providers

**What it does:**
- Generates a unique nonce for each OAuth request
- Verifies the nonce when the user returns from the provider
- Ensures the authentication response is legitimate and not a replay

### ⚠️ When to Skip Nonce Checks (Enable the option)

Only enable "Skip nonce checks" if:
- You're experiencing specific OAuth flow errors related to nonce validation
- You're using a legacy OAuth provider that doesn't support nonces
- You're in a development/testing environment and need to debug OAuth issues

**Risks of skipping nonce checks:**
- ⚠️ Reduced security - more vulnerable to replay attacks
- ⚠️ Not recommended for production
- ⚠️ May violate OAuth 2.0 security best practices

## Recommendation for QuiverCore

**For Google OAuth:**
- ✅ **Keep nonce checks ENABLED** (leave "Skip nonce checks?" unchecked)
- Google fully supports nonce checks
- This is the most secure configuration

**For GitHub OAuth:**
- ✅ **Keep nonce checks ENABLED** (leave "Skip nonce checks?" unchecked)
- GitHub fully supports nonce checks

## How to Configure

In Supabase Dashboard → Authentication → Providers → Google:

1. Enable Google provider
2. Add your Client ID and Client Secret
3. **Leave "Skip nonce checks?" UNCHECKED** ✅
4. Click Save

## Troubleshooting

If you're experiencing OAuth errors and suspect nonce issues:

1. **First, check the error message** - it will usually mention nonce if that's the issue
2. **Check browser console** - look for nonce-related errors
3. **Verify redirect URI** - most OAuth issues are actually redirect URI mismatches
4. **Only as a last resort** - temporarily enable "Skip nonce checks" to test if that's the issue
5. **If skipping nonce checks fixes it** - investigate why nonce validation is failing (usually a configuration issue)

## Security Best Practices

1. ✅ Always use nonce checks in production
2. ✅ Keep OAuth credentials secure (never in code)
3. ✅ Use HTTPS in production
4. ✅ Verify redirect URIs are correctly configured
5. ✅ Monitor authentication logs for suspicious activity

## Summary

**For your Google OAuth setup:**
- Leave "Skip nonce checks?" **UNCHECKED** ✅
- This provides the best security
- Google OAuth works perfectly with nonce checks enabled

