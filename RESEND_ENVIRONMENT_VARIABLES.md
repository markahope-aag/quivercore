# Resend Environment Variables

**Date:** 2025-01-16  
**Purpose:** Complete guide to Resend environment variables

---

## Required Environment Variables

### 1. `RESEND_API_KEY` ✅ **REQUIRED**

**What it is:**
- Your Resend API key for authentication
- Starts with `re_`
- Used to authenticate with Resend API

**Where to get it:**
1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Click **"Create API Key"**
3. Give it a name (e.g., "QuiverCore Production")
4. Select permissions (at minimum: "Send emails")
5. Copy the API key

**Format:**
```
RESEND_API_KEY=re_1234567890abcdefghijklmnopqrstuvwxyz
```

**Where to set it:**
- ✅ **Local:** `.env.local`
- ✅ **Vercel:** Project Settings → Environment Variables
- ✅ **All environments:** Production, Preview, Development

**Security:**
- ⚠️ **Never commit to git** (already in `.gitignore`)
- ⚠️ **Keep secret** - don't expose in client-side code
- ✅ **Server-side only** - safe to use in API routes

---

## Optional Environment Variables

### 2. `RESEND_FROM_EMAIL` ⚠️ **OPTIONAL**

**What it is:**
- Default "from" email address for all emails
- Used when `from` parameter is not specified in `sendEmail()`

**Default value:**
- If not set, defaults to `onboarding@resend.dev`
- Limited to 100 emails/day
- Good for development/testing

**Format:**
```
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Recommended for production:**
- Use your verified domain email
- Better deliverability
- Professional appearance
- No daily limit (based on plan)

**Where to set it:**
- ✅ **Local:** `.env.local` (optional)
- ✅ **Vercel:** Project Settings → Environment Variables (optional)

**How to verify domain:**
1. Go to [Resend Domains](https://resend.com/domains)
2. Click **"Add Domain"**
3. Add your domain (e.g., `yourdomain.com`)
4. Add DNS records as instructed
5. Wait for verification
6. Use verified email (e.g., `noreply@yourdomain.com`)

---

## Complete Environment Variables List

### Required (1)
- ✅ `RESEND_API_KEY` - **MUST SET**

### Optional (1)
- ⚠️ `RESEND_FROM_EMAIL` - Optional (defaults to `onboarding@resend.dev`)

---

## Setup Instructions

### Local Development

**Create/Edit `.env.local`:**
```env
# Required
RESEND_API_KEY=re_your_api_key_here

# Optional (recommended)
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Note:** `.env.local` is already in `.gitignore`, so it won't be committed.

### Vercel Production

1. **Go to Vercel Dashboard:**
   - [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project
   - Go to **Settings** → **Environment Variables**

2. **Add `RESEND_API_KEY`:**
   - Click **"Add New"**
   - **Name:** `RESEND_API_KEY`
   - **Value:** Your Resend API key
   - **Environment:** Select all (Production, Preview, Development)
   - Click **"Add"**

3. **Add `RESEND_FROM_EMAIL` (Optional):**
   - Click **"Add New"**
   - **Name:** `RESEND_FROM_EMAIL`
   - **Value:** Your verified domain email (e.g., `noreply@yourdomain.com`)
   - **Environment:** Select all
   - Click **"Add"**

4. **Redeploy:**
   - After adding variables, redeploy your project
   - Or wait for next deployment

---

## Verification

### Check if Variables Are Set

**In Code:**
```typescript
// lib/email/resend.ts automatically checks
if (!process.env.RESEND_API_KEY) {
  // Email functionality disabled
  logger.warn('RESEND_API_KEY not set')
}
```

**In Vercel:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify `RESEND_API_KEY` is listed
3. Check it's set for the right environments

**Local:**
```bash
# Check if variable is set (won't show value for security)
echo $RESEND_API_KEY
```

---

## Usage in Code

### How Variables Are Used

```typescript
// lib/email/resend.ts

// Check if available
const apiKey = process.env.RESEND_API_KEY
if (!apiKey) {
  // Email disabled
}

// Create client
const resend = new Resend(apiKey)

// Get from email
const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
```

### Example Usage

```typescript
import { sendEmail } from '@/lib/email/resend'

// Uses RESEND_FROM_EMAIL if set, otherwise uses 'onboarding@resend.dev'
await sendEmail({
  to: 'user@example.com',
  from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  subject: 'Welcome!',
  html: '<h1>Welcome!</h1>',
})
```

---

## Security Best Practices

### ✅ Do:
- ✅ Store API key in environment variables only
- ✅ Use different keys for dev/prod
- ✅ Rotate keys periodically
- ✅ Use verified domain for production
- ✅ Keep keys secret

### ❌ Don't:
- ❌ Commit API keys to git
- ❌ Expose keys in client-side code
- ❌ Share keys publicly
- ❌ Use same key for all environments

---

## Troubleshooting

### Issue: Email Not Sending

**Check:**
1. ✅ `RESEND_API_KEY` is set
2. ✅ API key is valid (starts with `re_`)
3. ✅ API key has "Send emails" permission
4. ✅ Check Resend Dashboard → Logs for errors

### Issue: "From email not verified"

**Solution:**
1. Verify domain in Resend Dashboard
2. Or use `onboarding@resend.dev` (limited to 100/day)
3. Set `RESEND_FROM_EMAIL` to verified email

### Issue: Rate Limits

**Free Tier:**
- 100 emails/day
- 3,000 emails/month

**Solution:**
- Upgrade Resend plan
- Or verify domain (may increase limits)

---

## Quick Reference

### Minimum Setup (Development)
```env
RESEND_API_KEY=re_your_key_here
```

### Production Setup (Recommended)
```env
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

---

## Summary

**Required:**
- ✅ `RESEND_API_KEY` - **MUST SET**

**Optional:**
- ⚠️ `RESEND_FROM_EMAIL` - Optional (defaults to `onboarding@resend.dev`)

**Where to Set:**
- Local: `.env.local`
- Vercel: Settings → Environment Variables

**That's it!** Just set `RESEND_API_KEY` and you're ready to send emails. 🚀

