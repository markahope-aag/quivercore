/**
 * Professional Textarea Component
 * Enterprise-grade textarea with floating labels
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false)
    const hasValue = Boolean(props.value || props.defaultValue)

    return (
      <div className="w-full">
        <div className="relative">
          <textarea
            className={cn(
              'peer min-h-[100px] w-full rounded-lg border bg-white px-4 py-2.5 text-sm',
              'transition-all duration-200',
              'placeholder:text-transparent',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 hover:border-slate-400',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'resize-none',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:border-blue-500',
              'dark:bg-slate-800 dark:border-slate-700 dark:text-white',
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              props.onBlur?.(e)
            }}
            {...props}
          />
          {label && (
            <label
              className={cn(
                'absolute left-4 top-2.5 text-sm transition-all duration-200',
                'pointer-events-none',
                focused || hasValue
                  ? 'top-2.5 -translate-y-0 text-xs text-blue-600 dark:text-blue-400'
                  : 'text-slate-500',
                error && 'text-red-600 dark:text-red-400'
              )}
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }

