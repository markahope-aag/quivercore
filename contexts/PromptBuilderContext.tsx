'use client'

import React, { createContext, useContext, useReducer, useCallback } from 'react'
import type {
  PromptBuilderState,
  PromptBuilderAction,
  BuilderStep,
  BasePromptConfig,
  VSEnhancement,
  GeneratedPrompt,
  ExecutionResult,
  PromptTemplate,
  PromptConfiguration,
} from '@/lib/types/prompt-builder'
import { DomainCategory, FrameworkType } from '@/lib/types/prompt-builder'
import type {
  AdvancedEnhancements,
  RoleEnhancement,
  FormatControl,
  SmartConstraints,
  ReasoningScaffolds,
  ConversationFlow,
} from '@/src/types/index'
import { DEFAULT_BASE_CONFIG, DEFAULT_VS_ENHANCEMENT } from '@/lib/constants/prompt-builder'
import { generateEnhancedPrompt } from '@/lib/utils/prompt-generation'

const initialState: PromptBuilderState = {
  currentStep: 'base',
  baseConfig: DEFAULT_BASE_CONFIG,
  vsEnhancement: DEFAULT_VS_ENHANCEMENT,
  advancedEnhancements: {
    roleEnhancement: {
      enabled: false,
      expertiseLevel: 'expert',
      authorityLevel: 'advisory',
      domainSpecialty: '',
    },
    formatControl: {
      enabled: false,
      structure: 'paragraphs',
      styleGuide: 'conversational',
      lengthSpec: { type: 'word-count' },
    },
    smartConstraints: {
      enabled: false,
      positiveConstraints: [],
      negativeConstraints: [],
      boundaryConditions: [],
      qualityGates: [],
    },
    reasoningScaffolds: {
      enabled: false,
      showWork: false,
      stepByStep: false,
      exploreAlternatives: false,
      confidenceScoring: false,
      reasoningStyle: 'logical',
    },
    conversationFlow: {
      enabled: false,
      contextPreservation: true,
      followUpTemplates: [],
      clarificationProtocols: true,
      iterationImprovement: true,
    },
  },
  generatedPrompt: null,
  executionResults: [],
  savedTemplates: [],
  isExecuting: false,
  errors: {},
  validationResults: {
    issues: [],
    suggestions: [],
  },
}

function promptBuilderReducer(
  state: PromptBuilderState,
  action: PromptBuilderAction
): PromptBuilderState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload }

    case 'UPDATE_BASE_CONFIG':
      return {
        ...state,
        baseConfig: { ...state.baseConfig, ...action.payload },
      }

    case 'UPDATE_VS_ENHANCEMENT':
      return {
        ...state,
        vsEnhancement: { ...state.vsEnhancement, ...action.payload },
      }

    case 'UPDATE_ADVANCED_ENHANCEMENTS':
      return {
        ...state,
        advancedEnhancements: {
          ...state.advancedEnhancements,
          ...action.payload,
        } as AdvancedEnhancements,
      }

    case 'UPDATE_ROLE_ENHANCEMENT':
      return {
        ...state,
        advancedEnhancements: {
          ...state.advancedEnhancements,
          roleEnhancement: {
            ...(state.advancedEnhancements.roleEnhancement || {
              enabled: false,
              expertiseLevel: 'expert',
              authorityLevel: 'advisory',
              domainSpecialty: '',
            }),
            ...action.payload,
          } as RoleEnhancement,
        },
      }

    case 'UPDATE_FORMAT_CONTROL':
      return {
        ...state,
        advancedEnhancements: {
          ...state.advancedEnhancements,
          formatControl: {
            ...(state.advancedEnhancements.formatControl || {
              enabled: false,
              structure: 'paragraphs',
              styleGuide: 'conversational',
              lengthSpec: { type: 'word-count' },
            }),
            ...action.payload,
          } as FormatControl,
        },
      }

    case 'UPDATE_SMART_CONSTRAINTS':
      return {
        ...state,
        advancedEnhancements: {
          ...state.advancedEnhancements,
          smartConstraints: {
            ...(state.advancedEnhancements.smartConstraints || {
              enabled: false,
              positiveConstraints: [],
              negativeConstraints: [],
              boundaryConditions: [],
              qualityGates: [],
            }),
            ...action.payload,
          } as SmartConstraints,
        },
      }

    case 'UPDATE_REASONING_SCAFFOLDS':
      return {
        ...state,
        advancedEnhancements: {
          ...state.advancedEnhancements,
          reasoningScaffolds: {
            ...(state.advancedEnhancements.reasoningScaffolds || {
              enabled: false,
              showWork: false,
              stepByStep: false,
              exploreAlternatives: false,
              confidenceScoring: false,
              reasoningStyle: 'logical',
            }),
            ...action.payload,
          } as ReasoningScaffolds,
        },
      }

    case 'UPDATE_CONVERSATION_FLOW':
      return {
        ...state,
        advancedEnhancements: {
          ...state.advancedEnhancements,
          conversationFlow: {
            ...(state.advancedEnhancements.conversationFlow || {
              enabled: false,
              contextPreservation: true,
              followUpTemplates: [],
              clarificationProtocols: true,
              iterationImprovement: true,
            }),
            ...action.payload,
          } as ConversationFlow,
        },
      }

    case 'VALIDATE_ENHANCEMENTS':
      return {
        ...state,
        validationResults: action.payload,
      }

    case 'GENERATE_PROMPT':
      return {
        ...state,
        generatedPrompt: action.payload,
      }

    case 'ADD_EXECUTION_RESULT':
      return {
        ...state,
        executionResults: [action.payload, ...state.executionResults],
        isExecuting: false,
      }

    case 'SET_EXECUTING':
      return {
        ...state,
        isExecuting: action.payload,
      }

    case 'SAVE_TEMPLATE':
      return {
        ...state,
        savedTemplates: [action.payload, ...state.savedTemplates],
      }

    case 'LOAD_TEMPLATE':
      return {
        ...state,
        baseConfig: action.payload.config,
        vsEnhancement: action.payload.vsEnhancement,
        advancedEnhancements: action.payload.advancedEnhancements || state.advancedEnhancements,
        currentStep: 'base',
      }

    case 'DELETE_TEMPLATE':
      return {
        ...state,
        savedTemplates: state.savedTemplates.filter((t) => t.id !== action.payload),
      }

    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload.field]: action.payload.message },
      }

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {},
      }

    case 'RESET_BUILDER':
      return {
        ...initialState,
        validationResults: { issues: [], suggestions: [] },
      }

    default:
      return state
  }
}

