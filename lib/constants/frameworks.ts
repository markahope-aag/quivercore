// Prompt engineering frameworks/patterns
// These represent different prompting techniques and structures

export const FRAMEWORKS = [
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
] as const

export type Framework = typeof FRAMEWORKS[number]

// Helper function to check if a string is a valid framework
export function isValidFramework(value: string): value is Framework {
  return FRAMEWORKS.includes(value as Framework)
}

// Get all frameworks as a simple array
export function getFrameworks(): readonly string[] {
  return FRAMEWORKS
}

// Framework descriptions for UI tooltips/help text
export const FRAMEWORK_DESCRIPTIONS: Record<Framework, string> = {
  'Role-Based': 'Assigns expertise/persona to the AI',
  'Few-Shot': 'Provides examples to guide responses',
  'Chain-of-Thought': 'Encourages step-by-step reasoning',
  'Template/Fill-in': 'Structured format with placeholders',
  'Constraint-Based': 'Specific rules or limitations',
  'Iterative/Multi-Turn': 'Builds through conversation',
  'Comparative': 'Analyze multiple options',
  'Generative': 'Create content from scratch',
  'Analytical': 'Break down/examine existing content',
  'Transformation': 'Convert format/style/structure',
}
