'use client'

/**
 * Test Panel Component
 * 
 * Functional testing interface - focused solely on execution:
 * - Template variables input
 * - Model selection
 * - Execute/test functionality
 * 
 * NOTE: Metadata (difficulty, ratings, reviews, guidance) belongs on the
 * template detail/browse page, not in this functional testing panel.
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button-v2'
import { Input } from '@/components/ui/input-v2'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-v2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Prompt } from '@/lib/types/database'
import { TestTube, Loader2 } from 'lucide-react'

interface TestPanelProps {
  prompt: Prompt
}

export function TestPanel({ prompt }: TestPanelProps) {
  const [variables, setVariables] = useState<Record<string, string>>(
    prompt.variables ? Object.keys(prompt.variables).reduce((acc, key) => {
      acc[key] = ''
      return acc
    }, {} as Record<string, string>) : {}
  )
  const [model, setModel] = useState('gpt-3.5-turbo')
  const [response, setResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTest = async () => {
    setIsLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch(`/api/prompts/${prompt.id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables, model }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to test prompt')
      }

      const data = await res.json()
      setResponse(data.response)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Template Variables */}
      {prompt.variables && Object.keys(prompt.variables).length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Template Variables</h4>
          {Object.keys(variables).map((key) => (
            <div key={key} className="space-y-2">
              <label htmlFor={`var-${key}`} className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {key}
              </label>
              <Input
                id={`var-${key}`}
                value={variables[key]}
                onChange={(e) =>
                  setVariables({ ...variables, [key]: e.target.value })
                }
                placeholder={`Enter value for ${key}`}
                className="h-12 border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600"
              />
            </div>
          ))}
        </div>
      )}

      {/* Model Selection */}
      <div className="space-y-2">
        <label htmlFor="model" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          AI Model
        </label>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger id="model" className="h-12 border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-lg border-blue-300 dark:bg-slate-800 dark:border-slate-600">
            <SelectItem value="gpt-3.5-turbo" className="hover:bg-blue-50 dark:hover:bg-blue-950">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="gpt-4" className="hover:bg-blue-50 dark:hover:bg-blue-950">GPT-4</SelectItem>
            <SelectItem value="gpt-4-turbo-preview" className="hover:bg-blue-50 dark:hover:bg-blue-950">GPT-4 Turbo</SelectItem>
            <SelectItem value="claude-3-5-sonnet-20241022" className="hover:bg-blue-50 dark:hover:bg-blue-950">Claude 3.5 Sonnet</SelectItem>
            <SelectItem value="claude-3-opus-20240229" className="hover:bg-blue-50 dark:hover:bg-blue-950">Claude 3 Opus</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Execute Button */}
      <Button 
        onClick={handleTest} 
        disabled={isLoading} 
        variant="default"
        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:from-blue-700 hover:to-blue-600 hover:shadow-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Testing...
          </>
        ) : (
          <>
            <TestTube className="mr-2 h-4 w-4" />
            Test Prompt
          </>
        )}
      </Button>

      {error && (
        <Card className="border-2 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {response && (
        <Card className="border-2 border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 max-h-[600px] overflow-y-auto">
                {response}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

