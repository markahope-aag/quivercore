/**
 * Comprehensive Framework Details
 * Rich metadata for each prompt engineering framework
 */

export interface FrameworkDetail {
  name: string
  description: string
  purpose: string
  bestFor: string[]
  examples: string[]
  worksWellWith: string[]
  icon: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
}

export const FRAMEWORK_DETAILS: Record<string, FrameworkDetail> = {
  'role-based': {
    name: 'Role-Based',
    description: 'Assigns AI specific expertise and authority',
    purpose: 'Creates focused, expert-level responses from a defined perspective',
    bestFor: ['Expert advice', 'Professional analysis', 'Domain-specific insights'],
    examples: [
      'You are a senior software architect with 12 years experience designing scalable systems...',
      'You are a pediatric nurse with expertise in patient education...',
      'You are a financial advisor specializing in retirement planning for teachers...',
      'You are a seasoned chef who has worked in Michelin-starred restaurants...',
    ],
    worksWellWith: ['Chain-of-Thought', 'Analytical'],
    icon: 'UserCheck',
    difficulty: 'Beginner',
  },
  'few-shot': {
    name: 'Few-Shot Learning',
    description: 'Provides examples to guide AI output format and style',
    purpose: 'Ensures consistent formatting and approach across responses',
    bestFor: ['Consistent formatting', 'Specific output styles', 'Complex structures'],
    examples: [
      'Here are 3 examples of clear bug reports: [examples]... Now write one for this issue...',
      'Here are examples of patient intake forms: [examples]... Create one for dental offices...',
      'Here are 3 lesson plan formats: [examples]... Create one for teaching fractions...',
      'Here are examples of legal contract clauses: [examples]... Draft one for freelance work...',
    ],
    worksWellWith: ['Verbalized Sampling', 'Template-based'],
    icon: 'List',
    difficulty: 'Intermediate',
  },
  'chain-of-thought': {
    name: 'Chain-of-Thought',
    description: 'Asks AI to show step-by-step reasoning process',
    purpose: 'Provides transparent logic and improves complex problem-solving',
    bestFor: ['Complex problems', 'Multi-step processes', 'Transparent reasoning'],
    examples: [
      'Diagnose this network connectivity issue step-by-step, explaining each troubleshooting step...',
      'Walk through the patient assessment process, explaining your clinical reasoning at each stage...',
      'Analyze this legal case step-by-step, showing how you evaluate each piece of evidence...',
      'Plan this construction project phase by phase, explaining dependencies and decisions...',
    ],
    worksWellWith: ['Verbalized Sampling', 'Role-Based'],
    icon: 'GitBranch',
    difficulty: 'Beginner',
  },
  'generative': {
    name: 'Generative',
    description: 'Open-ended creative generation without constraints',
    purpose: 'Maximizes creative output and explores possibilities',
    bestFor: ['Brainstorming', 'Creative content', 'Ideation'],
    examples: [
      'Generate innovative app features for elderly users who want to stay connected with family...',
      'Create diverse treatment approaches for patients with chronic pain...',
      'Brainstorm engaging science experiments for 4th graders studying magnetism...',
      'Generate cost-effective home renovation ideas for first-time buyers...',
    ],
    worksWellWith: ['Verbalized Sampling', 'Comparative'],
    icon: 'Sparkles',
    difficulty: 'Beginner',
  },
  'analytical': {
    name: 'Analytical',
    description: 'Structured breakdown and systematic analysis',
    purpose: 'Organizes information and provides methodical evaluation',
    bestFor: ['Data interpretation', 'Systematic review', 'Problem diagnosis'],
    examples: [
      "Analyze this codebase's performance bottlenecks by examining architecture, algorithms, and data flow...",
      "Evaluate this patient's symptoms by reviewing vitals, history, and test results systematically...",
      "Assess this nonprofit's grant proposal by analyzing budget, impact metrics, and sustainability...",
      "Review this building's structural issues by examining foundation, framing, and environmental factors...",
    ],
    worksWellWith: ['Chain-of-Thought', 'Comparative'],
    icon: 'BarChart3',
    difficulty: 'Intermediate',
  },
  'comparative': {
    name: 'Comparative',
    description: 'Evaluates multiple options against defined criteria',
    purpose: 'Provides structured comparison and recommendation framework',
    bestFor: ['Decision making', 'Option evaluation', 'Trade-off analysis'],
    examples: [
      'Compare React, Vue, and Angular for building a real-time dashboard, evaluating performance, learning curve, and ecosystem...',
      'Evaluate different physical therapy approaches for ACL recovery, comparing timeline, effectiveness, and patient compliance...',
      'Compare homeschooling curricula for gifted children, analyzing academic rigor, flexibility, and social development...',
      'Assess investment portfolio options for a 30-year-old teacher, comparing risk, returns, and liquidity...',
    ],
    worksWellWith: ['Analytical', 'Verbalized Sampling'],
    icon: 'Scale',
    difficulty: 'Intermediate',
  },
  'template-fill': {
    name: 'Template/Fill-in',
    description: 'Provides structured templates with specific placeholders',
    purpose: 'Creates consistent, professional outputs with variable content',
    bestFor: ['Standardized documents', 'Repeatable processes', 'Form generation'],
    examples: [
      'Create an employee performance review template with sections for [GOALS], [ACHIEVEMENTS], [AREAS FOR IMPROVEMENT]...',
      'Generate a patient discharge summary with [DIAGNOSIS], [TREATMENT_RECEIVED], [FOLLOW_UP_INSTRUCTIONS]...',
      'Design a lesson plan template with [LEARNING_OBJECTIVE], [ACTIVITIES], [ASSESSMENT_METHOD]...',
      'Create a project proposal template with [PROBLEM_STATEMENT], [SOLUTION_APPROACH], [TIMELINE], [BUDGET]...',
    ],
    worksWellWith: ['Few-Shot', 'Constraint-Based'],
    icon: 'FileTemplate',
    difficulty: 'Beginner',
  },
  'constraint-based': {
    name: 'Constraint-Based',
    description: 'Applies specific rules and limitations to guide output',
    purpose: 'Ensures compliance with requirements, standards, or limitations',
    bestFor: ['Regulatory compliance', 'Limited resources', 'Specific requirements'],
    examples: [
      'Design a database schema using only open-source technologies, maximum 5 tables, GDPR compliant...',
      'Create a treatment plan using only non-pharmaceutical interventions, within insurance coverage limits...',
      'Develop a curriculum that meets state standards, uses existing textbooks, fits 20-week semester...',
      'Plan an event with $5000 budget, 50-person capacity, wheelchair accessible venue...',
    ],
    worksWellWith: ['Analytical', 'Template-based'],
    icon: 'Lock',
    difficulty: 'Advanced',
  },
  'iterative': {
    name: 'Iterative/Multi-Turn',
    description: 'Builds solution through conversational refinement',
    purpose: 'Develops complex outputs through iterative improvement',
    bestFor: ['Complex projects', 'Collaborative refinement', 'Evolving requirements'],
    examples: [
      'Let\'s develop an API design together. Start with core endpoints, then we\'ll refine based on use cases...',
      'Help me create a physical therapy protocol. We\'ll start broad, then customize based on patient feedback...',
      'Design a marketing campaign iteratively. First the concept, then messaging, then channel strategy...',
      'Build a lesson unit step-by-step. Begin with learning objectives, then activities, then assessments...',
    ],
    worksWellWith: ['Role-Based', 'Generative'],
    icon: 'RefreshCw',
    difficulty: 'Advanced',
  },
  'transformation': {
    name: 'Transformation',
    description: 'Convert format, style, or structure of existing content',
    purpose: 'Adapts content for different audiences, mediums, or purposes',
    bestFor: ['Format conversion', 'Audience adaptation', 'Style changes'],
    examples: [
      'Transform this technical API documentation into a beginner-friendly tutorial with examples...',
      'Convert this medical research paper into patient education material at 6th grade reading level...',
      'Rewrite this legal contract in plain language while maintaining all key terms...',
      'Transform this written recipe into a step-by-step video script with timing and visual cues...',
    ],
    worksWellWith: ['Template-based', 'Few-Shot'],
    icon: 'ArrowRightLeft',
    difficulty: 'Intermediate',
  },
}

