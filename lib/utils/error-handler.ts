/**
 * Centralized error handling utilities
 * Provides consistent error handling patterns across the application
 */

import { logger } from './logger'

export interface AppError {
  message: string
  code?: string
  statusCode?: number
  details?: unknown
  timestamp: string
}

export class ApplicationError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApplicationError'
    Object.setPrototypeOf(this, ApplicationError.prototype)
  }

  toJSON(): AppError {
    return {
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Standard error types
 */
export const ErrorCodes = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // External service errors
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const

/**
 * Handles errors consistently across the application
 */
export function handleError(error: unknown): AppError {
  // ApplicationError instances
  if (error instanceof ApplicationError) {
    logger.error('Application error', error.toJSON())
    return error.toJSON()
  }

  // Standard Error instances
  if (error instanceof Error) {
    logger.error('Error caught', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })

    return {
      message: error.message,
      code: ErrorCodes.INTERNAL_ERROR,
      statusCode: 500,
      timestamp: new Date().toISOString(),
    }
  }

  // Unknown error types
  const errorMessage = String(error || 'Unknown error occurred')
  logger.error('Unknown error type', { error })

  return {
    message: errorMessage,
    code: ErrorCodes.INTERNAL_ERROR,
    statusCode: 500,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Creates a standardized API error response
 */
export function createErrorResponse(error: unknown, statusCode: number = 500): Response {
  const appError = handleError(error)
  return new Response(JSON.stringify({ error: appError.message, code: appError.code }), {
    status: appError.statusCode || statusCode,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Wraps async functions with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      if (context) {
        logger.error(`Error in ${context}`, error)
      }
      throw error
    }
  }) as T
}

/**
 * Validates and sanitizes user input
 */
export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .replace(/\0/g, '') // Remove null bytes
    .slice(0, 10000) // Limit length
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

