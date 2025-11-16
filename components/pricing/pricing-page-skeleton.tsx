import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function PricingPageSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="text-center pb-2">
            <Skeleton className="h-8 w-32 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Skeleton className="h-10 w-24 mx-auto mb-2" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
            <ul className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((j) => (
                <li key={j} className="flex items-start gap-2">
                  <Skeleton className="h-5 w-5 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

