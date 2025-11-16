import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function BillingCancelPage() {
  return (
    <div className="container max-w-2xl mx-auto py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl">Payment Canceled</CardTitle>
          <CardDescription>
            Your subscription was not completed. No charges were made.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            If you have any questions or need assistance, please don't hesitate to contact our support team.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/pricing">View Plans</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/prompts">Back to Prompts</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

