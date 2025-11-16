/**
 * Trial Ending Email Template
 * High-conversion email sent 2 days before trial ends
 */

export interface TrialEndingEmailData {
  userName: string
  daysLeft: number
  upgradeUrl: string
  promoCode?: string
  promoDiscount?: number // percentage
}

export function getTrialEndingSubject(data: TrialEndingEmailData): string {
  return `⏰ Your Trial Ends in ${data.daysLeft} Days - Upgrade & Save${data.promoCode ? ' ' + data.promoDiscount + '%' : ''}!`
}

export function getTrialEndingHtml(data: TrialEndingEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <!-- Header -->
  <div style="text-align: center; padding: 30px 0; border-bottom: 3px solid #f59e0b;">
    <h1 style="margin: 0; color: #d97706; font-size: 28px;">⏰ Trial Ending Soon</h1>
  </div>

  <!-- Main Content -->
  <div style="padding: 40px 0;">
    <h2 style="color: #1e40af; margin-bottom: 20px;">Hi ${data.userName},</h2>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Your QuiverCore trial ends in <strong style="color: #d97706;">${data.daysLeft} days</strong>.
    </p>

    ${data.promoCode ? `
    <!-- Promo Code Alert -->
    <div style="background-color: #fef3c7; border: 2px dashed #f59e0b; padding: 25px; margin: 30px 0; border-radius: 8px; text-align: center;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #92400e; text-transform: uppercase; font-weight: 600;">
        Exclusive Trial Offer
      </p>
      <p style="margin: 0 0 15px 0; font-size: 32px; font-weight: 700; color: #d97706;">
        ${data.promoDiscount}% OFF
      </p>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #92400e;">
        Use code: <strong style="font-size: 18px; font-family: monospace;">${data.promoCode}</strong>
      </p>
      <p style="margin: 0; font-size: 12px; color: #92400e;">
        Valid for the next 48 hours only
      </p>
    </div>
    ` : ''}

    <p style="font-size: 16px; margin-bottom: 20px;">
      Don't lose access to the features you love:
    </p>

    <!-- Features List -->
    <div style="background-color: #eff6ff; padding: 25px; border-radius: 8px; margin: 20px 0;">
      <ul style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 12px;"><strong>Advanced Frameworks</strong> - 10 professional prompt frameworks</li>
        <li style="margin-bottom: 12px;"><strong>Verbalized Sampling</strong> - Get diverse, creative outputs</li>
        <li style="margin-bottom: 12px;"><strong>Template Library</strong> - Save and reuse your best prompts</li>
        <li style="margin-bottom: 12px;"><strong>Claude API Integration</strong> - Execute prompts instantly</li>
        <li style="margin-bottom: 0;"><strong>Priority Support</strong> - Get help when you need it</li>
      </ul>
    </div>

    <!-- What You'll Lose -->
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #991b1b; font-weight: 600;">
        After your trial ends:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #991b1b;">
        <li style="margin-bottom: 8px;">You'll lose access to the prompt builder</li>
        <li style="margin-bottom: 8px;">Your saved templates will be archived</li>
        <li style="margin-bottom: 0;">You won't be able to execute prompts with Claude</li>
      </ul>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 40px 0;">
      <a href="${data.upgradeUrl}" style="display: inline-block; background-color: #3b82f6; color: white; text-decoration: none; padding: 18px 36px; border-radius: 8px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        Upgrade Now ${data.promoCode ? '& Save ' + data.promoDiscount + '%' : ''} →
      </a>
    </div>

    <p style="font-size: 14px; color: #64748b; text-align: center;">
      Questions? Reply to this email and we'll help you choose the right plan.
    </p>
  </div>

  <!-- Social Proof -->
  <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; margin: 30px 0;">
    <p style="margin: 0 0 15px 0; font-size: 14px; color: #64748b; text-align: center;">
      <em>"QuiverCore transformed how we create AI prompts. The Verbalized Sampling feature alone is worth the price."</em>
    </p>
    <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
      - Sarah Chen, Content Strategist
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

export function getTrialEndingText(data: TrialEndingEmailData): string {
  return `
⏰ YOUR TRIAL ENDS IN ${data.daysLeft} DAYS

Hi ${data.userName},

Your QuiverCore trial ends in ${data.daysLeft} days.

${data.promoCode ? `
🎁 EXCLUSIVE TRIAL OFFER: ${data.promoDiscount}% OFF
Use code: ${data.promoCode}
Valid for the next 48 hours only!
` : ''}

Don't lose access to the features you love:
- Advanced Frameworks - 10 professional prompt frameworks
- Verbalized Sampling - Get diverse, creative outputs
- Template Library - Save and reuse your best prompts
- Claude API Integration - Execute prompts instantly
- Priority Support - Get help when you need it

After your trial ends:
- You'll lose access to the prompt builder
- Your saved templates will be archived
- You won't be able to execute prompts with Claude

UPGRADE NOW: ${data.upgradeUrl}

Questions? Reply to this email and we'll help you choose the right plan.

---
"QuiverCore transformed how we create AI prompts. The Verbalized Sampling feature alone is worth the price."
- Sarah Chen, Content Strategist

---
QuiverCore - Advanced AI Prompt Engineering
  `.trim()
}
