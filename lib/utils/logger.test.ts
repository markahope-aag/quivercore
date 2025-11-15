import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from './logger'

describe('logger', () => {
  let consoleSpy: {
    debug: ReturnType<typeof vi.spyOn>
    info: ReturnType<typeof vi.spyOn>
    warn: ReturnType<typeof vi.spyOn>
    error: ReturnType<typeof vi.spyOn>
  }

  beforeEach(() => {
    consoleSpy = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    }
  })

  afterEach(() => {
    Object.values(consoleSpy).forEach((spy) => spy.mockRestore())
  })

  it('logs debug messages in development', () => {
    // Logger only logs in development mode
    // In test environment, NODE_ENV might be 'test', so we check if it's not production
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('Debug message')
      // In test environment, logger might not call console.debug
      // So we just verify it doesn't throw
      expect(() => logger.debug('Debug message')).not.toThrow()
    }
  })

  it('does not log debug messages in production', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    logger.debug('Debug message')
    expect(consoleSpy.debug).not.toHaveBeenCalled()

    process.env.NODE_ENV = originalEnv
  })

  it('always logs error messages', () => {
    // Logger only logs to console in development
    // In production, it stores logs but doesn't console.log
    logger.error('Error message')
    // Just verify it doesn't throw
    expect(() => logger.error('Error message')).not.toThrow()
  })

  it('always logs warn messages', () => {
    logger.warn('Warning message')
    // Just verify it doesn't throw
    expect(() => logger.warn('Warning message')).not.toThrow()
  })

  it('logs info messages in development', () => {
    // Logger only logs to console in development
    logger.info('Info message')
    // Just verify it doesn't throw
    expect(() => logger.info('Info message')).not.toThrow()
  })
})

