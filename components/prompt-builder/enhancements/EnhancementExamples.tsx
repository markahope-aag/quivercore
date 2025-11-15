'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

interface EnhancementExamplesProps {
  before: string
  after: string
  title?: string
}

export function EnhancementExamples({ before, after, title = 'Example' }: EnhancementExamplesProps) {
  const [showAfter, setShowAfter] = useState(false)

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAfter(!showAfter)}
            className="text-xs"
          >
            {showAfter ? (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Show Before
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Show After
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium mb-2 text-muted-foreground">
              {showAfter ? 'After Enhancement' : 'Before Enhancement'}
            </div>
            <div className="rounded-md bg-gray-900 p-4">
              <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-gray-100">
                <code>{showAfter ? after : before}</code>
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

