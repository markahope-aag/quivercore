/**
 * Email Service
 * Centralized service for sending all application emails
 */

import { sendEmail, isResendAvailable } from './resend'
import { getWelcomeEmailHtml, getWelcomeEmailText, getWelcomeEmailSubject, type WelcomeEmailData } from './templates/welcome'
import {
  getPaymentFailedAttempt1Html,
  getPaymentFailedAttempt1Text,
  getPaymentFailedAttempt1Subject,
  getPaymentFailedAttempt2Html,
  getPaymentFailedAttempt2Subject,
  getPaymentFailedAttempt3Html,
  getPaymentFailedAttempt3Subject,
  type PaymentFailedEmailData,
} from './templates/payment-failed'
import {
  getTrialEndingHtml,
  getTrialEndingText,
  getTrialEndingSubject,
  type TrialEndingEmailData,
} from './templates/trial-ending'
import { logger } from '@/lib/utils/logger'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@quivercore.app'

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(to: string, data: WelcomeEmailData) {
  if (!isResendAvailable()) {
    logger.warn('Resend not configured - skipping welcome email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const result = await sendEmail({
      to,
      from: FROM_EMAIL,
      subject: getWelcomeEmailSubject(),
      html: getWelcomeEmailHtml(data),
      text: getWelcomeEmailText(data),
      tags: [{ name: 'category', value: 'onboarding' }, { name: 'type', value: 'welcome' }],
    })

    if (result.success) {
      logger.info('Welcome email sent', { to, emailId: result.id })
    } else {
      logger.error('Welcome email failed', { to, error: result.error })
    }

    return result
  } catch (error) {
    logger.error('Welcome email exception', { to, error })
    return { success: false, error: String(error) }
  }
}

/**
 * Send payment failed email - Attempt 1 (immediate)
 */
export async function sendPaymentFailedAttempt1(to: string, data: PaymentFailedEmailData) {
  if (!isResendAvailable()) {
    logger.warn('Resend not configured - skipping payment failed email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const result = await sendEmail({
      to,
      from: FROM_EMAIL,
      subject: getPaymentFailedAttempt1Subject(),
      html: getPaymentFailedAttempt1Html(data),
      text: getPaymentFailedAttempt1Text(data),
      tags: [{ name: 'category', value: 'billing' }, { name: 'type', value: 'payment_failed_1' }],
    })

    if (result.success) {
      logger.info('Payment failed (attempt 1) email sent', { to, emailId: result.id })
    } else {
      logger.error('Payment failed (attempt 1) email failed', { to, error: result.error })
    }

    return result
  } catch (error) {
    logger.error('Payment failed (attempt 1) email exception', { to, error })
    return { success: false, error: String(error) }
  }
}

/**
 * Send payment failed email - Attempt 2 (3 days later)
 */
export async function sendPaymentFailedAttempt2(to: string, data: PaymentFailedEmailData) {
  if (!isResendAvailable()) {
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const result = await sendEmail({
      to,
      from: FROM_EMAIL,
      subject: getPaymentFailedAttempt2Subject(),
      html: getPaymentFailedAttempt2Html(data),
      tags: [{ name: 'category', value: 'billing' }, { name: 'type', value: 'payment_failed_2' }],
    })

    if (result.success) {
      logger.info('Payment failed (attempt 2) email sent', { to, emailId: result.id })
    }

    return result
  } catch (error) {
    logger.error('Payment failed (attempt 2) email exception', { to, error })
    return { success: false, error: String(error) }
  }
}

/**
 * Send payment failed email - Attempt 3 (final notice)
 */
export async function sendPaymentFailedAttempt3(to: string, data: PaymentFailedEmailData) {
  if (!isResendAvailable()) {
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const result = await sendEmail({
      to,
      from: FROM_EMAIL,
      subject: getPaymentFailedAttempt3Subject(),
      html: getPaymentFailedAttempt3Html(data),
      tags: [{ name: 'category', value: 'billing' }, { name: 'type', value: 'payment_failed_3' }],
    })

    if (result.success) {
      logger.info('Payment failed (attempt 3 - FINAL) email sent', { to, emailId: result.id })
    }

    return result
  } catch (error) {
    logger.error('Payment failed (attempt 3) email exception', { to, error })
    return { success: false, error: String(error) }
  }
}

/**
 * Send trial ending email
 */
export async function sendTrialEndingEmail(to: string, data: TrialEndingEmailData) {
  if (!isResendAvailable()) {
    logger.warn('Resend not configured - skipping trial ending email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const result = await sendEmail({
      to,
      from: FROM_EMAIL,
      subject: getTrialEndingSubject(data),
      html: getTrialEndingHtml(data),
      text: getTrialEndingText(data),
      tags: [{ name: 'category', value: 'conversion' }, { name: 'type', value: 'trial_ending' }],
    })

    if (result.success) {
      logger.info('Trial ending email sent', { to, emailId: result.id, daysLeft: data.daysLeft })
    } else {
      logger.error('Trial ending email failed', { to, error: result.error })
    }

    return result
  } catch (error) {
    logger.error('Trial ending email exception', { to, error })
    return { success: false, error: String(error) }
  }
}

/**
 * Send admin notification email
 */
export async function sendAdminNotification(subject: string, html: string, text?: string) {
  if (!isResendAvailable()) {
    return { success: false, error: 'Email service not configured' }
  }

  // You can configure admin emails in environment variable
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []

  if (adminEmails.length === 0) {
    logger.warn('No admin emails configured - skipping admin notification')
    return { success: false, error: 'No admin emails configured' }
  }

  try {
    const result = await sendEmail({
      to: adminEmails,
      from: FROM_EMAIL,
      subject: `[QuiverCore Admin] ${subject}`,
      html,
      text,
      tags: [{ name: 'category', value: 'admin' }, { name: 'type', value: 'notification' }],
    })

    if (result.success) {
      logger.info('Admin notification sent', { subject, emailId: result.id })
    }

    return result
  } catch (error) {
    logger.error('Admin notification exception', { subject, error })
    return { success: false, error: String(error) }
  }
}
