// Types for AI Prompt Builder

import type { AdvancedEnhancements } from '@/lib/utils/enhancementGenerators'
import type { AdvancedEnhancements as NewAdvancedEnhancements } from '@/src/types/index'

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export enum DomainCategory {
  WRITING_CONTENT = 'Writing & Content',
  BUSINESS_STRATEGY = 'Business & Strategy',
  CODE_DEVELOPMENT = 'Code & Development',
  DATA_ANALYSIS = 'Data & Analysis',
  RESEARCH_LEARNING = 'Research & Learning',
  MARKETING_SALES = 'Marketing & Sales',
  CREATIVE_DESIGN = 'Creative & Design',
  COMMUNICATION = 'Communication',
  PRODUCTIVITY_PLANNING = 'Productivity & Planning',
  EDUCATION_TRAINING = 'Education & Training',
  TECHNICAL_WRITING = 'Technical Writing',
  LEGAL_COMPLIANCE = 'Legal & Compliance',
  HR_RECRUITING = 'HR & Recruiting',
  FINANCE_ACCOUNTING = 'Finance & Accounting',
  CUSTOMER_SUPPORT = 'Customer Support',
  SEO_SEARCH = 'SEO & Search',
  SOCIAL_MEDIA = 'Social Media',
  TEMPLATES = 'Templates',
  FRAMEWORKS = 'Frameworks',
  MULTI_STEP_WORKFLOWS = 'Multi-step Workflows',
  OTHER = 'Other',
}

export enum FrameworkType {
  ROLE_BASED = 'Role-Based',
  FEW_SHOT = 'Few-Shot',
  CHAIN_OF_THOUGHT = 'Chain-of-Thought',
  TEMPLATE_FILL_IN = 'Template/Fill-in',
  CONSTRAINT_BASED = 'Constraint-Based',
  ITERATIVE_MULTI_TURN = 'Iterative/Multi-Turn',
  COMPARATIVE = 'Comparative',
  GENERATIVE = 'Generative',
  ANALYTICAL = 'Analytical',
  TRANSFORMATION = 'Transformation',
}

export enum VSDistributionType {
  BROAD_SPECTRUM = 'broad_spectrum',
  RARITY_HUNT = 'rarity_hunt',
  BALANCED_CATEGORIES = 'balanced_categories',
}

export enum ReasoningStructure {
  STEP_BY_STEP = 'step-by-step',
  PROS_CONS = 'pros-cons',
  FIRST_PRINCIPLES = 'first-principles',
  CUSTOM = 'custom',
}

export type ResponseCount = 3 | 5 | 7 | number
export type RarityThreshold = 0.15 | 0.1 | 0.05
export type ProbabilityScore = number // 0.0 to 1.0

// ============================================================================
// CONFIGURATION INTERFACES
// ============================================================================

export interface VSConfiguration {
  type: VSDistributionType
  responseCount: ResponseCount
  includeReasoning: boolean
  customConstraints?: string
  rarityThreshold?: RarityThreshold
  categories?: string[]
  antiTypicalityMode: boolean
}

export interface FrameworkConfig {
  // Role-Based
  roleBasedRole?: string

  // Few-Shot
  fewShotExamples?: Array<{
    input: string
    output: string
  }>

  // Chain-of-Thought
  reasoningStructure?: ReasoningStructure
  customReasoningStructure?: string

  // Template/Fill-in
  templateVariables?: Record<string, string>

  // Constraint-Based
  constraintSpecs?: string[]

  // Iterative/Multi-Turn
  conversationContext?: string

  // Comparative
  comparisonCriteria?: string[]

  // Transformation
  targetFormat?: string
  sourceFormat?: string

  // Analytical
  analysisDepth?: 'surface' | 'moderate' | 'deep'
}

export interface PromptConfiguration {
  id?: string
  name?: string
  domain: DomainCategory
  framework: FrameworkType
  frameworkConfig: FrameworkConfig
  basePrompt: string
  targetOutcome?: string
  vsEnabled: boolean
  vsConfig?: VSConfiguration
  advancedEnhancements?: NewAdvancedEnhancements
  createdAt?: Date
  updatedAt?: Date
}

// ============================================================================
// LEGACY TYPES (for backward compatibility)
// ============================================================================

export type PromptDomain = DomainCategory
export type PromptFramework = FrameworkType

export interface VSEnhancement {
  enabled: boolean
  numberOfResponses: ResponseCount
  distributionType: VSDistributionType
  probabilityThreshold?: RarityThreshold
  dimensions?: string[]
  customDimensions?: string[]
  includeProbabilityReasoning: boolean
  customConstraints: string
  antiTypicalityEnabled: boolean
}

