/**
 * Extract template variables from prompt content
 * Finds all {{variable}} patterns
 */
export function extractVariables(content: string): string[] {
  const regex = /{{(\w+)}}/g
  const matches = content.matchAll(regex)
  const variables = new Set<string>()
  
  for (const match of matches) {
    variables.add(match[1])
  }
  
  return Array.from(variables)
}

/**
 * Substitute variables in prompt content
 */
export function substituteVariables(
  content: string,
  variables: Record<string, string>
): string {
  let result = content
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value)
  }
  
  return result
}

/**
 * Generate searchable text from prompt for embedding
 */
export function generateSearchableText(
  title: string,
  content: string,
  description?: string | null,
  tags?: string[] | null
): string {
  const parts = [title, content]
  
  if (description) {
    parts.push(description)
  }
  
  if (tags && tags.length > 0) {
    parts.push(tags.join(' '))
  }
  
  return parts.join(' ')
}

