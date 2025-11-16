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
import { X, Plus, Trash2 } from 'lucide-react'

export function FrameworkConfigStep() {
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
  const handleReasoningStructureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateBaseConfig({
      frameworkConfig: {
        ...config,
        reasoningStructure: e.target.value as ReasoningStructure,
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
      updateBaseConfig({
        frameworkConfig: {
          ...config,
          templateVariables: {
            ...(config.templateVariables || {}),
            [newVariable.key]: newVariable.value,
          },
        },
      })
      setNewVariable({ key: '', value: '' })
    }
  }

  const removeVariable = (key: string) => {
    const vars = { ...(config.templateVariables || {}) }
    delete vars[key]
    updateBaseConfig({
      frameworkConfig: { ...config, templateVariables: vars },
    })
  }

  // Constraint-Based handlers
  const [newConstraint, setNewConstraint] = useState('')

  const addConstraint = () => {
    if (newConstraint.trim()) {
      const constraints = config.constraintSpecs || []
      updateBaseConfig({
        frameworkConfig: {
          ...config,
          constraintSpecs: [...constraints, newConstraint],
        },
      })
      setNewConstraint('')
    }
  }

  const removeConstraint = (index: number) => {
    const constraints = config.constraintSpecs || []
    updateBaseConfig({
      frameworkConfig: {
        ...config,
        constraintSpecs: constraints.filter((_, i) => i !== index),
      },
    })
  }

  // Iterative/Multi-Turn handler
  const handleConversationContextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateBaseConfig({
      frameworkConfig: { ...config, conversationContext: e.target.value },
    })
  }

  // Comparative handlers
  const [newCriterion, setNewCriterion] = useState('')

  const addCriterion = () => {
    if (newCriterion.trim()) {
      const criteria = config.comparisonCriteria || []
      updateBaseConfig({
        frameworkConfig: {
          ...config,
          comparisonCriteria: [...criteria, newCriterion],
        },
      })
      setNewCriterion('')
    }
  }

  const removeCriterion = (index: number) => {
    const criteria = config.comparisonCriteria || []
    updateBaseConfig({
      frameworkConfig: {
        ...config,
        comparisonCriteria: criteria.filter((_, i) => i !== index),
      },
    })
  }

  // Transformation handlers
  const handleTargetFormatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBaseConfig({
      frameworkConfig: { ...config, targetFormat: e.target.value },
    })
  }

  const handleSourceFormatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBaseConfig({
      frameworkConfig: { ...config, sourceFormat: e.target.value },
    })
  }

  // Analytical handler
  const handleAnalysisDepthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateBaseConfig({
      frameworkConfig: {
        ...config,
        analysisDepth: e.target.value as 'surface' | 'moderate' | 'deep',
      },
    })
  }

  if (!framework) {
    return (
      <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
        <p className="text-sm text-yellow-700 dark:text-yellow-400">
          Please select a framework in Step 1 before configuring framework-specific options.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Framework Configuration
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Configure options specific to the <span className="font-semibold">{framework}</span>{' '}
          framework.
        </p>
      </div>

      {/* Role-Based */}
      {framework === FrameworkType.ROLE_BASED && (
        <div>
          <Input
            id="role"
            label="Role / Expertise"
            value={config.roleBasedRole || ''}
            onChange={handleRoleChange}
            placeholder="e.g., an expert software architect, a professional copywriter"
            helperText="Define the role or expertise the AI should assume"
          />
        </div>
      )}

      {/* Few-Shot */}
      {framework === FrameworkType.FEW_SHOT && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Example Inputs</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Provide example input/output pairs to guide the AI
            </p>
          </div>

          {/* Existing examples */}
          {config.fewShotExamples && config.fewShotExamples.length > 0 && (
            <div className="space-y-3">
              {config.fewShotExamples.map((example, index) => (
                <div
                  key={index}
                  className="rounded-md border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Input:</p>
                        <p className="text-sm text-gray-900 dark:text-white">{example.input}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Output:</p>
                        <p className="text-sm text-gray-900 dark:text-white">{example.output}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeExample(index)}
                      className="ml-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add new example */}
          <div className="space-y-3 rounded-md border border-dashed border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-900">
            <input
              type="text"
              value={newExample.input}
              onChange={(e) => setNewExample({ ...newExample, input: e.target.value })}
              placeholder="Example input..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
            />
            <textarea
              value={newExample.output}
              onChange={(e) => setNewExample({ ...newExample, output: e.target.value })}
              placeholder="Expected output..."
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
            />
            <button
              onClick={addExample}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Add Example
            </button>
          </div>
        </div>
      )}

      {/* Chain-of-Thought */}
      {framework === FrameworkType.CHAIN_OF_THOUGHT && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="reasoningStructure"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Reasoning Structure
            </label>
            <select
              id="reasoningStructure"
              value={config.reasoningStructure || ''}
              onChange={handleReasoningStructureChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
            >
              <option value="">Select structure...</option>
              <option value={ReasoningStructure.STEP_BY_STEP}>Step-by-step</option>
              <option value={ReasoningStructure.PROS_CONS}>Pros and Cons</option>
              <option value={ReasoningStructure.FIRST_PRINCIPLES}>First Principles</option>
              <option value={ReasoningStructure.CUSTOM}>Custom</option>
            </select>
          </div>

          {config.reasoningStructure === ReasoningStructure.CUSTOM && (
            <div>
              <label
                htmlFor="customReasoning"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Custom Reasoning Instructions
              </label>
              <textarea
                id="customReasoning"
                value={config.customReasoningStructure || ''}
                onChange={handleCustomReasoningChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
                placeholder="Describe your custom reasoning structure..."
              />
            </div>
          )}
        </div>
      )}

      {/* Template/Fill-in */}
      {framework === FrameworkType.TEMPLATE_FILL_IN && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Template Variables
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Define variables to be filled in your template
            </p>
          </div>

          {/* Existing variables */}
          {config.templateVariables && Object.keys(config.templateVariables).length > 0 && (
            <div className="space-y-2">
              {Object.entries(config.templateVariables).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800"
                >
                  <div>
                    <span className="font-mono text-sm text-indigo-600 dark:text-indigo-400">
                      {'{'}
                      {key}
                      {'}'}
                    </span>
                    <span className="mx-2 text-gray-500">=</span>
                    <span className="text-sm text-gray-900 dark:text-white">{value}</span>
                  </div>
                  <button
                    onClick={() => removeVariable(key)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <svg
                      className="h-5 w-5"
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
                </div>
              ))}
            </div>
          )}

          {/* Add new variable */}
          <div className="flex gap-3 rounded-md border border-dashed border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-900">
            <input
              type="text"
              value={newVariable.key}
              onChange={(e) => setNewVariable({ ...newVariable, key: e.target.value })}
              placeholder="Variable name (e.g., topic)"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
            />
            <input
              type="text"
              value={newVariable.value}
              onChange={(e) => setNewVariable({ ...newVariable, value: e.target.value })}
              placeholder="Value"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
            />
            <button
              onClick={addVariable}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Constraint-Based */}
      {framework === FrameworkType.CONSTRAINT_BASED && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Constraints</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Define constraints the response must satisfy
            </p>
          </div>

          {/* Existing constraints */}
          {config.constraintSpecs && config.constraintSpecs.length > 0 && (
            <ul className="space-y-2">
              {config.constraintSpecs.map((constraint, index) => (
                <li
                  key={index}
                  className="flex items-start justify-between rounded-md border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800"
                >
                  <span className="text-sm text-gray-900 dark:text-white">{constraint}</span>
                  <button
                    onClick={() => removeConstraint(index)}
                    className="ml-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <svg
                      className="h-5 w-5"
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
                </li>
              ))}
            </ul>
          )}

          {/* Add new constraint */}
          <div className="flex gap-3">
            <input
              type="text"
              value={newConstraint}
              onChange={(e) => setNewConstraint(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addConstraint()}
              placeholder="Add a constraint..."
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
            />
            <button
              onClick={addConstraint}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Iterative/Multi-Turn */}
      {framework === FrameworkType.ITERATIVE_MULTI_TURN && (
        <div>
          <label
            htmlFor="conversationContext"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Conversation Context
          </label>
          <textarea
            id="conversationContext"
            value={config.conversationContext || ''}
            onChange={handleConversationContextChange}
            rows={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
            placeholder="Provide context from previous conversation turns..."
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Include relevant context from earlier in the conversation
          </p>
        </div>
      )}

      {/* Comparative */}
      {framework === FrameworkType.COMPARATIVE && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Comparison Criteria
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Define criteria for comparison
            </p>
          </div>

          {/* Existing criteria */}
          {config.comparisonCriteria && config.comparisonCriteria.length > 0 && (
            <ul className="space-y-2">
              {config.comparisonCriteria.map((criterion, index) => (
                <li
                  key={index}
                  className="flex items-start justify-between rounded-md border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800"
                >
                  <span className="text-sm text-gray-900 dark:text-white">{criterion}</span>
                  <button
                    onClick={() => removeCriterion(index)}
                    className="ml-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <svg
                      className="h-5 w-5"
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
                </li>
              ))}
            </ul>
          )}

          {/* Add new criterion */}
          <div className="flex gap-3">
            <input
              type="text"
              value={newCriterion}
              onChange={(e) => setNewCriterion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCriterion()}
              placeholder="Add a comparison criterion..."
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
            />
            <button
              onClick={addCriterion}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Transformation */}
      {framework === FrameworkType.TRANSFORMATION && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="sourceFormat"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Source Format
            </label>
            <input
              type="text"
              id="sourceFormat"
              value={config.sourceFormat || ''}
              onChange={handleSourceFormatChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
              placeholder="e.g., JSON, CSV, plain text"
            />
          </div>

          <div>
            <label
              htmlFor="targetFormat"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Target Format
            </label>
            <input
              type="text"
              id="targetFormat"
              value={config.targetFormat || ''}
              onChange={handleTargetFormatChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
              placeholder="e.g., Markdown, HTML, XML"
            />
          </div>
        </div>
      )}

      {/* Analytical */}
      {framework === FrameworkType.ANALYTICAL && (
        <div>
          <label
            htmlFor="analysisDepth"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Analysis Depth
          </label>
          <select
            id="analysisDepth"
            value={config.analysisDepth || 'moderate'}
            onChange={handleAnalysisDepthChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          >
            <option value="surface">Surface (Quick overview)</option>
            <option value="moderate">Moderate (Balanced detail)</option>
            <option value="deep">Deep (Comprehensive analysis)</option>
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Choose how detailed the analysis should be
          </p>
        </div>
      )}

      {/* Generative - No specific config */}
      {framework === FrameworkType.GENERATIVE && (
        <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            The Generative framework doesn't require additional configuration. Your base prompt will
            be used to guide creative generation.
          </p>
        </div>
      )}
    </div>
  )
}
