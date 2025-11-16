# Email System Guide

## ✅ System Status

Your email system is fully configured and ready to use!

- **Service**: Resend
- **From Email**: noreply@quivercore.app
- **Status**: ✅ Configured
- **Templates**: 5 ready-to-use emails

---

## 🎯 Quick Start: Test Your Emails

1. **Go to Admin Panel**
   ```
   http://localhost:3000/admin/emails
   ```

2. **Select a Template**
   - Welcome Email
   - Trial Ending
   - Payment Failed

3. **Enter Your Email** (to receive the test)

4. **Click "Send Test Email"**

5. **Check Your Inbox!**

---

## 📧 Available Email Templates

### 1. Welcome Email
**When**: Immediately after user signs up
**Purpose**: Onboard new users, guide to first prompt
**Features**:
- Friendly welcome message
- 3-step getting started guide
- Feature highlights
- Direct CTA to prompt builder
- Professional branding

**Template Location**: `lib/email/templates/welcome.ts`

**Send Programmatically**:
```typescript
import { sendWelcomeEmail } from '@/lib/email/email-service'

await sendWelcomeEmail('user@example.com', {
  userName: 'John',
  userEmail: 'user@example.com',
  loginUrl: 'https://quivercore.app/builder'
})
```

---

### 2. Payment Failed - Attempt 1 (Immediate)
**When**: Payment declined by payment processor
**Purpose**: Alert user, prevent churn
**Urgency**: Medium
**Features**:
- Clear problem statement ($amount failed)
- 7-day grace period notice
- Common causes list
- Prominent "Update Payment" button
- Consequences of inaction

**Send Programmatically**:
```typescript
import { sendPaymentFailedAttempt1 } from '@/lib/email/email-service'

await sendPaymentFailedAttempt1('user@example.com', {
  userName: 'John',
  planName: 'Professional',
  amount: 2900, // $29.00 in cents
  updatePaymentUrl: 'https://quivercore.app/settings',
  daysUntilSuspension: 7
})
```

---

### 3. Payment Failed - Attempt 2 (3 Days Later)
**When**: 3 days after first attempt, still not resolved
**Purpose**: Create urgency
**Urgency**: HIGH
**Features**:
- Urgent visual design (red theme)
- Large countdown (4 days left)
- Emotional appeal ("Don't lose your work!")
- Amplified CTA button
- Offer help

**Send Programmatically**:
```typescript
import { sendPaymentFailedAttempt2 } from '@/lib/email/email-service'

await sendPaymentFailedAttempt2('user@example.com', {
  userName: 'John',
  planName: 'Professional',
  amount: 2900,
  updatePaymentUrl: 'https://quivercore.app/settings',
  daysUntilSuspension: 4
})
```

---

### 4. Payment Failed - Attempt 3 (Final Notice - 1 Day Before)
**When**: 6 days after failure, 1 day before suspension
**Purpose**: Final chance to save account
**Urgency**: CRITICAL
**Features**:
- Dark red emergency theme
- 24-hour countdown in huge font
- List of everything they'll lose
- Emergency language
- Support contact info

**Send Programmatically**:
```typescript
import { sendPaymentFailedAttempt3 } from '@/lib/email/email-service'

await sendPaymentFailedAttempt3('user@example.com', {
  userName: 'John',
  planName: 'Professional',
  amount: 2900,
  updatePaymentUrl: 'https://quivercore.app/settings',
  daysUntilSuspension: 1
})
```

---

### 5. Trial Ending (2 Days Before)
**When**: 2 days before trial expires
**Purpose**: Convert trial to paid
**Conversion**: HIGH
**Features**:
- Friendly reminder (2 days left)
- Optional promo code (20% off)
- Feature benefits list
- "What you'll lose" warning
- Social proof testimonial
- Strong upgrade CTA

**Send Programmatically**:
```typescript
import { sendTrialEndingEmail } from '@/lib/email/email-service'

await sendTrialEndingEmail('user@example.com', {
  userName: 'John',
  daysLeft: 2,
  upgradeUrl: 'https://quivercore.app/pricing',
  promoCode: 'TRIAL20',      // Optional
  promoDiscount: 20          // Optional (percentage)
})
```

---

## 🔧 Integration Points

