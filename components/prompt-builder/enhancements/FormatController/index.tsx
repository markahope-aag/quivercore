'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tooltip } from '@/components/ui/tooltip'
import { FORMAT_CONTROLLER_TYPES } from '@/lib/constants/enhancements'
import { ENHANCEMENT_HELP } from '@/lib/constants/enhancement-help'
import { EnhancementExamples } from '../EnhancementExamples'
import type { FormatController as FormatControllerType } from '@/lib/utils/enhancementGenerators'

interface FormatControllerProps {
  config: FormatControllerType
  onChange: (config: FormatControllerType) => void
}

export function FormatController({ config, onChange }: FormatControllerProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle>Format Controller</CardTitle>
              <Tooltip content={ENHANCEMENT_HELP.formatController.tooltip} />
            </div>
            <CardDescription>{ENHANCEMENT_HELP.formatController.description}</CardDescription>
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
            <Label htmlFor="format-type">Format Type</Label>
            <Select
              value={config.type}
              onValueChange={(type: any) => onChange({ ...config, type })}
            >
              <SelectTrigger id="format-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_CONTROLLER_TYPES.map((option) => (
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

          {config.type === 'structured' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Structured Format</Label>
                <RadioGroup
                  value={config.structuredFormat || 'json'}
                  onValueChange={(value: 'json' | 'yaml' | 'xml') =>
                    onChange({ ...config, structuredFormat: value })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="json" id="json" />
                    <Label htmlFor="json" className="font-normal cursor-pointer">
                      JSON
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yaml" id="yaml" />
                    <Label htmlFor="yaml" className="font-normal cursor-pointer">
                      YAML
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="xml" id="xml" />
                    <Label htmlFor="xml" className="font-normal cursor-pointer">
                      XML
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="include-examples"
                  checked={config.includeExamples || false}
                  onCheckedChange={(includeExamples: boolean) =>
                    onChange({ ...config, includeExamples })
                  }
                />
                <Label htmlFor="include-examples" className="font-normal cursor-pointer">
                  Include example values
                </Label>
              </div>
            </div>
          )}

          {config.type === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="custom-format">Custom Format Specification</Label>
              <Textarea
                id="custom-format"
                placeholder="Describe your desired output format..."
                value={config.customFormat || ''}
                onChange={(e) => onChange({ ...config, customFormat: e.target.value })}
                rows={4}
              />
            </div>
          )}

          <EnhancementExamples
            before={ENHANCEMENT_HELP.formatController.examples.before}
            after={ENHANCEMENT_HELP.formatController.examples.after}
            title="Example: Format Controller"
          />
        </CardContent>
      )}
    </Card>
  )
}
