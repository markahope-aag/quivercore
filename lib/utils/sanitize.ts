/**
 * Input sanitization utilities for XSS prevention
 * Provides functions to sanitize user inputs before rendering or storing
 */

/**
 * Sanitizes HTML content by removing potentially dangerous tags and attributes
 * For display purposes only - use DOMPurify for more complex scenarios
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  // Remove data: URLs that could contain scripts
  sanitized = sanitized.replace(/data:text\/html/gi, '')
  
  return sanitized.trim()
}

/**
 * Sanitizes plain text by removing HTML tags and encoding special characters
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  // Remove HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '')
  
  // Encode special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
  
  return sanitized.trim()
}

/**
 * Sanitizes a string for use in HTML attributes
 */
export function sanitizeAttribute(value: string): string {
  if (!value || typeof value !== 'string') {
    return ''
  }

  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

/**
 * Sanitizes user input for database storage
 * Removes null bytes, trims whitespace, and limits length
 */
export function sanitizeInput(input: string, maxLength: number = 10000): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters except newlines/tabs
    .trim()
    .slice(0, maxLength)
}

/**
 * Sanitizes an array of strings
 */
export function sanitizeStringArray(arr: string[] | null | undefined, maxLength: number = 1000): string[] {
  if (!Array.isArray(arr)) {
    return []
  }

  return arr
    .filter((item): item is string => typeof item === 'string')
    .map((item) => sanitizeInput(item, maxLength))
    .filter((item) => item.length > 0)
}

/**
 * Validates and sanitizes a URL
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  try {
    const parsed = new URL(url)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }

    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Sanitizes content for display in React components
 * Returns a safe string that can be rendered directly
 */
export function sanitizeForDisplay(content: string): string {
  if (!content || typeof content !== 'string') {
    return ''
  }

  // For React, we typically just need to ensure no dangerous HTML
  // React escapes by default, but we'll be extra safe
  return sanitizeText(content)
}

/**
 * Validates email format and sanitizes
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null
  }

  const sanitized = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(sanitized)) {
    return null
  }

  // Limit length
  if (sanitized.length > 254) {
    return null
  }

  return sanitized
}

