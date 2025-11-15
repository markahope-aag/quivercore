// Prompt optimization utilities

export interface OptimizationSuggestion {
  type: 'clarity' | 'specificity' | 'structure' | 'length' | 'tone' | 'effectiveness'
  severity: 'low' | 'medium' | 'high'
  message: string
  suggestion: string
}

export interface PromptAnalysis {
  score: number // 0-100
  wordCount: number
  characterCount: number
  suggestions: OptimizationSuggestion[]
  strengths: string[]
  readabilityScore: number
}

export function analyzePromptQuality(prompt: string): PromptAnalysis {
  const suggestions: OptimizationSuggestion[] = []
  const strengths: string[] = []

  const wordCount = prompt.trim().split(/\s+/).length
  const characterCount = prompt.length

  // Check prompt length
  if (wordCount < 10) {
    suggestions.push({
      type: 'length',
      severity: 'high',
      message: 'Prompt is very short',
      suggestion: 'Add more context and detail to help the AI understand your needs better.',
    })
  } else if (wordCount > 500) {
    suggestions.push({
      type: 'length',
      severity: 'medium',
      message: 'Prompt is quite long',
      suggestion: 'Consider breaking this into smaller, focused prompts or using structured sections.',
    })
  } else {
    strengths.push('Good length for detailed responses')
  }

  // Check for questions
  const hasQuestions = /\?/g.test(prompt)
  if (hasQuestions) {
    strengths.push('Contains clear questions')
  }

  // Check for vague terms
  const vagueTerms = ['something', 'things', 'stuff', 'maybe', 'kind of', 'sort of']
  const hasVagueTerms = vagueTerms.some((term) => prompt.toLowerCase().includes(term))
  if (hasVagueTerms) {
    suggestions.push({
      type: 'specificity',
      severity: 'medium',
      message: 'Contains vague language',
      suggestion: 'Replace vague terms with specific details for better results.',
    })
  }

  // Check for structure
  const hasNumberedList = /\d+\.|^\d+\)/gm.test(prompt)
  const hasBulletPoints = /^[-*•]/gm.test(prompt)
  if (hasNumberedList || hasBulletPoints) {
    strengths.push('Well-structured with lists')
  }

  // Check for examples
  const hasExamples = /example|for instance|such as|e\.g\./gi.test(prompt)
  if (hasExamples) {
    strengths.push('Includes examples for clarity')
  }

  // Check for action verbs
  const actionVerbs = [
    'create',
    'generate',
    'write',
    'analyze',
    'explain',
    'summarize',
    'compare',
    'list',
    'describe',
    'evaluate',
  ]
  const hasActionVerbs = actionVerbs.some((verb) =>
    prompt.toLowerCase().includes(verb)
  )
  if (hasActionVerbs) {
    strengths.push('Uses clear action verbs')
  } else {
    suggestions.push({
      type: 'clarity',
      severity: 'medium',
      message: 'Missing clear action verbs',
      suggestion: 'Start with action verbs like "create", "analyze", or "explain" to clarify intent.',
    })
  }

  // Check for context
  const contextIndicators = ['because', 'for', 'to help', 'in order to', 'context:', 'background:']
  const hasContext = contextIndicators.some((indicator) =>
    prompt.toLowerCase().includes(indicator)
  )
  if (hasContext) {
    strengths.push('Provides helpful context')
  }

  // Calculate readability (simplified Flesch reading ease)
  const sentences = prompt.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
  const avgWordsPerSentence = wordCount / Math.max(sentences, 1)
  const avgCharsPerWord = characterCount / Math.max(wordCount, 1)

  let readabilityScore = 100
  if (avgWordsPerSentence > 25) readabilityScore -= 20
  if (avgCharsPerWord > 6) readabilityScore -= 15

  // Calculate overall score
  let score = 70 // Base score

  // Add points for strengths
  score += strengths.length * 5

  // Deduct points for suggestions
  suggestions.forEach((s) => {
    if (s.severity === 'high') score -= 15
    else if (s.severity === 'medium') score -= 10
    else score -= 5
  })

  score = Math.max(0, Math.min(100, score))

  return {
    score,
    wordCount,
    characterCount,
    suggestions,
    strengths,
    readabilityScore,
  }
}

export function optimizePrompt(prompt: string): string {
  // Basic optimization: clean up whitespace and formatting
  let optimized = prompt.trim()

  // Remove excessive whitespace
  optimized = optimized.replace(/\s+/g, ' ')

  // Ensure proper sentence spacing
  optimized = optimized.replace(/\.\s+/g, '. ')

  // Remove redundant phrases
  const redundantPhrases = [
    'please be sure to ',
    'make sure to ',
    'don\'t forget to ',
    'I would like you to ',
  ]
  redundantPhrases.forEach((phrase) => {
    optimized = optimized.replace(new RegExp(phrase, 'gi'), '')
  })

  return optimized
}

export function generatePromptVariations(basePrompt: string, count: number = 3): string[] {
  const variations: string[] = []

  // Variation 1: More concise
  variations.push(optimizePrompt(basePrompt))

  // Variation 2: More detailed
  variations.push(`${basePrompt}\n\nPlease provide a comprehensive response with examples and explanations.`)

  // Variation 3: Step-by-step focused
  variations.push(`${basePrompt}\n\nBreak down your response into clear, actionable steps.`)

  return variations.slice(0, count)
}

export function estimateTokenCount(text: string): number {
  // Rough estimation: ~4 characters per token on average
  return Math.ceil(text.length / 4)
}

export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  model: 'claude-3-5-sonnet' | 'claude-3-opus' | 'claude-3-haiku' = 'claude-3-5-sonnet'
): number {
  // Pricing per 1M tokens (as of 2024)
  const pricing = {
    'claude-3-5-sonnet': { input: 3.0, output: 15.0 },
    'claude-3-opus': { input: 15.0, output: 75.0 },
    'claude-3-haiku': { input: 0.25, output: 1.25 },
  }

  const rates = pricing[model]
  const inputCost = (inputTokens / 1000000) * rates.input
  const outputCost = (outputTokens / 1000000) * rates.output

  return inputCost + outputCost
}