/**
 * Domain-based framework recommendations
 */
export interface DomainRecommendation {
  keywords: string[]
  frameworks: string[]
  reasoning?: string
}

export const DOMAIN_RECOMMENDATIONS: Record<string, DomainRecommendation> = {
  'Business & Strategy': {
    keywords: ['strategy', 'analysis', 'market', 'competitive', 'plan', 'growth', 'revenue'],
    frameworks: ['analytical', 'chain-of-thought', 'comparative'],
    reasoning: 'Business decisions benefit from structured analysis and comparison',
  },
  'Marketing & Sales': {
    keywords: ['campaign', 'creative', 'content', 'brand', 'audience', 'conversion', 'engagement'],
    frameworks: ['generative', 'few-shot', 'role-based'],
    reasoning: 'Marketing requires creativity and consistent messaging',
  },
  'Code & Development': {
    keywords: ['software', 'app', 'system', 'technical', 'algorithm', 'code', 'debug'],
    frameworks: ['analytical', 'comparative', 'few-shot'],
    reasoning: 'Development benefits from examples and systematic problem-solving',
  },
  'Education & Training': {
    keywords: ['teach', 'learn', 'curriculum', 'student', 'assessment', 'lesson', 'instruction'],
    frameworks: ['template-fill', 'few-shot', 'generative'],
    reasoning: 'Education needs structured templates and creative examples',
  },
  'Research & Learning': {
    keywords: ['research', 'study', 'analyze', 'investigate', 'explore', 'data', 'findings'],
    frameworks: ['analytical', 'chain-of-thought', 'comparative'],
    reasoning: 'Research requires systematic analysis and transparent reasoning',
  },
  'Creative & Design': {
    keywords: ['creative', 'design', 'innovative', 'artistic', 'visual', 'aesthetic', 'concept'],
    frameworks: ['generative', 'comparative', 'few-shot'],
    reasoning: 'Creative work benefits from ideation and style examples',
  },
  'Technical Writing': {
    keywords: ['documentation', 'guide', 'manual', 'instructions', 'process', 'tutorial', 'reference'],
    frameworks: ['template-fill', 'few-shot', 'constraint-based'],
    reasoning: 'Technical writing needs consistent structure and clear constraints',
  },
  'Legal & Compliance': {
    keywords: ['legal', 'contract', 'policy', 'compliance', 'regulation', 'terms', 'agreement'],
    frameworks: ['constraint-based', 'template-fill', 'analytical'],
    reasoning: 'Legal work requires strict compliance and standardized formats',
  },
  'HR & Recruiting': {
    keywords: ['hiring', 'employee', 'team', 'performance', 'culture', 'interview', 'candidate'],
    frameworks: ['template-fill', 'role-based', 'comparative'],
    reasoning: 'HR benefits from standardized processes and evaluation frameworks',
  },
  'Finance & Accounting': {
    keywords: ['budget', 'financial', 'investment', 'cost', 'revenue', 'forecast', 'analysis'],
    frameworks: ['analytical', 'comparative', 'constraint-based'],
    reasoning: 'Finance requires systematic analysis within regulatory constraints',
  },
  'Healthcare & Medical': {
    keywords: ['patient', 'medical', 'clinical', 'diagnosis', 'treatment', 'care', 'health'],
    frameworks: ['analytical', 'chain-of-thought', 'constraint-based'],
    reasoning: 'Healthcare needs systematic reasoning within evidence-based guidelines',
  },
  'Customer Service': {
    keywords: ['support', 'customer', 'help', 'service', 'issue', 'resolution', 'satisfaction'],
    frameworks: ['role-based', 'template-fill', 'few-shot'],
    reasoning: 'Customer service needs empathetic expertise and consistent responses',
  },
}

