// Enhancement generators for advanced prompt features

export interface RoleEnhancement {
  enabled: boolean
  type: 'expert' | 'persona' | 'perspective' | 'none'
  customRole?: string
  expertise?: string
  perspective?: string
}

export interface FormatController {
  enabled: boolean
  type: 'structured' | 'markdown' | 'list' | 'table' | 'code' | 'custom' | 'none'
  structuredFormat?: 'json' | 'yaml' | 'xml'
  customFormat?: string
  includeExamples?: boolean
}

export interface SmartConstraints {
  length: {
    enabled: boolean
    min: number
    max: number
    unit: 'words' | 'characters'
  }
  tone: {
    enabled: boolean
    tones: string[]
  }
  audience: {
    enabled: boolean
    target: string
  }
  exclusions: {
    enabled: boolean
    items: string[]
  }
  requirements: {
    enabled: boolean
    items: string[]
  }
  complexity: {
    enabled: boolean
    level: 'simple' | 'moderate' | 'advanced' | 'expert'
  }
}

export interface ReasoningScaffold {
  enabled: boolean
  type: 'analysis' | 'decision' | 'problem_solving' | 'critical_thinking' | 'creative' | 'none'
  customFramework?: string
  showWorking?: boolean
}

export interface ConversationFlow {
  type: 'single' | 'iterative' | 'clarifying' | 'multi_step' | 'collaborative'
  context?: string
  allowClarification?: boolean
}

export interface AdvancedEnhancements {
  roleEnhancement: RoleEnhancement
  formatController: FormatController
  smartConstraints: SmartConstraints
  reasoningScaffold: ReasoningScaffold
  conversationFlow: ConversationFlow
}

export function generateRoleEnhancement(config: RoleEnhancement): string {
  if (!config.enabled || config.type === 'none') return ''

  const instructions: string[] = []

  switch (config.type) {
    case 'expert':
      if (config.expertise) {
        instructions.push(`You are an expert in ${config.expertise}.`)
        instructions.push(
          'Draw upon deep domain knowledge and professional experience in your responses.'
        )
      }
      break

    case 'persona':
      if (config.customRole) {
        instructions.push(`Assume the role of ${config.customRole}.`)
        instructions.push('Embody this character fully in your tone, perspective, and approach.')
      }
      break

    case 'perspective':
      if (config.perspective) {
        instructions.push(`Approach this from the perspective of ${config.perspective}.`)
        instructions.push('Apply this unique viewpoint throughout your analysis and recommendations.')
      }
      break
  }

  return instructions.join('\n')
}

export function generateFormatController(config: FormatController): string {
  if (!config.enabled || config.type === 'none') return ''

  const instructions: string[] = []

  switch (config.type) {
    case 'structured':
      instructions.push(
        `Provide your response in ${config.structuredFormat?.toUpperCase() || 'JSON'} format.`
      )
      instructions.push('Ensure the output is valid and properly formatted.')
      if (config.includeExamples) {
        instructions.push('Include example values where appropriate.')
      }
      break

    case 'markdown':
      instructions.push('Format your response using proper Markdown syntax.')
      instructions.push(
        'Use headers, lists, code blocks, and emphasis to enhance readability.'
      )
      break

    case 'list':
      instructions.push('Present your response as a clear, organized list.')
      instructions.push('Use bullet points or numbering as appropriate for the content.')
      break

    case 'table':
      instructions.push('Organize the information in a table format.')
      instructions.push('Include clear column headers and well-structured rows.')
      break

    case 'code':
      instructions.push('Format code examples with proper syntax highlighting.')
      instructions.push('Include comments explaining key sections.')
      break

    case 'custom':
      if (config.customFormat) {
        instructions.push(`Follow this format specification:\n${config.customFormat}`)
      }
      break
  }

  return instructions.join('\n')
}

export function generateSmartConstraints(config: SmartConstraints): string {
  const instructions: string[] = []

  // Length constraints
  if (config.length.enabled && (config.length.min > 0 || config.length.max > 0)) {
    const unit = config.length.unit
    if (config.length.min > 0 && config.length.max > 0) {
      instructions.push(
        `Keep your response between ${config.length.min} and ${config.length.max} ${unit}.`
      )
    } else if (config.length.min > 0) {
      instructions.push(`Your response should be at least ${config.length.min} ${unit}.`)
    } else if (config.length.max > 0) {
      instructions.push(`Keep your response under ${config.length.max} ${unit}.`)
    }
  }

  // Tone constraints
  if (config.tone.enabled && config.tone.tones.length > 0) {
    const toneList = config.tone.tones.join(', ')
    instructions.push(`Maintain a ${toneList} tone throughout your response.`)
  }

  // Audience targeting
  if (config.audience.enabled && config.audience.target) {
    instructions.push(`Tailor your response for: ${config.audience.target}`)
    instructions.push('Adjust complexity, terminology, and examples accordingly.')
  }

  // Content exclusions
  if (config.exclusions.enabled && config.exclusions.items.length > 0) {
    instructions.push('\nAvoid the following:')
    config.exclusions.items.forEach((item) => {
      instructions.push(`- ${item}`)
    })
  }

  // Required elements
  if (config.requirements.enabled && config.requirements.items.length > 0) {
    instructions.push('\nEnsure your response includes:')
    config.requirements.items.forEach((item) => {
      instructions.push(`- ${item}`)
    })
  }

  // Complexity level
  if (config.complexity.enabled) {
    const levelDescriptions = {
      simple: 'Keep explanations simple and accessible. Minimize jargon.',
      moderate: 'Balance accessibility with appropriate technical detail.',
      advanced: 'Provide in-depth technical analysis and nuanced perspectives.',
      expert: 'Assume deep domain expertise. Use precise terminology and advanced concepts.',
    }
    instructions.push(levelDescriptions[config.complexity.level])
  }

  return instructions.join('\n')
}

