import { Suspense } from 'react'
import { PricingPageContent } from '@/components/pricing/pricing-page-content'
import { PricingPageSkeleton } from '@/components/pricing/pricing-page-skeleton'

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Choose Your Plan</h1>
        <p className="text-muted-foreground text-lg">
          Unlock the full potential of AI creativity with our subscription plans
        </p>
      </div>

      <Suspense fallback={<PricingPageSkeleton />}>
        <PricingPageContent />
      </Suspense>
    </div>
  )
}

