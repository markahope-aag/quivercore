/**
 * Welcome Email Template
 * Sent immediately after user signs up
 */

export interface WelcomeEmailData {
  userName: string
  userEmail: string
  loginUrl: string
}

export function getWelcomeEmailSubject(): string {
  return 'Welcome to QuiverCore - Let\'s Create Your First AI Prompt!'
}

export function getWelcomeEmailHtml(data: WelcomeEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to QuiverCore</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <!-- Header -->
  <div style="text-align: center; padding: 30px 0; border-bottom: 3px solid #3b82f6;">
    <h1 style="margin: 0; color: #1e40af; font-size: 28px;">⚡ QuiverCore</h1>
  </div>

  <!-- Main Content -->
  <div style="padding: 40px 0;">
    <h2 style="color: #1e40af; margin-bottom: 20px;">Welcome aboard, ${data.userName}! 🎉</h2>

    <p style="font-size: 16px; margin-bottom: 20px;">
      We're thrilled to have you join QuiverCore! You're now part of a community building better AI prompts with advanced techniques like Verbalized Sampling.
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Here's how to get started in 3 simple steps:
    </p>

    <!-- Steps -->
    <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 15px 0;"><strong>1. Choose Your Domain</strong><br>
      Select from Marketing, Technical Writing, Creative Content, and more.</p>

      <p style="margin: 0 0 15px 0;"><strong>2. Pick a Framework</strong><br>
      Role-Based, Chain-of-Thought, Few-Shot, and 7 other proven frameworks.</p>

      <p style="margin: 0 0 0 0;"><strong>3. Apply Verbalized Sampling</strong><br>
      Get diverse, creative outputs by explicitly sampling from the probability distribution.</p>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 40px 0;">
      <a href="${data.loginUrl}" style="display: inline-block; background-color: #3b82f6; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Create Your First Prompt →
      </a>
    </div>

    <!-- Features Highlight -->
    <div style="background-color: #eff6ff; padding: 25px; border-radius: 8px; margin: 30px 0;">
      <h3 style="margin-top: 0; color: #1e40af;">What You Can Do</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 10px;">Build prompts with 10 professional frameworks</li>
        <li style="margin-bottom: 10px;">Use Verbalized Sampling for creative outputs</li>
        <li style="margin-bottom: 10px;">Save templates for reuse</li>
        <li style="margin-bottom: 10px;">Execute prompts directly with Claude AI</li>
        <li style="margin-bottom: 0;">Export to multiple formats (JSON, Text, Markdown)</li>
      </ul>
    </div>

    <!-- Help Section -->
    <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
      <strong>Need help getting started?</strong><br>
      Check out our documentation or reply to this email with any questions. We're here to help!
    </p>
  </div>

  <!-- Footer -->
  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px; text-align: center; color: #64748b; font-size: 14px;">
    <p style="margin: 0 0 10px 0;">QuiverCore - Advanced AI Prompt Engineering</p>
    <p style="margin: 0; font-size: 12px;">
      You're receiving this because you signed up for QuiverCore.
    </p>
  </div>

</body>
</html>
  `.trim()
}

export function getWelcomeEmailText(data: WelcomeEmailData): string {
  return `
Welcome to QuiverCore!

Hi ${data.userName},

We're thrilled to have you join QuiverCore! You're now part of a community building better AI prompts with advanced techniques like Verbalized Sampling.

Here's how to get started in 3 simple steps:

1. Choose Your Domain
   Select from Marketing, Technical Writing, Creative Content, and more.

2. Pick a Framework
   Role-Based, Chain-of-Thought, Few-Shot, and 7 other proven frameworks.

3. Apply Verbalized Sampling
   Get diverse, creative outputs by explicitly sampling from the probability distribution.

Create your first prompt: ${data.loginUrl}

What You Can Do:
- Build prompts with 10 professional frameworks
- Use Verbalized Sampling for creative outputs
- Save templates for reuse
- Execute prompts directly with Claude AI
- Export to multiple formats (JSON, Text, Markdown)

Need help getting started?
Check out our documentation or reply to this email with any questions. We're here to help!

---
QuiverCore - Advanced AI Prompt Engineering
You're receiving this because you signed up for QuiverCore.
  `.trim()
}
