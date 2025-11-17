'use client'

/**
 * Billing History Table
 * Displays subscription invoices and overage charges
 */

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button-v2'
import { ExternalLink, Download, Receipt, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BillingHistoryItem {
  id: string
  created_at: string
  amount: number
  currency: string
  status: string
  invoice_url?: string | null
  stripe_invoice_id: string
  paid_at?: string | null
  description?: string | null
}

interface BillingHistoryTableProps {
  billingHistory: BillingHistoryItem[]
}

export function BillingHistoryTable({ billingHistory }: BillingHistoryTableProps) {
  if (!billingHistory || billingHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
          <Receipt className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          No billing history yet
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Your payment history will appear here once you make your first payment
        </p>
      </div>
    )
  }

  const formatAmount = (amount: number, currency: string) => {
    // Amount is in cents, convert to dollars
    const dollars = amount / 100
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(dollars)
  }

  const isOverageCharge = (item: BillingHistoryItem) => {
    return item.description?.toLowerCase().includes('overage') || false
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
              Date
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
              Type
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
              Description
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
              Amount
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
              Status
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
              Invoice
            </th>
          </tr>
        </thead>
        <tbody>
          {billingHistory.map((item) => (
            <tr
              key={item.id}
              className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
            >
              {/* Date */}
              <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400">
                {item.paid_at
                  ? new Date(item.paid_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : new Date(item.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
              </td>

              {/* Type */}
              <td className="py-4 px-4">
                {isOverageCharge(item) ? (
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-orange-100 dark:bg-orange-900 rounded">
                      <Zap className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                      Overage
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                      <Receipt className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Subscription
                    </span>
                  </div>
                )}
              </td>

              {/* Description */}
              <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-300">
                {item.description || 'Monthly subscription payment'}
              </td>

              {/* Amount */}
              <td className="py-4 px-4 text-right">
                <span className={cn(
                  'text-sm font-semibold',
                  isOverageCharge(item)
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-slate-900 dark:text-white'
                )}>
                  {formatAmount(item.amount, item.currency)}
                </span>
              </td>

              {/* Status */}
              <td className="py-4 px-4 text-center">
                <Badge
                  variant={item.status === 'paid' ? 'default' : 'secondary'}
                  className={cn(
                    item.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  )}
                >
                  {item.status === 'paid' ? 'Paid' : item.status}
                </Badge>
              </td>

              {/* Invoice Link */}
              <td className="py-4 px-4 text-right">
                {item.invoice_url ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <a
                      href={item.invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View
                    </a>
                  </Button>
                ) : (
                  <span className="text-xs text-slate-400">N/A</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Total Payments
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {formatAmount(
              billingHistory
                .filter((item) => item.status === 'paid')
                .reduce((sum, item) => sum + item.amount, 0),
              billingHistory[0]?.currency || 'usd'
            )}
          </span>
        </div>

        {/* Overage Total */}
        {billingHistory.some(isOverageCharge) && (
          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              Overage charges
            </span>
            <span className="font-semibold text-orange-600 dark:text-orange-400">
              {formatAmount(
                billingHistory
                  .filter((item) => item.status === 'paid' && isOverageCharge(item))
                  .reduce((sum, item) => sum + item.amount, 0),
                billingHistory[0]?.currency || 'usd'
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
