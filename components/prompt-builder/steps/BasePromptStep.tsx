'use client'

import { usePromptBuilder } from '@/contexts/PromptBuilderContext'
import { DOMAIN_CATEGORIES, FRAMEWORK_OPTIONS } from '@/lib/constants/prompt-builder'
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
import { Info } from 'lucide-react'

export function BasePromptStep() {
  const { state, updateBaseConfig, setError, clearErrors } = usePromptBuilder()


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
    <div className="space-y-8">
      {/* Section Header */}
      <div className="mb-12 border-b border-slate-200 pb-6 dark:border-slate-800">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Base Prompt</h2>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Prompt Configuration</h3>
        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Define the foundation of your prompt by selecting a domain and framework, then providing your core instructions.
        </p>
      </div>
      {/* Domain Category */}
      <div className="space-y-3">
        <Select
          value={state.baseConfig.domain || undefined}
          onValueChange={(value) => {
            updateBaseConfig({ domain: value as DomainCategory })
            clearErrors()
          }}
        >
          <SelectTrigger className="w-full h-12 rounded-lg">
            <SelectValue placeholder="Select a domain (optional)" />
          </SelectTrigger>
          <SelectContent>
            {DOMAIN_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Choose the domain that best describes your use case
        </p>
      </div>

      {/* Framework Selection */}
      <div className="space-y-3">
        <Select
          value={state.baseConfig.framework || undefined}
          onValueChange={(value) => {
            updateBaseConfig({ framework: value as FrameworkType })
            clearErrors()
          }}
        >
          <SelectTrigger className="w-full h-12 rounded-lg" aria-invalid={!!state.errors.framework}>
            <SelectValue placeholder="Select a framework *" />
          </SelectTrigger>
          <SelectContent>
            {FRAMEWORK_OPTIONS.map((framework) => (
              <SelectItem key={framework.value} value={framework.value}>
                {framework.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.errors.framework && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {state.errors.framework}
          </p>
        )}
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Select the prompt engineering pattern to use
        </p>
      </div>

      {/* Base Prompt */}
      <div className="space-y-3">
        <Textarea
          id="basePrompt"
          label="Base Prompt"
          value={state.baseConfig.basePrompt}
          onChange={handleBasePromptChange}
          error={state.errors.basePrompt}
          placeholder="Enter your core prompt instructions here. Be specific and clear about what you want the AI to do..."
          className="min-h-[160px] rounded-lg"
        />
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Provide the main instructions for your prompt
          </p>
          <span
            className={`text-xs text-slate-400 dark:text-slate-500 ${
              state.baseConfig.basePrompt.length > 45000
                ? 'text-red-500 dark:text-red-400'
                : ''
            }`}
          >
            {state.baseConfig.basePrompt.length.toLocaleString()} / 50,000
          </span>
        </div>
      </div>

      {/* Target Outcome */}
      <div className="space-y-3">
        <Textarea
          id="targetOutcome"
          label="Target Outcome (Optional)"
          value={state.baseConfig.targetOutcome}
          onChange={handleTargetOutcomeChange}
          placeholder="Describe the desired outcome or response format. For example: 'A structured JSON object with...' or 'A markdown document with sections for...'"
          className="min-h-[160px] rounded-lg"
        />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Optional: Describe what you want the AI to produce
        </p>
      </div>

      {/* Helpful Tips */}
      <Card className="border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-sm dark:border-blue-700 dark:from-blue-900/30 dark:to-blue-800/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-base text-blue-900 dark:text-blue-300">Tips</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Be specific and clear in your base prompt</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Choose a framework that matches your use case</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Use the target outcome to guide the AI's response format</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Framework-specific configuration will appear in the next step</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
