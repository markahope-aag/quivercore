/**
 * Comprehensive Framework Data Structure
 * Detailed information about each prompt engineering framework
 */

import { 
  UserCheck, List, GitBranch, FileText, Lock, 
  RefreshCw, Scale, Sparkles, Search, Repeat 
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface FrameworkInfo {
  name: string
  description: string
  purpose: string
  bestFor: string[]
  examples: string[]
  worksWellWith: string[]
  icon: LucideIcon
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
}

export const FRAMEWORKS_DETAILED: Record<string, FrameworkInfo> = {
  'Role-Based': {
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
    icon: UserCheck,
    difficulty: 'Beginner',
  },
  'Few-Shot': {
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
    worksWellWith: ['Verbalized Sampling', 'Template/Fill-in'],
    icon: List,
    difficulty: 'Intermediate',
  },
  'Chain-of-Thought': {
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
    icon: GitBranch,
    difficulty: 'Beginner',
  },
  'Template/Fill-in': {
    name: 'Template/Fill-in',
    description: 'Uses structured format with placeholders for specific information',
    purpose: 'Ensures consistent structure and completeness of responses',
    bestFor: ['Structured documents', 'Forms and templates', 'Standardized outputs'],
    examples: [
      'Fill in this project proposal template: [template]... Use the following information: [data]...',
      'Complete this patient assessment form: [form]... Based on: [patient info]...',
      'Fill out this lesson plan template: [template]... For topic: [subject]...',
      'Complete this contract template: [template]... With terms: [details]...',
    ],
    worksWellWith: ['Few-Shot', 'Constraint-Based'],
    icon: FileText,
    difficulty: 'Beginner',
  },
  'Constraint-Based': {
    name: 'Constraint-Based',
    description: 'Applies specific rules, limitations, or boundaries to responses',
    purpose: 'Ensures responses meet specific requirements or constraints',
    bestFor: ['Compliance requirements', 'Format constraints', 'Specific limitations'],
    examples: [
      'Write a bug report that is exactly 200 words, uses technical terminology, and includes severity rating...',
      'Create a patient note that follows HIPAA guidelines, uses medical terminology, and is under 500 words...',
      'Draft a lesson plan that aligns with Common Core standards, is 45 minutes long, and includes assessment...',
      'Write a contract clause that is legally binding, under 300 words, and covers liability...',
    ],
    worksWellWith: ['Template/Fill-in', 'Analytical'],
    icon: Lock,
    difficulty: 'Intermediate',
  },
  'Iterative/Multi-Turn': {
    name: 'Iterative/Multi-Turn',
    description: 'Builds responses through multiple conversation turns',
    purpose: 'Allows refinement and development of complex ideas over time',
    bestFor: ['Complex projects', 'Iterative refinement', 'Collaborative development'],
    examples: [
      'First, outline the system architecture. Then, we\'ll refine each component in subsequent steps...',
      'Start with a high-level treatment plan. Then, we\'ll detail each phase...',
      'Begin with a curriculum overview. Then, we\'ll develop each unit...',
      'Draft the initial contract terms. Then, we\'ll negotiate specific clauses...',
    ],
    worksWellWith: ['Chain-of-Thought', 'Generative'],
    icon: RefreshCw,
    difficulty: 'Advanced',
  },
  'Comparative': {
    name: 'Comparative',
    description: 'Analyzes and compares multiple options or perspectives',
    purpose: 'Provides balanced evaluation of alternatives',
    bestFor: ['Decision making', 'Option evaluation', 'Comparative analysis'],
    examples: [
      'Compare these three database solutions: [options]... Evaluate based on: [criteria]...',
      'Compare these treatment approaches: [options]... Consider: [factors]...',
      'Compare these teaching methods: [options]... For: [context]...',
      'Compare these contract structures: [options]... For: [use case]...',
    ],
    worksWellWith: ['Analytical', 'Chain-of-Thought'],
    icon: Scale,
    difficulty: 'Intermediate',
  },
  'Generative': {
    name: 'Generative',
    description: 'Creates new content from scratch without existing templates',
    purpose: 'Enables creative and original content generation',
    bestFor: ['Creative content', 'Original ideas', 'Innovation'],
    examples: [
      'Generate 5 unique feature ideas for a productivity app that haven\'t been done before...',
      'Create a novel patient engagement strategy for a rural clinic...',
      'Design an innovative curriculum for teaching coding to 8-year-olds...',
      'Draft a creative marketing campaign for a sustainable fashion brand...',
    ],
    worksWellWith: ['Role-Based', 'Iterative/Multi-Turn'],
    icon: Sparkles,
    difficulty: 'Intermediate',
  },
  'Analytical': {
    name: 'Analytical',
    description: 'Breaks down and examines existing content or problems',
    purpose: 'Provides deep understanding through systematic analysis',
    bestFor: ['Problem analysis', 'Content breakdown', 'Systematic examination'],
    examples: [
      'Analyze this codebase architecture: [code]... Identify: [aspects]...',
      'Analyze this patient case: [case]... Examine: [factors]...',
      'Analyze this curriculum: [curriculum]... Evaluate: [elements]...',
      'Analyze this contract: [contract]... Review: [sections]...',
    ],
    worksWellWith: ['Chain-of-Thought', 'Comparative'],
    icon: Search,
    difficulty: 'Beginner',
  },
  'Transformation': {
    name: 'Transformation',
    description: 'Converts format, style, or structure of existing content',
    purpose: 'Adapts content for different contexts or requirements',
    bestFor: ['Format conversion', 'Style adaptation', 'Content restructuring'],
    examples: [
      'Transform this technical documentation into a beginner-friendly tutorial...',
      'Convert this medical report into patient-friendly language...',
      'Transform this research paper into a lesson plan for high school students...',
      'Convert this legal document into plain language for consumers...',
    ],
    worksWellWith: ['Role-Based', 'Template/Fill-in'],
    icon: Repeat,
    difficulty: 'Intermediate',
  },
}

/**
 * Get recommended frameworks based on domain and target outcome
 */
export function getRecommendedFrameworks(
  domain?: string,
  targetOutcome?: string
): string[] {
  const recommendations: string[] = []

  const outcome = (targetOutcome || '').toLowerCase()
  const domainLower = (domain || '').toLowerCase()

  // If no inputs, return default recommendations
  if (!domain && !targetOutcome) {
    return ['Role-Based', 'Chain-of-Thought', 'Analytical']
  }

  // Analysis-related outcomes
  if (
    outcome.includes('analyze') ||
    outcome.includes('examine') ||
    outcome.includes('evaluate') ||
    outcome.includes('review')
  ) {
    recommendations.push('Analytical', 'Chain-of-Thought')
  }

  // Comparison-related outcomes
  if (
    outcome.includes('compare') ||
    outcome.includes('contrast') ||
    outcome.includes('versus') ||
    outcome.includes('options')
  ) {
    recommendations.push('Comparative', 'Analytical')
  }

  // Creative/generative outcomes
  if (
    outcome.includes('create') ||
    outcome.includes('generate') ||
    outcome.includes('design') ||
    outcome.includes('innovative') ||
    outcome.includes('creative')
  ) {
    recommendations.push('Generative', 'Role-Based')
  }

  // Product launch and marketing outcomes
  if (
    outcome.includes('launch') ||
    outcome.includes('product') ||
    outcome.includes('campaign') ||
    outcome.includes('marketing') ||
    outcome.includes('brand') ||
    outcome.includes('market') ||
    outcome.includes('promote') ||
    outcome.includes('advertise')
  ) {
    recommendations.push('Generative', 'Role-Based', 'Few-Shot')
  }

  // Food, beverage, and consumer products
  if (
    outcome.includes('food') ||
    outcome.includes('beverage') ||
    outcome.includes('coffee') ||
    outcome.includes('restaurant') ||
    outcome.includes('culinary') ||
    outcome.includes('recipe') ||
    outcome.includes('ingredient') ||
    outcome.includes('consumer product') ||
    outcome.includes('retail product')
  ) {
    recommendations.push('Role-Based', 'Generative', 'Few-Shot')
  }

  // Business strategy and planning
  if (
    outcome.includes('strategy') ||
    outcome.includes('plan') ||
    outcome.includes('business') ||
    outcome.includes('go-to-market') ||
    outcome.includes('gtm') ||
    outcome.includes('positioning') ||
    outcome.includes('competitive')
  ) {
    recommendations.push('Role-Based', 'Analytical', 'Chain-of-Thought')
  }

  // Step-by-step or process outcomes
  if (
    outcome.includes('step') ||
    outcome.includes('process') ||
    outcome.includes('guide') ||
    outcome.includes('walkthrough')
  ) {
    recommendations.push('Chain-of-Thought', 'Iterative/Multi-Turn')
  }

  // Template/form outcomes
  if (
    outcome.includes('template') ||
    outcome.includes('form') ||
    outcome.includes('fill') ||
    outcome.includes('structure')
  ) {
    recommendations.push('Template/Fill-in', 'Few-Shot')
  }

  // Domain-specific recommendations (check against actual domain values)
  if (
    domainLower.includes('code') ||
    domainLower.includes('development') ||
    domainLower.includes('technical') ||
    domainLower.includes('software') ||
    domainLower.includes('tech')
  ) {
    if (!recommendations.includes('Role-Based')) recommendations.push('Role-Based')
    if (!recommendations.includes('Chain-of-Thought')) recommendations.push('Chain-of-Thought')
  }

  if (
    domainLower.includes('medical') ||
    domainLower.includes('healthcare') ||
    domainLower.includes('health')
  ) {
    if (!recommendations.includes('Template/Fill-in')) recommendations.push('Template/Fill-in')
    if (!recommendations.includes('Analytical')) recommendations.push('Analytical')
  }

  if (
    domainLower.includes('education') ||
    domainLower.includes('teaching') ||
    domainLower.includes('training') ||
    domainLower.includes('learning')
  ) {
    if (!recommendations.includes('Few-Shot')) recommendations.push('Few-Shot')
    if (!recommendations.includes('Generative')) recommendations.push('Generative')
  }

  if (
    domainLower.includes('legal') ||
    domainLower.includes('compliance') ||
    domainLower.includes('law')
  ) {
    if (!recommendations.includes('Constraint-Based')) recommendations.push('Constraint-Based')
    if (!recommendations.includes('Template/Fill-in')) recommendations.push('Template/Fill-in')
  }

  if (
    domainLower.includes('business') ||
    domainLower.includes('strategy') ||
    domainLower.includes('marketing') ||
    domainLower.includes('sales') ||
    domainLower.includes('product')
  ) {
    if (!recommendations.includes('Role-Based')) recommendations.push('Role-Based')
    if (!recommendations.includes('Generative')) recommendations.push('Generative')
    if (!recommendations.includes('Chain-of-Thought')) recommendations.push('Chain-of-Thought')
  }

  if (
    domainLower.includes('writing') ||
    domainLower.includes('content') ||
    domainLower.includes('creative') ||
    domainLower.includes('design')
  ) {
    if (!recommendations.includes('Generative')) recommendations.push('Generative')
    if (!recommendations.includes('Role-Based')) recommendations.push('Role-Based')
  }

  if (
    domainLower.includes('data') ||
    domainLower.includes('analysis') ||
    domainLower.includes('research')
  ) {
    if (!recommendations.includes('Analytical')) recommendations.push('Analytical')
    if (!recommendations.includes('Chain-of-Thought')) recommendations.push('Chain-of-Thought')
  }

  // Consumer products and retail
  if (
    domainLower.includes('retail') ||
    domainLower.includes('consumer') ||
    domainLower.includes('product') ||
    domainLower.includes('food') ||
    domainLower.includes('beverage')
  ) {
    if (!recommendations.includes('Role-Based')) recommendations.push('Role-Based')
    if (!recommendations.includes('Generative')) recommendations.push('Generative')
    if (!recommendations.includes('Few-Shot')) recommendations.push('Few-Shot')
  }

  // If still no recommendations, provide defaults based on what we have
  if (recommendations.length === 0) {
    if (domain) {
      // Domain provided but no matches - return general defaults
      return ['Role-Based', 'Chain-of-Thought', 'Analytical']
    }
    if (targetOutcome) {
      // Target outcome provided but no matches - return general defaults
      return ['Role-Based', 'Chain-of-Thought', 'Generative']
    }
  }

  // Remove duplicates and return
  return Array.from(new Set(recommendations)).slice(0, 3) // Return top 3 recommendations
}

