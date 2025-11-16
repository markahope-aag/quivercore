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
import { Check, ChevronRight, FileText, Settings, Zap, Sliders, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card-v2'

const STEPS: { id: BuilderStep; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    id: 'base',
    label: 'Base Prompt',
    description: 'Define your prompt foundation',
    icon: FileText,
  },
  {
    id: 'framework',
    label: 'Framework',
    description: 'Configure framework options',
    icon: Settings,
  },
  {
    id: 'enhancement',
    label: 'VS Enhancement',
    description: 'Add Verbalized Sampling',
    icon: Zap,
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Fine-tune enhancements',
    icon: Sliders,
  },
  {
    id: 'preview',
    label: 'Preview & Execute',
    description: 'Review and run your prompt',
    icon: Eye,
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
    const navigationProps = {
      onNext: handleNext,
      onPrevious: handlePrevious,
      canProceed: canProceed(),
      canGoBack: canGoBack(),
      isLastStep: currentStepIndex === STEPS.length - 1,
    }

    switch (state.currentStep) {
      case 'base':
        return <BasePromptStep {...navigationProps} />
      case 'framework':
        return <FrameworkConfigStep {...navigationProps} />
      case 'enhancement':
        return <VSEnhancementStep {...navigationProps} />
      case 'advanced':
        return <AdvancedEnhancementsStep {...navigationProps} />
      case 'preview':
        return <PreviewExecuteStep />
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <Card className="border-slate-200 bg-white p-6 shadow-xl rounded-xl dark:border-slate-800 dark:bg-slate-900">
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
                      'relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200 shadow-md',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                      'hover:scale-105',
                      isActive
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 scale-105 ring-2 ring-blue-300'
                        : isCompleted
                          ? 'bg-green-500 text-white shadow-md'
                          : 'bg-white border-2 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
                    )}
                    aria-label={`Go to ${step.label} step`}
                  >
                    {isCompleted ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <Icon
                        className={cn(
                          'h-6 w-6',
                          isActive ? '' : ''
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
                  <div className="mx-6 flex-1 h-0.5 relative -mt-8">
                    <div
                      className={cn(
                        'absolute inset-0 rounded-full transition-all duration-300',
                        isCompleted
                          ? 'bg-green-500'
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
      <Card className="border border-slate-200 bg-white p-8 shadow-sm rounded-xl dark:border-slate-800 dark:bg-slate-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                {STEPS[currentStepIndex].label}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                {STEPS[currentStepIndex].description}
              </p>
            </div>

            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-300 bg-slate-50/50 -mx-8 -mb-8 px-8 py-6 dark:border-slate-700 dark:bg-slate-800/50">
              {canGoBack() ? (
                <button
                  onClick={handlePrevious}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold transition-all duration-200 shadow-sm',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                    'text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:shadow-md active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  )}
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  Previous
                </button>
              ) : (
                <div />
              )}

              <div className="text-sm text-slate-500 dark:text-slate-400">
                Step {currentStepIndex + 1} of {STEPS.length}
              </div>

              {currentStepIndex < STEPS.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                    canProceed()
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:from-blue-700 hover:to-blue-600 hover:shadow-lg active:scale-[0.98]'
                      : 'cursor-not-allowed opacity-50 bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                  )}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <div />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  )
}

