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
import { Prompt, PromptType } from '@/lib/types/database'
import { extractVariables } from '@/lib/utils/prompt'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { getCategoriesForType } from '@/lib/constants/categories'

const promptFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['ai_prompt', 'email_template', 'snippet', 'other']),
  category: z.string().optional(),
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
  const [customCategory, setCustomCategory] = useState(false)

  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: {
      title: prompt?.title || '',
      content: prompt?.content || '',
      type: (prompt?.type || 'ai_prompt') as PromptType,
      category: prompt?.category || '',
      description: prompt?.description || '',
      tags: prompt?.tags?.join(', ') || '',
    },
  })

  const content = form.watch('content')
  const selectedType = form.watch('type')
  const currentCategory = form.watch('category')
  const availableCategories = getCategoriesForType(selectedType)
  
  // Check if current category is in the predefined list
  useEffect(() => {
    if (currentCategory && !availableCategories.includes(currentCategory)) {
      setCustomCategory(true)
    } else {
      setCustomCategory(false)
    }
  }, [currentCategory, availableCategories])

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
        type: values.type,
        category: values.category || null,
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
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ai_prompt">AI Prompt</SelectItem>
                  <SelectItem value="email_template">Email Template</SelectItem>
                  <SelectItem value="snippet">Snippet</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
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

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <div className="space-y-2">
                  {!customCategory ? (
                    <Select 
                      onValueChange={(value) => {
                        if (value === '__custom__') {
                          setCustomCategory(true)
                          field.onChange('')
                        } else {
                          field.onChange(value)
                        }
                      }}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                        <SelectItem value="__custom__">
                          + Custom Category
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="space-y-2">
                      <Input 
                        placeholder="Enter custom category" 
                        {...field}
                        value={field.value || ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCustomCategory(false)
                          field.onChange('')
                        }}
                        className="text-xs"
                      >
                        Use predefined categories
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
        </div>

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

