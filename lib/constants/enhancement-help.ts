// Help text, tooltips, and examples for advanced enhancements

export interface EnhancementHelp {
  title: string
  description: string
  tooltip: string
  examples: {
    before: string
    after: string
  }
  useCases: string[]
  tips: string[]
}

export const ENHANCEMENT_HELP: Record<string, EnhancementHelp> = {
  roleEnhancement: {
    title: 'Role Enhancement',
    description:
      'Assign a specific role, persona, or perspective to guide the AI\'s responses. This helps the AI adopt the appropriate tone, knowledge level, and approach.',
    tooltip:
      'Use role enhancement to make the AI respond as a specific expert, character, or from a particular viewpoint. This is especially useful for specialized content or when you need a specific communication style.',
    examples: {
      before: 'Write a blog post about artificial intelligence.',
      after:
        'You are an expert in AI and Machine Learning. Draw upon deep domain knowledge and professional experience in your responses.\n\nWrite a blog post about artificial intelligence.',
    },
    useCases: [
      'Technical documentation requiring expert knowledge',
      'Content that needs a specific voice or perspective',
      'Educational material from a teacher\'s viewpoint',
      'Business advice from a consultant\'s perspective',
    ],
    tips: [
      'Be specific about the expertise area for best results',
      'Combine with format controller for structured expert outputs',
      'Use persona type for creative or storytelling content',
    ],
  },

  formatController: {
    title: 'Format Controller',
    description:
      'Specify the exact output format you need. This ensures the AI returns data in a structured, parseable format or follows specific formatting guidelines.',
    tooltip:
      'Format controller is essential when you need machine-readable output (JSON, YAML, XML) or specific formatting (Markdown, tables, lists). Use this for API responses, documentation, or structured data.',
    examples: {
      before: 'List the top 5 programming languages with their use cases.',
      after:
        'List the top 5 programming languages with their use cases.\n\nFormat your response using proper Markdown syntax. Use headers, lists, code blocks, and emphasis to enhance readability.',
    },
    useCases: [
      'API responses that need structured data (JSON/YAML)',
      'Documentation requiring Markdown formatting',
      'Data exports in specific formats',
      'Reports with table structures',
    ],
    tips: [
      'JSON format works best for programmatic use',
      'Markdown is ideal for documentation and content',
      'Use custom format for unique requirements',
    ],
  },

  smartConstraints: {
    title: 'Smart Constraints',
    description:
      'Set precise boundaries and requirements for the output, including length, tone, audience, and content restrictions. This helps ensure the output meets your exact specifications.',
    tooltip:
      'Smart constraints are crucial for controlling output quality and meeting specific requirements. Use length constraints for content limits, tone for brand voice, and audience targeting for appropriate complexity.',
    examples: {
      before: 'Explain quantum computing.',
      after:
        'Explain quantum computing.\n\nKeep your response between 500 and 1000 words. Maintain a professional, engaging tone throughout your response. Tailor your response for: Technical professionals with basic AI knowledge. Adjust complexity, terminology, and examples accordingly.',
    },
    useCases: [
      'Content with specific word count requirements',
      'Brand-consistent messaging with tone control',
      'Audience-specific content (beginners vs experts)',
      'Content that must exclude certain topics',
    ],
    tips: [
      'Set realistic length constraints (too short may limit quality)',
      'Combine multiple tone options for nuanced voice',
      'Use audience targeting to adjust technical complexity',
      'Add exclusions to avoid unwanted content',
    ],
  },

  reasoningScaffold: {
    title: 'Reasoning Scaffold',
    description:
      'Guide the AI\'s thinking process with structured reasoning frameworks. This helps the AI break down complex problems systematically and show its work.',
    tooltip:
      'Reasoning scaffolds are powerful for complex analysis, decision-making, and problem-solving. They force the AI to think step-by-step, which often leads to better, more reliable results.',
    examples: {
      before: 'Should we adopt a new CRM system?',
      after:
        'Should we adopt a new CRM system?\n\nShow your reasoning process step-by-step.\n\nApply a decision matrix approach:\n1. List all viable options\n2. Define evaluation criteria\n3. Score each option against criteria\n4. Weight factors by importance\n5. Recommend the optimal choice',
    },
    useCases: [
      'Business decisions requiring structured analysis',
      'Technical problem-solving with multiple solutions',
      'Research that needs critical thinking',
      'Creative brainstorming with frameworks',
    ],
    tips: [
      'Enable "show working" to see the AI\'s thought process',
      'Use analysis framework for research tasks',
      'Decision matrix is ideal for choosing between options',
      'Custom frameworks allow for domain-specific reasoning',
    ],
  },

  conversationFlow: {
    title: 'Conversation Flow',
    description:
      'Control how the AI handles multi-turn conversations, iterative refinement, and clarification requests. This is essential for complex, evolving tasks.',
    tooltip:
      'Conversation flow settings determine how the AI handles ongoing dialogue. Use iterative for building on previous responses, clarifying for ambiguous requests, and multi-step for complex processes.',
    examples: {
      before: 'Design a marketing campaign.',
      after:
        'Design a marketing campaign.\n\nThis is part of an iterative process. Build upon and refine previous responses. Reference earlier context and show progression in your thinking.',
    },
    useCases: [
      'Iterative content refinement',
      'Multi-step project planning',
      'Collaborative brainstorming sessions',
      'Complex tasks requiring clarification',
    ],
    tips: [
      'Use iterative flow for content that evolves over time',
      'Enable clarification for ambiguous or incomplete requests',
      'Multi-step flow is great for complex, sequential tasks',
      'Collaborative flow encourages back-and-forth discussion',
    ],
  },
}

