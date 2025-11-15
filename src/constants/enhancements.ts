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
