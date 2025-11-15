'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="space-y-4">
      {prompt.variables && Object.keys(prompt.variables).length > 0 && (
        <div className="space-y-4">
          <Label>Template Variables</Label>
          {Object.keys(variables).map((key) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`var-${key}`}>{key}</Label>
              <Input
                id={`var-${key}`}
                value={variables[key]}
                onChange={(e) =>
                  setVariables({ ...variables, [key]: e.target.value })
                }
                placeholder={`Enter value for ${key}`}
              />
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="model">Model</Label>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger id="model">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="gpt-4-turbo-preview">GPT-4 Turbo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleTest} disabled={isLoading} className="w-full">
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
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg">
                {response}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

