'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Grid3x3, List, Search } from 'lucide-react'
import { Prompt } from '@/lib/types/database'

interface PromptFiltersProps {
  prompts: Prompt[]
}

export function PromptFilters({ prompts }: PromptFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Load view mode from localStorage or URL
  useEffect(() => {
    const savedViewMode = localStorage.getItem('promptViewMode') as 'grid' | 'list' | null
    const urlViewMode = searchParams.get('view') as 'grid' | 'list' | null
    if (urlViewMode) {
      setViewMode(urlViewMode)
    } else if (savedViewMode) {
      setViewMode(savedViewMode)
    }
  }, [searchParams])

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode)
    localStorage.setItem('promptViewMode', mode)
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', mode)
    router.push(`/prompts?${params.toString()}`)
  }

  // Extract unique values from prompts
  const types = Array.from(new Set(prompts.map(p => p.type).filter(Boolean)))
  const categories = Array.from(new Set(prompts.map(p => p.category).filter(Boolean)))
  const allTags = prompts.flatMap(p => p.tags || [])
  const uniqueTags = Array.from(new Set(allTags))

  // Get current filter values from URL
  const currentType = searchParams.get('type') || ''
  const currentCategory = searchParams.get('category') || ''
  const currentTag = searchParams.get('tag') || ''
  const currentSearch = searchParams.get('q') || ''

  useEffect(() => {
    setSearchQuery(currentSearch)
  }, [currentSearch])

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`/prompts?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ q: searchQuery || null })
  }

  const clearFilters = () => {
    setSearchQuery('')
    router.push('/prompts')
  }

  const hasActiveFilters = currentType || currentCategory || currentTag || currentSearch

  return (
    <div className="space-y-4">
      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => handleViewModeChange('grid')}
            title="Grid view"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => handleViewModeChange('list')}
            title="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={currentType} onValueChange={(value) => updateFilters({ type: value || null })}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            {types.map((type) => (
              <SelectItem key={type} value={type}>
                {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentCategory} onValueChange={(value) => updateFilters({ category: value || null })}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {(currentType || currentCategory || currentTag) && (
        <div className="flex flex-wrap gap-2">
          {currentType && (
            <Badge variant="secondary" className="gap-1">
              Type: {currentType.replace('_', ' ')}
              <button
                onClick={() => updateFilters({ type: null })}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentCategory && (
            <Badge variant="secondary" className="gap-1">
              Category: {currentCategory}
              <button
                onClick={() => updateFilters({ category: null })}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentTag && (
            <Badge variant="secondary" className="gap-1">
              Tag: {currentTag}
              <button
                onClick={() => updateFilters({ tag: null })}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Popular Tags */}
      {uniqueTags.length > 0 && !currentTag && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Popular tags:</span>
          {uniqueTags.slice(0, 10).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="cursor-pointer hover:bg-accent"
              onClick={() => updateFilters({ tag })}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