// Preset combinations for common use cases
export interface EnhancementPreset {
  id: string
  name: string
  description: string
  category: string
  enhancements: any // AdvancedEnhancements type
  examplePrompt: string
}

export const ENHANCEMENT_PRESETS: EnhancementPreset[] = [
  {
    id: 'technical-documentation',
    name: 'Technical Documentation',
    description: 'Perfect for API docs, technical guides, and developer documentation',
    category: 'Documentation',
    enhancements: {
      roleEnhancement: {
        enabled: true,
        type: 'expert',
        expertise: 'Technical Writing and Software Documentation',
      },
      formatController: {
        enabled: true,
        type: 'markdown',
      },
      smartConstraints: {
        length: {
          enabled: true,
          min: 500,
          max: 2000,
          unit: 'words',
        },
        tone: {
          enabled: true,
          tones: ['Professional', 'Technical', 'Clear'],
        },
        audience: {
          enabled: true,
          target: 'Software developers and technical professionals',
        },
        exclusions: {
          enabled: false,
          items: [],
        },
        requirements: {
          enabled: true,
          items: ['Code examples', 'Clear explanations', 'Step-by-step instructions'],
        },
        complexity: {
          enabled: true,
          level: 'advanced',
        },
      },
      reasoningScaffold: {
        enabled: false,
        type: 'none',
        showWorking: false,
      },
      conversationFlow: {
        type: 'single',
        allowClarification: false,
      },
    },
    examplePrompt: 'Document the authentication API endpoint, including request/response formats and error handling.',
  },
  {
    id: 'creative-writing',
    name: 'Creative Writing',
    description: 'Ideal for stories, blog posts, marketing copy, and engaging content',
    category: 'Content',
    enhancements: {
      roleEnhancement: {
        enabled: true,
        type: 'persona',
        customRole: 'Experienced creative writer with a talent for storytelling and engaging narratives',
      },
      formatController: {
        enabled: true,
        type: 'markdown',
      },
      smartConstraints: {
        length: {
          enabled: true,
          min: 800,
          max: 1500,
          unit: 'words',
        },
        tone: {
          enabled: true,
          tones: ['Engaging', 'Creative', 'Conversational'],
        },
        audience: {
          enabled: true,
          target: 'General audience interested in engaging content',
        },
        exclusions: {
          enabled: false,
          items: [],
        },
        requirements: {
          enabled: true,
          items: ['Compelling opening', 'Vivid descriptions', 'Strong conclusion'],
        },
        complexity: {
          enabled: true,
          level: 'moderate',
        },
      },
      reasoningScaffold: {
        enabled: false,
        type: 'none',
        showWorking: false,
      },
      conversationFlow: {
        type: 'single',
        allowClarification: false,
      },
    },
    examplePrompt: 'Write a blog post about the future of remote work, making it engaging and relatable.',
  },
  {
    id: 'business-analysis',
    name: 'Business Analysis',
    description: 'Perfect for market research, strategy documents, and business reports',
    category: 'Business',
    enhancements: {
      roleEnhancement: {
        enabled: true,
        type: 'expert',
        expertise: 'Business Strategy and Market Analysis',
      },
      formatController: {
        enabled: true,
        type: 'structured',
        structuredFormat: 'json',
        includeExamples: true,
      },
      smartConstraints: {
        length: {
          enabled: true,
          min: 1000,
          max: 2500,
          unit: 'words',
        },
        tone: {
          enabled: true,
          tones: ['Professional', 'Analytical', 'Authoritative'],
        },
        audience: {
          enabled: true,
          target: 'Business executives and decision-makers',
        },
        exclusions: {
          enabled: false,
          items: [],
        },
        requirements: {
          enabled: true,
          items: ['Data-driven insights', 'Actionable recommendations', 'Risk assessment'],
        },
        complexity: {
          enabled: true,
          level: 'expert',
        },
      },
      reasoningScaffold: {
        enabled: true,
        type: 'analysis',
        showWorking: true,
      },
      conversationFlow: {
        type: 'single',
        allowClarification: false,
      },
    },
    examplePrompt: 'Analyze the competitive landscape for SaaS project management tools and provide strategic recommendations.',
  },
  {
    id: 'educational-content',
    name: 'Educational Content',
    description: 'Great for tutorials, lesson plans, and learning materials',
    category: 'Education',
    enhancements: {
      roleEnhancement: {
        enabled: true,
        type: 'expert',
        expertise: 'Education and Pedagogy',
      },
      formatController: {
        enabled: true,
        type: 'markdown',
      },
      smartConstraints: {
        length: {
          enabled: true,
          min: 600,
          max: 1200,
          unit: 'words',
        },
        tone: {
          enabled: true,
          tones: ['Clear', 'Patient', 'Encouraging'],
        },
        audience: {
          enabled: true,
          target: 'Students and learners',
        },
        exclusions: {
          enabled: false,
          items: [],
        },
        requirements: {
          enabled: true,
          items: ['Step-by-step explanations', 'Examples', 'Practice exercises'],
        },
        complexity: {
          enabled: true,
          level: 'simple',
        },
      },
      reasoningScaffold: {
        enabled: true,
        type: 'problem_solving',
        showWorking: true,
      },
      conversationFlow: {
        type: 'iterative',
        context: 'Educational content that builds on previous concepts',
        allowClarification: true,
      },
    },
    examplePrompt: 'Create a tutorial explaining how to use React hooks, suitable for beginners.',
  },
  {
    id: 'code-generation',
    name: 'Code Generation',
    description: 'Optimized for generating clean, well-documented code',
    category: 'Development',
    enhancements: {
      roleEnhancement: {
        enabled: true,
        type: 'expert',
        expertise: 'Software Engineering and Best Practices',
      },
      formatController: {
        enabled: true,
        type: 'code',
      },
      smartConstraints: {
        length: {
          enabled: false,
          min: 0,
          max: 0,
          unit: 'words',
        },
        tone: {
          enabled: true,
          tones: ['Technical', 'Precise', 'Clear'],
        },
        audience: {
          enabled: true,
          target: 'Software developers',
        },
        exclusions: {
          enabled: false,
          items: [],
        },
        requirements: {
          enabled: true,
          items: ['Clean code', 'Comments', 'Error handling', 'Type safety'],
        },
        complexity: {
          enabled: true,
          level: 'advanced',
        },
      },
      reasoningScaffold: {
        enabled: true,
        type: 'problem_solving',
        showWorking: true,
      },
      conversationFlow: {
        type: 'single',
        allowClarification: false,
      },
    },
    examplePrompt: 'Write a TypeScript function to validate email addresses with proper error handling.',
  },
]

