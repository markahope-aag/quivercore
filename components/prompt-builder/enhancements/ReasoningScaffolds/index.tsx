'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip } from '@/components/ui/tooltip'
import { REASONING_SCAFFOLD_TYPES } from '@/lib/constants/enhancements'
import { ENHANCEMENT_HELP } from '@/lib/constants/enhancement-help'
import { EnhancementExamples } from '../EnhancementExamples'
import type { ReasoningScaffold as ReasoningScaffoldType } from '@/lib/utils/enhancementGenerators'

interface ReasoningScaffoldsProps {
  config: ReasoningScaffoldType
  onChange: (config: ReasoningScaffoldType) => void
}

export function ReasoningScaffolds({ config, onChange }: ReasoningScaffoldsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle>Reasoning Scaffolds</CardTitle>
              <Tooltip content={ENHANCEMENT_HELP.reasoningScaffold.tooltip} />
            </div>
            <CardDescription>{ENHANCEMENT_HELP.reasoningScaffold.description}</CardDescription>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled: boolean) => onChange({ ...config, enabled })}
          />
        </div>
      </CardHeader>
      {config.enabled && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scaffold-type">Reasoning Framework</Label>
            <Select
              value={config.type}
              onValueChange={(type: any) => onChange({ ...config, type })}
            >
              <SelectTrigger id="scaffold-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REASONING_SCAFFOLD_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {config.type !== 'none' && (
            <>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-working"
                  checked={config.showWorking || false}
                  onCheckedChange={(showWorking: boolean) => onChange({ ...config, showWorking })}
                />
                <Label htmlFor="show-working" className="font-normal cursor-pointer">
                  Show reasoning process step-by-step
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-framework">Additional Framework Instructions (Optional)</Label>
                <Textarea
                  id="custom-framework"
                  placeholder="Add any specific reasoning guidelines or steps..."
                  value={config.customFramework || ''}
                  onChange={(e) => onChange({ ...config, customFramework: e.target.value })}
                  rows={3}
                />
              </div>
            </>
          )}

          <EnhancementExamples
            before={ENHANCEMENT_HELP.reasoningScaffold.examples.before}
            after={ENHANCEMENT_HELP.reasoningScaffold.examples.after}
            title="Example: Reasoning Scaffold"
          />
        </CardContent>
      )}
    </Card>
  )
}
