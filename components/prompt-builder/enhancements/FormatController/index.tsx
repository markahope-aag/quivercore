'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip } from '@/components/ui/tooltip'
import { FORMAT_STRUCTURES, LENGTH_SPEC_TYPES, STYLE_GUIDES } from '@/src/constants/enhancements'
import { ENHANCEMENT_HELP } from '@/lib/constants/enhancement-help'
import { EnhancementExamples } from '../EnhancementExamples'
import type { FormatControl as FormatControlType } from '@/lib/types/enhancements'

interface FormatControllerProps {
  config: FormatControlType
  onChange: (config: FormatControlType) => void
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
            <Label htmlFor="format-structure">Output Structure</Label>
            <Select
              value={config.structure}
              onValueChange={(structure: FormatControlType['structure']) => onChange({ ...config, structure })}
            >
              <SelectTrigger id="format-structure">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_STRUCTURES.map((option) => (
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

          {config.structure === 'custom' && (
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

          <div className="space-y-2">
            <Label htmlFor="length-spec-type">Length Specification Type</Label>
            <Select
              value={config.lengthSpec.type}
              onValueChange={(type: FormatControlType['lengthSpec']['type']) =>
                onChange({ ...config, lengthSpec: { ...config.lengthSpec, type } })
              }
            >
              <SelectTrigger id="length-spec-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LENGTH_SPEC_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {config.lengthSpec.type && (
            <div className="grid grid-cols-3 gap-2">
              {config.lengthSpec.min !== undefined && (
                <div className="space-y-2">
                  <Label htmlFor="length-min">Min</Label>
                  <Input
                    id="length-min"
                    type="number"
                    min="0"
                    value={config.lengthSpec.min || ''}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        lengthSpec: {
                          ...config.lengthSpec,
                          min: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        },
                      })
                    }
                  />
                </div>
              )}
              {config.lengthSpec.target !== undefined && (
                <div className="space-y-2">
                  <Label htmlFor="length-target">Target</Label>
                  <Input
                    id="length-target"
                    type="number"
                    min="0"
                    value={config.lengthSpec.target || ''}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        lengthSpec: {
                          ...config.lengthSpec,
                          target: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        },
                      })
                    }
                  />
                </div>
              )}
              {config.lengthSpec.max !== undefined && (
                <div className="space-y-2">
                  <Label htmlFor="length-max">Max</Label>
                  <Input
                    id="length-max"
                    type="number"
                    min="0"
                    value={config.lengthSpec.max || ''}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        lengthSpec: {
                          ...config.lengthSpec,
                          max: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        },
                      })
                    }
                  />
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="style-guide">Style Guide</Label>
            <Select
              value={config.styleGuide}
              onValueChange={(styleGuide: FormatControlType['styleGuide']) =>
                onChange({ ...config, styleGuide })
              }
            >
              <SelectTrigger id="style-guide">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STYLE_GUIDES.map((option) => (
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
