/**
 * Payment Failed Email Templates
 * Critical for revenue protection
 */

export interface PaymentFailedEmailData {
  userName: string
  planName: string
  amount: number // in cents
  updatePaymentUrl: string
  daysUntilSuspension: number
}

// ATTEMPT 1: Immediate notification
export function getPaymentFailedAttempt1Subject(): string {
  return '⚠️ Payment Failed - Please Update Your Payment Method'
}

export function getPaymentFailedAttempt1Html(data: PaymentFailedEmailData): string {
  const amountFormatted = (data.amount / 100).toFixed(2)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <!-- Header -->
  <div style="text-align: center; padding: 30px 0; border-bottom: 3px solid #ef4444;">
    <h1 style="margin: 0; color: #dc2626; font-size: 28px;">⚠️ Payment Issue</h1>
  </div>

  <!-- Main Content -->
  <div style="padding: 40px 0;">
    <h2 style="color: #dc2626; margin-bottom: 20px;">Hi ${data.userName},</h2>

    <p style="font-size: 16px; margin-bottom: 20px;">
      We had trouble processing your payment of <strong>$${amountFormatted}</strong> for your ${data.planName} plan.
    </p>

    <!-- Alert Box -->
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0;">
      <p style="margin: 0; color: #991b1b; font-weight: 600;">
        ⏰ You have ${data.daysUntilSuspension} days to update your payment method before your account is suspended.
      </p>
    </div>

    <p style="font-size: 16px; margin-bottom: 20px;">
      This usually happens when:
    </p>

    <ul style="margin: 0 0 20px 0; padding-left: 20px;">
      <li style="margin-bottom: 8px;">Your card has expired</li>
      <li style="margin-bottom: 8px;">Your bank declined the charge</li>
      <li style="margin-bottom: 8px;">You've reached your credit limit</li>
      <li style="margin-bottom: 0;">Your billing address needs to be updated</li>
    </ul>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 40px 0;">
      <a href="${data.updatePaymentUrl}" style="display: inline-block; background-color: #ef4444; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Update Payment Method →
      </a>
    </div>

    <p style="font-size: 14px; color: #64748b;">
      <strong>What happens if I don't update?</strong><br>
      After ${data.daysUntilSuspension} days, your account will be suspended and you'll lose access to:
    </p>

    <ul style="margin: 10px 0 20px 0; padding-left: 20px; font-size: 14px; color: #64748b;">
      <li>Your saved prompts and templates</li>
      <li>Prompt builder features</li>
      <li>Claude API execution</li>
    </ul>

    <p style="font-size: 14px; color: #64748b;">
      Need help? Reply to this email or contact support.
    </p>
  </div>

  <!-- Footer -->
  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px; text-align: center; color: #64748b; font-size: 14px;">
    <p style="margin: 0;">QuiverCore - Advanced AI Prompt Engineering</p>
  </div>

</body>
</html>
  `.trim()
}

export function getPaymentFailedAttempt1Text(data: PaymentFailedEmailData): string {
  const amountFormatted = (data.amount / 100).toFixed(2)

  return `
⚠️ PAYMENT ISSUE

Hi ${data.userName},

We had trouble processing your payment of $${amountFormatted} for your ${data.planName} plan.

⏰ You have ${data.daysUntilSuspension} days to update your payment method before your account is suspended.

This usually happens when:
- Your card has expired
- Your bank declined the charge
- You've reached your credit limit
- Your billing address needs to be updated

UPDATE YOUR PAYMENT METHOD: ${data.updatePaymentUrl}

What happens if I don't update?
After ${data.daysUntilSuspension} days, your account will be suspended and you'll lose access to:
- Your saved prompts and templates
- Prompt builder features
- Claude API execution

Need help? Reply to this email or contact support.

---
QuiverCore - Advanced AI Prompt Engineering
  `.trim()
}

// ATTEMPT 2: 3 days later
export function getPaymentFailedAttempt2Subject(): string {
  return '🚨 Urgent: Update Payment Method - Account Suspension Soon'
}

export function getPaymentFailedAttempt2Html(data: PaymentFailedEmailData): string {
  const amountFormatted = (data.amount / 100).toFixed(2)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <!-- Header -->
  <div style="text-align: center; padding: 30px 0; border-bottom: 3px solid #dc2626; background-color: #fef2f2;">
    <h1 style="margin: 0; color: #991b1b; font-size: 32px;">🚨 URGENT</h1>
  </div>

  <!-- Main Content -->
  <div style="padding: 40px 0;">
    <h2 style="color: #dc2626; margin-bottom: 20px;">Hi ${data.userName},</h2>

    <p style="font-size: 18px; margin-bottom: 20px; font-weight: 600; color: #dc2626;">
      Your account will be suspended in ${data.daysUntilSuspension} days.
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      We still haven't been able to process your payment of <strong>$${amountFormatted}</strong>.
    </p>

    <!-- Urgent Alert Box -->
    <div style="background-color: #991b1b; color: white; padding: 25px; margin: 30px 0; border-radius: 8px; text-align: center;">
      <p style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700;">
        ${data.daysUntilSuspension} Days Left
      </p>
      <p style="margin: 0; font-size: 14px;">
        Update your payment method now to keep your account active
      </p>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 40px 0;">
      <a href="${data.updatePaymentUrl}" style="display: inline-block; background-color: #dc2626; color: white; text-decoration: none; padding: 18px 36px; border-radius: 8px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        Update Payment Method Now →
      </a>
    </div>

    <p style="font-size: 16px; margin-bottom: 20px; text-align: center;">
      <strong>Don't lose access to your work!</strong>
    </p>

    <p style="font-size: 14px; color: #64748b; text-align: center;">
      Having trouble? Reply to this email and we'll help you resolve this immediately.
    </p>
  </div>

  <!-- Footer -->
  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px; text-align: center; color: #64748b; font-size: 14px;">
    <p style="margin: 0;">QuiverCore - Advanced AI Prompt Engineering</p>
  </div>

</body>
</html>
  `.trim()
}

