/**
 * Professional Empty State Component
 * Enterprise-grade empty states with helpful messaging
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button-v2'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Icon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mb-6 max-w-sm text-sm text-slate-600 dark:text-slate-400">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="default">
          {action.label}
        </Button>
      )}
    </div>
  )
}

