'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip } from '@/components/ui/tooltip'
import { X, Plus } from 'lucide-react'
import { ENHANCEMENT_HELP } from '@/lib/constants/enhancement-help'
import { EnhancementExamples } from '../EnhancementExamples'
import type { SmartConstraints as SmartConstraintsType } from '@/src/types/index'

interface SmartConstraintsProps {
  config: SmartConstraintsType
  onChange: (config: SmartConstraintsType) => void
}

export function SmartConstraints({ config, onChange }: SmartConstraintsProps) {
  const [positiveInput, setPositiveInput] = useState('')
  const [negativeInput, setNegativeInput] = useState('')
  const [boundaryInput, setBoundaryInput] = useState('')
  const [qualityInput, setQualityInput] = useState('')

  const addPositive = () => {
    if (positiveInput.trim()) {
      onChange({
        ...config,
        positiveConstraints: [...config.positiveConstraints, positiveInput.trim()],
      })
      setPositiveInput('')
    }
  }

  const removePositive = (index: number) => {
    onChange({
      ...config,
      positiveConstraints: config.positiveConstraints.filter((_, i) => i !== index),
    })
  }

  const addNegative = () => {
    if (negativeInput.trim()) {
      onChange({
        ...config,
        negativeConstraints: [...config.negativeConstraints, negativeInput.trim()],
      })
      setNegativeInput('')
    }
  }

  const removeNegative = (index: number) => {
    onChange({
      ...config,
      negativeConstraints: config.negativeConstraints.filter((_, i) => i !== index),
    })
  }

  const addBoundary = () => {
    if (boundaryInput.trim()) {
      onChange({
        ...config,
        boundaryConditions: [...config.boundaryConditions, boundaryInput.trim()],
      })
      setBoundaryInput('')
    }
  }

  const removeBoundary = (index: number) => {
    onChange({
      ...config,
      boundaryConditions: config.boundaryConditions.filter((_, i) => i !== index),
    })
  }

  const addQuality = () => {
    if (qualityInput.trim()) {
      onChange({
        ...config,
        qualityGates: [...config.qualityGates, qualityInput.trim()],
      })
      setQualityInput('')
    }
  }

  const removeQuality = (index: number) => {
    onChange({
      ...config,
      qualityGates: config.qualityGates.filter((_, i) => i !== index),
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle>Smart Constraints</CardTitle>
              <Tooltip content={ENHANCEMENT_HELP.smartConstraints.tooltip} />
            </div>
            <CardDescription>{ENHANCEMENT_HELP.smartConstraints.description}</CardDescription>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled: boolean) => onChange({ ...config, enabled })}
          />
        </div>
      </CardHeader>
      {config.enabled && (
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="positive-constraints">Must Include (Positive Constraints)</Label>
            <div className="flex gap-2">
              <Input
                id="positive-constraints"
                placeholder="e.g., include statistics, cite sources"
                value={positiveInput}
                onChange={(e) => setPositiveInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addPositive()
                  }
                }}
              />
              <Button type="button" onClick={addPositive} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {config.positiveConstraints.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {config.positiveConstraints.map((constraint, index) => (
                  <Badge key={index} variant="default" className="flex items-center gap-1">
                    {constraint}
                    <button
                      type="button"
                      onClick={() => removePositive(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="negative-constraints">Must Avoid (Negative Constraints)</Label>
            <div className="flex gap-2">
              <Input
                id="negative-constraints"
                placeholder="e.g., avoid jargon, no personal opinions"
                value={negativeInput}
                onChange={(e) => setNegativeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addNegative()
                  }
                }}
              />
              <Button type="button" onClick={addNegative} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {config.negativeConstraints.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {config.negativeConstraints.map((constraint, index) => (
                  <Badge key={index} variant="destructive" className="flex items-center gap-1">
                    {constraint}
                    <button
                      type="button"
                      onClick={() => removeNegative(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="boundary-conditions">Boundary Conditions</Label>
            <div className="flex gap-2">
              <Input
                id="boundary-conditions"
                placeholder="e.g., focus on 2020-2024, US market only"
                value={boundaryInput}
                onChange={(e) => setBoundaryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addBoundary()
                  }
                }}
              />
              <Button type="button" onClick={addBoundary} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {config.boundaryConditions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {config.boundaryConditions.map((condition, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {condition}
                    <button
                      type="button"
                      onClick={() => removeBoundary(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quality-gates">Quality Gates</Label>
            <div className="flex gap-2">
              <Input
                id="quality-gates"
                placeholder="e.g., fact-check all claims, verify sources"
                value={qualityInput}
                onChange={(e) => setQualityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addQuality()
                  }
                }}
              />
              <Button type="button" onClick={addQuality} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {config.qualityGates.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {config.qualityGates.map((gate, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {gate}
                    <button
                      type="button"
                      onClick={() => removeQuality(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <EnhancementExamples
            before={ENHANCEMENT_HELP.smartConstraints.examples.before}
            after={ENHANCEMENT_HELP.smartConstraints.examples.after}
            title="Example: Smart Constraints"
          />
        </CardContent>
      )}
    </Card>
  )
}
