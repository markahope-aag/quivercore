'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { Mail, Send, CheckCircle, XCircle } from 'lucide-react'

export function EmailTester() {
  const [emailType, setEmailType] = useState('welcome')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const emailTypes = [
    { value: 'welcome', label: 'Welcome Email', description: 'Sent immediately after signup' },
    { value: 'trial_ending', label: 'Trial Ending', description: '2 days before trial expires' },
    { value: 'payment_failed', label: 'Payment Failed (Attempt 1)', description: 'Immediate payment failure notification' },
  ]

  const sendTestEmail = async () => {
    if (!recipientEmail) {
      setResult({ success: false, message: 'Please enter an email address' })
      return
    }

    setSending(true)
    setResult(null)

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailType, recipientEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message })
      } else {
        setResult({ success: false, message: data.error || 'Failed to send email' })
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error - check console' })
      console.error('Email test error:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <CardTitle>Email Testing</CardTitle>
          </div>
          <CardDescription>Preview and test email templates before sending to users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Type Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Email Template</label>
            <div className="space-y-2">
              {emailTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    emailType === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-slate-300 dark:border-slate-600 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="emailType"
                    value={type.value}
                    checked={emailType === type.value}
                    onChange={(e) => setEmailType(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{type.label}</p>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Recipient Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Send Test To</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              The test email will be sent to this address
            </p>
          </div>

          {/* Send Button */}
          <Button onClick={sendTestEmail} disabled={sending} className="w-full">
            {sending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Test Email
              </>
            )}
          </Button>

          {/* Result Message */}
          {result && (
            <div
              className={`flex items-start gap-2 p-4 rounded-lg ${
                result.success
                  ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'
              }`}
            >
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                {result.message}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Email Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Service:</span>
              <span className="font-mono">Resend</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">From Email:</span>
              <span className="font-mono">{process.env.NEXT_PUBLIC_FROM_EMAIL || 'noreply@quivercore.app'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="inline-flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                Configured
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Templates</CardTitle>
          <CardDescription>Emails ready to send</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Welcome Email</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Trial Ending (2 days)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Payment Failed - Attempt 1</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Payment Failed - Attempt 2</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Payment Failed - Attempt 3 (Final)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
