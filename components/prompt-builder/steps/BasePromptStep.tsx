'use client'

import { useState, useMemo } from 'react'
import { usePromptBuilder } from '@/contexts/PromptBuilderContext'
import { DOMAIN_CATEGORIES, FRAMEWORK_OPTIONS } from '@/lib/constants/prompt-builder'
import { FRAMEWORKS_DETAILED, getRecommendedFrameworks } from '@/lib/constants/frameworks-detailed'
import { PROMPT_GUIDANCE, getPlaceholderText, getPromptQualityScore } from '@/lib/constants/prompt-guidance'
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
import { Info, HelpCircle, Sparkles, CheckCircle, X, ChevronDown, ChevronUp } from 'lucide-react'
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
  const [showPromptTips, setShowPromptTips] = useState(false)

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

  // Get framework-specific guidance
  const selectedFramework = state.baseConfig.framework
  const frameworkGuidance = selectedFramework ? PROMPT_GUIDANCE[selectedFramework] : null
  const placeholderText = useMemo(() => getPlaceholderText(selectedFramework), [selectedFramework])
  const qualityScore = useMemo(
    () => getPromptQualityScore(state.baseConfig.basePrompt, selectedFramework),
    [state.baseConfig.basePrompt, selectedFramework]
  )


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
          {/* Framework Label with Recommendations Button */}
          <div className="flex items-center justify-between">
            <label htmlFor="framework" className="text-sm font-medium text-slate-900 dark:text-white">
              Framework <span className="text-red-500">*</span>
            </label>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFrameworkGuide(true)}
              className="text-xs border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              <HelpCircle className="mr-1.5 h-3.5 w-3.5" />
              Framework Tips
            </Button>
          </div>

          {/* Smart Recommendations - Show if domain OR target outcome provided */}
          {(state.baseConfig.domain || state.baseConfig.targetOutcome) && recommendedFrameworks.length > 0 && (
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
                      type="button"
                      onClick={() => {
                        updateBaseConfig({ framework: fw as FrameworkType })
                        clearErrors()
                      }}
                      className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors border border-blue-300 dark:border-blue-700 shadow-sm"
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
      <div className="space-y-4 rounded-lg border-2 border-slate-300 bg-white p-5 shadow-sm dark:border-slate-600 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Base Prompt <span className="text-red-500">*</span>
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Provide your core instructions and context. This is the foundation of your prompt - be as detailed as necessary
            </p>
          </div>
          {selectedFramework && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowPromptTips(!showPromptTips)}
              className="text-xs border-2 border-blue-200 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/30"
            >
              <HelpCircle className="mr-1.5 h-3.5 w-3.5" />
              {selectedFramework} Tips
            </Button>
          )}
        </div>

        {/* Framework-Specific Guidance */}
        {selectedFramework && showPromptTips && frameworkGuidance && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                {selectedFramework} Prompt Guidelines
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800 dark:text-blue-200">Structure:</span>
                <p className="text-blue-700 dark:text-blue-300 mt-1">{frameworkGuidance.structure}</p>
              </div>
              <div>
                <span className="font-medium text-blue-800 dark:text-blue-200">Length:</span>
                <p className="text-blue-700 dark:text-blue-300 mt-1">{frameworkGuidance.length}</p>
              </div>
            </div>

            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200 block mb-2">Key Tips:</span>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1.5">
                {frameworkGuidance.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200 block mb-2">Avoid:</span>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1.5">
                {frameworkGuidance.avoid.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <X className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <details className="mt-4 group">
              <summary className="font-medium text-blue-800 dark:text-blue-200 cursor-pointer hover:text-blue-900 dark:hover:text-blue-100 flex items-center gap-2 list-none">
                <span>View Example</span>
                <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-3 p-3 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded text-sm text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap">
                {frameworkGuidance.example}
              </div>
            </details>
          </div>
        )}

        <Textarea
          id="basePrompt"
          label=""
          value={state.baseConfig.basePrompt}
          onChange={handleBasePromptChange}
          error={state.errors.basePrompt}
          placeholder={placeholderText}
          className={`min-h-[140px] bg-slate-50 border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
            state.errors.basePrompt ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
          }`}
        />

        {/* Quality Feedback and Character Count */}
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-1">
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
            {/* Quality Feedback */}
            {selectedFramework && state.baseConfig.basePrompt.trim() && qualityScore.feedback.length > 0 && (
              <div className="text-xs text-amber-600 dark:text-amber-400 space-y-0.5">
                {qualityScore.feedback.slice(0, 2).map((fb, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span>•</span>
                    <span>{fb}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={cn(
                'text-xs',
                state.baseConfig.basePrompt.length > 45000
                  ? 'text-red-600 dark:text-red-400 font-medium'
                  : state.baseConfig.basePrompt.length < 50
                    ? 'text-amber-600 dark:text-amber-400'
                    : state.baseConfig.basePrompt.length < 150
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-slate-500 dark:text-slate-400'
              )}
            >
              {state.baseConfig.basePrompt.length.toLocaleString()} / 50,000
            </span>
            {selectedFramework && state.baseConfig.basePrompt.trim() && (
              <span
                className={cn(
                  'text-xs font-medium',
                  qualityScore.score >= 75
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : qualityScore.score >= 50
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-amber-600 dark:text-amber-400'
                )}
              >
                {qualityScore.score >= 75
                  ? 'Good length for detailed prompt'
                  : qualityScore.score >= 50
                    ? 'Getting better - add more detail'
                    : 'Too short - add more context'}
              </span>
            )}
          </div>
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
        domain={state.baseConfig.domain}
        targetOutcome={state.baseConfig.targetOutcome}
      />
    </div>
  )
}
