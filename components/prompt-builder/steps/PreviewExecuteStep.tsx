'use client'

import { useState, useEffect } from 'react'
import { usePromptBuilder } from '@/contexts/PromptBuilderContext'
import { exportPrompt, copyToClipboard, exportVSResponsesAsCSV } from '@/lib/utils/export'
import { parseVSResponse } from '@/lib/utils/api-client'
import type { ExportFormat } from '@/lib/utils/export'
import type { AdvancedEnhancements } from '@/lib/types/enhancements'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Helper function to get list of enabled advanced enhancements
function getEnabledAdvancedEnhancements(enhancements: AdvancedEnhancements): string[] {
  const enabled: string[] = []

  if (enhancements.roleEnhancement?.enabled) {
    enabled.push('Role Enhancement')
  }

  if (enhancements.formatControl?.enabled) {
    enabled.push('Format Control')
  }

  if (enhancements.smartConstraints?.enabled) {
    enabled.push('Smart Constraints')
  }

  if (enhancements.reasoningScaffolds?.enabled) {
    enabled.push('Reasoning Scaffolds')
  }

  if (enhancements.conversationFlow?.enabled) {
    enabled.push('Conversation Flow')
  }

  return enabled
}

// Helper function to format advanced enhancement details
function formatAdvancedEnhancementDetails(enhancements: AdvancedEnhancements): string {
  const details: string[] = []

  // Role Enhancement
  if (enhancements.roleEnhancement?.enabled) {
    const role = enhancements.roleEnhancement
    details.push(`Role: ${role.expertiseLevel} in ${role.domainSpecialty}`)
    if (role.experienceYears) {
      details.push(`${role.experienceYears} years experience`)
    }
    details.push(`Authority: ${role.authorityLevel}`)
  }

  // Format Control
  if (enhancements.formatControl?.enabled) {
    const format = enhancements.formatControl
    details.push(`Format: ${format.structure}`)
    if (format.lengthSpec.target) {
      details.push(`Length: ${format.lengthSpec.target} ${format.lengthSpec.type}`)
    }
    details.push(`Style: ${format.styleGuide}`)
  }

  // Smart Constraints
  if (enhancements.smartConstraints?.enabled) {
    const constraints = enhancements.smartConstraints
    if (constraints.positiveConstraints.length > 0) {
      details.push(`Must include: ${constraints.positiveConstraints.length} items`)
    }
    if (constraints.negativeConstraints.length > 0) {
      details.push(`Must avoid: ${constraints.negativeConstraints.length} items`)
    }
    if (constraints.boundaryConditions.length > 0) {
      details.push(`Boundaries: ${constraints.boundaryConditions.length} conditions`)
    }
    if (constraints.qualityGates.length > 0) {
      details.push(`Quality gates: ${constraints.qualityGates.length} requirements`)
    }
  }

  // Reasoning Scaffolds
  if (enhancements.reasoningScaffolds?.enabled) {
    const reasoning = enhancements.reasoningScaffolds
    const parts: string[] = []
    if (reasoning.showWork) parts.push('show work')
    if (reasoning.stepByStep) parts.push('step-by-step')
    if (reasoning.exploreAlternatives) parts.push('alternatives')
    if (reasoning.confidenceScoring) parts.push('confidence scores')
    parts.push(reasoning.reasoningStyle)
    details.push(`Reasoning: ${parts.join(', ')}`)
  }

  // Conversation Flow
  if (enhancements.conversationFlow?.enabled) {
    const flow = enhancements.conversationFlow
    const parts: string[] = []
    if (flow.contextPreservation) parts.push('context preservation')
    if (flow.clarificationProtocols) parts.push('clarification')
    if (flow.iterationImprovement) parts.push('iteration')
    if (flow.followUpTemplates.length > 0) parts.push(`${flow.followUpTemplates.length} follow-ups`)
    details.push(`Flow: ${parts.join(', ')}`)
  }

  return details.join(' • ') || 'None'
}

