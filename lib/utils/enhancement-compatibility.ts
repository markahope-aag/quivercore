// Enhancement compatibility with frameworks
// Aligned with Prompt Builder logic: only filter VS, others are always available

import { getEnhancementTechniques } from '@/lib/constants/enhancement-techniques'
import { isVSCompatibleWithFramework } from '@/lib/utils/vs-enhancement'

export interface EnhancementCompatibility {
  compatible: boolean
  warning?: string
  recommendation?: string
}

/**
 * Determines if an enhancement technique is compatible with a framework
 * Only shows enhancements that are relevant/applicable to each framework
 */
export function isEnhancementCompatibleWithFramework(
  enhancement: string,
  framework: string | null
): EnhancementCompatibility {
  if (!framework) {
    // If no framework is selected, all enhancements are available
    return { compatible: true }
  }

  // For Verbalized Sampling, use the same compatibility check as Prompt Builder
  if (enhancement === 'Verbalized Sampling') {
    const vsCompat = isVSCompatibleWithFramework(framework)
    return {
      compatible: vsCompat.compatible,
      warning: vsCompat.warning,
    }
  }

  // Define which enhancements are relevant for each framework
  // Only show enhancements that make sense for the selected framework
  // Verbalized Sampling is added separately based on VS compatibility check
  const frameworkEnhancements: Record<string, string[]> = {
    'Role-Based': ['Verbalized Sampling', 'System Prompting', 'Temperature Control'],
    'Few-Shot': ['Verbalized Sampling', 'Token Optimization', 'System Prompting'],
    'Chain-of-Thought': ['Verbalized Sampling', 'Token Optimization', 'System Prompting'],
    'Template/Fill-in': ['Verbalized Sampling', 'System Prompting', 'Token Optimization'],
    'Constraint-Based': ['System Prompting', 'Token Optimization'], // VS not compatible
    'Iterative/Multi-Turn': ['Verbalized Sampling', 'System Prompting', 'Token Optimization'],
    Comparative: ['Verbalized Sampling', 'System Prompting', 'Temperature Control'],
    Generative: ['Verbalized Sampling', 'Temperature Control', 'System Prompting'],
    Analytical: ['Verbalized Sampling', 'System Prompting', 'Token Optimization'],
    Transformation: ['Verbalized Sampling', 'System Prompting', 'Temperature Control'],
  }

  const relevantEnhancements = frameworkEnhancements[framework] || []
  const isRelevant = relevantEnhancements.includes(enhancement)

  // Provide recommendations for relevant enhancements
  const recommendations: Record<string, Record<string, string>> = {
    'Temperature Control': {
      Generative: 'Excellent for creative generation',
      'Role-Based': 'Helps control response style and creativity',
      Comparative: 'Useful for varying comparison depth',
      Transformation: 'Affects transformation creativity and style',
    },
    'System Prompting': {
      'Role-Based': 'Consider consolidating role definitions if Role-Based framework is used',
      'Iterative/Multi-Turn': 'Great for maintaining context across turns',
      'Few-Shot': 'Complements example-based learning',
      'Chain-of-Thought': 'Reinforces reasoning structure',
    },
    'Token Optimization': {
      'Few-Shot': 'Balance example count with token limits',
      'Chain-of-Thought': 'Use to balance detail vs. length',
      'Iterative/Multi-Turn': 'Essential for managing conversation length',
      Analytical: 'Important for detailed analysis without exceeding limits',
    },
  }

  const recommendation = recommendations[enhancement]?.[framework]

  return {
    compatible: isRelevant,
    recommendation,
  }
}

/**
 * Gets all enhancement techniques that are compatible with a given framework
 * Only returns enhancements that are relevant/applicable to the selected framework
 */
export function getCompatibleEnhancements(framework: string | null): string[] {
  const allEnhancements = getEnhancementTechniques()
  
  if (!framework) {
    return [...allEnhancements]
  }

  // Filter to only show enhancements that are relevant for this framework
  return allEnhancements.filter((enhancement) => {
    const compat = isEnhancementCompatibleWithFramework(enhancement, framework)
    return compat.compatible
  })
}

/**
 * Gets enhancement techniques that are recommended for a given framework
 */
export function getRecommendedEnhancements(framework: string | null): string[] {
  const compatible = getCompatibleEnhancements(framework)
  
  if (!framework) {
    return []
  }

  // Return enhancements that are particularly well-suited for this framework
  const recommendations: Record<string, string[]> = {
    'Role-Based': ['System Prompting', 'Temperature Control'],
    'Few-Shot': ['Token Optimization', 'System Prompting'],
    'Chain-of-Thought': ['Token Optimization', 'System Prompting'],
    Generative: ['Temperature Control', 'Verbalized Sampling'],
    Analytical: ['System Prompting', 'Token Optimization'],
    'Iterative/Multi-Turn': ['System Prompting', 'Token Optimization'],
    Transformation: ['System Prompting', 'Temperature Control'],
  }

  const recommended = recommendations[framework] || []
  return compatible.filter((enh) => recommended.includes(enh))
}

