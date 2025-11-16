# Resend Email Setup Guide

**Date:** 2025-01-16  
**Purpose:** Step-by-step guide to set up Resend for email functionality

---

## Quick Setup (5 minutes)

### Step 1: Create Resend Account

1. Go to [Resend](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### Step 2: Get API Key

1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Click **"Create API Key"**
3. Give it a name (e.g., "QuiverCore Production")
4. Select permissions (at minimum: "Send emails")
5. Copy the API key (starts with `re_`)

### Step 3: Add to Environment Variables

**Local Development (`.env.local`):**
```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Vercel Production:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click **"Add New"**
3. Add:
   - **Name:** `RESEND_API_KEY`
   - **Value:** Your Resend API key
   - **Environment:** Production, Preview, Development (select all)
4. Click **"Add"**
5. Repeat for `RESEND_FROM_EMAIL` (optional, defaults to `onboarding@resend.dev`)

### Step 4: Verify Domain (Optional but Recommended)

**For Production:**
1. Go to [Resend Domains](https://resend.com/domains)
2. Click **"Add Domain"**
3. Add your domain (e.g., `yourdomain.com`)
4. Add DNS records as instructed
5. Wait for verification (usually a few minutes)
6. Use verified domain email in `RESEND_FROM_EMAIL`

**For Development:**
- Can use `onboarding@resend.dev` (default)
- Limited to 100 emails/day
- Good for testing

---

## Usage

### Basic Email Sending

```typescript
import { sendEmail } from '@/lib/email/resend'

// Send a simple email
const result = await sendEmail({
  to: 'user@example.com',
  from: 'noreply@yourdomain.com',
  subject: 'Welcome!',
  html: '<h1>Welcome to QuiverCore!</h1>',
  text: 'Welcome to QuiverCore!',
})

if (result.success) {
  console.log('Email sent:', result.messageId)
} else {
  console.error('Email failed:', result.error)
}
```

### Transactional Emails

```typescript
import { sendTransactionalEmail } from '@/lib/email/resend'

// Send welcome email
await sendTransactionalEmail('user@example.com', 'welcome', {
  name: 'John Doe',
})

// Send password reset
await sendTransactionalEmail('user@example.com', 'password-reset', {
  name: 'John Doe',
  resetUrl: 'https://yourapp.com/reset?token=abc123',
  expiryMinutes: 60,
})

// Send verification email
await sendTransactionalEmail('user@example.com', 'verification', {
  name: 'John Doe',
  verificationUrl: 'https://yourapp.com/verify?token=abc123',
})
```

### Advanced Options

```typescript
await sendEmail({
  to: ['user1@example.com', 'user2@example.com'],
  from: 'noreply@yourdomain.com',
  subject: 'Important Update',
  html: '<p>Your content here</p>',
  text: 'Your content here',
  replyTo: 'support@yourdomain.com',
  cc: 'manager@example.com',
  bcc: 'archive@example.com',
  tags: [
    { name: 'category', value: 'notification' },
    { name: 'user_id', value: '123' },
  ],
})
```

---

## Pricing

### Free Tier
- 3,000 emails/month
- 100 emails/day
- Perfect for development and small apps

### Paid Plans
- **Pro:** $20/month - 50,000 emails
- **Business:** $80/month - 200,000 emails
- **Enterprise:** Custom pricing

---

## Features

✅ **Transactional Emails**
- Welcome emails
- Password resets
- Email verification
- Notifications

✅ **Reliability**
- High deliverability
- Built-in analytics
- Webhook support

✅ **Developer Experience**
- Simple API
- TypeScript support
- Good documentation

---

## Common Use Cases

### 1. Welcome Email

```typescript
// After user signs up
await sendTransactionalEmail(user.email, 'welcome', {
  name: user.name,
})
```

### 2. Password Reset

```typescript
// Generate reset token
const token = generateResetToken()
const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

await sendTransactionalEmail(user.email, 'password-reset', {
  name: user.name,
  resetUrl,
  expiryMinutes: 60,
})
```

### 3. Email Verification

```typescript
// After signup
const token = generateVerificationToken()
const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

await sendTransactionalEmail(user.email, 'verification', {
  name: user.name,
  verificationUrl,
})
```

### 4. Custom Notifications

```typescript
await sendTransactionalEmail(user.email, 'notification', {
  subject: 'New Prompt Shared',
  message: '<p>Someone shared a prompt with you!</p>',
})
```

---

## API Route Example

```typescript
// app/api/email/send/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { to, subject, html, text } = body

    const result = await sendEmail({
      to,
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      subject,
      html,
      text,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      messageId: result.messageId 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
```

---

## Troubleshooting

### Email Not Sending?

1. **Check API Key:**
   - Verify `RESEND_API_KEY` is set correctly
   - Check it starts with `re_`
   - Ensure it has "Send emails" permission

2. **Check From Email:**
   - Must be verified domain or `onboarding@resend.dev`
   - Check Resend Dashboard → Domains

3. **Check Logs:**
   - Look for Resend errors in application logs
   - Check Resend Dashboard → Logs for delivery status

### Rate Limits

- Free tier: 100 emails/day
- If exceeded, upgrade plan or wait for reset

### Domain Verification

- Required for production use
- Add DNS records as instructed
- Wait for verification (usually < 1 hour)

---

## Security Best Practices

1. **Never expose API key:**
   - Keep in environment variables only
   - Never commit to git
   - Use different keys for dev/prod

2. **Validate email addresses:**
   - Sanitize user input
   - Validate email format
   - Rate limit email sending

3. **Use verified domains:**
   - Better deliverability
   - Professional appearance
   - Required for production

---

## Summary

✅ **Package Installed:** `resend`  
✅ **Client Created:** `lib/email/resend.ts`  
✅ **Ready to Use:** Just add API key to environment variables

**Next Steps:**
1. Get Resend API key
2. Add to environment variables
3. (Optional) Verify domain
4. Start sending emails!

---

**You're all set!** Just add your Resend API key and you can start sending emails. 🚀

