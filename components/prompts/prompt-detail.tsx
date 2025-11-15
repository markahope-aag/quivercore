'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Star, Edit, Trash2, Copy, TestTube, History, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Prompt } from '@/lib/types/database'
import { format } from 'date-fns'
import { TestPanel } from './test-panel'
import { VersionHistory } from './version-history'

interface PromptDetailProps {
  prompt: Prompt
}

export function PromptDetail({ prompt }: PromptDetailProps) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(prompt.is_favorite)
  const [showTestPanel, setShowTestPanel] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)

  const handleToggleFavorite = async () => {
    const newFavorite = !isFavorite
    setIsFavorite(newFavorite)

    try {
      await fetch(`/api/prompts/${prompt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: newFavorite }),
      })
    } catch (error) {
      setIsFavorite(!newFavorite)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this prompt?')) {
      return
    }

    try {
      await fetch(`/api/prompts/${prompt.id}`, {
        method: 'DELETE',
      })
      router.push('/prompts')
    } catch (error) {
      console.error('Failed to delete prompt:', error)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{prompt.title}</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
            >
              <Star
                className={`h-5 w-5 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`}
              />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
            {prompt.use_case && (
              <Badge variant="outline">{prompt.use_case}</Badge>
            )}
            {prompt.framework && (
              <Badge variant="secondary">{prompt.framework}</Badge>
            )}
            {prompt.enhancement_technique && (
              <Badge variant="default">{prompt.enhancement_technique}</Badge>
            )}
            <span className="text-sm">
              Used {prompt.usage_count} time{prompt.usage_count !== 1 ? 's' : ''}
            </span>
            <span className="text-sm">
              • Created {format(new Date(prompt.created_at), 'MMM d, yyyy')}
            </span>
          </div>
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {prompt.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/prompts/${prompt.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {prompt.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{prompt.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg">
              {prompt.content}
            </pre>
          </div>
        </CardContent>
      </Card>

      {prompt.variables && Object.keys(prompt.variables).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Template Variables</CardTitle>
            <CardDescription>
              These variables can be replaced when testing the prompt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.keys(prompt.variables).map((variable) => (
                <Badge key={variable} variant="secondary">
                  {`{{${variable}}}`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Test Prompt</CardTitle>
              <CardDescription>
                Test this prompt with AI models
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTestPanel(!showTestPanel)}
            >
              {showTestPanel ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <TestTube className="mr-2 h-4 w-4" />
                  Show Test Panel
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {showTestPanel && (
          <CardContent>
            <TestPanel prompt={prompt} />
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Version History</CardTitle>
              <CardDescription>
                View and restore previous versions
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVersionHistory(!showVersionHistory)}
            >
              {showVersionHistory ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <History className="mr-2 h-4 w-4" />
                  Show History
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {showVersionHistory && (
          <CardContent>
            <VersionHistory promptId={prompt.id} />
          </CardContent>
        )}
      </Card>
    </div>
  )
}