export interface BasePromptConfig {
  domain: DomainCategory | ''
  framework: FrameworkType | ''
  basePrompt: string
  targetOutcome: string
  frameworkConfig: FrameworkConfig
}

// ============================================================================
// CONVERSION UTILITIES
// ============================================================================

export function toPromptConfiguration(
  baseConfig: BasePromptConfig,
  vsEnhancement: VSEnhancement,
  metadata?: { id?: string; name?: string }
): PromptConfiguration {
  const vsConfig: VSConfiguration | undefined = vsEnhancement.enabled
    ? {
        type: vsEnhancement.distributionType,
        responseCount: vsEnhancement.numberOfResponses,
        includeReasoning: vsEnhancement.includeProbabilityReasoning,
        customConstraints: vsEnhancement.customConstraints || undefined,
        rarityThreshold: vsEnhancement.probabilityThreshold,
        categories: [
          ...(vsEnhancement.dimensions || []),
          ...(vsEnhancement.customDimensions || []),
        ],
        antiTypicalityMode: vsEnhancement.antiTypicalityEnabled,
      }
    : undefined

  return {
    id: metadata?.id,
    name: metadata?.name,
    domain: baseConfig.domain as DomainCategory,
    framework: baseConfig.framework as FrameworkType,
    frameworkConfig: baseConfig.frameworkConfig,
    basePrompt: baseConfig.basePrompt,
    targetOutcome: baseConfig.targetOutcome || undefined,
    vsEnabled: vsEnhancement.enabled,
    vsConfig,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export function fromPromptConfiguration(config: PromptConfiguration): {
  baseConfig: BasePromptConfig
  vsEnhancement: VSEnhancement
} {
  const baseConfig: BasePromptConfig = {
    domain: config.domain,
    framework: config.framework,
    basePrompt: config.basePrompt,
    targetOutcome: config.targetOutcome || '',
    frameworkConfig: config.frameworkConfig,
  }

  const vsEnhancement: VSEnhancement = {
    enabled: config.vsEnabled,
    numberOfResponses: config.vsConfig?.responseCount || 5,
    distributionType: config.vsConfig?.type || VSDistributionType.BROAD_SPECTRUM,
    probabilityThreshold: config.vsConfig?.rarityThreshold,
    dimensions: config.vsConfig?.categories || [],
    customDimensions: [],
    includeProbabilityReasoning: config.vsConfig?.includeReasoning || false,
    customConstraints: config.vsConfig?.customConstraints || '',
    antiTypicalityEnabled: config.vsConfig?.antiTypicalityMode || false,
  }

  return { baseConfig, vsEnhancement }
}

export interface PromptTemplate {
  id: string
  name: string
  description: string
  config: BasePromptConfig
  vsEnhancement: VSEnhancement
  advancedEnhancements?: AdvancedEnhancements // Optional for backward compatibility
  createdAt: string
  updatedAt: string
  tags: string[]
}

export interface GeneratedPrompt {
  finalPrompt: string
  systemPrompt: string
  metadata: {
    domain: string
    framework: string
    vsEnabled: boolean
    timestamp: string
  }
}

export interface ExecutionResult {
  id: string
  prompt: GeneratedPrompt
  response: string
  model: string
  timestamp: string
  tokensUsed?: {
    input: number
    output: number
    total: number
  }
}

export type BuilderStep = 'base' | 'framework' | 'enhancement' | 'advanced' | 'preview'

export interface PromptBuilderState {
  currentStep: BuilderStep
  baseConfig: BasePromptConfig
  vsEnhancement: VSEnhancement
  advancedEnhancements: AdvancedEnhancements
  generatedPrompt: GeneratedPrompt | null
  executionResults: ExecutionResult[]
  savedTemplates: PromptTemplate[]
  isExecuting: boolean
  errors: Record<string, string>
}

export type PromptBuilderAction =
  | { type: 'SET_STEP'; payload: BuilderStep }
  | { type: 'UPDATE_BASE_CONFIG'; payload: Partial<BasePromptConfig> }
  | { type: 'UPDATE_VS_ENHANCEMENT'; payload: Partial<VSEnhancement> }
  | { type: 'UPDATE_ADVANCED_ENHANCEMENTS'; payload: Partial<AdvancedEnhancements> }
  | { type: 'GENERATE_PROMPT'; payload: GeneratedPrompt }
  | { type: 'ADD_EXECUTION_RESULT'; payload: ExecutionResult }
  | { type: 'SET_EXECUTING'; payload: boolean }
  | { type: 'SAVE_TEMPLATE'; payload: PromptTemplate }
  | { type: 'LOAD_TEMPLATE'; payload: PromptTemplate }
  | { type: 'DELETE_TEMPLATE'; payload: string }
  | { type: 'SET_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'RESET_BUILDER' }
