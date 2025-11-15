'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { X, Plus } from 'lucide-react'
import { TONE_OPTIONS, AUDIENCE_OPTIONS, COMPLEXITY_LEVELS } from '@/lib/constants/enhancements'
import type { SmartConstraints as SmartConstraintsType } from '@/lib/utils/enhancementGenerators'

interface SmartConstraintsProps {
  config: SmartConstraintsType
  onChange: (config: SmartConstraintsType) => void
}

export function SmartConstraints({ config, onChange }: SmartConstraintsProps) {
  const [exclusionInput, setExclusionInput] = useState('')
  const [requirementInput, setRequirementInput] = useState('')

  const addExclusion = () => {
    if (exclusionInput.trim()) {
      onChange({
        ...config,
        exclusions: {
          ...config.exclusions,
          items: [...config.exclusions.items, exclusionInput.trim()],
        },
      })
      setExclusionInput('')
    }
  }

  const removeExclusion = (index: number) => {
    onChange({
      ...config,
      exclusions: {
        ...config.exclusions,
        items: config.exclusions.items.filter((_, i) => i !== index),
      },
    })
  }

  const addRequirement = () => {
    if (requirementInput.trim()) {
      onChange({
        ...config,
        requirements: {
          ...config.requirements,
          items: [...config.requirements.items, requirementInput.trim()],
        },
      })
      setRequirementInput('')
    }
  }

  const removeRequirement = (index: number) => {
    onChange({
      ...config,
      requirements: {
        ...config.requirements,
        items: config.requirements.items.filter((_, i) => i !== index),
      },
    })
  }

  const toggleTone = (tone: string) => {
    const tones = config.tone.tones.includes(tone)
      ? config.tone.tones.filter((t) => t !== tone)
      : [...config.tone.tones, tone]
    onChange({ ...config, tone: { ...config.tone, tones } })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Constraints</CardTitle>
        <CardDescription>
          Define specific rules, limits, and requirements for the output
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Length Constraints */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Length Constraints</Label>
            <Switch
              checked={config.length.enabled}
              onCheckedChange={(enabled: boolean) =>
                onChange({ ...config, length: { ...config.length, enabled } })
              }
            />
          </div>
          {config.length.enabled && (
            <div className="space-y-3 pl-4 border-l-2">
              <RadioGroup
                value={config.length.unit}
                onValueChange={(unit: 'words' | 'characters') =>
                  onChange({ ...config, length: { ...config.length, unit } })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="words" id="words" />
                  <Label htmlFor="words" className="font-normal cursor-pointer">
                    Words
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="characters" id="characters" />
                  <Label htmlFor="characters" className="font-normal cursor-pointer">
                    Characters
                  </Label>
                </div>
              </RadioGroup>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="min-length">Minimum</Label>
                  <Input
                    id="min-length"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={config.length.min || ''}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        length: { ...config.length, min: parseInt(e.target.value) || 0 },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-length">Maximum</Label>
                  <Input
                    id="max-length"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={config.length.max || ''}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        length: { ...config.length, max: parseInt(e.target.value) || 0 },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tone & Style */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Tone & Style</Label>
            <Switch
              checked={config.tone.enabled}
              onCheckedChange={(enabled: boolean) =>
                onChange({ ...config, tone: { ...config.tone, enabled } })
              }
            />
          </div>
          {config.tone.enabled && (
            <div className="pl-4 border-l-2">
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map((tone) => (
                  <Badge
                    key={tone}
                    variant={config.tone.tones.includes(tone) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTone(tone)}
                  >
                    {tone}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Target Audience */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Target Audience</Label>
            <Switch
              checked={config.audience.enabled}
              onCheckedChange={(enabled: boolean) =>
                onChange({ ...config, audience: { ...config.audience, enabled } })
              }
            />
          </div>
          {config.audience.enabled && (
            <div className="pl-4 border-l-2">
              <Select
                value={config.audience.target}
                onValueChange={(target) =>
                  onChange({ ...config, audience: { ...config.audience, target } })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Content Exclusions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Content Exclusions</Label>
            <Switch
              checked={config.exclusions.enabled}
              onCheckedChange={(enabled: boolean) =>
                onChange({ ...config, exclusions: { ...config.exclusions, enabled } })
              }
            />
          </div>
          {config.exclusions.enabled && (
            <div className="space-y-3 pl-4 border-l-2">
              <div className="flex gap-2">
                <Input
                  placeholder="What to avoid..."
                  value={exclusionInput}
                  onChange={(e) => setExclusionInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addExclusion()}
                />
                <Button type="button" size="icon" onClick={addExclusion}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.exclusions.items.map((item, idx) => (
                  <Badge key={idx} variant="secondary">
                    {item}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => removeExclusion(idx)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Must Include */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Must Include</Label>
            <Switch
              checked={config.requirements.enabled}
              onCheckedChange={(enabled: boolean) =>
                onChange({ ...config, requirements: { ...config.requirements, enabled } })
              }
            />
          </div>
          {config.requirements.enabled && (
            <div className="space-y-3 pl-4 border-l-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Required element..."
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addRequirement()}
                />
                <Button type="button" size="icon" onClick={addRequirement}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.requirements.items.map((item, idx) => (
                  <Badge key={idx} variant="secondary">
                    {item}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => removeRequirement(idx)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Complexity Level */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Complexity Level</Label>
            <Switch
              checked={config.complexity.enabled}
              onCheckedChange={(enabled: boolean) =>
                onChange({ ...config, complexity: { ...config.complexity, enabled } })
              }
            />
          </div>
          {config.complexity.enabled && (
            <div className="pl-4 border-l-2">
              <RadioGroup
                value={config.complexity.level}
                onValueChange={(level: any) =>
                  onChange({ ...config, complexity: { ...config.complexity, level } })
                }
              >
                {COMPLEXITY_LEVELS.map((option) => (
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
          )}
        </div>
      </CardContent>
    </Card>
  )
}
