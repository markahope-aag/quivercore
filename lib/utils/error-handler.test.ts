import { describe, it, expect } from 'vitest'
import { ApplicationError, ErrorCodes, handleError } from './error-handler'

describe('error-handler', () => {
  describe('ApplicationError', () => {
    it('creates an error with correct properties', () => {
      const error = new ApplicationError(
        'Test error',
        ErrorCodes.VALIDATION_ERROR,
        400,
        { field: 'test' }
      )

      expect(error.message).toBe('Test error')
      expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR)
      expect(error.statusCode).toBe(400)
      expect(error.details).toEqual({ field: 'test' })
    })

    it('converts to JSON correctly', () => {
      const error = new ApplicationError('Test error', ErrorCodes.NOT_FOUND, 404)
      const json = error.toJSON()

      expect(json.message).toBe('Test error')
      expect(json.code).toBe(ErrorCodes.NOT_FOUND)
      expect(json.statusCode).toBe(404)
      expect(json.timestamp).toBeDefined()
    })
  })

  describe('handleError', () => {
    it('handles ApplicationError instances', () => {
      const error = new ApplicationError('Test error', ErrorCodes.BAD_REQUEST, 400)
      const result = handleError(error)

      expect(result.message).toBe('Test error')
      expect(result.code).toBe(ErrorCodes.BAD_REQUEST)
      expect(result.statusCode).toBe(400)
    })

    it('handles standard Error instances', () => {
      const error = new Error('Standard error')
      const result = handleError(error)

      expect(result.message).toBe('Standard error')
      expect(result.code).toBe(ErrorCodes.INTERNAL_ERROR)
      expect(result.statusCode).toBe(500)
    })

    it('handles unknown error types', () => {
      const error = { unexpected: 'data' }
      const result = handleError(error)

      expect(result.message).toBe('[object Object]')
      expect(result.code).toBe(ErrorCodes.INTERNAL_ERROR)
      expect(result.statusCode).toBe(500)
    })

    it('handles string errors', () => {
      const result = handleError('String error')

      expect(result.message).toBe('String error')
      expect(result.code).toBe(ErrorCodes.INTERNAL_ERROR)
    })
  })
})

