# OAuth Account Linking Behavior

## What Happens When a User Signs Up with Email/Password, Then Uses OAuth?

### Automatic Account Linking

**Supabase automatically links accounts** when a user:
1. Signs up with email/password (e.g., `user@example.com`)
2. Later signs in with Google OAuth using the **same email address** (`user@example.com`)

**Result:** Both authentication methods are linked to the **same user account**. The user can sign in using either:
- Email/password
- Google OAuth

### How It Works

1. **User signs up with email/password:**
   - Account created: `user@example.com` (email/password provider)
   - User ID: `abc123...`

2. **User later clicks "Sign in with Google":**
   - Google OAuth flow starts
   - User authorizes with Google account: `user@example.com`
   - Supabase checks if email matches existing account
   - **Automatic linking occurs** ✅
   - Both providers now linked to same user ID: `abc123...`

3. **User can now sign in with either method:**
   - Email/password → Same account
   - Google OAuth → Same account
   - All prompts, data, settings are preserved

### Security Features

1. **Email Verification Required:**
   - For automatic linking to work, the email must be verified
   - If email isn't verified, Supabase may create a separate account
   - This prevents account hijacking

2. **User Enumeration Protection:**
   - If someone tries to sign up with email after using OAuth with the same email
   - Supabase returns an obfuscated response (doesn't reveal if account exists)
   - Prevents attackers from discovering which emails are registered

### Edge Cases

#### Different Email Addresses

If a user has:
- Email/password account: `work@company.com`
- Google account: `personal@gmail.com`

**Result:** These are **separate accounts** (different emails). User would need to manually link them (see below).

#### Manual Account Linking

For users with different email addresses, they can manually link accounts:

```typescript
// While logged in with email/password
const { data, error } = await supabase.auth.linkIdentity({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
})
```

This allows linking a Google account to an existing email/password account even if emails differ.

### Current Implementation

Our current code handles this automatically through Supabase:

1. **Login Page** (`app/(auth)/login/page.tsx`):
   - `handleOAuthLogin()` calls `supabase.auth.signInWithOAuth()`
   - Supabase handles the linking automatically

2. **Signup Page** (`app/(auth)/signup/page.tsx`):
   - `handleOAuthSignup()` also calls `signInWithOAuth()`
   - If email matches existing account, it links automatically

3. **Callback Route** (`app/auth/callback/route.ts`):
   - Exchanges OAuth code for session
   - Supabase automatically links if email matches

### User Experience

**Best Case (Same Email):**
1. User signs up: `user@example.com` / password
2. User clicks "Sign in with Google" → Uses `user@example.com` Google account
3. ✅ **Automatic linking** - Seamless experience
4. User can use either method going forward

**Edge Case (Different Emails):**
1. User signs up: `work@company.com` / password
2. User clicks "Sign in with Google" → Uses `personal@gmail.com` Google account
3. ⚠️ **Separate accounts created**
4. User would need to manually link accounts (not currently implemented in UI)

### Recommendations

#### Current State: ✅ Good
- Automatic linking works for same-email scenarios
- No code changes needed for basic use case
- Supabase handles security (email verification, enumeration protection)

#### Future Enhancements (Optional)

1. **Account Linking UI:**
   - Add a settings page where users can link/unlink OAuth providers
   - Show which providers are linked
   - Allow manual linking for different email addresses

2. **Better Error Messages:**
   - If linking fails, show helpful message
   - Guide users to verify email if needed

3. **Account Merging:**
   - If user has two accounts (different emails), provide UI to merge
   - Transfer prompts/data from one account to another

### Testing Scenarios

To test account linking:

1. **Test Automatic Linking:**
   ```
   1. Sign up with: test@example.com / password123
   2. Sign out
   3. Click "Sign in with Google" using test@example.com Google account
   4. Verify: Same account, all data preserved
   ```

2. **Test Separate Accounts:**
   ```
   1. Sign up with: work@company.com / password123
   2. Sign out
   3. Click "Sign in with Google" using personal@gmail.com
   4. Verify: New account created (different email)
   ```

3. **Test Email Verification:**
   ```
   1. Sign up with: test@example.com / password123
   2. Don't verify email
   3. Try OAuth with same email
   4. Verify: May create separate account or require verification
   ```

### Configuration

Account linking behavior is controlled by Supabase settings:

1. **Supabase Dashboard** → **Authentication** → **Settings**
2. **Email Auth** → **Enable email confirmations** (recommended: ON)
3. **OAuth** → **Automatic account linking** (default: ON)

### Summary

✅ **Current behavior is correct and secure:**
- Automatic linking works for same-email scenarios
- Supabase handles security and verification
- No code changes needed for basic functionality

⚠️ **Edge cases to be aware of:**
- Different email addresses = separate accounts
- Unverified emails may not link automatically
- Manual linking not currently available in UI (but can be added)

🎯 **User experience:**
- Seamless for same-email scenarios (most common case)
- May need manual intervention for different-email scenarios (rare)

