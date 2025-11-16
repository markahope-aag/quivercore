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
import {
  UserCheck, List, GitBranch, FileText, Lock,
  RefreshCw, Scale, Sparkles, BarChart3, ArrowRightLeft, FileType
} from 'lucide-react'

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

  // Map icon string to component
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'UserCheck': UserCheck,
    'List': List,
    'GitBranch': GitBranch,
    'FileText': FileText,
    'Lock': Lock,
    'RefreshCw': RefreshCw,
    'Scale': Scale,
    'Sparkles': Sparkles,
    'BarChart3': BarChart3,
    'ArrowRightLeft': ArrowRightLeft,
    'FileTemplate': FileType, // FileTemplate doesn't exist in lucide-react, using FileType instead
  }
  
  const IconComponent = frameworkDetail?.icon ? iconMap[frameworkDetail.icon] : null

  // Generate content preview (first 150 characters)
  const contentPreview = prompt.content && prompt.content.length > 150
    ? `${prompt.content.substring(0, 150)}...`
    : (prompt.content || 'No content available')

  return (
    <Card className="group flex flex-col h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 overflow-hidden">
      {/* Gradient Top Border */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {/* Framework Icon */}
              {IconComponent && (
                <div className="flex-shrink-0 text-xl" title={prompt.framework || undefined}>
                  <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              )}
              <CardTitle className="line-clamp-1 text-lg font-bold text-slate-900 dark:text-white">
                <Link
                  href={`/prompts/${prompt.id}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {sanitizeForDisplay(prompt.title)}
                </Link>
              </CardTitle>
              {prompt.is_template && (
                <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-semibold px-2 py-0.5 shrink-0 border-0">
                  Template
                </Badge>
              )}
            </div>
            <CardDescription className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
              {prompt.description ? sanitizeForDisplay(prompt.description) : 'No description'}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            className="flex-shrink-0 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-full transition-colors"
          >
            <Star
              className={`h-5 w-5 transition-all ${isFavorite ? 'fill-yellow-400 text-yellow-500 scale-110' : 'text-slate-300 dark:text-slate-600'}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <div className="space-y-4">
          {/* Framework, Use Case, Enhancement Technique */}
          {(prompt.use_case || prompt.framework || prompt.enhancement_technique) && (
            <div className="flex flex-wrap gap-2">
              {prompt.framework && (
                <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm">
                  {sanitizeForDisplay(prompt.framework)}
                </Badge>
              )}
              {prompt.use_case && (
                <Badge className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 dark:from-slate-700 dark:to-slate-600 dark:text-slate-200 border-0 shadow-sm">
                  {sanitizeForDisplay(prompt.use_case)}
                </Badge>
              )}
              {prompt.enhancement_technique && (
                <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-sm">
                  ✨ {sanitizeForDisplay(prompt.enhancement_technique)}
                </Badge>
              )}
            </div>
          )}

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {prompt.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} className="text-xs font-normal bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  #{sanitizeForDisplay(tag)}
                </Badge>
              ))}
              {prompt.tags.length > 3 && (
                <Badge className="text-xs font-normal bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 border-0">
                  +{prompt.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Usage Stats */}
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-700">
            <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md">
              <Copy className="h-3.5 w-3.5 text-blue-500" />
              <span className="font-medium">{prompt.usage_count}</span> use{prompt.usage_count !== 1 ? 's' : ''}
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
            <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700">
              <Archive className="h-4 w-4" />
              Archived
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700">
        {prompt.is_template && prompt.builder_config ? (
          <Button
            variant="default"
            size="sm"
            asChild
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white border-0 shadow-md hover:shadow-lg transition-all"
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
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0 shadow-md hover:shadow-lg transition-all"
          >
            <Link href={`/prompts/${prompt.id}`}>
              View Details
            </Link>
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 shadow-sm hover:shadow transition-all"
            >
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