export function generateReasoningScaffold(config: ReasoningScaffold): string {
  if (!config.enabled || config.type === 'none') return ''

  const instructions: string[] = []

  if (config.showWorking) {
    instructions.push('Show your reasoning process step-by-step.')
  }

  switch (config.type) {
    case 'analysis':
      instructions.push('Use this analytical framework:')
      instructions.push('1. Identify key components and variables')
      instructions.push('2. Examine relationships and dependencies')
      instructions.push('3. Evaluate implications and consequences')
      instructions.push('4. Synthesize insights and conclusions')
      break

    case 'decision':
      instructions.push('Apply a decision matrix approach:')
      instructions.push('1. List all viable options')
      instructions.push('2. Define evaluation criteria')
      instructions.push('3. Score each option against criteria')
      instructions.push('4. Weight factors by importance')
      instructions.push('5. Recommend the optimal choice')
      break

    case 'problem_solving':
      instructions.push('Follow this problem-solving process:')
      instructions.push('1. Define the problem clearly')
      instructions.push('2. Analyze root causes')
      instructions.push('3. Generate potential solutions')
      instructions.push('4. Evaluate feasibility and impact')
      instructions.push('5. Recommend and justify the best approach')
      break

    case 'critical_thinking':
      instructions.push('Apply critical thinking principles:')
      instructions.push('1. Question underlying assumptions')
      instructions.push('2. Evaluate evidence quality and sources')
      instructions.push('3. Consider alternative perspectives')
      instructions.push('4. Identify potential biases')
      instructions.push('5. Draw well-reasoned conclusions')
      break

    case 'creative':
      instructions.push('Use creative exploration techniques:')
      instructions.push('1. Generate diverse possibilities without judgment')
      instructions.push('2. Combine ideas in novel ways')
      instructions.push('3. Challenge conventional approaches')
      instructions.push('4. Explore unexpected connections')
      instructions.push('5. Refine and develop the most promising ideas')
      break
  }

  if (config.customFramework) {
    instructions.push(`\nAdditional framework:\n${config.customFramework}`)
  }

  return instructions.join('\n')
}

export function generateConversationFlow(config: ConversationFlow): string {
  const instructions: string[] = []

  switch (config.type) {
    case 'single':
      // No special instructions for single turn
      break

    case 'iterative':
      instructions.push(
        'This is part of an iterative process. Build upon and refine previous responses.'
      )
      instructions.push('Reference earlier context and show progression in your thinking.')
      break

    case 'clarifying':
      if (config.allowClarification) {
        instructions.push(
          'If the request is ambiguous or requires additional information, ask clarifying questions before providing your main response.'
        )
      }
      break

    case 'multi_step':
      instructions.push('Break down your response into clear, sequential steps.')
      instructions.push('Each step should build logically on the previous one.')
      break

    case 'collaborative':
      instructions.push('Approach this as a collaborative dialogue.')
      instructions.push(
        'Invite feedback, suggest alternatives, and be open to refinement in subsequent turns.'
      )
      break
  }

  if (config.context) {
    instructions.push(`\nConversation context: ${config.context}`)
  }

  return instructions.join('\n')
}

export function generateAllAdvancedEnhancements(enhancements: AdvancedEnhancements): string {
  const sections: string[] = []

  const roleInstructions = generateRoleEnhancement(enhancements.roleEnhancement)
  if (roleInstructions) sections.push(roleInstructions)

  const formatInstructions = generateFormatController(enhancements.formatController)
  if (formatInstructions) sections.push(formatInstructions)

  const constraintInstructions = generateSmartConstraints(enhancements.smartConstraints)
  if (constraintInstructions) sections.push(constraintInstructions)

  const reasoningInstructions = generateReasoningScaffold(enhancements.reasoningScaffold)
  if (reasoningInstructions) sections.push(reasoningInstructions)

  const flowInstructions = generateConversationFlow(enhancements.conversationFlow)
  if (flowInstructions) sections.push(flowInstructions)

  return sections.filter((s) => s.length > 0).join('\n\n')
}
