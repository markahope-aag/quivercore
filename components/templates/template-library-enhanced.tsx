'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
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
import type { PromptTemplate } from '@/lib/types/templates'

interface TemplateLibraryEnhancedProps {
  templates: PromptTemplate[]
  onSelectTemplate?: (template: PromptTemplate) => void
}

const INDUSTRIES = ['SaaS', 'Healthcare', 'Education', 'Finance', 'E-commerce', 'Marketing', 'Other']
const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const
const POPULAR_TAGS = [
  'Content Creation',
  'Customer Support',
  'Data Analysis',
  'Email Marketing',
  'Product Development',
  'Sales',
  'Technical Writing',
  'User Research',
]

export function TemplateLibraryEnhanced({ templates, onSelectTemplate }: TemplateLibraryEnhancedProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<PromptTemplate[]>(templates)

  useEffect(() => {
    filterTemplates()
  }, [searchQuery, selectedIndustry, selectedDifficulty, selectedTags, templates])

  const filterTemplates = () => {
    let filtered = [...templates]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.metadata.useCaseTags.some((tag) => tag.toLowerCase().includes(query)) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // Industry filter
    if (selectedIndustry) {
      filtered = filtered.filter((t) => t.metadata.industry === selectedIndustry)
    }

    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter((t) => t.metadata.difficultyLevel === selectedDifficulty)
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((t) =>
        selectedTags.some((tag) =>
          t.metadata.useCaseTags.includes(tag) || t.tags.includes(tag)
        )
      )
    }

    setFilteredTemplates(filtered)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedIndustry('')
    setSelectedDifficulty('')
    setSelectedTags([])
  }

  const hasActiveFilters = searchQuery || selectedIndustry || selectedDifficulty || selectedTags.length > 0

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-slate-50 border-2 border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 dark:bg-slate-800 dark:border-slate-600"
              />
            </div>
          </div>

          <Select value={selectedIndustry || '__all__'} onValueChange={(value) => setSelectedIndustry(value === '__all__' ? '' : value)}>
            <SelectTrigger className="w-[200px] h-12 bg-slate-50 border-2 border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 dark:bg-slate-800 dark:border-slate-600">
              <SelectValue placeholder="All Industries" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg border-blue-300 dark:bg-slate-800 dark:border-slate-600">
              <SelectItem value="__all__" className="hover:bg-blue-50 dark:hover:bg-blue-950">All Industries</SelectItem>
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry} value={industry} className="hover:bg-blue-50 dark:hover:bg-blue-950">
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDifficulty || '__all__'} onValueChange={(value) => setSelectedDifficulty(value === '__all__' ? '' : value)}>
            <SelectTrigger className="w-[200px] h-12 bg-slate-50 border-2 border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 dark:bg-slate-800 dark:border-slate-600">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg border-blue-300 dark:bg-slate-800 dark:border-slate-600">
              <SelectItem value="__all__" className="hover:bg-blue-50 dark:hover:bg-blue-950">All Difficulties</SelectItem>
              {DIFFICULTY_LEVELS.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty} className="hover:bg-blue-50 dark:hover:bg-blue-950">
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Popular Tags */}
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-slate-600 dark:text-slate-400 self-center">Popular tags:</span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 text-sm rounded-full border-2 transition-all ${
                selectedTags.includes(tag)
                  ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-500/30 dark:text-blue-300'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-600 dark:text-slate-400">Active filters:</span>
            {selectedIndustry && (
              <Badge variant="secondary" className="border-2 border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700">
                Industry: {selectedIndustry}
                <button
                  onClick={() => setSelectedIndustry('')}
                  className="ml-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedDifficulty && (
              <Badge variant="secondary" className="border-2 border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700">
                Difficulty: {selectedDifficulty}
                <button
                  onClick={() => setSelectedDifficulty('')}
                  className="ml-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="border-2 border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700">
                {tag}
                <button
                  onClick={() => toggleTag(tag)}
                  className="ml-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={clearFilters}
              className="border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              <X className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Showing {filteredTemplates.length} of {templates.length} templates
      </div>

      {/* Templates will be rendered by parent component */}
      {onSelectTemplate && filteredTemplates.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onClick={() => onSelectTemplate(template)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TemplateCardProps {
  template: PromptTemplate
  onClick: () => void
}

function TemplateCard({ template, onClick }: TemplateCardProps) {
  const difficultyColors = {
    Beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Advanced: 'bg-red-100 text-red-700 border-red-200',
  }

  return (
    <div
      onClick={onClick}
      className="cursor-pointer border-2 border-slate-200 bg-white rounded-lg shadow-sm hover:shadow-md transition-all dark:border-slate-600 dark:bg-slate-800"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-1">
            {template.name}
          </h3>
          <Badge
            variant="secondary"
            className={`text-xs border-2 ${difficultyColors[template.metadata.difficultyLevel]}`}
          >
            {template.metadata.difficultyLevel}
          </Badge>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
          {template.description}
        </p>
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <span>⭐ {template.quality.userRating.toFixed(1)}</span>
          <span>👥 {template.quality.usageCount} uses</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {template.metadata.useCaseTags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs border-2 border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

