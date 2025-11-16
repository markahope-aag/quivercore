/**
 * Professional Framework Config Step
 * Enterprise-grade form with new design system components
 */

'use client'

import { useState } from 'react'
import { usePromptBuilder } from '@/contexts/PromptBuilderContext'
import { FrameworkType, ReasoningStructure } from '@/lib/types/prompt-builder'
import { Input } from '@/components/ui/input-v2'
import { Textarea } from '@/components/ui/textarea-v2'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-v2'
import { Button } from '@/components/ui/button-v2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { X, Plus, Trash2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StepHeader } from './StepHeader'

const REASONING_STRUCTURE_OPTIONS: { value: ReasoningStructure; label: string }[] = [
  { value: 'step-by-step', label: 'Step-by-Step' },
  { value: 'problem-solution', label: 'Problem-Solution' },
  { value: 'pros-cons', label: 'Pros and Cons' },
  { value: 'compare-contrast', label: 'Compare and Contrast' },
  { value: 'custom', label: 'Custom Structure' },
]

interface FrameworkConfigStepProps {
  onNext?: () => void
  onPrevious?: () => void
  canProceed?: boolean
  canGoBack?: boolean
  isLastStep?: boolean
}

export function FrameworkConfigStep({ onNext, canProceed = true }: FrameworkConfigStepProps) {
  const { state, updateBaseConfig } = usePromptBuilder()
  const framework = state.baseConfig.framework
  const config = state.baseConfig.frameworkConfig

  // Role-Based handlers
  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBaseConfig({
      frameworkConfig: { ...config, roleBasedRole: e.target.value },
    })
  }

  // Few-Shot handlers
  const [newExample, setNewExample] = useState({ input: '', output: '' })

  const addExample = () => {
    if (newExample.input.trim() && newExample.output.trim()) {
      const examples = config.fewShotExamples || []
      updateBaseConfig({
        frameworkConfig: {
          ...config,
          fewShotExamples: [...examples, { ...newExample }],
        },
      })
      setNewExample({ input: '', output: '' })
    }
  }

  const removeExample = (index: number) => {
    const examples = config.fewShotExamples || []
    updateBaseConfig({
      frameworkConfig: {
        ...config,
        fewShotExamples: examples.filter((_, i) => i !== index),
      },
    })
  }

  // Chain-of-Thought handlers
  const handleReasoningStructureChange = (value: string) => {
    updateBaseConfig({
      frameworkConfig: {
        ...config,
        reasoningStructure: value as ReasoningStructure,
      },
    })
  }

  const handleCustomReasoningChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateBaseConfig({
      frameworkConfig: { ...config, customReasoningStructure: e.target.value },
    })
  }

  // Template/Fill-in handlers
  const [newVariable, setNewVariable] = useState({ key: '', value: '' })

  const addVariable = () => {
    if (newVariable.key.trim() && newVariable.value.trim()) {
      const variables = config.templateVariables || {}
      updateBaseConfig({
        frameworkConfig: {
          ...config,
          templateVariables: { ...variables, [newVariable.key]: newVariable.value },
        },
      })
      setNewVariable({ key: '', value: '' })
    }
  }

  const removeVariable = (key: string) => {
    const variables = config.templateVariables || {}
    const { [key]: removed, ...rest } = variables
    updateBaseConfig({
      frameworkConfig: { ...config, templateVariables: rest },
    })
  }

  if (!framework) {
    return (
      <div className="space-y-6">
        <StepHeader
          title="Framework Configuration"
          description="Configure framework-specific options for your prompt."
          onNext={onNext}
          canProceed={canProceed}
        />
        <div className="rounded-lg border-2 border-slate-300 bg-white p-6 text-center shadow-sm dark:border-slate-600 dark:bg-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Please select a framework in the Base Prompt step first.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <StepHeader
        title="Framework Configuration"
        description="Configure framework-specific options for your prompt."
        onNext={onNext}
        canProceed={canProceed}
      />
      {/* Role-Based */}
      {framework === FrameworkType.ROLE_BASED && (
        <div className="space-y-3 rounded-lg border-2 border-slate-300 bg-white p-5 shadow-sm dark:border-slate-600 dark:bg-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Role / Expertise
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Define the role or expertise the AI should assume
            </p>
          </div>
          <Input
            id="role"
            label=""
            value={config.roleBasedRole || ''}
            onChange={handleRoleChange}
            placeholder="e.g., an expert software architect, a professional copywriter"
            className="bg-slate-50 border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>
      )}

      {/* Few-Shot */}
      {framework === FrameworkType.FEW_SHOT && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Examples
            </h3>
            {(config.fewShotExamples || []).length > 0 && (
              <div className="space-y-3 mb-4">
                {(config.fewShotExamples || []).map((example, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Example {index + 1}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExample(index)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          Input
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                          {example.input}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          Output
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                          {example.output}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Add New Example</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  label="Input"
                  value={newExample.input}
                  onChange={(e) => setNewExample({ ...newExample, input: e.target.value })}
                  placeholder="Enter example input..."
                  className="min-h-[80px]"
                />
                <Textarea
                  label="Output"
                  value={newExample.output}
                  onChange={(e) => setNewExample({ ...newExample, output: e.target.value })}
                  placeholder="Enter example output..."
                  className="min-h-[80px]"
                />
                <Button
                  onClick={addExample}
                  disabled={!newExample.input.trim() || !newExample.output.trim()}
                  leftIcon={<Plus className="h-4 w-4" />}
                  className="w-full"
                >
                  Add Example
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Chain-of-Thought */}
      {framework === FrameworkType.CHAIN_OF_THOUGHT && (
        <div className="space-y-4">
          <Select
            value={config.reasoningStructure || 'step-by-step'}
            onValueChange={handleReasoningStructureChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select reasoning structure" />
            </SelectTrigger>
            <SelectContent>
              {REASONING_STRUCTURE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {config.reasoningStructure === 'custom' && (
            <Textarea
              label="Custom Reasoning Structure"
              value={config.customReasoningStructure || ''}
              onChange={handleCustomReasoningChange}
              placeholder="Define your custom reasoning structure..."
              className="min-h-[150px]"
              helperText="Specify how the AI should structure its reasoning process"
            />
          )}
        </div>
      )}

      {/* Template/Fill-in */}
      {framework === FrameworkType.TEMPLATE_FILL_IN && (
        <div className="space-y-4">
          {Object.keys(config.templateVariables || {}).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Template Variables
              </h3>
              {Object.entries(config.templateVariables || {}).map(([key, value]) => (
                <Card key={key}>
                  <CardContent className="flex items-center justify-between py-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{key}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{value}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVariable(key)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Add Template Variable</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                label="Variable Name"
                value={newVariable.key}
                onChange={(e) => setNewVariable({ ...newVariable, key: e.target.value })}
                placeholder="e.g., {{topic}}"
              />
              <Input
                label="Default Value"
                value={newVariable.value}
                onChange={(e) => setNewVariable({ ...newVariable, value: e.target.value })}
                placeholder="Enter default value..."
              />
              <Button
                onClick={addVariable}
                disabled={!newVariable.key.trim() || !newVariable.value.trim()}
                leftIcon={<Plus className="h-4 w-4" />}
                className="w-full"
              >
                Add Variable
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Other frameworks can be added similarly */}
      {![
        FrameworkType.ROLE_BASED,
        FrameworkType.FEW_SHOT,
        FrameworkType.CHAIN_OF_THOUGHT,
        FrameworkType.TEMPLATE_FILL_IN,
      ].includes(framework) && (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No additional configuration needed for this framework.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

