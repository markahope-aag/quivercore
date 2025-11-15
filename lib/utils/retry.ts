/**
 * Retry utility with exponential backoff
 * 
 * Provides retry logic for handling transient failures in API calls.
 * Implements exponential backoff with configurable retry attempts and delays.
 * 
 * @module lib/utils/retry
 */

interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  retryableErrors?: number[]
  onRetry?: (attempt: number, error: unknown) => void
}

/**
 * Executes a function with retry logic and exponential backoff
 * 
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns The result of the function execution
 * @throws The last error if all retries are exhausted
 * 
 * @example
 * ```typescript
 * const result = await executeWithRetry(
 *   () => fetch('https://api.example.com/data'),
 *   { maxRetries: 3, baseDelay: 1000 }
 * )
 * ```
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    retryableErrors = [429, 500, 502, 503, 504],
    onRetry,
  } = options

  let lastError: unknown

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: unknown) {
      lastError = error

      // Don't retry on the last attempt
      if (attempt === maxRetries - 1) {
        break
      }

      // Check if error is retryable
      const isRetryable = isRetryableError(error, retryableErrors)
      if (!isRetryable) {
        throw error
      }

      // Calculate delay with exponential backoff
      // For rate limits (429), use longer delay
      const isRateLimit = error instanceof Error && error.message.includes('429')
      const delayMultiplier = isRateLimit ? 2 : 1
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) * delayMultiplier,
        maxDelay
      )

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, error)
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  // All retries exhausted
  throw lastError
}

/**
 * Checks if an error is retryable based on status code
 */
function isRetryableError(error: unknown, retryableErrors: number[]): boolean {
  // Check for Anthropic APIError
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status
    return retryableErrors.includes(status)
  }

  // Check for network errors (fetch failures)
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('econnreset') ||
      message.includes('enotfound')
    )
  }

  // Default to retryable for unknown errors
  return true
}

/**
 * Creates a retry wrapper for a function
 * Useful for creating reusable retry configurations
 * 
 * @example
 * ```typescript
 * const retryFetch = createRetryWrapper(
 *   { maxRetries: 5, baseDelay: 2000 }
 * )
 * 
 * const result = await retryFetch(() => fetch(url))
 * ```
 */
export function createRetryWrapper<T extends (...args: any[]) => Promise<any>>(
  options: RetryOptions
) {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return executeWithRetry(() => (args[0] as T)(...args.slice(1)), options)
  }
}

