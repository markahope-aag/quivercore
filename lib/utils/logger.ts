/**
 * Centralized logging utility
 * Replaces console.log/error/warn with a configurable logging system
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  data?: unknown
  timestamp: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private logs: LogEntry[] = []
  private maxLogs = 100 // Keep last 100 logs in memory

  private log(level: LogLevel, message: string, data?: unknown): void {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    }

    // Store in memory (for debugging)
    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Only log to console in development
    if (this.isDevelopment) {
      const prefix = `[${level.toUpperCase()}]`
      switch (level) {
        case 'error':
          console.error(prefix, message, data || '')
          break
        case 'warn':
          console.warn(prefix, message, data || '')
          break
        case 'debug':
          console.debug(prefix, message, data || '')
          break
        default:
          console.log(prefix, message, data || '')
      }
    }

    // In production, send to error monitoring service (Sentry, etc.)
    if (!this.isDevelopment && level === 'error') {
      // TODO: Integrate with error monitoring service
      // Example: Sentry.captureException(new Error(message), { extra: data })
    }
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data)
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data)
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data)
  }

  error(message: string, error?: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error || message)
    const errorData = error instanceof Error ? { stack: error.stack, name: error.name } : error
    this.log('error', message || errorMessage, errorData)
  }

  /**
   * Get recent logs (for debugging)
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level)
    }
    return [...this.logs]
  }

  /**
   * Clear logs
   */
  clear(): void {
    this.logs = []
  }
}

// Export singleton instance
export const logger = new Logger()

// Export types for use in other files
export type { LogLevel, LogEntry }

