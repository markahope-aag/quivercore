import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  return (
    <div className="container max-w-2xl mx-auto py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your subscription has been activated. Thank you for subscribing!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            You now have access to all the features included in your plan. Start exploring your enhanced AI capabilities!
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/prompts">Go to Prompts</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/builder">Try the Builder</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

