'use client'

/**
 * Template Metadata Form Component
 * 
 * Comprehensive form for editing template metadata with:
 * - Dropdown fields for consistent filtering
 * - Multi-select for tags and categories
 * - Text fields for specific details
 * - Text areas for guidance content
 * - Auto-save functionality
 * - Validation rules
 */

import { useState, useEffect, useCallback } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button-v2'
import { Input } from '@/components/ui/input-v2'
import { Textarea } from '@/components/ui/textarea-v2'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-v2'
import { MultiSelect } from '@/components/ui/multi-select'
import {
  INDUSTRY_OPTIONS,
  DIFFICULTY_LEVELS,
  USE_CASE_TAG_OPTIONS,
  TEAM_USAGE_OPTIONS,
  FRAMEWORK_OPTIONS,
  VS_SETTINGS_OPTIONS,
} from '@/lib/constants/template-metadata'
import type { PromptTemplate } from '@/lib/types/templates'

interface TemplateMetadataFormProps {
  template: PromptTemplate
  onSave?: (metadata: Partial<PromptTemplate['metadata']>) => void
  autoSave?: boolean
  autoSaveInterval?: number
}

export function TemplateMetadataForm({
  template,
  onSave,
  autoSave = true,
  autoSaveInterval = 30000, // 30 seconds
}: TemplateMetadataFormProps) {
  // Metadata state
  const [industry, setIndustry] = useState<string>(template.metadata?.industry || '')
  const [difficultyLevel, setDifficultyLevel] = useState<string>(
    template.metadata?.difficultyLevel || 'Beginner'
  )
  const [useCaseTags, setUseCaseTags] = useState<string[]>(
    template.metadata?.useCaseTags || []
  )
  const [teamUsage, setTeamUsage] = useState<string[]>(
    template.metadata?.teamUsage || []
  )
  const [compatibleFrameworks, setCompatibleFrameworks] = useState<string[]>(
    template.recommendations?.compatibleFrameworks || []
  )
  const [vsSettings, setVsSettings] = useState<string>(
    template.recommendations?.vsSettings || ''
  )

  // Text fields
  const [estimatedTime, setEstimatedTime] = useState<string>(
    template.metadata?.estimatedTime || ''
  )
  const [outputLength, setOutputLength] = useState<string>(
    template.metadata?.outputLength || ''
  )
  const [businessImpact, setBusinessImpact] = useState<string>(
    template.metadata?.businessImpact || ''
  )

  // Text areas (guidance)
  const [prerequisites, setPrerequisites] = useState<string>(
    template.guidance?.prerequisites?.join('\n') || ''
  )
  const [bestPractices, setBestPractices] = useState<string>(
    template.guidance?.bestPractices?.join('\n') || ''
  )
  const [commonPitfalls, setCommonPitfalls] = useState<string>(
    template.guidance?.commonPitfalls?.join('\n') || ''
  )
  const [followUpPrompts, setFollowUpPrompts] = useState<string>(
    template.guidance?.followUpPrompts?.join('\n') || ''
  )

  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Parse bullet points from text area
  const parseBulletPoints = (text: string): string[] => {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => line.replace(/^[•\-\*]\s*/, ''))
  }

  // Collect all form data
  const collectFormData = useCallback(() => {
    return {
      metadata: {
        industry: industry || undefined,
        difficultyLevel: difficultyLevel as 'Beginner' | 'Intermediate' | 'Advanced',
        useCaseTags,
        teamUsage,
        estimatedTime: estimatedTime || undefined,
        outputLength: outputLength || undefined,
        businessImpact: businessImpact || undefined,
      },
      guidance: {
        prerequisites: parseBulletPoints(prerequisites),
        bestPractices: parseBulletPoints(bestPractices),
        commonPitfalls: parseBulletPoints(commonPitfalls),
        followUpPrompts: parseBulletPoints(followUpPrompts),
        successMetrics: template.guidance?.successMetrics || [],
      },
      recommendations: {
        vsSettings: vsSettings || undefined,
        compatibleFrameworks,
        advancedEnhancements: template.recommendations?.advancedEnhancements || [],
      },
    }
  }, [
    industry,
    difficultyLevel,
    useCaseTags,
    teamUsage,
    estimatedTime,
    outputLength,
    businessImpact,
    prerequisites,
    bestPractices,
    commonPitfalls,
    followUpPrompts,
    vsSettings,
    compatibleFrameworks,
    template,
  ])

  // Save function
  const saveMetadata = useCallback(async () => {
    setIsSaving(true)
    try {
      const formData = collectFormData()

      const response = await fetch(`/api/templates/${template.id}/metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save metadata')
      }

      setLastSaved(new Date())
      setHasChanges(false)
      onSave?.(formData.metadata)
    } catch (error) {
      console.error('Error saving metadata:', error)
    } finally {
      setIsSaving(false)
    }
  }, [template.id, collectFormData, onSave])

  // Auto-save effect
  useEffect(() => {
    if (!autoSave || !hasChanges) return

    const timer = setTimeout(() => {
      saveMetadata()
    }, autoSaveInterval)

    return () => clearTimeout(timer)
  }, [
    industry,
    difficultyLevel,
    useCaseTags,
    teamUsage,
    estimatedTime,
    outputLength,
    businessImpact,
    prerequisites,
    bestPractices,
    commonPitfalls,
    followUpPrompts,
    vsSettings,
    compatibleFrameworks,
    autoSave,
    autoSaveInterval,
    hasChanges,
    saveMetadata,
  ])

  // Track changes
  useEffect(() => {
    setHasChanges(true)
  }, [
    industry,
    difficultyLevel,
    useCaseTags,
    teamUsage,
    estimatedTime,
    outputLength,
    businessImpact,
    prerequisites,
    bestPractices,
    commonPitfalls,
    followUpPrompts,
    vsSettings,
    compatibleFrameworks,
  ])

  // Validation
  const validateEstimatedTime = estimatedTime.length <= 50
  const validateBusinessImpact = businessImpact.length <= 500

  return (
    <div className="space-y-6">
      {/* Auto-save indicator */}
      {autoSave && hasChanges && (
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Saving changes...</span>
        </div>
      )}
      {lastSaved && !hasChanges && (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}

      {/* Dropdown Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Industry
          </label>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger className="h-12 border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg border-blue-300 dark:bg-slate-800 dark:border-slate-600">
              {INDUSTRY_OPTIONS.map((option) => (
                <SelectItem
                  key={option}
                  value={option}
                  className="hover:bg-blue-50 dark:hover:bg-blue-950"
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Level */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Difficulty Level
          </label>
          <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
            <SelectTrigger className="h-12 border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg border-blue-300 dark:bg-slate-800 dark:border-slate-600">
              {DIFFICULTY_LEVELS.map((level) => (
                <SelectItem
                  key={level}
                  value={level}
                  className="hover:bg-blue-50 dark:hover:bg-blue-950"
                >
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Use Case Tags - Multi-select */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Use Case Tags
          </label>
          <MultiSelect
            options={USE_CASE_TAG_OPTIONS}
            selected={useCaseTags}
            onChange={setUseCaseTags}
            placeholder="Select relevant tags"
          />
        </div>

        {/* Team Usage - Multi-select */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Team Usage
          </label>
          <MultiSelect
            options={TEAM_USAGE_OPTIONS}
            selected={teamUsage}
            onChange={setTeamUsage}
            placeholder="Select teams"
          />
        </div>

        {/* Compatible Frameworks - Multi-select */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Compatible Frameworks
          </label>
          <MultiSelect
            options={FRAMEWORK_OPTIONS}
            selected={compatibleFrameworks}
            onChange={setCompatibleFrameworks}
            placeholder="Select frameworks"
          />
        </div>

        {/* VS Settings */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            VS Settings
          </label>
          <Select value={vsSettings} onValueChange={setVsSettings}>
            <SelectTrigger className="h-12 border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600">
              <SelectValue placeholder="Select VS setting" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg border-blue-300 dark:bg-slate-800 dark:border-slate-600">
              {VS_SETTINGS_OPTIONS.map((option) => (
                <SelectItem
                  key={option}
                  value={option}
                  className="hover:bg-blue-50 dark:hover:bg-blue-950"
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Estimated Time */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Estimated Time
          </label>
          <Input
            type="text"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            placeholder="e.g., 15-30 minutes"
            className="h-12 border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600"
            maxLength={50}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {estimatedTime.length}/50 characters
          </p>
        </div>

        {/* Output Length */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Output Length
          </label>
          <Input
            type="text"
            value={outputLength}
            onChange={(e) => setOutputLength(e.target.value)}
            placeholder="e.g., 2-3 pages, 5 bullet points, 1 paragraph"
            className="h-12 border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600"
          />
        </div>
      </div>

      {/* Business Impact - Text Area */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Business Impact
        </label>
        <Textarea
          value={businessImpact}
          onChange={(e) => setBusinessImpact(e.target.value)}
          placeholder="Describe the business value and expected outcomes..."
          className="min-h-[100px] border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600"
          maxLength={500}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {businessImpact.length}/500 characters
        </p>
      </div>

      {/* Guidance Sections - Text Areas with Bullet Formatting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prerequisites */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Prerequisites
          </label>
          <Textarea
            value={prerequisites}
            onChange={(e) => setPrerequisites(e.target.value)}
            placeholder="• Requirement 1&#10;• Requirement 2&#10;• Requirement 3"
            className="min-h-[120px] border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 font-mono text-sm"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            One item per line (bullet points optional)
          </p>
        </div>

        {/* Best Practices */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Best Practices
          </label>
          <Textarea
            value={bestPractices}
            onChange={(e) => setBestPractices(e.target.value)}
            placeholder="• Best practice 1&#10;• Best practice 2"
            className="min-h-[120px] border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 font-mono text-sm"
          />
        </div>

        {/* Common Pitfalls */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Common Pitfalls
          </label>
          <Textarea
            value={commonPitfalls}
            onChange={(e) => setCommonPitfalls(e.target.value)}
            placeholder="• Pitfall 1&#10;• Pitfall 2"
            className="min-h-[120px] border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 font-mono text-sm"
          />
        </div>

        {/* Follow-up Prompts */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Follow-up Prompts
          </label>
          <Textarea
            value={followUpPrompts}
            onChange={(e) => setFollowUpPrompts(e.target.value)}
            placeholder="• Follow-up prompt 1&#10;• Follow-up prompt 2"
            className="min-h-[120px] border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 font-mono text-sm"
          />
        </div>
      </div>

      {/* Manual Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveMetadata}
          disabled={isSaving || !hasChanges}
          variant="default"
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:from-blue-700 hover:to-blue-600"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

