'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip } from '@/components/ui/tooltip'
import { REASONING_STYLES } from '@/src/constants/enhancements'
import { ENHANCEMENT_HELP } from '@/lib/constants/enhancement-help'
import { EnhancementExamples } from '../EnhancementExamples'
import type { ReasoningScaffolds as ReasoningScaffoldsType } from '@/src/types/index'

interface ReasoningScaffoldsProps {
  config: ReasoningScaffoldsType
  onChange: (config: ReasoningScaffoldsType) => void
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
            <Label htmlFor="reasoning-style">Reasoning Style</Label>
            <Select
              value={config.reasoningStyle}
              onValueChange={(reasoningStyle: ReasoningScaffoldsType['reasoningStyle']) =>
                onChange({ ...config, reasoningStyle })
              }
            >
              <SelectTrigger id="reasoning-style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REASONING_STYLES.map((option) => (
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

          <div className="flex items-center space-x-2">
            <Switch
              id="show-work"
              checked={config.showWork}
              onCheckedChange={(showWork: boolean) => onChange({ ...config, showWork })}
            />
            <Label htmlFor="show-work" className="font-normal cursor-pointer">
              Show your reasoning process clearly
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="step-by-step"
              checked={config.stepByStep}
              onCheckedChange={(stepByStep: boolean) => onChange({ ...config, stepByStep })}
            />
            <Label htmlFor="step-by-step" className="font-normal cursor-pointer">
              Break down your approach step-by-step
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="explore-alternatives"
              checked={config.exploreAlternatives}
              onCheckedChange={(exploreAlternatives: boolean) =>
                onChange({ ...config, exploreAlternatives })
              }
            />
            <Label htmlFor="explore-alternatives" className="font-normal cursor-pointer">
              Consider alternative approaches and explain why you chose your method
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="confidence-scoring"
              checked={config.confidenceScoring}
              onCheckedChange={(confidenceScoring: boolean) =>
                onChange({ ...config, confidenceScoring })
              }
            />
            <Label htmlFor="confidence-scoring" className="font-normal cursor-pointer">
              Provide confidence scores (0-100%) for your key assertions
            </Label>
          </div>

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
