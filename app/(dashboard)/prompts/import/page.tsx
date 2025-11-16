'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Upload, FileText, FileCode, AlertCircle, CheckCircle2, X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button-v2'
import { Card, CardContent } from '@/components/ui/card-v2'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge-v2'
import { Prompt } from '@/lib/types/database'
import { extractVariables } from '@/lib/utils/prompt'
import { toast } from 'sonner'

interface ParsedPrompt {
  title: string
  content: string
  description?: string
  use_case?: string
  framework?: string
  enhancement_technique?: string
  tags?: string[]
  variables?: Record<string, string>
}

export default function ImportPromptPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isTemplate = searchParams.get('template') === 'true'

  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedPrompt[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const [pastedText, setPastedText] = useState('')

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    setSelectedFile(file)
    setParseError(null)
    setParsedData([])

    const fileExtension = file.name.split('.').pop()?.toLowerCase()

    try {
      const text = await file.text()

      if (fileExtension === 'json') {
        parseJSON(text)
      } else if (fileExtension === 'csv') {
        parseCSV(text)
      } else if (fileExtension === 'txt' || fileExtension === 'md') {
        parseText(text)
      } else {
        setParseError('Unsupported file type. Please upload JSON, CSV, TXT, or MD files.')
      }
    } catch (error) {
      console.error('Error reading file:', error)
      setParseError('Failed to read file. Please try again.')
    }
  }

  const parseJSON = (text: string) => {
    try {
      const data = JSON.parse(text)

      // Check if data is empty
      if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new Error('JSON file is empty or contains no data')
      }

      const prompts: ParsedPrompt[] = Array.isArray(data) ? data : [data]

      // Validate and extract variables if template
      const validated = prompts.map((p, index) => {
        // Detailed validation with specific error messages
        if (!p.title && !p.content) {
          throw new Error(
            `Item #${index + 1}: Missing both "title" and "content" fields. Each ${isTemplate ? 'template' : 'prompt'} must have at least these fields.`
          )
        }

        if (!p.title) {
          throw new Error(
            `Item #${index + 1}: Missing "title" field. Found content: "${p.content?.substring(0, 50)}..."`
          )
        }

        if (!p.content) {
          throw new Error(
            `Item #${index + 1}: Missing "content" field for "${p.title}"`
          )
        }

        if (typeof p.title !== 'string' || typeof p.content !== 'string') {
          throw new Error(
            `Item #${index + 1}: "title" and "content" must be text strings, not ${typeof p.title}/${typeof p.content}`
          )
        }

        const variables = isTemplate ? extractVariables(p.content) : []
        const variableDefaults: Record<string, string> = {}

        if (variables.length > 0) {
          variables.forEach((v) => {
            variableDefaults[v] = p.variables?.[v] || ''
          })
        }

        // Warn if importing as template but no variables found
        if (isTemplate && variables.length === 0) {
          console.warn(`Item #${index + 1} ("${p.title}"): No variables found. Use {{variable}} syntax for template variables.`)
        }

        return {
          ...p,
          variables: variables.length > 0 ? variableDefaults : undefined,
        }
      })

      setParsedData(validated)
    } catch (error) {
      console.error('JSON parse error:', error)

      if (error instanceof SyntaxError) {
        // JSON syntax errors
        const match = error.message.match(/position (\d+)/)
        const position = match ? match[1] : 'unknown'
        setParseError(
          `Invalid JSON syntax at position ${position}. Common issues:\n` +
          `• Missing quotes around property names or values\n` +
          `• Trailing commas in objects or arrays\n` +
          `• Using single quotes instead of double quotes\n` +
          `• Unclosed brackets or braces\n\n` +
          `Error: ${error.message}`
        )
      } else {
        setParseError(error instanceof Error ? error.message : 'Unknown error parsing JSON')
      }
    }
  }

  const parseCSV = (text: string) => {
    try {
      const lines = text.split('\n').filter((line) => line.trim())

      if (lines.length === 0) {
        throw new Error('CSV file is empty')
      }

      if (lines.length < 2) {
        throw new Error(
          `CSV must have a header row and at least one data row.\n` +
          `Found only ${lines.length} line(s).\n\n` +
          `Expected format:\ntitle,content,description\n"My Prompt","The content","Description"`
        )
      }

      // Parse headers
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ''))
      const titleIndex = headers.findIndex((h) => h === 'title')
      const contentIndex = headers.findIndex((h) => h === 'content')

      if (titleIndex === -1 && contentIndex === -1) {
        throw new Error(
          `CSV must have "title" and "content" columns.\n\n` +
          `Found columns: ${headers.join(', ')}\n\n` +
          `Your CSV header row should include at minimum:\ntitle,content`
        )
      }

      if (titleIndex === -1) {
        throw new Error(
          `CSV is missing the "title" column.\n\n` +
          `Found columns: ${headers.join(', ')}\n` +
          `Required: title, content`
        )
      }

      if (contentIndex === -1) {
        throw new Error(
          `CSV is missing the "content" column.\n\n` +
          `Found columns: ${headers.join(', ')}\n` +
          `Required: title, content`
        )
      }

      const prompts: ParsedPrompt[] = []
      const errors: string[] = []

      for (let i = 1; i < lines.length; i++) {
        try {
          // Simple CSV parsing (doesn't handle quoted commas perfectly)
          const values = lines[i].split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''))

          if (values.length !== headers.length) {
            errors.push(`Row ${i + 1}: Expected ${headers.length} columns but found ${values.length}`)
            continue
          }

          const title = values[titleIndex] || ''
          const content = values[contentIndex] || ''

          if (!title && !content) {
            errors.push(`Row ${i + 1}: Both title and content are empty`)
            continue
          }

          if (!title) {
            errors.push(`Row ${i + 1}: Missing title`)
            continue
          }

          if (!content) {
            errors.push(`Row ${i + 1}: Missing content for "${title}"`)
            continue
          }

          const variables = isTemplate ? extractVariables(content) : []
          const variableDefaults: Record<string, string> = {}

          if (variables.length > 0) {
            variables.forEach((v) => {
              variableDefaults[v] = ''
            })
          }

          prompts.push({
            title,
            content,
            description: values[headers.indexOf('description')] || '',
            use_case: values[headers.indexOf('use_case')] || '',
            framework: values[headers.indexOf('framework')] || '',
            enhancement_technique: values[headers.indexOf('enhancement_technique')] || '',
            tags: values[headers.indexOf('tags')]?.split(';').map((t) => t.trim()).filter(Boolean) || [],
            variables: variables.length > 0 ? variableDefaults : undefined,
          })
        } catch (rowError) {
          errors.push(`Row ${i + 1}: ${rowError instanceof Error ? rowError.message : 'Unknown error'}`)
        }
      }

      if (prompts.length === 0 && errors.length > 0) {
        throw new Error(
          `Failed to parse any valid rows:\n\n${errors.join('\n')}\n\n` +
          `Tip: Ensure each row has values for both "title" and "content" columns`
        )
      }

      if (errors.length > 0) {
        console.warn('CSV parsing warnings:', errors)
      }

      setParsedData(prompts)

      if (errors.length > 0 && prompts.length > 0) {
        setParseError(
          `Parsed ${prompts.length} ${isTemplate ? 'template' : 'prompt'}(s) successfully, ` +
          `but ${errors.length} row(s) had issues:\n\n${errors.slice(0, 5).join('\n')}` +
          (errors.length > 5 ? `\n...and ${errors.length - 5} more` : '')
        )
      }
    } catch (error) {
      console.error('CSV parse error:', error)
      setParseError(error instanceof Error ? error.message : 'Unknown error parsing CSV')
    }
  }

  const parseText = (text: string) => {
    try {
      if (!text || !text.trim()) {
        throw new Error('Text file is empty')
      }

      // Simple text format: each prompt separated by "---"
      const sections = text.split('---').filter((s) => s.trim())

      if (sections.length === 0) {
        throw new Error(
          `No content found in file.\n\n` +
          `For multiple ${isTemplate ? 'templates' : 'prompts'}, separate them with "---" on its own line:\n\n` +
          `First Title\nFirst content here\n---\nSecond Title\nSecond content here`
        )
      }

      const prompts: ParsedPrompt[] = []
      const warnings: string[] = []

      sections.forEach((section, index) => {
        const lines = section.trim().split('\n').filter((l) => l.trim())

        if (lines.length === 0) {
          warnings.push(`Section ${index + 1}: Empty section ignored`)
          return
        }

        const title = lines[0]?.trim() || `Imported ${isTemplate ? 'Template' : 'Prompt'} ${index + 1}`
        const content = lines.slice(1).join('\n').trim()

        // If no content, use title as content (single-line format)
        const finalContent = content || title

        if (finalContent.length === 0) {
          warnings.push(`Section ${index + 1}: Skipped - no content`)
          return
        }

        if (finalContent.length < 10) {
          warnings.push(`Section ${index + 1} ("${title}"): Very short content (${finalContent.length} characters)`)
        }

        const variables = isTemplate ? extractVariables(finalContent) : []
        const variableDefaults: Record<string, string> = {}

        if (variables.length > 0) {
          variables.forEach((v) => {
            variableDefaults[v] = ''
          })
        } else if (isTemplate) {
          warnings.push(`Section ${index + 1} ("${title}"): No variables found - use {{variable}} syntax`)
        }

        prompts.push({
          title,
          content: finalContent,
          variables: variables.length > 0 ? variableDefaults : undefined,
        })
      })

      if (prompts.length === 0) {
        throw new Error(
          `No valid ${isTemplate ? 'templates' : 'prompts'} found.\n\n` +
          (warnings.length > 0 ? `Issues:\n${warnings.join('\n')}` : '')
        )
      }

      setParsedData(prompts)

      if (warnings.length > 0) {
        console.warn('Text parsing warnings:', warnings)
      }
    } catch (error) {
      console.error('Text parse error:', error)
      setParseError(error instanceof Error ? error.message : 'Unknown error parsing text')
    }
  }

  const handlePastedTextParse = () => {
    if (!pastedText.trim()) {
      setParseError('Please paste some content')
      return
    }

    setParseError(null)
    setParsedData([])

    // Try to parse as JSON first
    try {
      parseJSON(pastedText)
      return
    } catch {
      // Not JSON, try text format
      parseText(pastedText)
    }
  }

  const handleImport = async () => {
    if (parsedData.length === 0) {
      setParseError('No data to import')
      return
    }

    setImporting(true)
    setParseError(null)

    try {
      const response = await fetch('/api/prompts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompts: parsedData,
          source: 'third-party',
          is_template: isTemplate,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle validation errors with detailed messages
        if (result.details && Array.isArray(result.details)) {
          const errorMessage =
            `${result.error || 'Validation failed'}\n\n` +
            `${result.details.join('\n')}` +
            (result.totalErrors > result.details.length ? `\n\n...and ${result.totalErrors - result.details.length} more errors` : '')
          throw new Error(errorMessage)
        }

        // Handle other API errors
        const errorMessage = result.details
          ? `${result.error}\n\nDetails: ${result.details}${result.hint ? `\nHint: ${result.hint}` : ''}`
          : result.error || 'Failed to import'

        throw new Error(errorMessage)
      }

      setImportSuccess(true)
      toast.success(result.message || `Successfully imported ${result.imported} ${isTemplate ? 'template' : 'prompt'}${result.imported !== 1 ? 's' : ''}!`)

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/prompts?refresh=' + Date.now())
      }, 2000)
    } catch (error) {
      console.error('Import error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to import. Please try again.'
      setParseError(errorMessage)
      toast.error('Import failed - see details below')
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const template = {
      title: 'Example Prompt Title',
      content: isTemplate ? 'Write about {{topic}} for {{audience}}' : 'Your prompt content here',
      description: 'Brief description of the prompt',
      use_case: 'Writing & Content',
      framework: 'Role-Based',
      enhancement_technique: 'Few-Shot Examples',
      tags: ['example', 'template'],
      variables: isTemplate ? { topic: 'example value', audience: 'example audience' } : undefined,
    }

    const blob = new Blob([JSON.stringify([template], null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${isTemplate ? 'template' : 'prompt'}-import-example.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-12 dark:from-slate-900 dark:to-blue-950/30">
        <div className="flex items-center gap-3 mb-3">
          {isTemplate ? (
            <FileCode className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          ) : (
            <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
          )}
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Import {isTemplate ? 'Templates' : 'Prompts'}
          </h1>
        </div>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Upload a file or paste content to import {isTemplate ? 'templates' : 'prompts'} into your library
        </p>
      </div>

      {/* Success Message */}
      {importSuccess && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-800 dark:text-green-200">
              <CheckCircle2 className="h-5 w-5" />
              <div>
                <p className="font-medium">Import successful!</p>
                <p className="text-sm">Redirecting to your library...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Upload */}
      {!importSuccess && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Download Template Button */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Need a template?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Download an example file to see the expected format
                </p>
              </div>
              <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                <Download className="h-4 w-4" />
                Download Example
              </Button>
            </div>

            {/* Drag and Drop */}
            <div>
              <Label className="text-base font-semibold mb-2 block">Upload File</Label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  accept=".json,.csv,.txt,.md"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  {selectedFile ? selectedFile.name : 'Drop your file here or click to browse'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Supports JSON, CSV, TXT, and Markdown files
                </p>
              </div>
            </div>

            {/* Or Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">Or paste content</span>
              </div>
            </div>

            {/* Paste Text */}
            <div>
              <Label htmlFor="paste-text" className="text-base font-semibold mb-2 block">
                Paste Content
              </Label>
              <Textarea
                id="paste-text"
                placeholder={
                  isTemplate
                    ? 'Paste JSON, CSV, or plain text. For plain text, separate multiple templates with "---"'
                    : 'Paste JSON, CSV, or plain text. For plain text, separate multiple prompts with "---"'
                }
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <Button onClick={handlePastedTextParse} className="mt-2" variant="outline">
                Parse Content
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parse Error */}
      {parseError && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-red-800 dark:text-red-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-2">Error</p>
                <pre className="text-sm whitespace-pre-wrap font-sans bg-red-100 dark:bg-red-900/30 p-3 rounded border border-red-300 dark:border-red-700 overflow-x-auto">
                  {parseError}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parsed Data Preview */}
      {parsedData.length > 0 && !importSuccess && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Preview ({parsedData.length} {isTemplate ? 'template' : 'prompt'}
                  {parsedData.length !== 1 ? 's' : ''})
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Review the data before importing
                </p>
              </div>
              <Button onClick={handleImport} disabled={importing} className="gap-2">
                {importing ? 'Importing...' : 'Import All'}
              </Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {parsedData.map((prompt, index) => (
                <div
                  key={index}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-slate-900 dark:text-white">{prompt.title}</h4>
                    {prompt.variables && Object.keys(prompt.variables).length > 0 && (
                      <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/30">
                        Template
                      </Badge>
                    )}
                  </div>
                  {prompt.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">{prompt.description}</p>
                  )}
                  <p className="text-sm text-slate-500 dark:text-slate-500 font-mono line-clamp-2">
                    {prompt.content}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {prompt.use_case && <Badge variant="outline">{prompt.use_case}</Badge>}
                    {prompt.framework && <Badge variant="outline">{prompt.framework}</Badge>}
                    {prompt.tags?.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  {prompt.variables && Object.keys(prompt.variables).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(prompt.variables).map((v) => (
                        <Badge key={v} className="text-xs bg-blue-100 dark:bg-blue-900/30">
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Button */}
      {!importSuccess && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      )}
    </motion.div>
  )
}
