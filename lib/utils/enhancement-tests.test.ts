import { describe, it, expect } from 'vitest'
import {
  runAllTests,
  runAllIndividualTests,
  runAllCombinationTests,
  testCompleteFlow,
  validatePromptQuality,
  INDIVIDUAL_ENHANCEMENT_TESTS,
  COMBINATION_TESTS,
} from './enhancement-tests'
import { DEFAULT_ADVANCED_ENHANCEMENTS } from '@/src/constants/enhancements'

describe('Enhancement Tests', () => {
  describe('Individual Enhancement Tests', () => {
    it('should run all individual tests', () => {
      const results = runAllIndividualTests()
      expect(results).toBeDefined()
      expect(results.length).toBeGreaterThan(0)
    })

    it('should have test for role enhancement - expert', () => {
      const expertTest = INDIVIDUAL_ENHANCEMENT_TESTS.find(
        (t) => t.name === 'Role Enhancement - Expert'
      )
      expect(expertTest).toBeDefined()
      expect(expertTest?.advancedEnhancements.roleEnhancement?.expertiseLevel).toBe('expert')
    })

    it('should have test for format controller - JSON', () => {
      const jsonTest = INDIVIDUAL_ENHANCEMENT_TESTS.find(
        (t) => t.name === 'Format Controller - JSON'
      )
      expect(jsonTest).toBeDefined()
      expect(jsonTest?.advancedEnhancements.formatControl?.structure).toBe('json')
    })
  })

  describe('Combination Tests', () => {
    it('should run all combination tests', () => {
      const results = runAllCombinationTests()
      expect(results).toBeDefined()
      expect(results.length).toBeGreaterThan(0)
    })

    it('should have test for all enhancements combined', () => {
      const allTest = COMBINATION_TESTS.find((t) => t.name === 'All Enhancements Combined')
      expect(allTest).toBeDefined()
    })
  })

  describe('Complete Flow Test', () => {
    it('should test complete flow with base prompt', () => {
      const result = testCompleteFlow(
        'Write a blog post about AI',
        DEFAULT_ADVANCED_ENHANCEMENTS
      )

      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.steps.length).toBeGreaterThan(0)
      expect(result.finalPrompt).toBeDefined()
    })

    it('should fail with empty base prompt', () => {
      const result = testCompleteFlow('', DEFAULT_ADVANCED_ENHANCEMENTS)

      expect(result.success).toBe(false)
      expect(result.steps[0].success).toBe(false)
    })
  })

  describe('Quality Validation', () => {
    it('should validate prompt quality', () => {
      const quality = validatePromptQuality(
        'Please write a comprehensive blog post about artificial intelligence. Include sections on history, current applications, and future trends.'
      )

      expect(quality).toBeDefined()
      expect(quality.score).toBeGreaterThanOrEqual(0)
      expect(quality.score).toBeLessThanOrEqual(100)
      expect(Array.isArray(quality.issues)).toBe(true)
      expect(Array.isArray(quality.strengths)).toBe(true)
    })

    it('should give low score for very short prompt', () => {
      const quality = validatePromptQuality('Hi')
      expect(quality.score).toBeLessThan(80)
      expect(quality.issues.length).toBeGreaterThan(0)
    })

    it('should give good score for well-structured prompt', () => {
      const quality = validatePromptQuality(
        'You are an expert writer. Please write a blog post about AI. Format it in Markdown. Include headers, lists, and code examples. Keep it between 500-1000 words. Use a professional, engaging tone.'
      )
      expect(quality.score).toBeGreaterThan(70)
      expect(quality.strengths.length).toBeGreaterThan(0)
    })
  })

  describe('Run All Tests', () => {
    it('should run all tests and return summary', () => {
      const results = runAllTests()

      expect(results).toBeDefined()
      expect(results.individual).toBeDefined()
      expect(results.combinations).toBeDefined()
      expect(results.summary).toBeDefined()
      expect(results.summary.total).toBeGreaterThan(0)
      expect(results.summary.passed + results.summary.failed).toBe(results.summary.total)
    })
  })
})