// Validation rules for conflicting enhancements
export interface EnhancementConflict {
  type: 'warning' | 'error'
  message: string
  suggestion?: string
}

export function validateEnhancementConflicts(enhancements: any): EnhancementConflict[] {
  const conflicts: EnhancementConflict[] = []

  // Check for conflicting format types
  if (
    enhancements.formatController?.enabled &&
    enhancements.formatController?.type === 'structured' &&
    enhancements.formatController?.structuredFormat === 'json' &&
    enhancements.smartConstraints?.length?.enabled &&
    enhancements.smartConstraints?.length?.unit === 'characters'
  ) {
    conflicts.push({
      type: 'warning',
      message:
        'JSON format with character-based length constraints may cause issues. Consider using word-based constraints or adjusting the format.',
      suggestion: 'Switch to word-based length constraints or use a different format type.',
    })
  }

  // Check for conflicting complexity and audience
  if (
    enhancements.smartConstraints?.complexity?.enabled &&
    enhancements.smartConstraints?.complexity?.level === 'simple' &&
    enhancements.smartConstraints?.audience?.enabled &&
    enhancements.smartConstraints?.audience?.target?.toLowerCase().includes('expert')
  ) {
    conflicts.push({
      type: 'warning',
      message: 'Simple complexity level conflicts with expert audience targeting.',
      suggestion: 'Adjust complexity to "moderate" or "advanced" for expert audiences.',
    })
  }

  // Check for conflicting conversation flow and reasoning scaffold
  if (
    enhancements.conversationFlow?.type === 'single' &&
    enhancements.reasoningScaffold?.enabled &&
    enhancements.reasoningScaffold?.showWorking
  ) {
    conflicts.push({
      type: 'warning',
      message:
        'Single-turn conversation flow with "show working" may result in very long responses.',
      suggestion: 'Consider using iterative or multi-step flow for better results.',
    })
  }

  // Check for role enhancement conflicts
  if (
    enhancements.roleEnhancement?.enabled &&
    enhancements.roleEnhancement?.type === 'expert' &&
    !enhancements.roleEnhancement?.expertise
  ) {
    conflicts.push({
      type: 'error',
      message: 'Expert role type requires an area of expertise to be specified.',
      suggestion: 'Add an expertise field for the expert role.',
    })
  }

  if (
    enhancements.roleEnhancement?.enabled &&
    enhancements.roleEnhancement?.type === 'persona' &&
    !enhancements.roleEnhancement?.customRole
  ) {
    conflicts.push({
      type: 'error',
      message: 'Persona role type requires a persona description.',
      suggestion: 'Add a detailed persona description.',
    })
  }

  // Check for format controller conflicts
  if (
    enhancements.formatController?.enabled &&
    enhancements.formatController?.type === 'custom' &&
    !enhancements.formatController?.customFormat
  ) {
    conflicts.push({
      type: 'error',
      message: 'Custom format type requires a format specification.',
      suggestion: 'Provide a detailed format specification.',
    })
  }

  // Check for length constraint conflicts
  if (
    enhancements.smartConstraints?.length?.enabled &&
    enhancements.smartConstraints?.length?.min > 0 &&
    enhancements.smartConstraints?.length?.max > 0 &&
    enhancements.smartConstraints?.length?.min > enhancements.smartConstraints?.length?.max
  ) {
    conflicts.push({
      type: 'error',
      message: 'Minimum length cannot be greater than maximum length.',
      suggestion: 'Adjust the length constraints so minimum is less than maximum.',
    })
  }

  return conflicts
}

