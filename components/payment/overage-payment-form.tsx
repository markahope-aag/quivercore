'use client'

/**
 * Overage Payment Form
 * Stripe Elements payment form for overage charges
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button-v2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, Check, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface OveragePaymentFormProps {
  clientSecret: string
}

export function OveragePaymentForm({ clientSecret }: OveragePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<{
    amount: number
    promptCount: number
  } | null>(null)

  useEffect(() => {
    // Fetch payment intent details to display amount
    async function fetchPaymentDetails() {
      if (!stripe || !clientSecret) return

      try {
        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret)
        if (paymentIntent) {
          setPaymentDetails({
            amount: paymentIntent.amount / 100, // Convert cents to dollars
            promptCount: 1, // Default, could be passed in metadata
          })
        }
      } catch (error) {
        console.error('Error fetching payment intent:', error)
      }
    }

    fetchPaymentDetails()
  }, [stripe, clientSecret])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/overage/success`,
        },
        redirect: 'if_required',
      })

      if (error) {
        setPaymentError(error.message || 'Payment failed')
        toast.error(error.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('Payment successful! You can now continue creating.')
        router.push('/builder?payment=success')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentError(error instanceof Error ? error.message : 'Payment failed')
      toast.error('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle>Complete Overage Payment</CardTitle>
        </div>
        <CardDescription>
          Pay for additional prompts to continue creating this month
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Payment Summary */}
        {paymentDetails && (
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
              Payment Summary
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Additional prompts:
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {paymentDetails.promptCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">
                  Total amount:
                </span>
                <span className="font-bold text-lg text-slate-900 dark:text-white">
                  ${paymentDetails.amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Info Alert */}
        <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-sm text-slate-700 dark:text-slate-300">
            This is a one-time payment that doesn't affect your subscription. Your monthly limits will still reset on the 1st.
          </AlertDescription>
        </Alert>

        {/* Payment Error */}
        {paymentError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{paymentError}</AlertDescription>
          </Alert>
        )}

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <PaymentElement />
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!stripe || !elements || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay ${paymentDetails?.amount.toFixed(2) || '0.00'}
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.back()}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Check className="h-3 w-3 text-emerald-500" />
          <span>Secure payment powered by Stripe</span>
        </div>
      </CardContent>
    </Card>
  )
}
