'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  suggestions?: string[]
  maxTags?: number
  className?: string
}

export function TagInput({
  value = [],
  onChange,
  placeholder = 'Add tags...',
  suggestions = [],
  maxTags = 10,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Normalize tag (lowercase, trim, replace spaces with hyphens)
  const normalizeTag = (tag: string): string => {
    return tag
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }

  // Filter suggestions based on input and exclude already selected tags
  const filteredSuggestions = React.useMemo(() => {
    if (!inputValue) return suggestions.filter(s => !value.includes(s)).slice(0, 10)

    const normalized = normalizeTag(inputValue)
    return suggestions
      .filter(s => !value.includes(s) && s.toLowerCase().includes(normalized))
      .slice(0, 10)
  }, [inputValue, suggestions, value])

  const addTag = (tag: string) => {
    const normalized = normalizeTag(tag)
    if (!normalized) return

    if (value.includes(normalized)) {
      setInputValue('')
      return
    }

    if (value.length >= maxTags) {
      setInputValue('')
      return
    }

    onChange([...value, normalized])
    setInputValue('')
    setIsOpen(false)

    // Focus back on input
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue) {
        addTag(inputValue)
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1])
    } else if (e.key === ',') {
      e.preventDefault()
      if (inputValue) {
        addTag(inputValue)
      }
    }
  }

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    setIsOpen(newValue.length > 0)
  }

  return (
    <div className={cn('relative', className)}>
      <Command className="overflow-visible bg-transparent">
        {/* Tag Display & Input */}
        <div className="group rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-800 transition-all">
          <div className="flex flex-wrap gap-2">
            {value.map((tag) => (
              <Badge
                key={tag}
                className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 border border-blue-300 dark:border-blue-700 gap-1 pl-2 pr-1"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 rounded-sm hover:bg-blue-300 dark:hover:bg-blue-700 p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <CommandInput
              ref={inputRef}
              value={inputValue}
              onValueChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(inputValue.length > 0)}
              onBlur={() => setTimeout(() => setIsOpen(false), 200)}
              placeholder={value.length === 0 ? placeholder : ''}
              className="flex-1 bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 border-0 px-0 py-0 h-6 min-w-[120px]"
            />
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {isOpen && filteredSuggestions.length > 0 && (
          <div className="absolute top-full z-10 w-full mt-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
            <CommandList>
              <CommandEmpty>No suggestions</CommandEmpty>
              <CommandGroup heading="Suggested tags">
                {filteredSuggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion}
                    value={suggestion}
                    onSelect={() => addTag(suggestion)}
                    className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950"
                  >
                    <span className="text-slate-500 dark:text-slate-400 mr-1">#</span>
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        )}
      </Command>

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        Press <kbd className="px-1.5 py-0.5 text-xs font-semibold border rounded bg-slate-100 dark:bg-slate-800">Enter</kbd> or{' '}
        <kbd className="px-1.5 py-0.5 text-xs font-semibold border rounded bg-slate-100 dark:bg-slate-800">,</kbd> to add tags.
        {value.length > 0 && ` ${value.length}/${maxTags} tags`}
      </p>
    </div>
  )
}
