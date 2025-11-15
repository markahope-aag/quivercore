// Constants for AI Prompt Builder

import type { PromptDomain, PromptFramework, VSParameter } from '@/lib/types/prompt-builder'

// Core Categories
export const CORE_DOMAINS: PromptDomain[] = [
  'Writing & Content',
  'Business & Strategy',
  'Code & Development',
  'Data & Analysis',
  'Research & Learning',
  'Marketing & Sales',
  'Creative & Design',
  'Communication',
]

export const PROMPT_DOMAINS: PromptDomain[] = [
  'Writing & Content',
  'Business & Strategy',
  'Code & Development',
  'Data & Analysis',
  'Research & Learning',
  'Marketing & Sales',
  'Creative & Design',
  'Communication',
  'Other',
]

export const PROMPT_FRAMEWORKS: PromptFramework[] = [
  'Role-Based',
  'Few-Shot',
  'Chain-of-Thought',
  'Template/Fill-in',
  'Constraint-Based',
  'Iterative/Multi-Turn',
  'Comparative',
  'Generative',
  'Analytical',
  'Transformation',
]

export const FRAMEWORK_DESCRIPTIONS: Record<PromptFramework, string> = {
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

export const VS_PARAMETERS: Array<{
  name: VSParameter
  label: string
  description: string
  min: number
  max: number
  step: number
  default: number
  verbalizeTemplate: string
}> = [
  {
    name: 'temperature',
    label: 'Temperature',
    description: 'Controls randomness. Higher = more creative, lower = more focused',
    min: 0,
    max: 2,
    step: 0.1,
    default: 1.0,
    verbalizeTemplate: 'Use a creativity level of {value} (on a scale of 0-2, where 0 is most deterministic and 2 is most creative).',
  },
  {
    name: 'top_p',
    label: 'Top P (Nucleus Sampling)',
    description: 'Controls diversity via nucleus sampling',
    min: 0,
    max: 1,
    step: 0.05,
    default: 1.0,
    verbalizeTemplate: 'Consider the top {value}% most likely next words when generating your response.',
  },
  {
    name: 'top_k',
    label: 'Top K',
    description: 'Limits vocabulary to top K tokens',
    min: 1,
    max: 100,
    step: 1,
    default: 50,
    verbalizeTemplate: 'Limit your vocabulary choices to the top {value} most likely words at each step.',
  },
  {
    name: 'presence_penalty',
    label: 'Presence Penalty',
    description: 'Penalizes repeated tokens',
    min: -2,
    max: 2,
    step: 0.1,
    default: 0,
    verbalizeTemplate: 'Apply a {value} penalty for repeating topics (negative encourages, positive discourages repetition).',
  },
  {
    name: 'frequency_penalty',
    label: 'Frequency Penalty',
    description: 'Penalizes tokens based on frequency',
    min: -2,
    max: 2,
    step: 0.1,
    default: 0,
    verbalizeTemplate: 'Apply a {value} penalty based on word frequency (negative encourages, positive discourages common words).',
  },
]

export const BUILDER_STEPS = [
  { id: 'base', label: 'Base Prompt', description: 'Define your core prompt' },
  { id: 'enhancement', label: 'VS Enhancement', description: 'Add verbalized sampling' },
  { id: 'preview', label: 'Preview', description: 'Review generated prompt' },
  { id: 'execute', label: 'Execute', description: 'Run and see results' },
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
  distributionType: 'broad_spectrum' as const,
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