interface PromptBuilderContextType {
  state: PromptBuilderState
  dispatch: React.Dispatch<PromptBuilderAction>
  // Helper actions
  setStep: (step: BuilderStep) => void
  updateBaseConfig: (config: Partial<BasePromptConfig>) => void
  updateVSEnhancement: (enhancement: Partial<VSEnhancement>) => void
  updateAdvancedEnhancements: (enhancements: Partial<AdvancedEnhancements>) => void
  updateRoleEnhancement: (enhancement: Partial<RoleEnhancement>) => void
  updateFormatControl: (control: Partial<FormatControl>) => void
  updateSmartConstraints: (constraints: Partial<SmartConstraints>) => void
  updateReasoningScaffolds: (scaffolds: Partial<ReasoningScaffolds>) => void
  updateConversationFlow: (flow: Partial<ConversationFlow>) => void
  validateEnhancements: () => Promise<void>
  generatePrompt: () => void
  executePrompt: (apiKey: string) => Promise<void>
  saveTemplate: (name: string, description: string, tags: string[]) => void
  loadTemplate: (template: PromptTemplate) => void
  deleteTemplate: (id: string) => void
  resetBuilder: () => void
  setError: (field: string, message: string) => void
  clearErrors: () => void
}

const PromptBuilderContext = createContext<PromptBuilderContextType | undefined>(undefined)

