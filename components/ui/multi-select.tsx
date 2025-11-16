'use client'

/**
 * MultiSelect Component
 * 
 * A multi-select dropdown component for selecting multiple options
 * with a clean, accessible interface
 */

import { useState, useRef, useEffect } from 'react'
import { X, ChevronDown, Check } from 'lucide-react'
import { Button } from './button-v2'
import { Badge } from './badge-v2'
import { cn } from '@/lib/utils'

interface MultiSelectProps {
  options: readonly string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  className,
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option))
    } else {
      onChange([...selected, option])
    }
  }

  const removeOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter((item) => item !== option))
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full min-h-[48px] px-3 py-2 text-left',
          'border-2 border-slate-200 rounded-lg',
          'bg-white dark:bg-slate-800',
          'hover:border-slate-300 dark:hover:border-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isOpen && 'border-blue-500 ring-2 ring-blue-200',
          'transition-colors'
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 flex-1">
            {selected.length === 0 ? (
              <span className="text-slate-500 dark:text-slate-400">{placeholder}</span>
            ) : (
              selected.map((option) => (
                <Badge
                  key={option}
                  variant="secondary"
                  className="text-xs border-2 border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-900/20 dark:text-blue-300"
                >
                  {option}
                  <button
                    type="button"
                    onClick={(e) => removeOption(option, e)}
                    className="ml-1.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform',
              isOpen && 'transform rotate-180'
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="p-1">
            {options.map((option) => {
              const isSelected = selected.includes(option)
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleOption(option)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md',
                    'hover:bg-blue-50 dark:hover:bg-blue-950',
                    'transition-colors',
                    'flex items-center justify-between',
                    isSelected && 'bg-blue-50 dark:bg-blue-950'
                  )}
                >
                  <span className="text-sm text-slate-900 dark:text-white">{option}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

