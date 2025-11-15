export const CATEGORIES_BY_TYPE: Record<string, string[]> = {
  ai_prompt: [
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
    'Legal & Compliance',
    'HR & Recruiting',
    'Finance & Accounting',
    'Customer Support',
    'SEO & Search',
    'Social Media',
  ],
  email_template: [
    'Welcome',
    'Follow-up',
    'Newsletter',
    'Promotional',
    'Transactional',
    'Support',
    'Onboarding',
    'Announcement',
  ],
  snippet: [
    'Code',
    'Configuration',
    'Command',
    'Template',
    'Query',
    'Script',
  ],
  other: [
    'General',
    'Custom',
  ],
}

export const TYPE_LABELS: Record<string, string> = {
  ai_prompt: 'AI Prompts',
  email_template: 'Email Templates',
  snippet: 'Snippets',
  other: 'Other',
}

export function getCategoriesForType(type: string): string[] {
  return CATEGORIES_BY_TYPE[type] || []
}

export function getTypeLabel(type: string): string {
  return TYPE_LABELS[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

