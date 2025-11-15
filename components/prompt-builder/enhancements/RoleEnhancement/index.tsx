'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip } from '@/components/ui/tooltip'
import { EXPERTISE_LEVELS, AUTHORITY_LEVELS } from '@/src/constants/enhancements'
import { ENHANCEMENT_HELP } from '@/lib/constants/enhancement-help'
import { EnhancementExamples } from '../EnhancementExamples'
import type { RoleEnhancement as RoleEnhancementType } from '@/src/types/index'

interface RoleEnhancementProps {
  config: RoleEnhancementType
  onChange: (config: RoleEnhancementType) => void
}

export function RoleEnhancement({ config, onChange }: RoleEnhancementProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle>Role Enhancement</CardTitle>
              <Tooltip content={ENHANCEMENT_HELP.roleEnhancement.tooltip} />
            </div>
            <CardDescription>{ENHANCEMENT_HELP.roleEnhancement.description}</CardDescription>
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
            <Label htmlFor="expertise-level">Expertise Level</Label>
            <Select
              value={config.expertiseLevel}
              onValueChange={(expertiseLevel: RoleEnhancementType['expertiseLevel']) => onChange({ ...config, expertiseLevel })}
            >
              <SelectTrigger id="expertise-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPERTISE_LEVELS.map((option) => (
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

          <div className="space-y-2">
            <Label htmlFor="domain-specialty">Domain Specialty</Label>
            <Input
              id="domain-specialty"
              placeholder="e.g., software engineering, legal compliance, marketing strategy"
              value={config.domainSpecialty}
              onChange={(e) => onChange({ ...config, domainSpecialty: e.target.value })}
            />
          </div>

          {config.experienceYears !== undefined && (
            <div className="space-y-2">
              <Label htmlFor="experience-years">Years of Experience (optional)</Label>
              <Input
                id="experience-years"
                type="number"
                min="0"
                max="50"
                placeholder="e.g., 10"
                value={config.experienceYears || ''}
                onChange={(e) => {
                  const years = e.target.value ? parseInt(e.target.value, 10) : undefined
                  onChange({ ...config, experienceYears: years })
                }}
              />
            </div>
          )}

          {config.contextSetting !== undefined && (
            <div className="space-y-2">
              <Label htmlFor="context-setting">Context Setting (optional)</Label>
              <Input
                id="context-setting"
                placeholder="e.g., working in a fast-paced startup environment"
                value={config.contextSetting || ''}
                onChange={(e) => onChange({ ...config, contextSetting: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="authority-level">Authority Level</Label>
            <Select
              value={config.authorityLevel}
              onValueChange={(authorityLevel: RoleEnhancementType['authorityLevel']) => onChange({ ...config, authorityLevel })}
            >
              <SelectTrigger id="authority-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUTHORITY_LEVELS.map((option) => (
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
            before={ENHANCEMENT_HELP.roleEnhancement.examples.before}
            after={ENHANCEMENT_HELP.roleEnhancement.examples.after}
            title="Example: Role Enhancement"
          />
        </CardContent>
      )}
    </Card>
  )
}
