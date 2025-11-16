'use client'

import { useState } from 'react'
import { usePromptBuilder } from '@/contexts/PromptBuilderContext'
import { DOMAIN_CATEGORIES, FRAMEWORK_OPTIONS } from '@/lib/constants/prompt-builder'
import { FRAMEWORKS_DETAILED, getRecommendedFrameworks } from '@/lib/constants/frameworks-detailed'
import { DomainCategory, FrameworkType } from '@/lib/types/prompt-builder'
import { Input } from '@/components/ui/input-v2'
import { Textarea } from '@/components/ui/textarea-v2'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-v2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Badge } from '@/components/ui/badge-v2'
import { Button } from '@/components/ui/button-v2'
import { Info, HelpCircle, Sparkles } from 'lucide-react'
import { StepHeader } from './StepHeader'
import { FrameworkGuideModal } from '../FrameworkGuideModal'
import { cn } from '@/lib/utils'

interface BasePromptStepProps {
  onNext?: () => void
  onPrevious?: () => void
  canProceed?: boolean
  canGoBack?: boolean
  isLastStep?: boolean
}

export function BasePromptStep({ onNext, canProceed }: BasePromptStepProps) {
  const { state, updateBaseConfig, setError, clearErrors } = usePromptBuilder()
  const [showFrameworkGuide, setShowFrameworkGuide] = useState(false)

  // Get recommended frameworks based on domain and target outcome
  const recommendedFrameworks = getRecommendedFrameworks(
    state.baseConfig.domain,
    state.baseConfig.targetOutcome
  )

  const selectedFrameworkInfo = state.baseConfig.framework
    ? FRAMEWORKS_DETAILED[state.baseConfig.framework]
    : null

  const difficultyColors = {
    Beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-500/30',
    Intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-500/30',
    Advanced: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-500/30',
  }


  const handleBasePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateBaseConfig({ basePrompt: e.target.value })
    if (e.target.value.trim()) {
      clearErrors()
    }
  }

  const handleTargetOutcomeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateBaseConfig({ targetOutcome: e.target.value })
  }

  const validateStep = (): boolean => {
    if (!state.baseConfig.basePrompt.trim()) {
      setError('basePrompt', 'Base prompt is required')
      return false
    }
    if (!state.baseConfig.framework) {
      setError('framework', 'Framework selection is required')
      return false
    }
    if (state.baseConfig.basePrompt.length > 50000) {
      setError('basePrompt', 'Prompt is too long (max 50,000 characters)')
      return false
    }
    return true
  }

  return (
    <div className="space-y-6">
      <StepHeader
        title="Prompt Configuration"
        description="Define the foundation of your prompt by selecting a domain and framework, then providing your core instructions."
        onNext={onNext}
        canProceed={canProceed}
      />

      {/* Intent Section - Target Outcome */}
      <div className="space-y-3 rounded-lg border-2 border-slate-300 bg-white p-5 shadow-sm dark:border-slate-600 dark:bg-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Target Outcome <span className="text-slate-400 font-normal text-sm">(Optional)</span>
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Be specific about your desired output - this guides the entire prompt creation process
          </p>
        </div>
        <Textarea
          id="targetOutcome"
          label=""
          value={state.baseConfig.targetOutcome}
          onChange={handleTargetOutcomeChange}
          placeholder="e.g., Generate 5 creative marketing campaign concepts for a sustainable coffee brand"
          className="min-h-[120px] bg-slate-50 border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
        />
        {state.baseConfig.targetOutcome.trim() && (
          <div className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Target outcome defined</span>
          </div>
        )}
      </div>

      {/* Context Section - Domain + Framework */}
      <div className="space-y-4 rounded-lg border-2 border-slate-300 bg-white p-5 shadow-sm dark:border-slate-600 dark:bg-slate-800">
        <div className="border-b border-slate-300 pb-3 dark:border-slate-600">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Context</h3>
        </div>

        {/* Domain Category */}
        <div className="space-y-2">
          <label htmlFor="domain" className="text-sm font-medium text-slate-900 dark:text-white">
            Domain Category <span className="text-slate-400 font-normal text-xs">(Optional)</span>
          </label>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Choose the domain that best describes your use case
          </p>
          <Select
            value={state.baseConfig.domain || undefined}
            onValueChange={(value) => {
              updateBaseConfig({ domain: value as DomainCategory })
              clearErrors()
            }}
          >
            <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-300 hover:border-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
              <SelectValue placeholder="Select a domain (optional)" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg border-blue-300">
              {DOMAIN_CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value} className="hover:bg-blue-50">
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Framework Selection */}
        <div className="space-y-4">
          {/* Framework Label with Help */}
          <div className="flex items-center gap-2">
            <label htmlFor="framework" className="text-sm font-medium text-slate-900 dark:text-white">
              Framework <span className="text-red-500">*</span>
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFrameworkGuide(true)}
              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              title="Learn about frameworks"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>

          {/* Smart Recommendations */}
          {state.baseConfig.domain && state.baseConfig.targetOutcome && recommendedFrameworks.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                  Recommended for your use case:
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {recommendedFrameworks.map((fw) => {
                  const frameworkInfo = FRAMEWORKS_DETAILED[fw]
                  if (!frameworkInfo) return null
                  return (
                    <button
                      key={fw}
                      onClick={() => {
                        updateBaseConfig({ framework: fw as FrameworkType })
                        clearErrors()
                      }}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors border border-blue-300 dark:border-blue-700"
                    >
                      {frameworkInfo.name} ✨
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Framework Selection Dropdown */}
          <Select
            value={state.baseConfig.framework || undefined}
            onValueChange={(value) => {
              updateBaseConfig({ framework: value as FrameworkType })
              clearErrors()
            }}
          >
            <SelectTrigger
              className={cn(
                'w-full h-11 bg-slate-50 border-slate-300 hover:border-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200',
                state.errors.framework && 'border-red-300 focus:border-red-500 focus:ring-red-200'
              )}
              aria-invalid={!!state.errors.framework}
            >
              <SelectValue placeholder="Select a framework *" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg border-blue-300 dark:bg-slate-800 dark:border-slate-600">
              {FRAMEWORK_OPTIONS.map((framework) => {
                const frameworkInfo = FRAMEWORKS_DETAILED[framework.value]
                const IconComponent = frameworkInfo?.icon
                return (
                  <SelectItem
                    key={framework.value}
                    value={framework.value}
                    className="hover:bg-blue-50 dark:hover:bg-blue-950"
                  >
                    <div className="flex items-center gap-2">
                      {IconComponent && (
                        <IconComponent className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      )}
                      <span>{framework.label}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          {state.errors.framework && (
            <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5" role="alert">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {state.errors.framework}
            </p>
          )}

          {/* Selected Framework Info */}
          {selectedFrameworkInfo && !state.errors.framework && (
            <Card className="border-2 border-slate-200 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-700">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg flex-shrink-0">
                    {(() => {
                      const IconComponent = selectedFrameworkInfo.icon
                      return <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {selectedFrameworkInfo.name}
                      </h4>
                      <Badge
                        variant="secondary"
                        className={cn('text-xs border-2', difficultyColors[selectedFrameworkInfo.difficulty])}
                      >
                        {selectedFrameworkInfo.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {selectedFrameworkInfo.description}
                    </p>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Best for:{' '}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {selectedFrameworkInfo.bestFor.join(', ')}
                        </span>
                      </div>
                      {selectedFrameworkInfo.worksWellWith.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            Works well with:{' '}
                          </span>
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            {selectedFrameworkInfo.worksWellWith.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Content Section - Base Prompt */}
      <div className="space-y-3 rounded-lg border-2 border-slate-300 bg-white p-5 shadow-sm dark:border-slate-600 dark:bg-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Base Prompt <span className="text-red-500">*</span>
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Provide your core instructions and context. This is the foundation of your prompt - be as detailed as necessary
          </p>
        </div>
        <Textarea
          id="basePrompt"
          label=""
          value={state.baseConfig.basePrompt}
          onChange={handleBasePromptChange}
          error={state.errors.basePrompt}
          placeholder="e.g., I need marketing campaign ideas that will differentiate our brand from competitors while highlighting our sustainability mission..."
          className={`min-h-[140px] bg-slate-50 border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
            state.errors.basePrompt ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
          }`}
        />
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {state.errors.basePrompt && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5" role="alert">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {state.errors.basePrompt}
              </p>
            )}
            {state.baseConfig.basePrompt.trim() && !state.errors.basePrompt && (
              <div className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Base prompt provided</span>
              </div>
            )}
          </div>
          <span
            className={`text-xs ${
              state.baseConfig.basePrompt.length > 45000
                ? 'text-red-600 dark:text-red-400 font-medium'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {state.baseConfig.basePrompt.length.toLocaleString()} / 50,000
          </span>
        </div>
      </div>

      {/* Helpful Tips - Compact */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1.5 text-sm text-blue-700 dark:text-blue-300">
            <p><strong>Tips:</strong> Be specific in your base prompt. Choose a framework that matches your use case. Use the target outcome to guide the AI's response format.</p>
          </div>
        </div>
      </div>

      {/* Framework Guide Modal */}
      <FrameworkGuideModal
        open={showFrameworkGuide}
        onOpenChange={setShowFrameworkGuide}
        onSelectFramework={(framework) => {
          updateBaseConfig({ framework: framework as FrameworkType })
          clearErrors()
        }}
      />
    </div>
  )
}
