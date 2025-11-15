import type { PromptConfiguration, VSConfiguration } from '@/lib/types/prompt-builder'
import { EnhancementGenerators } from './enhancementGenerators'
import { generateFrameworkPrompt } from '@/lib/utils/framework-templates'
import { generateVSInstructions, getVSFormat } from '@/lib/utils/vs-enhancement'
import type { VSEnhancement } from '@/lib/types/prompt-builder'

/**
 * Converts VSConfiguration to VS enhancement text
 */
function generateVSEnhancement(vsConfig: VSConfiguration): string {
  // Convert VSConfiguration to VSEnhancement format for existing functions
  const vsEnhancement: VSEnhancement = {
    enabled: true,
    numberOfResponses: vsConfig.responseCount,
    distributionType: vsConfig.type,
    probabilityThreshold: vsConfig.rarityThreshold,
    dimensions: vsConfig.categories || [],
    customDimensions: [],
    includeProbabilityReasoning: vsConfig.includeReasoning,
    customConstraints: vsConfig.customConstraints || '',
    antiTypicalityEnabled: vsConfig.antiTypicalityMode,
  }

  const vsInstructions = generateVSInstructions(vsEnhancement)
  const format = getVSFormat(vsConfig.type, vsConfig.includeReasoning)

  return `${vsInstructions}\n\nFormat each response as:\n${format}`
}

/**
 * Generates a complete prompt by integrating all enhancements in the correct order
 */
export function generateCompletePrompt(config: PromptConfiguration): string {
  const sections: string[] = []

  // Role enhancement (comes first to establish context)
  if (config.advancedEnhancements?.roleEnhancement) {
    sections.push(
      EnhancementGenerators.generateRoleEnhancement(config.advancedEnhancements.roleEnhancement)
    )
  }

  // Framework-specific content
  // If no framework is specified, use base prompt directly
  const frameworkPrompt = config.framework
    ? generateFrameworkPrompt(
        config.framework,
        config.frameworkConfig,
        config.basePrompt,
        '' // VS enhancement will be added separately
      )
    : config.basePrompt
  sections.push(frameworkPrompt)

  // Advanced enhancements
  if (config.advancedEnhancements?.smartConstraints) {
    sections.push(
      EnhancementGenerators.generateSmartConstraints(config.advancedEnhancements.smartConstraints)
    )
  }

  if (config.advancedEnhancements?.reasoningScaffolds) {
    sections.push(
      EnhancementGenerators.generateReasoningScaffolds(
        config.advancedEnhancements.reasoningScaffolds
      )
    )
  }

  // VS enhancement (comes after reasoning scaffolds for best integration)
  if (config.vsEnabled && config.vsConfig) {
    sections.push(generateVSEnhancement(config.vsConfig))
  }

  // Format control (comes near end to control output structure)
  if (config.advancedEnhancements?.formatControl) {
    sections.push(
      EnhancementGenerators.generateFormatControl(config.advancedEnhancements.formatControl)
    )
  }

  // Conversation flow (comes last)
  if (config.advancedEnhancements?.conversationFlow) {
    sections.push(
      EnhancementGenerators.generateConversationFlow(config.advancedEnhancements.conversationFlow)
    )
  }

  return sections.filter((section) => section.trim()).join('\n\n')
}

