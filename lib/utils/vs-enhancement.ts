// VS Enhancement instruction generators

import type { VSEnhancement, VSDistributionType } from '@/lib/types/prompt-builder'

export const VS_ENHANCEMENTS = {
  broadSpectrum: {
    instruction: (count: number, includeReasoning: boolean) =>
      `Generate ${count} diverse responses with probability estimates (0.01-0.40). Include mix from common (0.15+) to rare (0.05-) responses. Ensure each represents a fundamentally different approach, not variations of the same concept.${
        includeReasoning ? ' Include brief rationale for each probability assignment.' : ''
      }`,
    format: (includeReasoning: boolean) =>
      includeReasoning
        ? '[Response] (Probability: 0.XX - Rationale: [explanation])'
        : '[Response] (Probability: 0.XX)',
  },

  rarityHunt: {
    instruction: (count: number, threshold: number, includeReasoning: boolean) =>
      `Generate ${count} responses focusing on unconventional approaches (probability < ${threshold}). Skip obvious choices. Focus on options that standard prompting would miss. Avoid defaulting to stereotypical responses.${
        includeReasoning ? ' Explain why each option is rare or unconventional.' : ''
      }`,
    format: (includeReasoning: boolean) =>
      includeReasoning
        ? '[Response] (Probability: 0.XX - Why rare: [rationale])'
        : '[Response] (Probability: 0.XX)',
    thresholds: [0.15, 0.1, 0.05],
  },

  balancedCategories: {
    instruction: (count: number, categories: string[], includeReasoning: boolean) =>
      `Generate ${count} responses, one per category with equal probability (${(1 / count).toFixed(
        2
      )}). Categories: ${categories.join(', ')}. Ensure each response genuinely represents its assigned category.${
        includeReasoning ? ' Explain how each response fits its category.' : ''
      }`,
    format: (includeReasoning: boolean) =>
      includeReasoning
        ? 'Category: [X] | [Response] (Probability: 0.XX - Category fit: [explanation])'
        : 'Category: [X] | [Response] (Probability: 0.XX)',
    commonDimensions: [
      'Audience segments',
      'Strategic approaches',
      'Risk levels',
      'Time horizons',
      'Resource requirements',
      'Technical complexity',
      'Innovation level',
      'Market positioning',
      'Cost structures',
    ],
  },
}

export function generateVSInstructions(vsConfig: VSEnhancement): string {
  if (!vsConfig.enabled) return ''

  const { distributionType, numberOfResponses, includeProbabilityReasoning } = vsConfig

  let instruction = ''

  switch (distributionType) {
    case 'broad_spectrum':
      instruction = VS_ENHANCEMENTS.broadSpectrum.instruction(
        numberOfResponses,
        includeProbabilityReasoning
      )
      break

    case 'rarity_hunt':
      const threshold = vsConfig.probabilityThreshold || 0.15
      instruction = VS_ENHANCEMENTS.rarityHunt.instruction(
        numberOfResponses,
        threshold,
        includeProbabilityReasoning
      )
      break

    case 'balanced_categories':
      const dimensions = vsConfig.dimensions || []
      const customDimensions = vsConfig.customDimensions || []
      const allDimensions = [...dimensions, ...customDimensions]
      instruction = VS_ENHANCEMENTS.balancedCategories.instruction(
        numberOfResponses,
        allDimensions,
        includeProbabilityReasoning
      )
      break
  }

  // Add anti-typicality instruction
  if (vsConfig.antiTypicalityEnabled) {
    instruction += '\n\nIMPORTANT: Actively avoid typical, first-thought responses. Challenge yourself to consider perspectives and approaches that would not be immediately obvious.'
  }

  // Add custom constraints
  if (vsConfig.customConstraints) {
    instruction += `\n\nAdditional constraints: ${vsConfig.customConstraints}`
  }

  return instruction
}

export function getVSFormat(distributionType: VSDistributionType, includeReasoning: boolean): string {
  switch (distributionType) {
    case 'broad_spectrum':
      return VS_ENHANCEMENTS.broadSpectrum.format(includeReasoning)
    case 'rarity_hunt':
      return VS_ENHANCEMENTS.rarityHunt.format(includeReasoning)
    case 'balanced_categories':
      return VS_ENHANCEMENTS.balancedCategories.format(includeReasoning)
    default:
      return ''
  }
}

export function isVSCompatibleWithFramework(framework: string): {
  compatible: boolean
  warning?: string
} {
  const compatibility: Record<string, { compatible: boolean; warning?: string }> = {
    'Role-Based': { compatible: true },
    'Few-Shot': { compatible: true },
    'Chain-of-Thought': { compatible: true },
    Comparative: { compatible: true },
    Generative: { compatible: true },
    Analytical: { compatible: true },
    'Template/Fill-in': {
      compatible: true,
      warning: 'VS works if template allows multiple outputs',
    },
    'Constraint-Based': {
      compatible: false,
      warning: 'VS diversity may conflict with strict constraints',
    },
    'Iterative/Multi-Turn': { compatible: true },
    Transformation: { compatible: true },
  }

  return compatibility[framework] || { compatible: true }
}
