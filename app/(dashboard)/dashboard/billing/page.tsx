/**
 * Billing History Page
 * Shows subscription invoices and overage charges
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BillingHistoryTable } from '@/components/billing/billing-history-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { CreditCard } from 'lucide-react'

export default async function BillingHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch billing history
  const { data: billingHistory } = await supabase
    .from('billing_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch current subscription
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('*, subscription_plans(name, price)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Billing History
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          View your subscription invoices and overage charges
        </p>
      </div>

      {/* Current Subscription */}
      {subscription && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>
                  {(subscription as any).subscription_plans?.name || 'Unknown'} Plan
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                {subscription.status}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Current Period</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {subscription.current_period_start && subscription.current_period_end
                  ? `${new Date(subscription.current_period_start).toLocaleDateString()} - ${new Date(subscription.current_period_end).toLocaleDateString()}`
                  : 'N/A'}
              </span>
            </div>
            {subscription.cancel_at_period_end && (
              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-sm text-orange-700 dark:text-orange-300">
                Your subscription will cancel at the end of this billing period
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Billing History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            All your subscription payments and overage charges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BillingHistoryTable billingHistory={billingHistory || []} />
        </CardContent>
      </Card>
    </div>
  )
}