### Where to Trigger Emails

#### 1. Welcome Email → Sign Up Flow
**File**: `app/api/auth/signup/route.ts` (or wherever you handle registration)

```typescript
// After successful user creation
import { sendWelcomeEmail } from '@/lib/email/email-service'

const newUser = await createUser(email, password)

// Send welcome email (non-blocking)
sendWelcomeEmail(email, {
  userName: newUser.name || email.split('@')[0],
  userEmail: email,
  loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/builder`
}).catch(err => console.error('Welcome email failed:', err))
```

---

#### 2. Payment Failed → Stripe Webhook
**File**: `app/api/subscriptions/webhook/route.ts`

```typescript
import { sendPaymentFailedAttempt1 } from '@/lib/email/email-service'

// When Stripe sends invoice.payment_failed event
if (event.type === 'invoice.payment_failed') {
  const invoice = event.data.object
  const customer = await stripe.customers.retrieve(invoice.customer)

  // Send immediate notification
  await sendPaymentFailedAttempt1(customer.email, {
    userName: customer.name || 'Valued Customer',
    planName: 'Professional', // Get from subscription
    amount: invoice.amount_due,
    updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    daysUntilSuspension: 7
  })

  // Schedule follow-up emails (use cron job or queue)
  // - Attempt 2: 3 days later
  // - Attempt 3: 6 days later (1 day before suspension)
}
```

---

#### 3. Trial Ending → Cron Job (Daily Check)
**File**: `app/api/cron/trial-checks/route.ts` (create new)

```typescript
import { sendTrialEndingEmail } from '@/lib/email/email-service'

export async function GET(request: NextRequest) {
  // Verify cron secret
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find trials ending in 2 days
  const supabase = await createClient()
  const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)

  const { data: expiringTrials } = await supabase
    .from('user_subscriptions')
    .select('*, user:auth.users!user_id(email, name)')
    .eq('status', 'trialing')
    .gte('trial_end', twoDaysFromNow.toISOString())
    .lt('trial_end', new Date(twoDaysFromNow.getTime() + 24 * 60 * 60 * 1000).toISOString())

  // Send emails
  for (const trial of expiringTrials || []) {
    await sendTrialEndingEmail(trial.user.email, {
      userName: trial.user.name || trial.user.email.split('@')[0],
      daysLeft: 2,
      upgradeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      // Optional: Add promo code from database
    })
  }

  return NextResponse.json({ sent: expiringTrials?.length || 0 })
}
```

**Set up Vercel Cron** in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/trial-checks",
      "schedule": "0 9 * * *"
    }
  ]
}
```

---

## 🎨 Email Design Features

All emails include:
- ✅ Professional HTML design
- ✅ Plain text fallback
- ✅ Mobile responsive
- ✅ Dark mode support (for email clients that support it)
- ✅ Clear CTAs
- ✅ Brand consistency
- ✅ Accessibility considerations

### Color Scheme
- **Primary Blue**: #3b82f6 (CTAs, headers)
- **Warning Orange**: #f59e0b (trial ending)
- **Error Red**: #ef4444, #dc2626, #991b1b (payment failed, escalating)
- **Success Green**: #10b981 (confirmations)
- **Neutral Gray**: #64748b (secondary text)

---

## 📊 Email Analytics

Resend automatically tracks:
- **Delivery**: Was email delivered?
- **Opens**: Did recipient open?
- **Clicks**: Did they click links?
- **Bounces**: Email bounced?
- **Spam**: Marked as spam?

View in Resend Dashboard:
```
https://resend.com/emails
```

### Email Tags
All emails are tagged for filtering:
- **Category**: onboarding, billing, conversion, admin
- **Type**: welcome, payment_failed_1, trial_ending, etc.

---

## 🚀 Testing Emails

### Method 1: Admin UI (Easiest)
1. Go to `/admin/emails`
2. Select template
3. Enter your email
4. Click "Send Test Email"
5. Check inbox!

### Method 2: API (For Testing Integration)
```bash
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -H "Cookie: your-admin-session-cookie" \
  -d '{
    "emailType": "welcome",
    "recipientEmail": "your@email.com"
  }'
```

