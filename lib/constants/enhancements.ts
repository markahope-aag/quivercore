// Constants for Advanced Enhancements

export const ROLE_ENHANCEMENT_TYPES = [
  { value: 'expert', label: 'Expert Role', description: 'Position AI as a domain expert' },
  { value: 'persona', label: 'Specific Persona', description: 'Give AI a detailed character' },
  { value: 'perspective', label: 'Unique Perspective', description: 'Apply a specific viewpoint' },
  { value: 'none', label: 'None', description: 'No role enhancement' },
] as const

export const FORMAT_CONTROLLER_TYPES = [
  { value: 'structured', label: 'Structured Output', description: 'JSON, YAML, or other structured formats' },
  { value: 'markdown', label: 'Markdown', description: 'Well-formatted markdown output' },
  { value: 'list', label: 'List Format', description: 'Bullet points or numbered lists' },
  { value: 'table', label: 'Table Format', description: 'Tabular data presentation' },
  { value: 'code', label: 'Code Format', description: 'Code blocks with syntax' },
  { value: 'custom', label: 'Custom Format', description: 'Define your own format' },
  { value: 'none', label: 'None', description: 'No format constraints' },
] as const

export const CONSTRAINT_TYPES = [
  { value: 'length', label: 'Length Constraints', description: 'Min/max word or character count' },
  { value: 'tone', label: 'Tone & Style', description: 'Formal, casual, technical, etc.' },
  { value: 'audience', label: 'Target Audience', description: 'Who the output is for' },
  { value: 'exclusions', label: 'Content Exclusions', description: 'What to avoid' },
  { value: 'requirements', label: 'Must Include', description: 'Required elements' },
  { value: 'complexity', label: 'Complexity Level', description: 'Simple, moderate, advanced' },
] as const

export const REASONING_SCAFFOLD_TYPES = [
  { value: 'analysis', label: 'Analysis Framework', description: 'Structured analytical thinking' },
  { value: 'decision', label: 'Decision Matrix', description: 'Systematic decision-making' },
  { value: 'problem_solving', label: 'Problem Solving', description: 'Step-by-step problem resolution' },
  { value: 'critical_thinking', label: 'Critical Thinking', description: 'Evaluate assumptions and evidence' },
  { value: 'creative', label: 'Creative Exploration', description: 'Divergent thinking patterns' },
  { value: 'none', label: 'None', description: 'No reasoning scaffold' },
] as const

export const CONVERSATION_FLOW_TYPES = [
  { value: 'single', label: 'Single Turn', description: 'One prompt, one response' },
  { value: 'iterative', label: 'Iterative Refinement', description: 'Build upon previous responses' },
  { value: 'clarifying', label: 'Clarifying Questions', description: 'AI asks questions before responding' },
  { value: 'multi_step', label: 'Multi-Step Process', description: 'Break into sequential steps' },
  { value: 'collaborative', label: 'Collaborative Dialog', description: 'Back-and-forth discussion' },
] as const

export const TONE_OPTIONS = [
  'Professional',
  'Casual',
  'Formal',
  'Friendly',
  'Technical',
  'Academic',
  'Conversational',
  'Persuasive',
  'Empathetic',
  'Authoritative',
] as const

export const AUDIENCE_OPTIONS = [
  'General Public',
  'Experts/Specialists',
  'Beginners',
  'Executives/Leadership',
  'Technical Teams',
  'Students',
  'Customers',
  'Stakeholders',
] as const

export const COMPLEXITY_LEVELS = [
  { value: 'simple', label: 'Simple', description: 'Easy to understand, minimal jargon' },
  { value: 'moderate', label: 'Moderate', description: 'Balanced complexity and detail' },
  { value: 'advanced', label: 'Advanced', description: 'Technical depth and nuance' },
  { value: 'expert', label: 'Expert', description: 'Maximum sophistication and precision' },
] as const

export const DEFAULT_ADVANCED_ENHANCEMENTS = {
  roleEnhancement: {
    enabled: false,
    type: 'none' as const,
    customRole: '',
    expertise: '',
    perspective: '',
  },
  formatController: {
    enabled: false,
    type: 'none' as const,
    structuredFormat: 'json',
    customFormat: '',
    includeExamples: false,
  },
  smartConstraints: {
    length: {
      enabled: false,
      min: 0,
      max: 0,
      unit: 'words' as 'words' | 'characters',
    },
    tone: {
      enabled: false,
      tones: [] as string[],
    },
    audience: {
      enabled: false,
      target: '',
    },
    exclusions: {
      enabled: false,
      items: [] as string[],
    },
    requirements: {
      enabled: false,
      items: [] as string[],
    },
    complexity: {
      enabled: false,
      level: 'moderate' as const,
    },
  },
  reasoningScaffold: {
    enabled: false,
    type: 'none' as const,
    customFramework: '',
    showWorking: false,
  },
  conversationFlow: {
    type: 'single' as const,
    context: '',
    allowClarification: false,
  },
}
