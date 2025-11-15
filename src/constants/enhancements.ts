import type {
  AdvancedEnhancements,
  RoleEnhancement,
  FormatControl,
  SmartConstraints,
  ReasoningScaffolds,
  ConversationFlow,
} from '@/src/types/index'

export const DEFAULT_ROLE_ENHANCEMENT: RoleEnhancement = {
  enabled: false,
  expertiseLevel: 'intermediate',
  domainSpecialty: '',
  authorityLevel: 'advisory',
}

export const DEFAULT_FORMAT_CONTROL: FormatControl = {
  enabled: false,
  structure: 'paragraphs',
  lengthSpec: {
    type: 'word-count',
  },
  styleGuide: 'formal',
}

export const DEFAULT_SMART_CONSTRAINTS: SmartConstraints = {
  enabled: false,
  positiveConstraints: [],
  negativeConstraints: [],
  boundaryConditions: [],
  qualityGates: [],
}

export const DEFAULT_REASONING_SCAFFOLDS: ReasoningScaffolds = {
  enabled: false,
  showWork: false,
  stepByStep: false,
  exploreAlternatives: false,
  confidenceScoring: false,
  reasoningStyle: 'logical',
}

export const DEFAULT_CONVERSATION_FLOW: ConversationFlow = {
  enabled: false,
  contextPreservation: false,
  followUpTemplates: [],
  clarificationProtocols: false,
  iterationImprovement: false,
}

export const DEFAULT_ADVANCED_ENHANCEMENTS: AdvancedEnhancements = {
  roleEnhancement: DEFAULT_ROLE_ENHANCEMENT,
  formatControl: DEFAULT_FORMAT_CONTROL,
  smartConstraints: DEFAULT_SMART_CONSTRAINTS,
  reasoningScaffolds: DEFAULT_REASONING_SCAFFOLDS,
  conversationFlow: DEFAULT_CONVERSATION_FLOW,
}

// UI Options for dropdowns
export const EXPERTISE_LEVELS: Array<{ value: RoleEnhancement['expertiseLevel']; label: string; description: string }> = [
  { value: 'novice', label: 'Novice', description: 'Learning this field' },
  { value: 'intermediate', label: 'Intermediate', description: 'Solid experience' },
  { value: 'expert', label: 'Expert', description: 'Highly experienced professional' },
  { value: 'world-class', label: 'World-Class', description: 'World-renowned expert' },
]

export const AUTHORITY_LEVELS: Array<{ value: RoleEnhancement['authorityLevel']; label: string; description: string }> = [
  { value: 'advisory', label: 'Advisory', description: 'Provide recommendations' },
  { value: 'authoritative', label: 'Authoritative', description: 'Make confident assertions' },
  { value: 'definitive', label: 'Definitive', description: 'Complete authority' },
]

export const FORMAT_STRUCTURES: Array<{ value: FormatControl['structure']; label: string; description: string }> = [
  { value: 'bullet-points', label: 'Bullet Points', description: 'Clear bullet points' },
  { value: 'numbered-list', label: 'Numbered List', description: 'Numbered list format' },
  { value: 'paragraphs', label: 'Paragraphs', description: 'Well-structured paragraphs' },
  { value: 'json', label: 'JSON', description: 'Valid JSON format' },
  { value: 'table', label: 'Table', description: 'Table format' },
  { value: 'custom', label: 'Custom', description: 'Custom format specification' },
]

export const LENGTH_SPEC_TYPES: Array<{ value: FormatControl['lengthSpec']['type']; label: string }> = [
  { value: 'word-count', label: 'Word Count' },
  { value: 'sentence-count', label: 'Sentence Count' },
  { value: 'paragraph-count', label: 'Paragraph Count' },
]

export const STYLE_GUIDES: Array<{ value: FormatControl['styleGuide']; label: string; description: string }> = [
  { value: 'formal', label: 'Formal', description: 'Professional, formal language' },
  { value: 'conversational', label: 'Conversational', description: 'Accessible, conversational tone' },
  { value: 'technical', label: 'Technical', description: 'Precise technical terminology' },
  { value: 'creative', label: 'Creative', description: 'Engaging, creative language' },
  { value: 'academic', label: 'Academic', description: 'Scholarly, academic tone' },
]

export const REASONING_STYLES: Array<{ value: ReasoningScaffolds['reasoningStyle']; label: string; description: string }> = [
  { value: 'logical', label: 'Logical', description: 'Deductive reasoning' },
  { value: 'creative', label: 'Creative', description: 'Divergent thinking' },
  { value: 'analytical', label: 'Analytical', description: 'Systematic analysis' },
  { value: 'practical', label: 'Practical', description: 'Actionable reasoning' },
]
