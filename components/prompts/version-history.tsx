'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PromptVersion } from '@/lib/types/database'

interface VersionHistoryProps {
  promptId: string
}

export function VersionHistory({ promptId }: VersionHistoryProps) {
  const [versions, setVersions] = useState<PromptVersion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const res = await fetch(`/api/prompts/${promptId}/versions`)
        if (res.ok) {
          const data = await res.json()
          setVersions(data)
        }
      } catch (error) {
        console.error('Failed to fetch versions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVersions()
  }, [promptId])

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading version history...</div>
  }

  if (versions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No version history available yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {versions.map((version) => (
        <Card key={version.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Version {version.version_number}
              </CardTitle>
              <Badge variant="outline">
                {format(new Date(version.created_at), 'MMM d, yyyy HH:mm')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
              {version.content}
            </pre>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

