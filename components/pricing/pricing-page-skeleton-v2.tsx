/**
 * Professional Pricing Page Skeleton
 * Enterprise-grade loading state for pricing page
 */

'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Skeleton } from '@/components/ui/skeleton'

export function PricingPageSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto items-stretch">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="h-full">
          <CardHeader className="text-center pb-4">
            <Skeleton className="h-7 w-32 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
            <ul className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                <li key={j} className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 rounded-full mt-0.5 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="pt-6">
            <Skeleton className="h-12 w-full rounded-lg" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

