'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CONVERSATION_FLOW_TYPES } from '@/lib/constants/enhancements'
import type { ConversationFlow as ConversationFlowType } from '@/lib/utils/enhancementGenerators'

interface ConversationFlowProps {
  config: ConversationFlowType
  onChange: (config: ConversationFlowType) => void
}

export function ConversationFlow({ config, onChange }: ConversationFlowProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversation Flow</CardTitle>
        <CardDescription>
          Configure how the AI should structure its interaction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label>Flow Type</Label>
          <RadioGroup
            value={config.type}
            onValueChange={(type: any) => onChange({ ...config, type })}
          >
            {CONVERSATION_FLOW_TYPES.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="font-normal cursor-pointer flex-1">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {config.type === 'clarifying' && (
          <div className="flex items-center space-x-2 pl-6">
            <Switch
              id="allow-clarification"
              checked={config.allowClarification || false}
              onCheckedChange={(allowClarification: boolean) =>
                onChange({ ...config, allowClarification })
              }
            />
            <Label htmlFor="allow-clarification" className="font-normal cursor-pointer">
              Allow AI to ask clarifying questions
            </Label>
          </div>
        )}

        {['iterative', 'multi_step', 'collaborative'].includes(config.type) && (
          <div className="space-y-2">
            <Label htmlFor="context">Conversation Context (Optional)</Label>
            <Textarea
              id="context"
              placeholder="Provide any relevant background or previous conversation context..."
              value={config.context || ''}
              onChange={(e) => onChange({ ...config, context: e.target.value })}
              rows={3}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
