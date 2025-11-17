'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { PricingPageContentV3 } from '@/components/pricing/pricing-page-content-v3'
import { PricingPageSkeleton } from '@/components/pricing/pricing-page-skeleton'
import { Sparkles } from 'lucide-react'

export default function PricingPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-12 pb-12"
    >
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-950 rounded-full border-2 border-blue-200 dark:border-blue-800 mb-4">
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            Powered by Stanford's Verbalized Sampling Research
          </span>
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          Choose Your Plan
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          Break free from predictable AI responses. All plans include full access to frameworks,
          Verbalized Sampling patterns, and advanced enhancements.
        </p>
      </div>

      <Suspense fallback={<PricingPageSkeleton />}>
        <PricingPageContentV3 />
      </Suspense>
    </motion.div>
  )
}