/**
 * Get recommended frameworks based on domain and target outcome
 */
export function getRecommendedFrameworks(
  domain?: string,
  targetOutcome?: string
): string[] {
  if (!domain && !targetOutcome) {
    return ['role-based', 'chain-of-thought', 'generative'] // Beginner-friendly defaults
  }

  const recommendations: Set<string> = new Set()

  // Check domain match
  if (domain && DOMAIN_RECOMMENDATIONS[domain]) {
    DOMAIN_RECOMMENDATIONS[domain].frameworks.forEach((f) => recommendations.add(f))
  }

  // Check target outcome keywords
  if (targetOutcome) {
    const lowerOutcome = targetOutcome.toLowerCase()
    Object.entries(DOMAIN_RECOMMENDATIONS).forEach(([_, rec]) => {
      const matchedKeywords = rec.keywords.filter((keyword) =>
        lowerOutcome.includes(keyword)
      )
      if (matchedKeywords.length > 0) {
        rec.frameworks.forEach((f) => recommendations.add(f))
      }
    })
  }

  return Array.from(recommendations).slice(0, 3) // Top 3 recommendations
}

/**
 * Get framework detail by key
 */
export function getFrameworkDetail(key: string): FrameworkDetail | undefined {
  const normalizedKey = key.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-')
  return FRAMEWORK_DETAILS[normalizedKey]
}

/**
 * Get all framework keys
 */
export function getAllFrameworkKeys(): string[] {
  return Object.keys(FRAMEWORK_DETAILS)
}
