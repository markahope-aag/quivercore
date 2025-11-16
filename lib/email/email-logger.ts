/**
 * Email Logger
 * Logs all sent emails to database for analytics and debugging
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

export type EmailType =
  | 'welcome'
  | 'trial_ending'
  | 'payment_failed_1'
  | 'payment_failed_2'
  | 'payment_failed_3'
  | 'subscription_confirmed'
  | 'receipt'
  | 'admin_notification'
  | 'other'

export type EmailStatus = 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed' | 'complained'

interface LogEmailParams {
  resendId?: string
  emailType: EmailType
  recipientEmail: string
  recipientName?: string
  userId?: string
  subject: string
  templateData?: Record<string, any>
  status?: EmailStatus
  errorMessage?: string
  errorCode?: string
  tags?: Record<string, string>[]
}

/**
 * Log an email send to the database
 */
export async function logEmail(params: LogEmailParams) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('email_logs').insert({
      resend_id: params.resendId,
      email_type: params.emailType,
      recipient_email: params.recipientEmail,
      recipient_name: params.recipientName,
      user_id: params.userId,
      subject: params.subject,
      template_data: params.templateData,
      status: params.status || 'sent',
      error_message: params.errorMessage,
      error_code: params.errorCode,
      tags: params.tags,
    })

    if (error) {
      logger.error('Failed to log email', { error, params })
    } else {
      logger.debug('Email logged to database', { emailType: params.emailType, recipientEmail: params.recipientEmail })
    }
  } catch (error) {
    // Don't throw - logging failure shouldn't break email sending
    logger.error('Email logging exception', { error, params })
  }
}

/**
 * Update email status (e.g., from webhooks)
 */
export async function updateEmailStatus(resendId: string, status: EmailStatus, metadata?: { errorMessage?: string; errorCode?: string }) {
  try {
    const supabase = await createClient()

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    // Set timestamp based on status
    switch (status) {
      case 'delivered':
        updateData.delivered_at = new Date().toISOString()
        break
      case 'opened':
        updateData.opened_at = new Date().toISOString()
        updateData.open_count = supabase.rpc('increment', { amount: 1 }) // Will need a function for this
        break
      case 'clicked':
        updateData.clicked_at = new Date().toISOString()
        updateData.click_count = supabase.rpc('increment', { amount: 1 })
        break
      case 'bounced':
        updateData.bounced_at = new Date().toISOString()
        break
    }

    if (metadata?.errorMessage) {
      updateData.error_message = metadata.errorMessage
    }
    if (metadata?.errorCode) {
      updateData.error_code = metadata.errorCode
    }

    const { error } = await supabase.from('email_logs').update(updateData).eq('resend_id', resendId)

    if (error) {
      logger.error('Failed to update email status', { error, resendId, status })
    } else {
      logger.debug('Email status updated', { resendId, status })
    }
  } catch (error) {
    logger.error('Email status update exception', { error, resendId, status })
  }
}

/**
 * Get email analytics for dashboard
 */
export async function getEmailAnalytics(days: number = 30) {
  try {
    const supabase = await createClient()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('email_analytics')
      .select('*')
      .gte('sent_date', startDate.toISOString())
      .order('sent_date', { ascending: false })

    if (error) {
      logger.error('Failed to fetch email analytics', { error })
      return null
    }

    return data
  } catch (error) {
    logger.error('Email analytics exception', { error })
    return null
  }
}

/**
 * Get recent email logs
 */
export async function getRecentEmailLogs(limit: number = 100) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('Failed to fetch email logs', { error })
      return null
    }

    return data
  } catch (error) {
    logger.error('Email logs exception', { error })
    return null
  }
}

/**
 * Get email logs for a specific user
 */
export async function getUserEmailLogs(userId: string, limit: number = 50) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('Failed to fetch user email logs', { error, userId })
      return null
    }

    return data
  } catch (error) {
    logger.error('User email logs exception', { error, userId })
    return null
  }
}

/**
 * Get email stats summary
 */
export async function getEmailStatsSummary() {
  try {
    const supabase = await createClient()

    const { data: stats, error } = await supabase.rpc('get_email_stats_summary')

    if (error) {
      // If function doesn't exist, calculate manually
      const { data: logs, error: logsError } = await supabase
        .from('email_logs')
        .select('email_type, status')

      if (logsError) {
        logger.error('Failed to fetch email stats', { error: logsError })
        return null
      }

      // Calculate stats manually
      const summary = {
        total: logs.length,
        sent: logs.filter(l => l.status === 'sent').length,
        delivered: logs.filter(l => l.status === 'delivered').length,
        opened: logs.filter(l => l.status === 'opened').length,
        clicked: logs.filter(l => l.status === 'clicked').length,
        bounced: logs.filter(l => l.status === 'bounced').length,
        failed: logs.filter(l => l.status === 'failed').length,
        delivery_rate: logs.length > 0 ? (logs.filter(l => l.status === 'delivered').length / logs.length) * 100 : 0,
        open_rate: logs.filter(l => l.status === 'delivered').length > 0
          ? (logs.filter(l => l.status === 'opened').length / logs.filter(l => l.status === 'delivered').length) * 100
          : 0,
      }

      return summary
    }

    return stats
  } catch (error) {
    logger.error('Email stats summary exception', { error })
    return null
  }
}
