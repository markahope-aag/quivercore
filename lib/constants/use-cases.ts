// Use-case categories for prompts
// These are independent of prompt type and represent the specific use-case or application

export const USE_CASES = [
  // Core Categories
  'Writing & Content',
  'Business & Strategy',
  'Code & Development',
  'Data & Analysis',
  'Research & Learning',
  'Marketing & Sales',
  'Creative & Design',
  'Communication',
  'Productivity & Planning',
  'Education & Training',
  'Technical Writing',

  // Specialized Categories
  'Legal & Compliance',
  'HR & Recruiting',
  'Finance & Accounting',
  'Customer Support',
  'SEO & Search',
  'Social Media',

  // Meta Categories
  'Templates',
  'Frameworks',
  'Multi-step Workflows',
] as const

export type UseCase = typeof USE_CASES[number]

// Helper function to check if a string is a valid use-case
export function isValidUseCase(value: string): value is UseCase {
  return USE_CASES.includes(value as UseCase)
}

// Get all use-cases as a simple array
export function getUseCases(): readonly string[] {
  return USE_CASES
}
