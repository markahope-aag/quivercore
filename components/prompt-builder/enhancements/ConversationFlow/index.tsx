'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip } from '@/components/ui/tooltip'
import { X } from 'lucide-react'
import { ENHANCEMENT_HELP } from '@/lib/constants/enhancement-help'
import { EnhancementExamples } from '../EnhancementExamples'
import type { ConversationFlow as ConversationFlowType } from '@/src/types/index'

interface ConversationFlowProps {
  config: ConversationFlowType
  onChange: (config: ConversationFlowType) => void
}

export function ConversationFlow({ config, onChange }: ConversationFlowProps) {
  const [followUpInput, setFollowUpInput] = useState('')

  const addFollowUp = () => {
    if (followUpInput.trim()) {
      onChange({
        ...config,
        followUpTemplates: [...config.followUpTemplates, followUpInput.trim()],
      })
      setFollowUpInput('')
    }
  }

  const removeFollowUp = (index: number) => {
    onChange({
      ...config,
      followUpTemplates: config.followUpTemplates.filter((_, i) => i !== index),
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle>Conversation Flow</CardTitle>
              <Tooltip content={ENHANCEMENT_HELP.conversationFlow.tooltip} />
            </div>
            <CardDescription>{ENHANCEMENT_HELP.conversationFlow.description}</CardDescription>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled: boolean) => onChange({ ...config, enabled })}
          />
        </div>
      </CardHeader>
      {config.enabled && (
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="context-preservation"
              checked={config.contextPreservation}
              onCheckedChange={(contextPreservation: boolean) =>
                onChange({ ...config, contextPreservation })
              }
            />
            <Label htmlFor="context-preservation" className="font-normal cursor-pointer">
              Preserve context from previous exchanges
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="clarification-protocols"
              checked={config.clarificationProtocols}
              onCheckedChange={(clarificationProtocols: boolean) =>
                onChange({ ...config, clarificationProtocols })
              }
            />
            <Label htmlFor="clarification-protocols" className="font-normal cursor-pointer">
              Allow AI to ask clarifying questions if request is ambiguous
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="iteration-improvement"
              checked={config.iterationImprovement}
              onCheckedChange={(iterationImprovement: boolean) =>
                onChange({ ...config, iterationImprovement })
              }
            />
            <Label htmlFor="iteration-improvement" className="font-normal cursor-pointer">
              Offer to refine or improve response based on feedback
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="follow-up-templates">Follow-up Question Templates (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="follow-up-templates"
                placeholder="e.g., 'Can you provide more detail on...'"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addFollowUp()
                  }
                }}
              />
              <Button type="button" onClick={addFollowUp} size="sm">
                Add
              </Button>
            </div>
            {config.followUpTemplates.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {config.followUpTemplates.map((template, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                  >
                    <span>{template}</span>
                    <button
                      type="button"
                      onClick={() => removeFollowUp(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <EnhancementExamples
            before={ENHANCEMENT_HELP.conversationFlow.examples.before}
            after={ENHANCEMENT_HELP.conversationFlow.examples.after}
            title="Example: Conversation Flow"
          />
        </CardContent>
      )}
    </Card>
  )
}
