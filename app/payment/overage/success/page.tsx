'use client'

/**
 * Overage Payment Success Page
 * Displays success message after overage payment completes
 */

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { Skeleton } from '@/components/ui/skeleton'
import { Check, ArrowRight, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

function OverageSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)

  useEffect(() => {
    const intentId = searchParams.get('payment_intent')
    if (intentId) {
      setPaymentIntentId(intentId)
    }
  }, [searchParams])

  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                <Check className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
              </div>
            </motion.div>
            <CardTitle className="text-3xl text-emerald-600 dark:text-emerald-400">
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              You can now continue creating prompts
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success Info */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Check className="h-5 w-5 text-emerald-500" />
                What's Next
              </h3>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>Your prompt limit has been increased for this billing period</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>Continue creating AI prompts without interruption</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>Your limits will reset on the 1st of next month</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>You'll receive a receipt via email shortly</span>
                </li>
              </ul>
            </div>

            {/* Payment ID */}
            {paymentIntentId && (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Payment ID
                </p>
                <p className="text-sm font-mono text-slate-900 dark:text-white break-all">
                  {paymentIntentId}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                className="flex-1"
                size="lg"
                onClick={() => router.push('/builder')}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Continue Creating
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                size="lg"
                onClick={() => router.push('/dashboard/billing')}
              >
                View Billing History
              </Button>
            </div>

            {/* Support */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
              <AlertCircle className="h-3 w-3" />
              <span>
                Questions? Contact{' '}
                <a href="mailto:support@quivercore.com" className="underline hover:text-slate-700 dark:hover:text-slate-300">
                  support@quivercore.com
                </a>
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function OverageSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <Skeleton className="h-12 w-12 mx-auto mb-4 rounded-full" />
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    }>
      <OverageSuccessContent />
    </Suspense>
  )
}
