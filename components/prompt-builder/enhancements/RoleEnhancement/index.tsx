'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROLE_ENHANCEMENT_TYPES } from '@/lib/constants/enhancements'
import type { RoleEnhancement as RoleEnhancementType } from '@/lib/utils/enhancementGenerators'

interface RoleEnhancementProps {
  config: RoleEnhancementType
  onChange: (config: RoleEnhancementType) => void
}

export function RoleEnhancement({ config, onChange }: RoleEnhancementProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Role Enhancement</CardTitle>
            <CardDescription>
              Assign a specific role, persona, or perspective to the AI
            </CardDescription>
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
            <Label htmlFor="role-type">Role Type</Label>
            <Select
              value={config.type}
              onValueChange={(type: any) => onChange({ ...config, type })}
            >
              <SelectTrigger id="role-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_ENHANCEMENT_TYPES.map((option) => (
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

          {config.type === 'expert' && (
            <div className="space-y-2">
              <Label htmlFor="expertise">Area of Expertise</Label>
              <Input
                id="expertise"
                placeholder="e.g., software engineering, legal compliance, marketing strategy"
                value={config.expertise || ''}
                onChange={(e) => onChange({ ...config, expertise: e.target.value })}
              />
            </div>
          )}

          {config.type === 'persona' && (
            <div className="space-y-2">
              <Label htmlFor="custom-role">Persona Description</Label>
              <Textarea
                id="custom-role"
                placeholder="Describe the persona in detail (e.g., 'a seasoned tech startup founder who has raised $50M in funding')"
                value={config.customRole || ''}
                onChange={(e) => onChange({ ...config, customRole: e.target.value })}
                rows={3}
              />
            </div>
          )}

          {config.type === 'perspective' && (
            <div className="space-y-2">
              <Label htmlFor="perspective">Perspective</Label>
              <Input
                id="perspective"
                placeholder="e.g., a user experience designer, a financial analyst, a sustainability advocate"
                value={config.perspective || ''}
                onChange={(e) => onChange({ ...config, perspective: e.target.value })}
              />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
