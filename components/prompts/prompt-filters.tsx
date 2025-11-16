'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input-v2'
import { Button } from '@/components/ui/button-v2'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-v2'
import { Badge } from '@/components/ui/badge-v2'
import { X, Grid3x3, List, Search, Star, Archive } from 'lucide-react'
import { Prompt } from '@/lib/types/database'
import { getUseCases } from '@/lib/constants/use-cases'
import { getFrameworks } from '@/lib/constants/frameworks'
import { getEnhancementTechniques } from '@/lib/constants/enhancement-techniques'
import { useDebounce } from '@/lib/hooks/use-debounce'

interface PromptFiltersProps {
  prompts?: Prompt[]
}

export function PromptFilters({ prompts }: PromptFiltersProps = {}) {
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

  // Get use-cases, frameworks, and enhancement techniques from prompts and merge with predefined
  // If prompts not provided, only show predefined options
  const userUseCases = prompts ? Array.from(new Set(prompts.map(p => p.use_case).filter((uc): uc is string => Boolean(uc)))) : []
  const userFrameworks = prompts ? Array.from(new Set(prompts.map(p => p.framework).filter((fw): fw is string => Boolean(fw)))) : []
  const userEnhancementTechniques = prompts ? Array.from(new Set(prompts.map(p => p.enhancement_technique).filter((et): et is string => Boolean(et)))) : []
  const allTags = prompts ? prompts.flatMap(p => p.tags || []) : []
  const uniqueTags = Array.from(new Set(allTags))

  // Get use-cases (always show all predefined + user custom ones)
  const predefinedUseCases = getUseCases()
  const useCases = [
    ...predefinedUseCases,
    ...userUseCases.filter((uc: string) => !predefinedUseCases.includes(uc))
  ]

  // Get frameworks (always show all predefined + user custom ones)
  const predefinedFrameworks = getFrameworks()
  const frameworks = [
    ...predefinedFrameworks,
    ...userFrameworks.filter((fw: string) => !predefinedFrameworks.includes(fw))
  ]

  // Get enhancement techniques (always show all predefined + user custom ones)
  const predefinedEnhancementTechniques = getEnhancementTechniques()
  const enhancementTechniques = [
    ...predefinedEnhancementTechniques,
    ...userEnhancementTechniques.filter((et: string) => !predefinedEnhancementTechniques.includes(et))
  ]

  // Get current filter values from URL
  const currentUseCase = searchParams.get('use_case') || ''
  const currentFramework = searchParams.get('framework') || ''
  const currentEnhancementTechnique = searchParams.get('enhancement_technique') || ''
  const currentTag = searchParams.get('tag') || ''
  const currentSearch = searchParams.get('q') || ''
  const currentFavorite = searchParams.get('favorite') === 'true'
  const currentShowArchived = searchParams.get('archived') === 'true'

  useEffect(() => {
    setSearchQuery(currentSearch)
  }, [currentSearch])

  // Debounce search query to avoid too many URL updates
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Update URL when debounced search query changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (debouncedSearchQuery) {
      params.set('q', debouncedSearchQuery)
    } else {
      params.delete('q')
    }

    // Only update if the value actually changed
    if (debouncedSearchQuery !== currentSearch) {
      router.push(`/prompts?${params.toString()}`)
    }
  }, [debouncedSearchQuery, router, searchParams, currentSearch])

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
    // Search is now handled by debounced effect, but we keep this for immediate submission
    updateFilters({ q: searchQuery || null })
  }

  const clearFilters = () => {
    setSearchQuery('')
    router.push('/prompts')
  }

  const hasActiveFilters = currentUseCase || currentFramework || currentEnhancementTechnique || currentTag || currentSearch || currentFavorite || currentShowArchived

  return (
    <div className="space-y-4">
      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-slate-50 border-2 border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 dark:bg-slate-800 dark:border-slate-600"
            />
          </div>
        </form>
        <div className="flex gap-2">
          <Button
            variant={currentFavorite ? 'default' : 'secondary'}
            size="icon"
            onClick={() => updateFilters({ favorite: currentFavorite ? null : 'true' })}
            title="Show favorites"
            className={currentFavorite ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:from-blue-700 hover:to-blue-600' : 'border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800'}
          >
            <Star className={`h-4 w-4 ${currentFavorite ? 'fill-current' : ''}`} />
          </Button>
          <Button
            variant={currentShowArchived ? 'default' : 'secondary'}
            size="icon"
            onClick={() => updateFilters({ archived: currentShowArchived ? null : 'true' })}
            title={currentShowArchived ? 'Hide archived' : 'Show archived'}
            className={currentShowArchived ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:from-blue-700 hover:to-blue-600' : 'border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800'}
          >
            <Archive className="h-4 w-4" />
          </Button>
          <div className="w-px bg-slate-200 dark:bg-slate-600" />
          <Button
            variant={viewMode === 'grid' ? 'default' : 'secondary'}
            size="icon"
            onClick={() => handleViewModeChange('grid')}
            title="Grid view"
            className={viewMode === 'grid' ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:from-blue-700 hover:to-blue-600' : 'border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800'}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'secondary'}
            size="icon"
            onClick={() => handleViewModeChange('list')}
            title="List view"
            className={viewMode === 'list' ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:from-blue-700 hover:to-blue-600' : 'border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800'}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={currentUseCase || '__all__'} onValueChange={(value) => updateFilters({ use_case: value === '__all__' ? null : value })}>
          <SelectTrigger className="w-[200px] h-12 bg-slate-50 border-2 border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 dark:bg-slate-800 dark:border-slate-600">
            <SelectValue placeholder="All Use Cases" />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-lg border-blue-300 dark:bg-slate-800 dark:border-slate-600">
            <SelectItem value="__all__" className="hover:bg-blue-50 dark:hover:bg-blue-950">All Use Cases</SelectItem>
            {useCases.map((useCase) => (
              <SelectItem key={useCase} value={useCase} className="hover:bg-blue-50 dark:hover:bg-blue-950">
                {useCase}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentFramework || '__all__'} onValueChange={(value) => updateFilters({ framework: value === '__all__' ? null : value })}>
          <SelectTrigger className="w-[200px] h-12 bg-slate-50 border-2 border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 dark:bg-slate-800 dark:border-slate-600">
            <SelectValue placeholder="All Frameworks" />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-lg border-blue-300 dark:bg-slate-800 dark:border-slate-600">
            <SelectItem value="__all__" className="hover:bg-blue-50 dark:hover:bg-blue-950">All Frameworks</SelectItem>
            {frameworks.map((framework) => (
              <SelectItem key={framework} value={framework} className="hover:bg-blue-50 dark:hover:bg-blue-950">
                {framework}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentEnhancementTechnique || '__all__'} onValueChange={(value) => updateFilters({ enhancement_technique: value === '__all__' ? null : value })}>
          <SelectTrigger className="w-[200px] h-12 bg-slate-50 border-2 border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 dark:bg-slate-800 dark:border-slate-600">
            <SelectValue placeholder="All Techniques" />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-lg border-blue-300 dark:bg-slate-800 dark:border-slate-600">
            <SelectItem value="__all__" className="hover:bg-blue-50 dark:hover:bg-blue-950">All Techniques</SelectItem>
            {enhancementTechniques.map((technique) => (
              <SelectItem key={technique} value={technique} className="hover:bg-blue-50 dark:hover:bg-blue-950">
                {technique}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="secondary" size="sm" onClick={clearFilters} className="border-2 border-slate-200 hover:bg-slate-50">
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {(currentUseCase || currentFramework || currentEnhancementTechnique || currentTag) && (
        <div className="flex flex-wrap gap-2">
          {currentUseCase && (
            <Badge variant="secondary" className="gap-1">
              Use Case: {currentUseCase}
              <button
                onClick={() => updateFilters({ use_case: null })}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentFramework && (
            <Badge variant="secondary" className="gap-1">
              Framework: {currentFramework}
              <button
                onClick={() => updateFilters({ framework: null })}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentEnhancementTechnique && (
            <Badge variant="secondary" className="gap-1">
              Technique: {currentEnhancementTechnique}
              <button
                onClick={() => updateFilters({ enhancement_technique: null })}
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

