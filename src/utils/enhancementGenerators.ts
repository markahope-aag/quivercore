import type {
  RoleEnhancement,
  FormatControl,
  SmartConstraints,
  ReasoningScaffolds,
  ConversationFlow,
} from '@/src/types/index'

export class EnhancementGenerators {
  static generateRoleEnhancement(config: RoleEnhancement): string {
    if (!config.enabled) return ''

    const expertiseLevels = {
      novice: 'You are learning this field',
      intermediate: 'You have solid experience in this field',
      expert: 'You are a highly experienced professional',
      'world-class': 'You are a world-renowned expert and thought leader',
    }

    const authorityLevels = {
      advisory: 'Provide recommendations and suggestions',
      authoritative: 'Make confident assertions based on your expertise',
      definitive: 'You have complete authority to make definitive statements',
    }

    let roleInstruction = `${expertiseLevels[config.expertiseLevel]} in ${config.domainSpecialty}.`

    if (config.experienceYears) {
      roleInstruction += ` You have ${config.experienceYears} years of hands-on experience.`
    }

    if (config.contextSetting) {
      roleInstruction += ` Context: ${config.contextSetting}`
    }

    roleInstruction += ` ${authorityLevels[config.authorityLevel]}.`

    return `ROLE: ${roleInstruction}`
  }

  static generateFormatControl(config: FormatControl): string {
    if (!config.enabled) return ''

    const structures = {
      'bullet-points': 'Format your response as clear bullet points',
      'numbered-list': 'Format your response as a numbered list',
      paragraphs: 'Format your response in well-structured paragraphs',
      json: 'Format your response as valid JSON',
      table: 'Format your response as a table',
      custom: config.customFormat || 'Use the specified custom format',
    }

    let formatInstruction = structures[config.structure]

    if (config.lengthSpec.type && config.lengthSpec.target) {
      const lengthTypes = {
        'word-count': 'words',
        'sentence-count': 'sentences',
        'paragraph-count': 'paragraphs',
      }
      formatInstruction += `. Target length: approximately ${config.lengthSpec.target} ${lengthTypes[config.lengthSpec.type]}`
    }

    const styleGuides = {
      formal: 'Use formal, professional language',
      conversational: 'Use conversational, accessible language',
      technical: 'Use precise technical terminology',
      creative: 'Use engaging, creative language',
      academic: 'Use scholarly, academic tone',
    }

    formatInstruction += `. ${styleGuides[config.styleGuide]}.`

    return `FORMAT: ${formatInstruction}`
  }

  static generateSmartConstraints(config: SmartConstraints): string {
    if (!config.enabled) return ''

    let constraints = []

    if (config.positiveConstraints.length > 0) {
      constraints.push(`MUST INCLUDE: ${config.positiveConstraints.join(', ')}`)
    }

    if (config.negativeConstraints.length > 0) {
      constraints.push(`MUST AVOID: ${config.negativeConstraints.join(', ')}`)
    }

    if (config.boundaryConditions.length > 0) {
      constraints.push(`BOUNDARIES: ${config.boundaryConditions.join(', ')}`)
    }

    if (config.qualityGates.length > 0) {
      constraints.push(`QUALITY REQUIREMENTS: ${config.qualityGates.join(', ')}`)
    }

    return constraints.join('\n')
  }

  static generateReasoningScaffolds(config: ReasoningScaffolds): string {
    if (!config.enabled) return ''

    let scaffolds = []

    if (config.showWork) {
      scaffolds.push('Show your reasoning process clearly')
    }

    if (config.stepByStep) {
      scaffolds.push('Break down your approach step-by-step')
    }

    if (config.exploreAlternatives) {
      scaffolds.push('Consider alternative approaches and explain why you chose your method')
    }

    if (config.confidenceScoring) {
      scaffolds.push('Provide confidence scores (0-100%) for your key assertions')
    }

    const reasoningStyles = {
      logical: 'Use logical, deductive reasoning',
      creative: 'Use creative, divergent thinking',
      analytical: 'Use systematic, analytical thinking',
      practical: 'Focus on practical, actionable reasoning',
    }

    scaffolds.push(reasoningStyles[config.reasoningStyle])

    return `REASONING: ${scaffolds.join('. ')}`
  }

  static generateConversationFlow(config: ConversationFlow): string {
    if (!config.enabled) return ''

    let flowInstructions = []

    if (config.contextPreservation) {
      flowInstructions.push('Maintain context from previous exchanges')
    }

    if (config.followUpTemplates.length > 0) {
      flowInstructions.push(
        `Suggest relevant follow-up questions: ${config.followUpTemplates.join(', ')}`
      )
    }

    if (config.clarificationProtocols) {
      flowInstructions.push('Ask clarifying questions if the request is ambiguous')
    }

    if (config.iterationImprovement) {
      flowInstructions.push('Offer to refine or improve your response based on feedback')
    }

    return `CONVERSATION: ${flowInstructions.join('. ')}`
  }
}

