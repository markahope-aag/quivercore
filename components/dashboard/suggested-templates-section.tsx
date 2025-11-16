'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { FileText, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function SuggestedTemplatesSection() {
  // This will be populated from an API call in the future
  // For now, we'll show a placeholder
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Suggested Templates</CardTitle>
            <CardDescription>Popular templates to get started</CardDescription>
          </div>
          <Link href="/prompts?is_template=true">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Browse Templates
              </p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Explore our template library to find prompts for your use case.
            </p>
            <Link href="/prompts?is_template=true">
              <Button variant="outline" size="sm" className="w-full gap-2">
                Browse Templates
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
