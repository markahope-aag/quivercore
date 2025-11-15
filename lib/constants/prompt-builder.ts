// Constants for AI Prompt Builder

import { DomainCategory, FrameworkType, VSDistributionType } from '@/lib/types/prompt-builder'

// Core Categories
export const CORE_DOMAINS = [
  DomainCategory.WRITING_CONTENT,
  DomainCategory.BUSINESS_STRATEGY,
  DomainCategory.CODE_DEVELOPMENT,
  DomainCategory.DATA_ANALYSIS,
  DomainCategory.RESEARCH_LEARNING,
  DomainCategory.MARKETING_SALES,
  DomainCategory.CREATIVE_DESIGN,
  DomainCategory.COMMUNICATION,
]

export const PROMPT_DOMAINS = [
  DomainCategory.WRITING_CONTENT,
  DomainCategory.BUSINESS_STRATEGY,
  DomainCategory.CODE_DEVELOPMENT,
  DomainCategory.DATA_ANALYSIS,
  DomainCategory.RESEARCH_LEARNING,
  DomainCategory.MARKETING_SALES,
  DomainCategory.CREATIVE_DESIGN,
  DomainCategory.COMMUNICATION,
  DomainCategory.OTHER,
]

export const PROMPT_FRAMEWORKS = [
  FrameworkType.ROLE_BASED,
  FrameworkType.FEW_SHOT,
  FrameworkType.CHAIN_OF_THOUGHT,
  FrameworkType.TEMPLATE_FILL_IN,
  FrameworkType.CONSTRAINT_BASED,
  FrameworkType.ITERATIVE_MULTI_TURN,
  FrameworkType.COMPARATIVE,
  FrameworkType.GENERATIVE,
  FrameworkType.ANALYTICAL,
  FrameworkType.TRANSFORMATION,
]

export const FRAMEWORK_DESCRIPTIONS: Record<string, string> = {
  'Role-Based': 'Assign a specific role or persona to the AI (e.g., "You are an expert copywriter...")',
  'Few-Shot': 'Provide examples of input-output pairs to guide the AI',
  'Chain-of-Thought': 'Ask the AI to show its reasoning step-by-step',
  'Template/Fill-in': 'Create a structured template with placeholders',
  'Constraint-Based': 'Define specific rules, limits, or requirements',
  'Iterative/Multi-Turn': 'Build upon previous responses in a conversation',
  'Comparative': 'Ask the AI to compare and contrast multiple options',
  'Generative': 'Request creative generation from scratch',
  'Analytical': 'Break down and examine existing content',
  'Transformation': 'Convert content from one format/style to another',
}

export const BUILDER_STEPS = [
  { id: 'base', label: 'Base Prompt', description: 'Define your core prompt' },
  { id: 'framework', label: 'Framework', description: 'Configure framework settings' },
  { id: 'enhancement', label: 'VS Enhancement', description: 'Add verbalized sampling' },
  { id: 'advanced', label: 'Advanced', description: 'Fine-tune with advanced enhancements' },
  { id: 'preview', label: 'Preview & Execute', description: 'Review and run your prompt' },
] as const

export const VS_DISTRIBUTION_TYPES = [
  {
    value: 'broad_spectrum' as const,
    label: 'Broad Spectrum',
    description: 'Full range from common to rare ideas',
  },
  {
    value: 'rarity_hunt' as const,
    label: 'Rarity Hunt',
    description: 'Only unconventional, low-probability options',
  },
  {
    value: 'balanced_categories' as const,
    label: 'Balanced Categories',
    description: 'Equal coverage across specific dimensions',
  },
]

export const PROBABILITY_THRESHOLDS = [
  { value: 0.15, label: '0.15 (Somewhat rare)' },
  { value: 0.10, label: '0.10 (Quite rare)' },
  { value: 0.05, label: '0.05 (Very rare)' },
]

export const RESPONSE_COUNT_OPTIONS = [
  { value: 3, label: '3 responses' },
  { value: 5, label: '5 responses' },
  { value: 7, label: '7 responses' },
]

export const BALANCED_DIMENSIONS = [
  'Technical vs Creative',
  'Formal vs Casual',
  'Brief vs Detailed',
  'Conservative vs Innovative',
  'Practical vs Theoretical',
  'Structured vs Flexible',
]

export const DEFAULT_VS_ENHANCEMENT = {
  enabled: false,
  numberOfResponses: 5 as const,
  distributionType: VSDistributionType.BROAD_SPECTRUM,
  includeProbabilityReasoning: false,
  customConstraints: '',
  antiTypicalityEnabled: false,
}

export const DEFAULT_BASE_CONFIG = {
  domain: '' as const,
  framework: '' as const,
  basePrompt: '',
  targetOutcome: '',
  frameworkConfig: {},
}

// Alias exports for UI components (formatted for dropdowns)
export const DOMAIN_CATEGORIES = [
  { value: 'Writing & Content', label: 'Writing & Content' },
  { value: 'Business & Strategy', label: 'Business & Strategy' },
  { value: 'Code & Development', label: 'Code & Development' },
  { value: 'Data & Analysis', label: 'Data & Analysis' },
  { value: 'Research & Learning', label: 'Research & Learning' },
  { value: 'Marketing & Sales', label: 'Marketing & Sales' },
  { value: 'Creative & Design', label: 'Creative & Design' },
  { value: 'Communication', label: 'Communication' },
  { value: 'Productivity & Planning', label: 'Productivity & Planning' },
  { value: 'Education & Training', label: 'Education & Training' },
  { value: 'Technical Writing', label: 'Technical Writing' },
  { value: 'Legal & Compliance', label: 'Legal & Compliance' },
  { value: 'HR & Recruiting', label: 'HR & Recruiting' },
  { value: 'Finance & Accounting', label: 'Finance & Accounting' },
  { value: 'Customer Support', label: 'Customer Support' },
  { value: 'SEO & Search', label: 'SEO & Search' },
  { value: 'Social Media', label: 'Social Media' },
  { value: 'Templates', label: 'Templates' },
  { value: 'Frameworks', label: 'Frameworks' },
  { value: 'Multi-step Workflows', label: 'Multi-step Workflows' },
  { value: 'Other', label: 'Other' },
]

export const FRAMEWORK_OPTIONS = [
  { value: 'Role-Based', label: 'Role-Based' },
  { value: 'Few-Shot', label: 'Few-Shot' },
  { value: 'Chain-of-Thought', label: 'Chain-of-Thought' },
  { value: 'Template/Fill-in', label: 'Template/Fill-in' },
  { value: 'Constraint-Based', label: 'Constraint-Based' },
  { value: 'Iterative/Multi-Turn', label: 'Iterative/Multi-Turn' },
  { value: 'Comparative', label: 'Comparative' },
  { value: 'Generative', label: 'Generative' },
  { value: 'Analytical', label: 'Analytical' },
  { value: 'Transformation', label: 'Transformation' },
]