export function PromptBuilderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(promptBuilderReducer, initialState)

  const setStep = useCallback((step: BuilderStep) => {
    dispatch({ type: 'SET_STEP', payload: step })
  }, [])

  const updateBaseConfig = useCallback((config: Partial<BasePromptConfig>) => {
    dispatch({ type: 'UPDATE_BASE_CONFIG', payload: config })
  }, [])

  const updateVSEnhancement = useCallback((enhancement: Partial<VSEnhancement>) => {
    dispatch({ type: 'UPDATE_VS_ENHANCEMENT', payload: enhancement })
  }, [])

  const updateAdvancedEnhancements = useCallback((enhancements: Partial<AdvancedEnhancements>) => {
    dispatch({ type: 'UPDATE_ADVANCED_ENHANCEMENTS', payload: enhancements })
  }, [])

  const updateRoleEnhancement = useCallback((enhancement: Partial<RoleEnhancement>) => {
    dispatch({ type: 'UPDATE_ROLE_ENHANCEMENT', payload: enhancement })
  }, [])

  const updateFormatControl = useCallback((control: Partial<FormatControl>) => {
    dispatch({ type: 'UPDATE_FORMAT_CONTROL', payload: control })
  }, [])

  const updateSmartConstraints = useCallback((constraints: Partial<SmartConstraints>) => {
    dispatch({ type: 'UPDATE_SMART_CONSTRAINTS', payload: constraints })
  }, [])

  const updateReasoningScaffolds = useCallback((scaffolds: Partial<ReasoningScaffolds>) => {
    dispatch({ type: 'UPDATE_REASONING_SCAFFOLDS', payload: scaffolds })
  }, [])

  const updateConversationFlow = useCallback((flow: Partial<ConversationFlow>) => {
    dispatch({ type: 'UPDATE_CONVERSATION_FLOW', payload: flow })
  }, [])

  const validateEnhancements = useCallback(async () => {
    // Convert state to PromptConfiguration for validation
    const config: PromptConfiguration = {
      domain: state.baseConfig.domain as DomainCategory,
      framework: state.baseConfig.framework as FrameworkType,
      frameworkConfig: state.baseConfig.frameworkConfig,
      basePrompt: state.baseConfig.basePrompt,
      targetOutcome: state.baseConfig.targetOutcome,
      vsEnabled: state.vsEnhancement.enabled,
      vsConfig: state.vsEnhancement.enabled
        ? {
            type: state.vsEnhancement.distributionType,
            responseCount: state.vsEnhancement.numberOfResponses,
            includeReasoning: state.vsEnhancement.includeProbabilityReasoning,
            customConstraints: state.vsEnhancement.customConstraints || undefined,
            rarityThreshold: state.vsEnhancement.probabilityThreshold,
            categories: [
              ...(state.vsEnhancement.dimensions || []),
              ...(state.vsEnhancement.customDimensions || []),
            ],
            antiTypicalityMode: state.vsEnhancement.antiTypicalityEnabled,
          }
        : undefined,
      advancedEnhancements: state.advancedEnhancements,
    }

    const { PromptOptimizers } = await import('@/src/utils/promptOptimizers')
    const validationResult = PromptOptimizers.validateEnhancementCombination(config)
    dispatch({ type: 'VALIDATE_ENHANCEMENTS', payload: validationResult })
  }, [state])

  const generatePrompt = useCallback(() => {
    const generated = generateEnhancedPrompt(
      state.baseConfig,
      state.vsEnhancement,
      state.advancedEnhancements
    )
    dispatch({ type: 'GENERATE_PROMPT', payload: generated })
  }, [state.baseConfig, state.vsEnhancement, state.advancedEnhancements])

  const executePrompt = useCallback(
    async (apiKey: string) => {
      if (!state.generatedPrompt) return

      dispatch({ type: 'SET_EXECUTING', payload: true })
      dispatch({ type: 'CLEAR_ERRORS' })

      try {
        const { executePrompt: execute } = await import('@/lib/utils/api-client')

        const data = await execute(
          state.generatedPrompt.finalPrompt,
          state.generatedPrompt.systemPrompt,
          { apiKey }
        )

        const result: ExecutionResult = {
          id: crypto.randomUUID(),
          prompt: state.generatedPrompt,
          response: data.response,
          model: data.model,
          timestamp: new Date().toISOString(),
          tokensUsed: data.tokensUsed,
        }

        dispatch({ type: 'ADD_EXECUTION_RESULT', payload: result })
      } catch (error: any) {
        console.error('Execution error:', error)
        dispatch({ type: 'SET_EXECUTING', payload: false })
        dispatch({
          type: 'SET_ERROR',
          payload: { field: 'execution', message: error.message || 'Failed to execute prompt' },
        })
      }
    },
    [state.generatedPrompt]
  )

  const saveTemplate = useCallback(
    (name: string, description: string, tags: string[]) => {
      const template: PromptTemplate = {
        id: crypto.randomUUID(),
        name,
        description,
        config: state.baseConfig,
        vsEnhancement: state.vsEnhancement,
        advancedEnhancements: state.advancedEnhancements,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags,
      }

      dispatch({ type: 'SAVE_TEMPLATE', payload: template })

      // Save to localStorage
      const saved = localStorage.getItem('promptTemplates')
      const templates = saved ? JSON.parse(saved) : []
      localStorage.setItem('promptTemplates', JSON.stringify([template, ...templates]))
    },
    [state.baseConfig, state.vsEnhancement, state.advancedEnhancements]
  )

  const loadTemplate = useCallback((template: PromptTemplate) => {
    dispatch({ type: 'LOAD_TEMPLATE', payload: template })
  }, [])

  const deleteTemplate = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TEMPLATE', payload: id })

    // Remove from localStorage
    const saved = localStorage.getItem('promptTemplates')
    if (saved) {
      const templates = JSON.parse(saved)
      localStorage.setItem(
        'promptTemplates',
        JSON.stringify(templates.filter((t: PromptTemplate) => t.id !== id))
      )
    }
  }, [])

  const resetBuilder = useCallback(() => {
    dispatch({ type: 'RESET_BUILDER' })
  }, [])

  const setError = useCallback((field: string, message: string) => {
    dispatch({ type: 'SET_ERROR', payload: { field, message } })
  }, [])

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' })
  }, [])

  const value = {
    state,
    dispatch,
    setStep,
    updateBaseConfig,
    updateVSEnhancement,
    updateAdvancedEnhancements,
    updateRoleEnhancement,
    updateFormatControl,
    updateSmartConstraints,
    updateReasoningScaffolds,
    updateConversationFlow,
    validateEnhancements,
    generatePrompt,
    executePrompt,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    resetBuilder,
    setError,
    clearErrors,
  }

  return <PromptBuilderContext.Provider value={value}>{children}</PromptBuilderContext.Provider>
}

export function usePromptBuilder() {
  const context = useContext(PromptBuilderContext)
  if (!context) {
    throw new Error('usePromptBuilder must be used within PromptBuilderProvider')
  }
  return context
}
