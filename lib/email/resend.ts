/**
 * Resend email client and utilities
 * Handles email sending using Resend API
 */

import { Resend } from 'resend'
import { logger } from '@/lib/utils/logger'

let resendClient: Resend | null = null

/**
 * Get or create Resend client
 */
function getResendClient(): Resend | null {
  if (resendClient) {
    return resendClient
  }

  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    logger.warn('RESEND_API_KEY not set - email functionality disabled')
    return null
  }

  try {
    resendClient = new Resend(apiKey)
    return resendClient
  } catch (error) {
    logger.error('Failed to create Resend client', { error })
    return null
  }
}

/**
 * Check if Resend is configured
 */
export function isResendAvailable(): boolean {
  return !!process.env.RESEND_API_KEY
}

/**
 * Send an email using Resend
 */
export interface SendEmailOptions {
  to: string | string[]
  from: string
  subject: string
  html?: string
  text?: string
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
  tags?: Array<{ name: string; value: string }>
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send an email
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const client = getResendClient()

  if (!client) {
    logger.warn('Resend not available - email not sent', { to: options.to, subject: options.subject })
    return {
      success: false,
      error: 'Resend API key not configured',
    }
  }

  try {
    // Ensure 'to' is an array
    const to = Array.isArray(options.to) ? options.to : [options.to]
    const cc = options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined
    const bcc = options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined

    const result = await client.emails.send({
      from: options.from,
      to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      cc,
      bcc,
      tags: options.tags,
    } as any)

    if (result.error) {
      logger.error('Resend email error', { error: result.error, to: options.to, subject: options.subject })
      return {
        success: false,
        error: result.error.message || 'Unknown error',
      }
    }

    logger.info('Email sent successfully', { 
      messageId: result.data?.id, 
      to: options.to, 
      subject: options.subject 
    })

    return {
      success: true,
      messageId: result.data?.id,
    }
  } catch (error) {
    logger.error('Failed to send email', { error, to: options.to, subject: options.subject })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send a transactional email (e.g., welcome, password reset)
 */
export async function sendTransactionalEmail(
  to: string,
  template: 'welcome' | 'password-reset' | 'verification' | 'notification',
  data: Record<string, string | number>
): Promise<SendEmailResult> {
  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  
  // You can customize these templates
  const templates = {
    welcome: {
      subject: 'Welcome to QuiverCore!',
      html: `
        <h1>Welcome to QuiverCore!</h1>
        <p>Hi ${data.name || 'there'},</p>
        <p>Thank you for joining QuiverCore. We're excited to have you!</p>
        <p>Get started by creating your first prompt.</p>
      `,
      text: `Welcome to QuiverCore! Hi ${data.name || 'there'}, thank you for joining.`,
    },
    'password-reset': {
      subject: 'Reset your QuiverCore password',
      html: `
        <h1>Reset Your Password</h1>
        <p>Hi ${data.name || 'there'},</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${data.resetUrl}">Reset Password</a></p>
        <p>This link will expire in ${data.expiryMinutes || 60} minutes.</p>
      `,
      text: `Reset your password: ${data.resetUrl}`,
    },
    verification: {
      subject: 'Verify your QuiverCore email',
      html: `
        <h1>Verify Your Email</h1>
        <p>Hi ${data.name || 'there'},</p>
        <p>Click the link below to verify your email address:</p>
        <p><a href="${data.verificationUrl}">Verify Email</a></p>
      `,
      text: `Verify your email: ${data.verificationUrl}`,
    },
    notification: {
      subject: data.subject as string || 'Notification from QuiverCore',
      html: data.message as string || '',
      text: data.message as string || '',
    },
  }

  const templateData = templates[template]

  return sendEmail({
    to,
    from,
    subject: templateData.subject,
    html: templateData.html,
    text: templateData.text,
  })
}