// ATTEMPT 3: Final notice (1 day before suspension)
export function getPaymentFailedAttempt3Subject(): string {
  return '🚨 FINAL NOTICE: Account Suspended Tomorrow'
}

export function getPaymentFailedAttempt3Html(data: PaymentFailedEmailData): string {
  const amountFormatted = (data.amount / 100).toFixed(2)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <!-- Header -->
  <div style="text-align: center; padding: 40px 0; background-color: #7f1d1d; color: white;">
    <h1 style="margin: 0; font-size: 36px;">🚨 FINAL NOTICE</h1>
    <p style="margin: 10px 0 0 0; font-size: 18px;">Your account will be suspended tomorrow</p>
  </div>

  <!-- Main Content -->
  <div style="padding: 40px 0;">
    <h2 style="color: #7f1d1d; margin-bottom: 20px;">Hi ${data.userName},</h2>

    <p style="font-size: 18px; margin-bottom: 20px; font-weight: 600;">
      This is your final chance to save your account.
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Tomorrow, your QuiverCore account will be <strong>suspended</strong> due to the unpaid balance of <strong>$${amountFormatted}</strong>.
    </p>

    <!-- Final Countdown -->
    <div style="background-color: #7f1d1d; color: white; padding: 30px; margin: 30px 0; border-radius: 8px; text-align: center;">
      <p style="margin: 0 0 10px 0; font-size: 48px; font-weight: 700;">
        24 Hours
      </p>
      <p style="margin: 0; font-size: 16px;">
        Until your account is suspended
      </p>
    </div>

    <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #991b1b; font-weight: 600;">
        You will lose access to:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #991b1b;">
        <li>All saved prompts and templates</li>
        <li>Your prompt builder workspace</li>
        <li>Claude API execution capabilities</li>
        <li>All account data and history</li>
      </ul>
    </div>

    <!-- Emergency CTA Button -->
    <div style="text-align: center; margin: 40px 0;">
      <a href="${data.updatePaymentUrl}" style="display: inline-block; background-color: #7f1d1d; color: white; text-decoration: none; padding: 20px 40px; border-radius: 8px; font-weight: 700; font-size: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
        UPDATE NOW - AVOID SUSPENSION →
      </a>
    </div>

    <p style="font-size: 16px; margin-bottom: 20px; text-align: center; color: #dc2626;">
      <strong>Act now or lose everything.</strong>
    </p>

    <p style="font-size: 14px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
      <strong>Need emergency assistance?</strong><br>
      Reply to this email immediately or call us at [SUPPORT_PHONE]
    </p>
  </div>

  <!-- Footer -->
  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px; text-align: center; color: #64748b; font-size: 14px;">
    <p style="margin: 0;">QuiverCore - Advanced AI Prompt Engineering</p>
  </div>

</body>
</html>
  `.trim()
}
