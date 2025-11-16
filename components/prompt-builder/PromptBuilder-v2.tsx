/**
 * Professional Prompt Builder Component
 * Enterprise-grade tabbed interface with progress indicators
 */

'use client'

import { usePromptBuilder } from '@/contexts/PromptBuilderContext'
import { BuilderStep } from '@/lib/types/prompt-builder'
import { BasePromptStep } from './steps/BasePromptStep'
import { FrameworkConfigStep } from './steps/FrameworkConfigStep-v2'
import { VSEnhancementStep } from './steps/VSEnhancementStep'
import { AdvancedEnhancementsStep } from './steps/AdvancedEnhancementsStep'
import { PreviewExecuteStep } from './steps/PreviewExecuteStep'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card-v2'

const STEPS: { id: BuilderStep; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    id: 'base',
    label: 'Base Prompt',
    description: 'Define your prompt foundation',
    icon: Sparkles,
  },
  {
    id: 'framework',
    label: 'Framework',
    description: 'Configure framework options',
    icon: Sparkles,
  },
  {
    id: 'enhancement',
    label: 'VS Enhancement',
    description: 'Add Verbalized Sampling',
    icon: Sparkles,
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Fine-tune enhancements',
    icon: Sparkles,
  },
  {
    id: 'preview',
    label: 'Preview & Execute',
    description: 'Review and run your prompt',
    icon: Sparkles,
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
        return !!state.generatedPrompt
      default:
        return false
    }
  }

  const canGoBack = (): boolean => {
    return currentStepIndex > 0
  }

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1 && canProceed()) {
      setStep(STEPS[currentStepIndex + 1].id)
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setStep(STEPS[currentStepIndex - 1].id)
    }
  }

  const renderStepContent = () => {
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
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStepIndex
            const isCompleted = index < currentStepIndex
            const isUpcoming = index > currentStepIndex

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  {/* Step Circle */}
                  <button
                    onClick={() => setStep(step.id)}
                    className={cn(
                      'relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                      isActive
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                        : isCompleted
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                          : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800'
                    )}
                    aria-label={`Go to ${step.label} step`}
                  >
                    {isCompleted ? (
                      <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Icon
                        className={cn(
                          'h-6 w-6',
                          isActive
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-400 dark:text-slate-500'
                        )}
                      />
                    )}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-blue-600"
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.2 }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                      />
                    )}
                  </button>

                  {/* Step Label */}
                  <div className="mt-3 text-center">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : isCompleted
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-500 dark:text-slate-400'
                      )}
                    >
                      {step.label}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < STEPS.length - 1 && (
                  <div className="mx-4 flex-1 h-0.5 relative -mt-6">
                    <div
                      className={cn(
                        'absolute inset-0 transition-all duration-300',
                        isCompleted
                          ? 'bg-emerald-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                      )}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Step Content */}
      <Card className="p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                {STEPS[currentStepIndex].label}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {STEPS[currentStepIndex].description}
              </p>
            </div>

            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-800">
              <button
                onClick={handlePrevious}
                disabled={!canGoBack()}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                  canGoBack()
                    ? 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    : 'cursor-not-allowed opacity-50'
                )}
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                Previous
              </button>

              <div className="text-sm text-slate-500 dark:text-slate-400">
                Step {currentStepIndex + 1} of {STEPS.length}
              </div>

              <button
                onClick={handleNext}
                disabled={!canProceed() || currentStepIndex === STEPS.length - 1}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                  canProceed() && currentStepIndex < STEPS.length - 1
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm hover:from-blue-700 hover:to-blue-600 hover:shadow-md'
                    : 'cursor-not-allowed opacity-50 bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                )}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  )
}

