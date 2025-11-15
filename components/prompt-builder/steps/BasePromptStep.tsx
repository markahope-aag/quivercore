'use client'

import { usePromptBuilder } from '@/contexts/PromptBuilderContext'
import { DOMAIN_CATEGORIES, FRAMEWORK_OPTIONS } from '@/lib/constants/prompt-builder'
import { DomainCategory, FrameworkType } from '@/lib/types/prompt-builder'

export function BasePromptStep() {
  const { state, updateBaseConfig, setError, clearErrors } = usePromptBuilder()

  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateBaseConfig({ domain: e.target.value as DomainCategory })
    clearErrors()
  }

  const handleFrameworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateBaseConfig({ framework: e.target.value as FrameworkType })
    clearErrors()
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Base Prompt Setup</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Define the foundation of your prompt by selecting a domain and framework, then providing your
          core instructions.
        </p>
      </div>

      {/* Domain Category */}
      <div>
        <label htmlFor="domain" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Domain Category
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Optional)</span>
        </label>
        <select
          id="domain"
          value={state.baseConfig.domain}
          onChange={handleDomainChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
        >
          <option value="">Select a domain...</option>
          {DOMAIN_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Choose the domain that best describes your use case
        </p>
      </div>

      {/* Framework Selection */}
      <div>
        <label htmlFor="framework" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Framework
          <span className="ml-2 text-xs text-red-500">*Required</span>
        </label>
        <select
          id="framework"
          value={state.baseConfig.framework}
          onChange={handleFrameworkChange}
          className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm ${
            state.errors.framework
              ? 'border-red-300 dark:border-red-600'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          required
        >
          <option value="">Select a framework...</option>
          {FRAMEWORK_OPTIONS.map((framework) => (
            <option key={framework.value} value={framework.value}>
              {framework.label}
            </option>
          ))}
        </select>
        {state.errors.framework && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.errors.framework}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Select the prompt engineering pattern to use
        </p>
      </div>

      {/* Base Prompt */}
      <div>
        <label
          htmlFor="basePrompt"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Base Prompt
          <span className="ml-2 text-xs text-red-500">*Required</span>
        </label>
        <textarea
          id="basePrompt"
          value={state.baseConfig.basePrompt}
          onChange={handleBasePromptChange}
          rows={8}
          className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm ${
            state.errors.basePrompt
              ? 'border-red-300 dark:border-red-600'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="Enter your core prompt instructions here..."
          required
        />
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Provide the main instructions for your prompt
          </p>
          <span
            className={`text-xs ${
              state.baseConfig.basePrompt.length > 45000
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {state.baseConfig.basePrompt.length.toLocaleString()} / 50,000 characters
          </span>
        </div>
        {state.errors.basePrompt && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.errors.basePrompt}</p>
        )}
      </div>

      {/* Target Outcome */}
      <div>
        <label
          htmlFor="targetOutcome"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Target Outcome
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Optional)</span>
        </label>
        <textarea
          id="targetOutcome"
          value={state.baseConfig.targetOutcome}
          onChange={handleTargetOutcomeChange}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          placeholder="Describe the desired outcome or response format..."
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Optional: Describe what you want the AI to produce
        </p>
      </div>

      {/* Helpful Tips */}
      <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Tips</h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
              <ul className="list-disc space-y-1 pl-5">
                <li>Be specific and clear in your base prompt</li>
                <li>Choose a framework that matches your use case</li>
                <li>Use the target outcome to guide the AI's response format</li>
                <li>Framework-specific configuration will appear in the next step</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
