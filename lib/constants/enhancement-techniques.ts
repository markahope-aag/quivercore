// Enhancement techniques for prompts
// These represent advanced techniques to improve prompt performance

export const ENHANCEMENT_TECHNIQUES = [
  'Verbalized Sampling',
  'Temperature Control',
  'System Prompting',
  'Token Optimization',
] as const

export type EnhancementTechnique = typeof ENHANCEMENT_TECHNIQUES[number]

// Helper function to check if a string is a valid enhancement technique
export function isValidEnhancementTechnique(value: string): value is EnhancementTechnique {
  return ENHANCEMENT_TECHNIQUES.includes(value as EnhancementTechnique)
}

// Get all enhancement techniques as a simple array
export function getEnhancementTechniques(): readonly string[] {
  return ENHANCEMENT_TECHNIQUES
}

// Enhancement technique descriptions for UI tooltips/help text
export const ENHANCEMENT_TECHNIQUE_DESCRIPTIONS: Record<EnhancementTechnique, string> = {
  'Verbalized Sampling': 'Use explicit sampling instructions in the prompt',
  'Temperature Control': 'Adjust randomness/creativity in responses',
  'System Prompting': 'Use system-level instructions to set behavior',
  'Token Optimization': 'Optimize prompt length and token usage',
}