### Method 3: Programmatically (In Code)
```typescript
import { sendWelcomeEmail } from '@/lib/email/email-service'

// In any API route or server component
const result = await sendWelcomeEmail('test@example.com', {
  userName: 'Test User',
  userEmail: 'test@example.com',
  loginUrl: 'https://quivercore.app/builder'
})

console.log(result) // { success: true, id: 'email-id-from-resend' }
```

---

## 🛠️ Adding New Email Templates

### Step 1: Create Template File
Create `lib/email/templates/your-template.ts`:

```typescript
export interface YourEmailData {
  userName: string
  // ... other data
}

export function getYourEmailSubject(): string {
  return 'Your Subject Line'
}

export function getYourEmailHtml(data: YourEmailData): string {
  return `
<!DOCTYPE html>
<html>
<body style="...">
  <h1>Hello ${data.userName}</h1>
  <!-- Your HTML template -->
</body>
</html>
  `.trim()
}

export function getYourEmailText(data: YourEmailData): string {
  return `
Hello ${data.userName}

Your plain text version...
  `.trim()
}
```

### Step 2: Add to Email Service
Edit `lib/email/email-service.ts`:

```typescript
import { getYourEmailHtml, getYourEmailText, getYourEmailSubject } from './templates/your-template'

export async function sendYourEmail(to: string, data: YourEmailData) {
  const result = await sendEmail({
    to,
    from: FROM_EMAIL,
    subject: getYourEmailSubject(),
    html: getYourEmailHtml(data),
    text: getYourEmailText(data),
    tags: [{ name: 'category', value: 'your-category' }],
  })

  return result
}
```

### Step 3: Add to Test Endpoint (Optional)
Edit `app/api/email/test/route.ts` to include your new template.

---

## 📈 Email Best Practices

### Timing
- **Welcome**: Immediately (< 1 minute)
- **Trial Ending**: 2 days before expiration
- **Payment Failed #1**: Immediately
- **Payment Failed #2**: 3 days after failure
- **Payment Failed #3**: 1 day before suspension

### Subject Lines
- Keep under 50 characters
- Use emojis sparingly (⚠️ 🎉 ⏰ work well)
- Create urgency when appropriate
- Be clear and honest

### Content
- Mobile-first design
- Clear single CTA
- Short paragraphs (2-3 lines max)
- Bullet points for lists
- Personalization (use names)

### Testing
- Always send test to yourself first
- Check on mobile device
- Test in Gmail, Outlook, Apple Mail
- Verify all links work
- Check spam score

---

## 🐛 Troubleshooting

### Email Not Sending?
1. **Check Resend API Key**
   ```bash
   echo $RESEND_API_KEY
   ```
   Should show: `re_hHkA2L17_...`

2. **Check Logs**
   Look in terminal for error messages

3. **Verify Domain**
   Make sure `noreply@quivercore.app` is verified in Resend

4. **Test API Directly**
   Use Resend's test endpoint

### Email Goes to Spam?
- Add SPF record to DNS
- Add DKIM record to DNS
- Add DMARC record to DNS
- Warm up your domain (gradual sending)
- Avoid spam trigger words

### Email Looks Broken?
- Test in Litmus or Email on Acid
- Check CSS inline styles
- Avoid complex layouts
- Use tables for structure
- Test dark mode

---

## 📞 Next Steps

### Immediate Actions
1. ✅ Test all email templates (go to `/admin/emails`)
2. ✅ Verify emails look good in your inbox
3. ✅ Integrate welcome email into signup flow
4. ⏳ Set up Stripe webhook for payment emails
5. ⏳ Create cron job for trial ending emails

### Future Enhancements
- [ ] Add more templates (receipts, feature announcements, etc.)
- [ ] Build email campaign UI in admin panel
- [ ] Add email scheduling system
- [ ] Track open/click rates in database
- [ ] A/B test subject lines
- [ ] Create email preference center

---

## 📚 Resources

- **Resend Docs**: https://resend.com/docs
- **Resend Dashboard**: https://resend.com/emails
- **Email Template Guide**: /lib/email/templates/
- **Email Service Code**: /lib/email/email-service.ts
- **Admin Tester UI**: /admin/emails

---

Your email system is ready to help convert, retain, and engage users! 🚀📧
