'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button-v2'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card-v2'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-v2'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Prompt } from '@/lib/types/database'
import { extractVariables } from '@/lib/utils/prompt'
import { Badge } from '@/components/ui/badge'
import { X, ChevronDown, ChevronUp, Code } from 'lucide-react'
import { getUseCases } from '@/lib/constants/use-cases'
import { getFrameworks } from '@/lib/constants/frameworks'
import { getEnhancementTechniques } from '@/lib/constants/enhancement-techniques'
import { getCompatibleEnhancements, isEnhancementCompatibleWithFramework } from '@/lib/utils/enhancement-compatibility'
import { MultiSelect } from '@/components/ui/multi-select'
import { TagInput } from '@/components/ui/tag-input'

const promptFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  use_case: z.string().optional(),
  framework: z.string().optional(),
  enhancement_technique: z.string().optional(), // Stored as comma-separated string
  description: z.string().optional(),
  tags: z.string().optional(),
})

type PromptFormValues = z.infer<typeof promptFormSchema>

interface PromptFormProps {
  prompt?: Prompt
}

export function PromptForm({ prompt }: PromptFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [detectedVariables, setDetectedVariables] = useState<string[]>([])
  const [variableDefaults, setVariableDefaults] = useState<Record<string, string>>({})
  const [showVariablesSection, setShowVariablesSection] = useState(false)
  const [customUseCase, setCustomUseCase] = useState(false)
  const [customFramework, setCustomFramework] = useState(false)
  const [selectedEnhancements, setSelectedEnhancements] = useState<string[]>([])

  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: {
      title: prompt?.title || '',
      content: prompt?.content || '',
      use_case: prompt?.use_case || '',
      framework: prompt?.framework || '',
      enhancement_technique: prompt?.enhancement_technique || '',
      description: prompt?.description || '',
      tags: prompt?.tags?.join(', ') || '',
    },
  })

  // Initialize selected enhancements from prompt
  useEffect(() => {
    if (prompt?.enhancement_technique) {
      const enhancements = prompt.enhancement_technique.split(',').map((e) => e.trim()).filter(Boolean)
      setSelectedEnhancements(enhancements)
    }
  }, [prompt])

  // Initialize variable defaults from prompt
  useEffect(() => {
    if (prompt?.variables && typeof prompt.variables === 'object') {
      setVariableDefaults(prompt.variables as Record<string, string>)
      // Show variables section if there are variables or defaults
      if (Object.keys(prompt.variables).length > 0) {
        setShowVariablesSection(true)
      }
    }
  }, [prompt])

  // Show variables section when variables are detected or when there are existing variable defaults
  useEffect(() => {
    if (detectedVariables.length > 0 || Object.keys(variableDefaults).length > 0) {
      setShowVariablesSection(true)
    }
    // Don't auto-hide - let user control visibility via the collapse button
  }, [detectedVariables, variableDefaults])

  // Use useWatch for better reactivity
  const content = useWatch({ control: form.control, name: 'content' }) || ''
  const currentUseCase = useWatch({ control: form.control, name: 'use_case' }) || ''
  const currentFramework = useWatch({ control: form.control, name: 'framework' }) || ''
  const availableUseCases = getUseCases()
  const availableFrameworks = getFrameworks()
  
  // Get compatible enhancements based on selected framework
  const compatibleEnhancements = getCompatibleEnhancements(currentFramework || null)
  const allEnhancementTechniques = getEnhancementTechniques()

  // Check if current use-case is in the predefined list
  useEffect(() => {
    if (currentUseCase && !availableUseCases.includes(currentUseCase)) {
      setCustomUseCase(true)
    } else {
      setCustomUseCase(false)
    }
  }, [currentUseCase, availableUseCases])

  // Check if current framework is in the predefined list
  useEffect(() => {
    if (currentFramework && !availableFrameworks.includes(currentFramework)) {
      setCustomFramework(true)
    } else {
      setCustomFramework(false)
    }
  }, [currentFramework, availableFrameworks])

  // Update form field when selected enhancements change
  useEffect(() => {
    form.setValue('enhancement_technique', selectedEnhancements.join(', '))
  }, [selectedEnhancements, form])

  // Filter out incompatible enhancements when framework changes
  useEffect(() => {
    if (currentFramework && selectedEnhancements.length > 0) {
      const compatible = selectedEnhancements.filter((enh) => {
        const compat = isEnhancementCompatibleWithFramework(enh, currentFramework)
        return compat.compatible
      })
      if (compatible.length !== selectedEnhancements.length) {
        setSelectedEnhancements(compatible)
      }
    }
  }, [currentFramework, selectedEnhancements])

  // Extract and manage variables from content
  useEffect(() => {
    const vars = content ? extractVariables(content) : []
    
    // Debug logging (remove in production)
    if (vars.length > 0) {
      console.log('Variables detected:', vars)
    }
    
    setDetectedVariables(vars)
    
    // Initialize new variables in variableDefaults if they don't exist
    // Use functional update to avoid dependency issues
    setVariableDefaults((currentDefaults) => {
      const newDefaults = { ...currentDefaults }
      let hasNewVariables = false
      
      // Add new variables
      vars.forEach((variable) => {
        if (!(variable in newDefaults)) {
          newDefaults[variable] = ''
          hasNewVariables = true
        }
      })
      
      // Remove variables that are no longer in the content (only if content exists)
      if (content) {
        Object.keys(newDefaults).forEach((key) => {
          if (!vars.includes(key)) {
            delete newDefaults[key]
            hasNewVariables = true
          }
        })
      }
      
      return hasNewVariables ? newDefaults : currentDefaults
    })
  }, [content])

  const onSubmit = async (values: PromptFormValues) => {
    setIsSubmitting(true)

    try {
      const tags = values.tags
        ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : []

      const body = {
        title: values.title,
        content: values.content,
        use_case: values.use_case || null,
        framework: values.framework || null,
        enhancement_technique: values.enhancement_technique || null,
        description: values.description || null,
        tags,
        variables: Object.keys(variableDefaults).length > 0 ? variableDefaults : null,
      }

      const url = prompt ? `/api/prompts/${prompt.id}` : '/api/prompts'
      const method = prompt ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Failed to save prompt:', error)
        throw new Error(error.error || 'Failed to save prompt')
      }

      const result = await response.json()
      console.log('Prompt saved successfully:', result)

      // Redirect to prompts page and force refresh to bypass cache
      router.push('/prompts?refresh=' + Date.now())
      router.refresh()
    } catch (error) {
      console.error('Error saving prompt:', error)
      alert('Failed to save prompt. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input 
                  placeholder="My Awesome Prompt" 
                  {...field}
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-800 rounded-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief description of this prompt..."
                  {...field}
                  rows={2}
                  className="!border-2 !border-slate-200 dark:!border-slate-700 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-200 dark:focus:!border-blue-400 dark:focus:!ring-blue-800 !rounded-lg resize-y !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white placeholder:!text-slate-500 dark:placeholder:!text-slate-400 !shadow-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="use_case"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Use Case</FormLabel>
              <div className="space-y-2">
                {!customUseCase ? (
                  <Select
                    onValueChange={(value) => {
                      if (value === '__custom__') {
                        setCustomUseCase(true)
                        field.onChange('')
                      } else {
                        field.onChange(value)
                      }
                    }}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-800 rounded-lg">
                        <SelectValue placeholder="Select a use case" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white shadow-lg border-blue-300 dark:bg-slate-800 dark:border-slate-600">
                      {availableUseCases.map((useCase) => (
                        <SelectItem key={useCase} value={useCase} className="hover:bg-blue-50 dark:hover:bg-blue-950">
                          {useCase}
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom__" className="hover:bg-blue-50 dark:hover:bg-blue-950">
                        + Custom Use Case
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter custom use case"
                      {...field}
                      value={field.value || ''}
                      className="border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-800 rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCustomUseCase(false)
                        field.onChange('')
                      }}
                      className="text-xs"
                    >
                      Use predefined use cases
                    </Button>
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="framework"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Framework</FormLabel>
              <div className="space-y-2">
                {!customFramework ? (
                  <Select
                    onValueChange={(value) => {
                      if (value === '__custom__') {
                        setCustomFramework(true)
                        field.onChange('')
                      } else {
                        field.onChange(value)
                      }
                    }}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-800 rounded-lg">
                        <SelectValue placeholder="Select a framework" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white shadow-lg border-blue-300 dark:bg-slate-800 dark:border-slate-600">
                      {availableFrameworks.map((framework) => (
                        <SelectItem key={framework} value={framework} className="hover:bg-blue-50 dark:hover:bg-blue-950">
                          {framework}
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom__" className="hover:bg-blue-50 dark:hover:bg-blue-950">
                        + Custom Framework
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter custom framework"
                      {...field}
                      value={field.value || ''}
                      className="border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-800 rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCustomFramework(false)
                        field.onChange('')
                      }}
                      className="text-xs"
                    >
                      Use predefined frameworks
                    </Button>
                  </div>
                )}
              </div>
              <FormDescription>
                The prompting technique or pattern used
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="enhancement_technique"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enhancement Techniques</FormLabel>
              <div className="space-y-2">
                <MultiSelect
                  options={compatibleEnhancements}
                  selected={selectedEnhancements}
                  onChange={setSelectedEnhancements}
                  placeholder={
                    currentFramework
                      ? `Select enhancement techniques compatible with ${currentFramework}...`
                      : 'Select enhancement techniques...'
                  }
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your prompt content here. Use {{variable}} syntax for template variables."
                  {...field}
                  rows={20}
                  className="font-mono text-sm min-h-[500px] resize-y border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-800 rounded-lg p-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
              </FormControl>
              <FormDescription>
                Use {`{{variableName}}`} syntax to create template variables
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Variables Section */}
        {(detectedVariables.length > 0 || Object.keys(variableDefaults).length > 0) && (
          <div className="rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
            <button
              type="button"
              onClick={() => setShowVariablesSection(!showVariablesSection)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors rounded-t-lg"
            >
              <div className="flex items-center gap-3">
                <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Template Variables ({detectedVariables.length > 0 ? detectedVariables.length : Object.keys(variableDefaults).length})
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Set default or example values for documentation and testing
                  </p>
                </div>
              </div>
              {showVariablesSection ? (
                <ChevronUp className="h-5 w-5 text-slate-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-500" />
              )}
            </button>

            {showVariablesSection && (
              <div className="p-4 space-y-4 border-t border-blue-200 dark:border-blue-800">
                <div className="flex flex-wrap gap-2 mb-4">
                  {(detectedVariables.length > 0 ? detectedVariables : Object.keys(variableDefaults)).map((variable) => (
                    <Badge key={variable} variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-3">
                  {(detectedVariables.length > 0 ? detectedVariables : Object.keys(variableDefaults)).map((variable) => {
                    const hasValue = variableDefaults[variable] && variableDefaults[variable].trim().length > 0
                    return (
                      <div key={variable} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`var-${variable}`} className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {variable} <span className="text-xs text-slate-500">(optional)</span>
                          </Label>
                          {hasValue && (
                            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Saved
                            </span>
                          )}
                        </div>
                        <Input
                          id={`var-${variable}`}
                          placeholder={`Example value for ${variable}...`}
                          value={variableDefaults[variable] || ''}
                          onChange={(e) => {
                            const newValue = e.target.value
                            console.log(`Updating variable ${variable}:`, newValue)
                            setVariableDefaults({
                              ...variableDefaults,
                              [variable]: newValue,
                            })
                          }}
                          className="border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-800 rounded-lg bg-white dark:bg-slate-800"
                        />
                        {hasValue && (
                          <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-slate-200 dark:border-slate-700">
                            <span className="font-medium">Preview:</span> {variableDefaults[variable]}
                          </div>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          This value will be saved when you {prompt ? 'update' : 'create'} the prompt
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input 
                  placeholder="tag1, tag2, tag3" 
                  {...field}
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-800 rounded-lg"
                />
              </FormControl>
              <FormDescription>
                Separate tags with commas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? 'Saving...' : prompt ? 'Update Prompt' : 'Create Prompt'}
          </Button>
        </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

