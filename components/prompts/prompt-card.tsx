'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, memo } from 'react'
import { Star, Edit, Trash2, Copy, TestTube, Archive, ArchiveRestore, Files, Wand2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { Badge } from '@/components/ui/badge-v2'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Prompt } from '@/lib/types/database'
import { format, formatDistanceToNow } from 'date-fns'
import { sanitizeForDisplay } from '@/lib/utils/sanitize'
import { toast } from 'sonner'
import { getFrameworkDetail } from '@/lib/constants/framework-details'

interface PromptCardProps {
  prompt: Prompt
}

export const PromptCard = memo(function PromptCard({ prompt }: PromptCardProps) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(prompt.is_favorite)
  const [isArchived, setIsArchived] = useState(prompt.archived)

  const handleToggleFavorite = async () => {
    const newFavorite = !isFavorite
    setIsFavorite(newFavorite)

    try {
      const response = await fetch(`/api/prompts/${prompt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: newFavorite }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(error.error || 'Failed to update favorite')
      }

      toast.success(newFavorite ? 'Added to favorites' : 'Removed from favorites')
    } catch (error) {
      setIsFavorite(!newFavorite) // Revert on error
      console.error('Failed to toggle favorite:', error)
      toast.error('Failed to update favorite. Please try again.')
    }
  }

  const handleToggleArchive = async () => {
    const newArchived = !isArchived
    setIsArchived(newArchived)

    try {
      const response = await fetch(`/api/prompts/${prompt.id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: newArchived }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(error.error || 'Failed to archive prompt')
      }

      toast.success(newArchived ? 'Prompt archived' : 'Prompt unarchived')
      router.refresh()
    } catch (error) {
      setIsArchived(!newArchived) // Revert on error
      console.error('Failed to toggle archive:', error)
      toast.error('Failed to update archive status. Please try again.')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/prompts/${prompt.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(error.error || 'Failed to delete prompt')
      }

      toast.success('Prompt deleted')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete prompt:', error)
      toast.error('Failed to delete prompt. Please try again.')
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content)

      // Track usage when copying
      await fetch(`/api/prompts/${prompt.id}/use`, { method: 'POST' })

      toast.success('Copied to clipboard')
      router.refresh()
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleDuplicate = async () => {
    try {
      const response = await fetch(`/api/prompts/${prompt.id}/duplicate`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(error.error || 'Failed to duplicate prompt')
      }

      const duplicated = await response.json()
      toast.success('Prompt duplicated')
      router.push(`/prompts/${duplicated.id}/edit`)
    } catch (error) {
      console.error('Failed to duplicate:', error)
      toast.error('Failed to duplicate prompt. Please try again.')
    }
  }

  // Get framework details for icon
  const frameworkDetail = prompt.framework ? getFrameworkDetail(prompt.framework) : null

  // Generate content preview (first 150 characters)
  const contentPreview = prompt.content.length > 150
    ? `${prompt.content.substring(0, 150)}...`
    : prompt.content

  return (
    <Card className="flex flex-col h-full border-2 border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow dark:border-slate-600 dark:bg-slate-800">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="line-clamp-1">
                <Link href={`/prompts/${prompt.id}`} className="hover:underline">
                  {sanitizeForDisplay(prompt.title)}
                </Link>
              </CardTitle>
              {prompt.is_template && (
                <Badge variant="default" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-700 text-xs font-semibold shrink-0">
                  Template
                </Badge>
              )}
            </div>
            <CardDescription className="line-clamp-2 mt-1">
              {prompt.description ? sanitizeForDisplay(prompt.description) : 'No description'}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            className="flex-shrink-0 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <Star
              className={`h-4 w-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-slate-400'}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-3">
          {/* Content Preview */}
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {sanitizeForDisplay(contentPreview)}
          </p>

          {/* Framework, Use Case, Enhancement Technique */}
          {(prompt.use_case || prompt.framework || prompt.enhancement_technique) && (
            <div className="flex flex-wrap gap-2">
              {prompt.framework && (
                <Badge
                  variant="default"
                  className="bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-500/30"
                >
                  {frameworkDetail?.icon && <span className="mr-1">{frameworkDetail.icon}</span>}
                  {sanitizeForDisplay(prompt.framework)}
                </Badge>
              )}
              {prompt.use_case && (
                <Badge variant="secondary" className="border-2 border-slate-200 text-slate-700 dark:border-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700">
                  {sanitizeForDisplay(prompt.use_case)}
                </Badge>
              )}
              {prompt.enhancement_technique && (
                <Badge variant="secondary" className="border-2 border-emerald-200 text-emerald-700 dark:border-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20">
                  {sanitizeForDisplay(prompt.enhancement_technique)}
                </Badge>
              )}
            </div>
          )}

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {prompt.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs font-normal border-2 border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700">
                  {sanitizeForDisplay(tag)}
                </Badge>
              ))}
              {prompt.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs font-normal border-2 border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700">
                  +{prompt.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Usage Stats */}
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="flex items-center gap-1">
              <Copy className="h-3 w-3" />
              {prompt.usage_count} use{prompt.usage_count !== 1 ? 's' : ''}
            </span>
            {prompt.last_used_at ? (
              <span className="flex items-center gap-1">
                Used {formatDistanceToNow(new Date(prompt.last_used_at), { addSuffix: true })}
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500">Never used</span>
            )}
          </div>

          {/* Archived Badge */}
          {isArchived && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-200 dark:border-amber-800">
              <Archive className="h-3 w-3" />
              Archived
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 border-t border-slate-200 dark:border-slate-700">
        {prompt.is_template && prompt.builder_config ? (
          <Button
            variant="default"
            size="sm"
            asChild
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white border-0"
          >
            <Link href={`/builder?template=${prompt.id}`}>
              <Wand2 className="mr-1.5 h-4 w-4" />
              Load in Builder
            </Link>
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            asChild
            className="flex-1 border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
          >
            <Link href={`/prompts/${prompt.id}`}>
              View
            </Link>
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" className="border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700">
              ⋮
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy & Track Usage
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate}>
              <Files className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/prompts/${prompt.id}?test=true`}>
                <TestTube className="mr-2 h-4 w-4" />
                Test
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/prompts/${prompt.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleToggleArchive}>
              {isArchived ? (
                <>
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  Unarchive
                </>
              ) : (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
})

