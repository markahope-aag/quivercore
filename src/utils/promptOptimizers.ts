import type { PromptConfiguration } from '@/lib/types/prompt-builder'
import { FrameworkType } from '@/lib/types/prompt-builder'

export interface ValidationResult {
  issues: string[]
  suggestions: string[]
}

export class PromptOptimizers {
  static validateEnhancementCombination(config: PromptConfiguration): ValidationResult {
    const issues: string[] = []
    const suggestions: string[] = []

    // Check for conflicting enhancements
    if (
      config.vsConfig?.type === 'balanced_categories' &&
      config.advancedEnhancements?.smartConstraints?.positiveConstraints &&
      config.advancedEnhancements.smartConstraints.positiveConstraints.length > 0
    ) {
      suggestions.push(
        'Balanced VS works best with minimal constraints to allow full category exploration'
      )
    }

    // Check role-framework compatibility
    if (
      config.framework === FrameworkType.ROLE_BASED &&
      config.advancedEnhancements?.roleEnhancement?.enabled
    ) {
      suggestions.push(
        'You have role definition in both framework and role enhancement - consider consolidating'
      )
    }

    // Check reasoning scaffold compatibility
    if (
      config.framework === FrameworkType.CHAIN_OF_THOUGHT &&
      config.advancedEnhancements?.reasoningScaffolds?.enabled
    ) {
      suggestions.push(
        'Chain-of-thought framework and reasoning scaffolds complement each other well'
      )
    }

    return { issues, suggestions }
  }

  static optimizePromptOrder(config: PromptConfiguration): string[] {
    // Return optimal order of enhancement application based on research
    const order: string[] = []

    if (config.advancedEnhancements?.roleEnhancement?.enabled) {
      order.push('role')
    }

    order.push('framework')

    if (config.advancedEnhancements?.smartConstraints?.enabled) {
      order.push('constraints')
    }

    if (config.advancedEnhancements?.reasoningScaffolds?.enabled) {
      order.push('reasoning')
    }

    if (config.vsEnabled) {
      order.push('vs')
    }

    if (config.advancedEnhancements?.formatControl?.enabled) {
      order.push('format')
    }

    if (config.advancedEnhancements?.conversationFlow?.enabled) {
      order.push('conversation')
    }

    return order
  }

  static generateOptimizationSuggestions(config: PromptConfiguration): string[] {
    const suggestions: string[] = []

    // Suggest complementary enhancements
    if (config.vsEnabled && !config.advancedEnhancements?.reasoningScaffolds?.enabled) {
      suggestions.push(
        'Consider adding reasoning scaffolds to help explain why certain VS options are rare/common'
      )
    }

    if (
      config.framework === FrameworkType.FEW_SHOT &&
      !config.advancedEnhancements?.formatControl?.enabled
    ) {
      suggestions.push(
        'Format control helps ensure consistent output structure across few-shot examples'
      )
    }

    return suggestions
  }
}

