'use client'

import { useState } from 'react'
import { usePromptBuilder } from '@/contexts/PromptBuilderContext'
import {
  VS_DISTRIBUTION_TYPES,
  PROBABILITY_THRESHOLDS,
  BALANCED_DIMENSIONS,
  RESPONSE_COUNT_OPTIONS,
} from '@/lib/constants/prompt-builder'
import { VSDistributionType } from '@/lib/types/prompt-builder'
import { isVSCompatibleWithFramework } from '@/lib/utils/vs-enhancement'
import { StepHeader } from './StepHeader'

interface VSEnhancementStepProps {
  onNext?: () => void
  onPrevious?: () => void
  canProceed?: boolean
  canGoBack?: boolean
  isLastStep?: boolean
}

export function VSEnhancementStep({ onNext, canProceed = true }: VSEnhancementStepProps) {
  const { state, updateVSEnhancement } = usePromptBuilder()
  const vs = state.vsEnhancement

  // Check VS compatibility with current framework
  const compatibility = state.baseConfig.framework
    ? isVSCompatibleWithFramework(state.baseConfig.framework)
    : { compatible: true }

  const handleEnableToggle = () => {
    updateVSEnhancement({ enabled: !vs.enabled })
  }

  const handleResponseCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    updateVSEnhancement({
      numberOfResponses: value === 'custom' ? vs.numberOfResponses : parseInt(value),
    })
  }

  const handleCustomCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value > 0 && value <= 20) {
      updateVSEnhancement({ numberOfResponses: value })
    }
  }

  const handleDistributionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateVSEnhancement({ distributionType: e.target.value as VSDistributionType })
  }

  const handleProbabilityThresholdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseFloat(e.target.value) as 0.15 | 0.1 | 0.05 | undefined
    if (value === 0.15 || value === 0.1 || value === 0.05) {
      updateVSEnhancement({ probabilityThreshold: value })
    } else if (e.target.value === '') {
      updateVSEnhancement({ probabilityThreshold: undefined })
    }
  }

  const handleDimensionToggle = (dimension: string) => {
    const current = vs.dimensions || []
    const updated = current.includes(dimension)
      ? current.filter((d) => d !== dimension)
      : [...current, dimension]
    updateVSEnhancement({ dimensions: updated })
  }

  const handleCustomDimensionAdd = (dimension: string) => {
    if (dimension.trim()) {
      const current = vs.customDimensions || []
      updateVSEnhancement({ customDimensions: [...current, dimension.trim()] })
    }
  }

  const handleCustomDimensionRemove = (dimension: string) => {
    const current = vs.customDimensions || []
    updateVSEnhancement({ customDimensions: current.filter((d) => d !== dimension) })
  }

  const handleReasoningToggle = () => {
    updateVSEnhancement({ includeProbabilityReasoning: !vs.includeProbabilityReasoning })
  }

  const handleCustomConstraintsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateVSEnhancement({ customConstraints: e.target.value })
  }

  const handleAntiTypicalityToggle = () => {
    updateVSEnhancement({ antiTypicalityEnabled: !vs.antiTypicalityEnabled })
  }

  const [customDimensionInput, setCustomDimensionInput] = useState('')

  return (
    <div className="space-y-6">
      <StepHeader
        title="Verbalized Sampling Enhancement"
        description="Optionally enhance your prompt with Verbalized Sampling (VS) to generate diverse, probability-weighted responses."
        onNext={onNext}
        canProceed={canProceed}
      />

      {/* VS Compatibility Warning */}
      {!compatibility.compatible && compatibility.warning && (
        <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Compatibility Notice
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                {compatibility.warning}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enable VS Toggle */}
      <div className="flex items-center justify-between rounded-lg border-2 border-slate-300 bg-white p-5 shadow-sm dark:border-slate-600 dark:bg-slate-800">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Enable Verbalized Sampling
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Generate multiple diverse responses with probability estimates
          </p>
        </div>
        <button
          type="button"
          onClick={handleEnableToggle}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            vs.enabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              vs.enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {vs.enabled && (
        <>
          {/* Number of Responses */}
          <div className="space-y-3 rounded-lg border-2 border-slate-300 bg-white p-5 shadow-sm dark:border-slate-600 dark:bg-slate-800">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Number of Responses
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                How many diverse responses to generate (max 20)
              </p>
            </div>
            <div className="flex gap-3">
              <select
                id="responseCount"
                value={
                  RESPONSE_COUNT_OPTIONS.some((opt) => opt.value === vs.numberOfResponses)
                    ? vs.numberOfResponses
                    : 'custom'
                }
                onChange={handleResponseCountChange}
                className="block flex-1 h-11 rounded-lg bg-slate-50 border-slate-300 shadow-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all duration-200"
              >
                {RESPONSE_COUNT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
                <option value="custom">Custom</option>
              </select>

              {!RESPONSE_COUNT_OPTIONS.some((opt) => opt.value === vs.numberOfResponses) && (
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={vs.numberOfResponses}
                  onChange={handleCustomCountChange}
                  className="block w-24 h-11 rounded-lg bg-slate-50 border-slate-300 shadow-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all duration-200"
                />
              )}
            </div>
          </div>

          {/* Distribution Type */}
          <div>
            <label
              htmlFor="distributionType"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Distribution Type
            </label>
            <select
              id="distributionType"
              value={vs.distributionType}
              onChange={handleDistributionTypeChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
            >
              {VS_DISTRIBUTION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Choose how responses should be distributed across the probability spectrum
            </p>
          </div>

          {/* Conditional: Rarity Hunt - Probability Threshold */}
          {vs.distributionType === 'rarity_hunt' && (
            <div className="rounded-md border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
              <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-300">
                Rarity Hunt Configuration
              </h4>
              <div className="mt-3">
                <label
                  htmlFor="probabilityThreshold"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Probability Threshold
                </label>
                <select
                  id="probabilityThreshold"
                  value={vs.probabilityThreshold || 0.15}
                  onChange={handleProbabilityThresholdChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
                >
                  {PROBABILITY_THRESHOLDS.map((threshold) => (
                    <option key={threshold.value} value={threshold.value}>
                      {threshold.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Only generate responses with probability below this threshold
                </p>
              </div>
            </div>
          )}

          {/* Conditional: Balanced Categories - Dimensions */}
          {vs.distributionType === 'balanced_categories' && (
            <div className="rounded-md border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
              <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-300">
                Balanced Categories Configuration
              </h4>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Select dimensions for balanced coverage (at least 2)
              </p>

              <div className="mt-3 space-y-2">
                {BALANCED_DIMENSIONS.map((dimension) => (
                  <label
                    key={dimension}
                    className="flex items-center rounded-md border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-800"
                  >
                    <input
                      type="checkbox"
                      checked={vs.dimensions?.includes(dimension) || false}
                      onChange={() => handleDimensionToggle(dimension)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-sm text-gray-900 dark:text-white">{dimension}</span>
                  </label>
                ))}
              </div>

              {/* Custom Dimensions */}
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Custom Dimensions
                </h5>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={customDimensionInput}
                    onChange={(e) => setCustomDimensionInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCustomDimensionAdd(customDimensionInput)
                        setCustomDimensionInput('')
                      }
                    }}
                    placeholder="Add custom dimension..."
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleCustomDimensionAdd(customDimensionInput)
                      setCustomDimensionInput('')
                    }}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                  >
                    Add
                  </button>
                </div>

                {vs.customDimensions && vs.customDimensions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {vs.customDimensions.map((dimension) => (
                      <span
                        key={dimension}
                        className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300"
                      >
                        {dimension}
                        <button
                          type="button"
                          onClick={() => handleCustomDimensionRemove(dimension)}
                          className="hover:text-indigo-900 dark:hover:text-indigo-200"
                        >
                          <svg
                            className="h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Include Probability Reasoning */}
          <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Include Probability Reasoning
              </h4>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                AI explains why each response has its probability score
              </p>
            </div>
            <button
              type="button"
              onClick={handleReasoningToggle}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                vs.includeProbabilityReasoning ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  vs.includeProbabilityReasoning ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Custom Constraints */}
          <div>
            <label
              htmlFor="customConstraints"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Custom Constraints
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Optional)</span>
            </label>
            <textarea
              id="customConstraints"
              value={vs.customConstraints}
              onChange={handleCustomConstraintsChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
              placeholder="Add any additional constraints for VS generation..."
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optional: Add specific constraints to guide response diversity
            </p>
          </div>

          {/* Anti-Typicality Mode */}
          <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Anti-Typicality Mode
              </h4>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Explicitly instruct AI to avoid typical/common responses
              </p>
            </div>
            <button
              type="button"
              onClick={handleAntiTypicalityToggle}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                vs.antiTypicalityEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  vs.antiTypicalityEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Info Box */}
          <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  About Verbalized Sampling
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                  <p>
                    Verbalized Sampling (VS) works by explicitly instructing the AI to generate
                    diverse responses with probability estimates. This technique is more effective
                    than just using API parameters like temperature.
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>
                      <strong>Broad Spectrum:</strong> Mix from common to rare ideas
                    </li>
                    <li>
                      <strong>Rarity Hunt:</strong> Only unconventional, low-probability options
                    </li>
                    <li>
                      <strong>Balanced Categories:</strong> Equal coverage across dimensions
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!vs.enabled && (
        <div className="rounded-md bg-gray-50 p-8 text-center dark:bg-gray-800">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            VS Enhancement Disabled
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enable Verbalized Sampling above to generate diverse, probability-weighted responses.
          </p>
        </div>
      )}
    </div>
  )
}
