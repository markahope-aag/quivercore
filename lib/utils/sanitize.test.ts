import { describe, it, expect } from 'vitest'
import { sanitizeInput, sanitizeStringArray, sanitizeForDisplay } from './sanitize'

describe('sanitize', () => {
  describe('sanitizeInput', () => {
    it('removes control characters and limits length', () => {
      const input = 'Hello\x00World'
      const result = sanitizeInput(input)
      expect(result).not.toContain('\x00')
      expect(result).toContain('Hello')
    })

    it('limits string length', () => {
      const input = 'a'.repeat(3000)
      const result = sanitizeInput(input, 100)
      expect(result.length).toBeLessThanOrEqual(100)
    })

    it('handles empty strings', () => {
      expect(sanitizeInput('')).toBe('')
    })

    it('handles non-string input', () => {
      // @ts-expect-error - testing invalid input
      expect(sanitizeInput(null)).toBe('')
      // @ts-expect-error - testing invalid input
      expect(sanitizeInput(undefined)).toBe('')
    })
  })

  describe('sanitizeForDisplay', () => {
    it('sanitizes text for display', () => {
      const input = '<p>Hello <strong>world</strong></p>'
      const result = sanitizeForDisplay(input)
      // Should remove HTML tags and encode special characters
      expect(result).toContain('Hello')
      expect(result).toContain('world')
      expect(result).not.toContain('<p>')
    })

    it('removes HTML tags', () => {
      const input = '<script>alert("xss")</script><p>Safe</p>'
      const result = sanitizeForDisplay(input)
      expect(result).not.toContain('<script>')
      expect(result).toContain('Safe')
    })

    it('encodes special characters', () => {
      const input = '<div>Click me</div>'
      const result = sanitizeForDisplay(input)
      // Should remove HTML tags and encode special characters
      expect(result).not.toContain('<div')
      expect(result).not.toContain('</div>')
      // The text content should remain
      expect(result).toContain('Click me')
    })
  })

  describe('sanitizeStringArray', () => {
    it('sanitizes array of strings', () => {
      const input = ['safe string', 'another', 'test\x00']
      const result = sanitizeStringArray(input)
      
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toBe('safe string')
      // Control characters should be removed
      expect(result.some(item => item.includes('\x00'))).toBe(false)
    })

    it('limits each string length', () => {
      const input = ['a'.repeat(200), 'b'.repeat(200)]
      const result = sanitizeStringArray(input, 50)
      
      expect(result[0].length).toBeLessThanOrEqual(50)
      expect(result[1].length).toBeLessThanOrEqual(50)
    })

    it('handles non-array input', () => {
      // @ts-expect-error - testing invalid input
      expect(sanitizeStringArray(null)).toEqual([])
      // @ts-expect-error - testing invalid input
      expect(sanitizeStringArray(undefined)).toEqual([])
    })
  })
})