export function PreviewExecuteStep() {
  const { state, generatePrompt, executePrompt, saveTemplate, setError, setModel } = usePromptBuilder()
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showSaveToLibraryDialog, setShowSaveToLibraryDialog] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [templateTags, setTemplateTags] = useState('')
  const [libraryTitle, setLibraryTitle] = useState('')
  const [libraryDescription, setLibraryDescription] = useState('')
  const [libraryTags, setLibraryTags] = useState('')
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [isSavingToLibrary, setIsSavingToLibrary] = useState(false)
  const [copied, setCopied] = useState(false)

  const enabledAdvancedEnhancements = getEnabledAdvancedEnhancements(state.advancedEnhancements)
  const advancedEnhancementDetails = formatAdvancedEnhancementDetails(state.advancedEnhancements)

  // Generate prompt on mount and when config changes
  useEffect(() => {
    generatePrompt()
  }, [state.baseConfig, state.vsEnhancement, state.advancedEnhancements, generatePrompt])

  const handleExecute = async () => {
    if (!state.generatedPrompt) {
      setError('execution', 'No prompt generated')
      return
    }

    await executePrompt()
  }

  const handleExport = (format: ExportFormat) => {
    if (!state.generatedPrompt) return

    const latestResult = state.executionResults[0]

    exportPrompt(format, {
      generatedPrompt: state.generatedPrompt,
      baseConfig: state.baseConfig,
      vsEnhancement: state.vsEnhancement,
      executionResult: latestResult,
    })
  }

  const handleCopy = async () => {
    if (!state.generatedPrompt) return

    const text = `${state.generatedPrompt.systemPrompt}\n\n---\n\n${state.generatedPrompt.finalPrompt}`
    const success = await copyToClipboard(text)

    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      setError('template', 'Template name is required')
      return
    }

    const tags = templateTags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    saveTemplate(templateName, templateDescription, tags)
    setShowSaveDialog(false)
    setTemplateName('')
    setTemplateDescription('')
    setTemplateTags('')
  }

  const handleSaveToLibrary = async () => {
    if (!libraryTitle.trim()) {
      setError('library', 'Title is required')
      return
    }

    if (!state.generatedPrompt) {
      setError('library', 'No prompt generated')
      return
    }

    setIsSavingToLibrary(true)

    try {
      const tags = libraryTags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      // Format the full prompt content (system + user)
      const fullPrompt = `${state.generatedPrompt.systemPrompt}\n\n---\n\n${state.generatedPrompt.finalPrompt}`

      // Convert variables to database format
      const variables = state.baseConfig.variables?.reduce((acc, v) => {
        acc[v.name] = { description: v.description || '' }
        return acc
      }, {} as Record<string, any>) || null

      // Build complete builder config for reconstruction
      const builderConfig = {
        baseConfig: state.baseConfig,
        vsEnhancement: state.vsEnhancement,
        advancedEnhancements: state.advancedEnhancements,
      }

      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: libraryTitle,
          content: fullPrompt,
          description: libraryDescription || null,
          is_template: saveAsTemplate,
          builder_config: builderConfig,
          use_case: state.baseConfig.domain || null,
          framework: state.baseConfig.framework || null,
          enhancement_technique: state.vsEnhancement.enabled
            ? `VS: ${state.vsEnhancement.distributionType}`
            : (enabledAdvancedEnhancements.length > 0
                ? enabledAdvancedEnhancements.join(', ')
                : null),
          tags: tags.length > 0 ? tags : null,
          variables: variables,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP error: ${response.status}`)
      }

      // Success - close dialog and reset form
      setShowSaveToLibraryDialog(false)
      setLibraryTitle('')
      setLibraryDescription('')
      setLibraryTags('')
      setSaveAsTemplate(false)

      // Show success message (you could add a toast notification here)
      alert('Prompt saved to library successfully!')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save to library'
      setError('library', errorMessage)
    } finally {
      setIsSavingToLibrary(false)
    }
  }

  if (!state.generatedPrompt) {
    return (
      <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
        <p className="text-sm text-yellow-700 dark:text-yellow-400">
          Complete the previous steps to generate a prompt preview.
        </p>
      </div>
    )
  }

  const latestResult = state.executionResults[0]
  const parsedVS = latestResult && state.vsEnhancement.enabled ? parseVSResponse(latestResult.response) : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Preview & Execute</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Review your generated prompt, execute it with Claude, and export or save as a template.
        </p>
      </div>

      {/* Model Selector */}
      <div className="rounded-md border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Claude Model
        </label>
        <Select value={state.selectedModel} onValueChange={setModel}>
          <SelectTrigger className="w-full max-w-md">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="claude-3-5-sonnet-20241022">
              Claude 3.5 Sonnet (Latest) - Best balance of speed and quality
            </SelectItem>
            <SelectItem value="claude-3-opus-20240229">
              Claude 3 Opus - Highest quality, slower
            </SelectItem>
            <SelectItem value="claude-3-sonnet-20240229">
              Claude 3 Sonnet - Good balance (legacy)
            </SelectItem>
            <SelectItem value="claude-3-haiku-20240307">
              Claude 3 Haiku - Fastest, lower cost
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Choose the Claude model for prompt execution. Claude 3.5 Sonnet offers the best balance of speed, quality, and cost.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-500"
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>

        <div className="relative inline-block text-left">
          <button
            onClick={() => document.getElementById('export-menu')?.classList.toggle('hidden')}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Export
          </button>
          <div
            id="export-menu"
            className="absolute right-0 z-10 mt-2 hidden w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800"
          >
            <div className="py-1">
              <button
                onClick={() => handleExport('json')}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                JSON (Full Configuration)
              </button>
              <button
                onClick={() => handleExport('text')}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Text (Prompt Only)
              </button>
              <button
                onClick={() => handleExport('markdown')}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Markdown (Formatted)
              </button>
              {latestResult && state.vsEnhancement.enabled && (
                <button
                  onClick={() => handleExport('csv')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  CSV (VS Responses)
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowSaveDialog(true)}
          className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
          </svg>
          Save as Template
        </button>

        <button
          onClick={() => setShowSaveToLibraryDialog(true)}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
          </svg>
          Save to Library
        </button>
      </div>

      {/* System Prompt Preview */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Prompt</h3>
        <div className="mt-2 rounded-md bg-gray-900 p-4">
          <pre className="overflow-x-auto text-sm text-gray-100">
            <code>{state.generatedPrompt.systemPrompt}</code>
          </pre>
        </div>
      </div>

      {/* User Prompt Preview */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Prompt</h3>
          {enabledAdvancedEnhancements.length > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Includes {enabledAdvancedEnhancements.length} advanced enhancement
              {enabledAdvancedEnhancements.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="mt-2 rounded-md bg-gray-900 p-4">
          <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-gray-100">
            <code>{state.generatedPrompt.finalPrompt}</code>
          </pre>
        </div>
        {enabledAdvancedEnhancements.length > 0 && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            The prompt above includes instructions from your enabled advanced enhancements (role, format, constraints, reasoning, and conversation flow).
          </p>
        )}
      </div>

      {/* Advanced Enhancements Settings */}
      {enabledAdvancedEnhancements.length > 0 && (
        <div className="rounded-md border border-blue-300 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300">Advanced Enhancements</h4>
          <div className="mt-2 space-y-2">
            <div className="flex flex-wrap gap-2">
              {enabledAdvancedEnhancements.map((enhancement) => (
                <span
                  key={enhancement}
                  className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-800/50 dark:text-blue-200"
                >
                  {enhancement}
                </span>
              ))}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">{advancedEnhancementDetails}</p>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="rounded-md border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Metadata</h4>
        <dl className="mt-2 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">Domain:</dt>
            <dd className="text-gray-900 dark:text-white">{state.generatedPrompt.metadata.domain || 'N/A'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">Framework:</dt>
            <dd className="text-gray-900 dark:text-white">{state.generatedPrompt.metadata.framework}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">VS Enabled:</dt>
            <dd className="text-gray-900 dark:text-white">
              {state.generatedPrompt.metadata.vsEnabled ? 'Yes' : 'No'}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">Advanced Enhancements:</dt>
            <dd className="text-gray-900 dark:text-white">
              {enabledAdvancedEnhancements.length > 0 ? enabledAdvancedEnhancements.join(', ') : 'None'}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">Variables:</dt>
            <dd className="text-gray-900 dark:text-white">
              {state.baseConfig.variables && state.baseConfig.variables.length > 0
                ? `${state.baseConfig.variables.length} defined (${state.baseConfig.variables.map(v => v.name).join(', ')})`
                : 'None'}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">Generated:</dt>
            <dd className="text-gray-900 dark:text-white">
              {new Date(state.generatedPrompt.metadata.timestamp).toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      {/* Execute Section */}
      <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-800 dark:bg-indigo-900/20">
        <h3 className="text-lg font-medium text-indigo-900 dark:text-indigo-300">
          Execute with Claude API
        </h3>
        <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-400">
          Execute your prompt using the Claude API to see the results.
        </p>

        <div className="mt-4 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Secure Execution:</strong> Prompts are executed securely using server-side API keys. 
            No API keys are required or stored in your browser.
          </p>
        </div>

        {state.errors.execution && (
          <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-400">{state.errors.execution}</p>
          </div>
        )}

        <button
          onClick={handleExecute}
          disabled={state.isExecuting}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state.isExecuting ? (
            <>
              <svg
                className="h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Executing...
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              Execute Prompt
            </>
          )}
        </button>
      </div>

      {/* Results Display */}
      {latestResult && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Latest Result</h3>

          {/* Result Metadata */}
          <div className="rounded-md border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
            <dl className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="font-medium text-gray-500 dark:text-gray-400">Model:</dt>
                <dd className="text-gray-900 dark:text-white">{latestResult.model}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500 dark:text-gray-400">Timestamp:</dt>
                <dd className="text-gray-900 dark:text-white">
                  {new Date(latestResult.timestamp).toLocaleString()}
                </dd>
              </div>
              {latestResult.tokensUsed && (
                <div>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Tokens:</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {latestResult.tokensUsed.total?.toLocaleString() || 'N/A'}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* VS Parsed Responses */}
          {parsedVS && parsedVS.responses.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white">VS Responses</h4>
              <div className="mt-2 space-y-3">
                {parsedVS.responses.map((response, index) => (
                  <div
                    key={index}
                    className="rounded-md border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-900"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {response.content}
                        </p>
                        {response.rationale && (
                          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Rationale:</span> {response.rationale}
                          </p>
                        )}
                        {response.category && (
                          <span className="mt-2 inline-block rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                            {response.category}
                          </span>
                        )}
                      </div>
                      {response.probability !== undefined && (
                        <div className="ml-4 text-right">
                          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            {(response.probability * 100).toFixed(1)}%
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">probability</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Response */}
          {(!parsedVS || parsedVS.responses.length === 0) && (
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white">Response</h4>
              <div className="mt-2 rounded-md bg-gray-900 p-4">
                <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-gray-100">
                  <code>{latestResult.response}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save Template Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Save as Template</h3>

            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="templateName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Template Name *
                </label>
                <input
                  type="text"
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="My Awesome Prompt"
                />
              </div>

              <div>
                <label
                  htmlFor="templateDescription"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Description
                </label>
                <textarea
                  id="templateDescription"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="Describe what this template does..."
                />
              </div>

              <div>
                <label
                  htmlFor="templateTags"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="templateTags"
                  value={templateTags}
                  onChange={(e) => setTemplateTags(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="writing, creative, blog"
                />
              </div>

              {state.errors.template && (
                <p className="text-sm text-red-600 dark:text-red-400">{state.errors.template}</p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save to Library Dialog */}
      {showSaveToLibraryDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Save to Prompt Library</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Save this prompt to your database library for reuse across your account
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="libraryTitle"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Title *
                </label>
                <input
                  type="text"
                  id="libraryTitle"
                  value={libraryTitle}
                  onChange={(e) => setLibraryTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="My Awesome Prompt"
                />
              </div>

              <div>
                <label
                  htmlFor="libraryDescription"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Description
                </label>
                <textarea
                  id="libraryDescription"
                  value={libraryDescription}
                  onChange={(e) => setLibraryDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="Describe what this prompt does..."
                />
              </div>

              <div>
                <label
                  htmlFor="libraryTags"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="libraryTags"
                  value={libraryTags}
                  onChange={(e) => setLibraryTags(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="writing, creative, blog"
                />
              </div>

              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="saveAsTemplate"
                    type="checkbox"
                    checked={saveAsTemplate}
                    onChange={(e) => setSaveAsTemplate(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="saveAsTemplate" className="font-medium text-gray-700 dark:text-gray-300">
                    Save as Template
                  </label>
                  <p className="text-gray-500 dark:text-gray-400">
                    Templates are reusable patterns that can be loaded back into the builder with all configurations intact
                  </p>
                </div>
              </div>

              <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Auto-filled:</strong> Domain: {state.baseConfig.domain || 'None'},
                  Framework: {state.baseConfig.framework || 'None'},
                  Enhancements: {state.vsEnhancement.enabled ? `VS (${state.vsEnhancement.distributionType})` : 'None'}
                  {enabledAdvancedEnhancements.length > 0 && `, ${enabledAdvancedEnhancements.join(', ')}`}
                </p>
              </div>

              {state.errors.library && (
                <p className="text-sm text-red-600 dark:text-red-400">{state.errors.library}</p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowSaveToLibraryDialog(false)
                  setLibraryTitle('')
                  setLibraryDescription('')
                  setLibraryTags('')
                  setSaveAsTemplate(false)
                }}
                className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                disabled={isSavingToLibrary}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveToLibrary}
                disabled={isSavingToLibrary}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingToLibrary ? 'Saving...' : 'Save to Library'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
