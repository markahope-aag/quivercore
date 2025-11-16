/**
 * Query performance monitoring utilities
 * Tracks query execution times and logs slow queries
 */

import { logger } from './logger'

interface QueryMetrics {
  operation: string
  duration: number
  queryType: 'select' | 'insert' | 'update' | 'delete' | 'rpc'
  table?: string
  rowCount?: number
}

const SLOW_QUERY_THRESHOLD_MS = 500 // Log queries slower than 500ms

/**
 * Wraps a database query with performance monitoring
 */
export async function withQueryPerformance<T>(
  operation: string,
  queryType: QueryMetrics['queryType'],
  table: string | undefined,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()
  
  try {
    const result = await queryFn()
    const duration = Date.now() - startTime
    
    // Log slow queries
    if (duration > SLOW_QUERY_THRESHOLD_MS) {
      logger.warn('Slow query detected', {
        operation,
        queryType,
        table,
        duration,
        threshold: SLOW_QUERY_THRESHOLD_MS,
      })
    }
    
    // Log all queries in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Query performance', {
        operation,
        queryType,
        table,
        duration,
      })
    }
    
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Query failed', {
      operation,
      queryType,
      table,
      duration,
      error,
    })
    throw error
  }
}

/**
 * Measures the duration of an async operation
 */
export async function measureDuration<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const startTime = Date.now()
  const result = await fn()
  const duration = Date.now() - startTime
  
  if (duration > SLOW_QUERY_THRESHOLD_MS) {
    logger.warn('Slow operation detected', {
      operation,
      duration,
      threshold: SLOW_QUERY_THRESHOLD_MS,
    })
  }
  
  return { result, duration }
}

