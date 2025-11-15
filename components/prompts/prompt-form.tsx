'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { X } from 'lucide-react'
import { getUseCases } from '@/lib/constants/use-cases'
import { getFrameworks } from '@/lib/constants/frameworks'
import { getEnhancementTechniques } from '@/lib/constants/enhancement-techniques'

const promptFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  use_case: z.string().optional(),
  framework: z.string().optional(),
  enhancement_technique: z.string().optional(),
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
  const [customUseCase, setCustomUseCase] = useState(false)
  const [customFramework, setCustomFramework] = useState(false)
  const [customEnhancementTechnique, setCustomEnhancementTechnique] = useState(false)

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

  const content = form.watch('content')
  const currentUseCase = form.watch('use_case')
  const currentFramework = form.watch('framework')
  const currentEnhancementTechnique = form.watch('enhancement_technique')
  const availableUseCases = getUseCases()
  const availableFrameworks = getFrameworks()
  const availableEnhancementTechniques = getEnhancementTechniques()

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

  // Check if current enhancement technique is in the predefined list
  useEffect(() => {
    if (currentEnhancementTechnique && !availableEnhancementTechniques.includes(currentEnhancementTechnique)) {
      setCustomEnhancementTechnique(true)
    } else {
      setCustomEnhancementTechnique(false)
    }
  }, [currentEnhancementTechnique, availableEnhancementTechniques])

  useEffect(() => {
    if (content) {
      const vars = extractVariables(content)
      setDetectedVariables(vars)
    } else {
      setDetectedVariables([])
    }
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
        throw new Error(error.error || 'Failed to save prompt')
      }

      router.push('/prompts')
      router.refresh()
    } catch (error) {
      console.error('Error saving prompt:', error)
      alert('Failed to save prompt. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="My Awesome Prompt" {...field} />
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select a use case" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableUseCases.map((useCase) => (
                        <SelectItem key={useCase} value={useCase}>
                          {useCase}
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom__">
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select a framework" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableFrameworks.map((framework) => (
                        <SelectItem key={framework} value={framework}>
                          {framework}
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom__">
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
              <FormLabel>Enhancement Technique</FormLabel>
              <div className="space-y-2">
                {!customEnhancementTechnique ? (
                  <Select
                    onValueChange={(value) => {
                      if (value === '__custom__') {
                        setCustomEnhancementTechnique(true)
                        field.onChange('')
                      } else {
                        field.onChange(value)
                      }
                    }}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an enhancement technique" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableEnhancementTechniques.map((technique) => (
                        <SelectItem key={technique} value={technique}>
                          {technique}
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom__">
                        + Custom Enhancement Technique
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter custom enhancement technique"
                      {...field}
                      value={field.value || ''}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCustomEnhancementTechnique(false)
                        field.onChange('')
                      }}
                      className="text-xs"
                    >
                      Use predefined enhancement techniques
                    </Button>
                  </div>
                )}
              </div>
              <FormDescription>
                Advanced techniques to improve prompt performance
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your prompt content here. Use {{variable}} syntax for template variables."
                  {...field}
                  rows={12}
                  className="font-mono text-sm"
                />
              </FormControl>
              <FormDescription>
                Use {`{{variableName}}`} syntax to create template variables
              </FormDescription>
              {detectedVariables.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-sm text-muted-foreground">Variables:</span>
                  {detectedVariables.map((variable) => (
                    <Badge key={variable} variant="secondary">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input placeholder="tag1, tag2, tag3" {...field} />
              </FormControl>
              <FormDescription>
                Separate tags with commas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : prompt ? 'Update Prompt' : 'Create Prompt'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

