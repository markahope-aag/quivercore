import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { PricingPageContent } from '@/components/pricing/pricing-page-content'
import { PricingPageSkeleton } from '@/components/pricing/pricing-page-skeleton'

export default function PricingPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Choose Your Plan
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Unlock the full potential of AI creativity with our subscription plans
        </p>
      </div>

      <Suspense fallback={<PricingPageSkeleton />}>
        <PricingPageContent />
      </Suspense>
    </motion.div>
  )
}

