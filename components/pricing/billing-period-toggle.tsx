'use client'

/**
 * Billing Period Toggle
 * Allows users to switch between monthly and annual pricing display
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export type BillingPeriod = 'monthly' | 'annual'

interface BillingPeriodToggleProps {
  value: BillingPeriod
  onChange: (period: BillingPeriod) => void
}

export function BillingPeriodToggle({ value, onChange }: BillingPeriodToggleProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={() => onChange('monthly')}
        className={`
          relative px-6 py-2.5 rounded-lg font-semibold transition-all
          ${value === 'monthly'
            ? 'text-white'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }
        `}
      >
        {value === 'monthly' && (
          <motion.div
            layoutId="active-pill"
            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg"
            transition={{ type: 'spring', duration: 0.5 }}
          />
        )}
        <span className="relative z-10">Monthly</span>
      </button>

      <button
        onClick={() => onChange('annual')}
        className={`
          relative px-6 py-2.5 rounded-lg font-semibold transition-all
          ${value === 'annual'
            ? 'text-white'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }
        `}
      >
        {value === 'annual' && (
          <motion.div
            layoutId="active-pill"
            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg"
            transition={{ type: 'spring', duration: 0.5 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          Annual
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full">
            <Check className="h-3 w-3" />
            Save 20%
          </span>
        </span>
      </button>
    </div>
  )
}
