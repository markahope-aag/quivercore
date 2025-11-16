import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/admin'
import { sendWelcomeEmail, sendTrialEndingEmail, sendPaymentFailedAttempt1 } from '@/lib/email/email-service'

/**
 * Test email endpoint (admin only)
 * Allows admins to preview and test email templates
 */
export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin()
    const body = await request.json()
    const { emailType, recipientEmail } = body

    if (!recipientEmail) {
      return NextResponse.json({ error: 'recipientEmail is required' }, { status: 400 })
    }

    let result

    switch (emailType) {
      case 'welcome':
        result = await sendWelcomeEmail(recipientEmail, {
          userName: 'Test User',
          userEmail: recipientEmail,
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/builder`,
        })
        break

      case 'trial_ending':
        result = await sendTrialEndingEmail(recipientEmail, {
          userName: 'Test User',
          daysLeft: 2,
          upgradeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
          promoCode: 'TRIAL20',
          promoDiscount: 20,
        })
        break

      case 'payment_failed':
        result = await sendPaymentFailedAttempt1(recipientEmail, {
          userName: 'Test User',
          planName: 'Professional',
          amount: 2900, // $29.00
          updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
          daysUntilSuspension: 7,
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid emailType. Supported: welcome, trial_ending, payment_failed' },
          { status: 400 }
        )
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test ${emailType} email sent to ${recipientEmail}`,
        emailId: result.messageId,
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Email test error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send test email' },
      { status: error.message === 'Unauthorized: Admin access required' ? 403 : 500 }
    )
  }
}
