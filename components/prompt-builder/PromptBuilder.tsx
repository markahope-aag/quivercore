'use client'

import { usePromptBuilder } from '@/contexts/PromptBuilderContext'
import { BuilderStep } from '@/lib/types/prompt-builder'
import { BasePromptStep } from './steps/BasePromptStep'
import { FrameworkConfigStep } from './steps/FrameworkConfigStep'
import { VSEnhancementStep } from './steps/VSEnhancementStep'
import { AdvancedEnhancementsStep } from './steps/AdvancedEnhancementsStep'
import { PreviewExecuteStep } from './steps/PreviewExecuteStep'

const STEPS: { id: BuilderStep; label: string; description: string }[] = [
  {
    id: 'base',
    label: 'Base Prompt',
    description: 'Define your prompt foundation',
  },
  {
    id: 'framework',
    label: 'Framework Config',
    description: 'Configure framework options',
  },
  {
    id: 'enhancement',
    label: 'VS Enhancement',
    description: 'Add Verbalized Sampling',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Fine-tune enhancements',
  },
  {
    id: 'preview',
    label: 'Preview & Execute',
    description: 'Review and run your prompt',
  },
]

export function PromptBuilder() {
  const { state, setStep } = usePromptBuilder()

  const currentStepIndex = STEPS.findIndex((step) => step.id === state.currentStep)

  const canProceed = (): boolean => {
    switch (state.currentStep) {
      case 'base':
        return !!(
          state.baseConfig.basePrompt.trim() &&
          state.baseConfig.framework &&
          state.baseConfig.basePrompt.length <= 50000
        )
      case 'framework':
        return true // Framework config is optional
      case 'enhancement':
        return true // VS enhancement is optional
      case 'advanced':
        return true // Advanced enhancements are optional
      case 'preview':
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (canProceed() && currentStepIndex < STEPS.length - 1) {
      setStep(STEPS[currentStepIndex + 1].id)
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setStep(STEPS[currentStepIndex - 1].id)
    }
  }

  const renderStep = () => {
    switch (state.currentStep) {
      case 'base':
        return <BasePromptStep />
      case 'framework':
        return <FrameworkConfigStep />
      case 'enhancement':
        return <VSEnhancementStep />
      case 'advanced':
        return <AdvancedEnhancementsStep />
      case 'preview':
        return <PreviewExecuteStep />
      default:
        return <BasePromptStep />
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Progress Indicator */}
      <nav aria-label="Progress" className="mb-8">
        <ol className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isActive = step.id === state.currentStep
            const isCompleted = index < currentStepIndex
            const isAccessible = index <= currentStepIndex

            return (
              <li key={step.id} className="relative flex-1">
                {/* Connector Line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={`absolute left-1/2 top-5 h-0.5 w-full ${
                      isCompleted ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    aria-hidden="true"
                  />
                )}

                {/* Step Button */}
                <button
                  onClick={() => isAccessible && setStep(step.id)}
                  disabled={!isAccessible}
                  className={`group relative flex flex-col items-center ${
                    isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                >
                  {/* Step Circle */}
                  <div
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      isActive
                        ? 'border-indigo-600 bg-white dark:border-indigo-400 dark:bg-gray-900'
                        : isCompleted
                          ? 'border-indigo-600 bg-indigo-600 dark:border-indigo-400 dark:bg-indigo-400'
                          : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="h-6 w-6 text-white dark:text-gray-900"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span
                        className={`text-sm font-semibold ${
                          isActive
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-3 text-center">
                    <span
                      className={`block text-sm font-medium ${
                        isActive
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : isCompleted
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">
                      {step.description}
                    </span>
                  </div>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow dark:border-gray-700 dark:bg-gray-900">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700"
        >
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Previous
        </button>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Step {currentStepIndex + 1} of {STEPS.length}
        </div>

        {currentStepIndex < STEPS.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        ) : (
          <div className="w-24" />
        )}
      </div>

      {/* Error Display */}
      {Object.keys(state.errors).length > 0 && (
        <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                Please fix the following errors:
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700 dark:text-red-400">
                {Object.entries(state.errors).map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
