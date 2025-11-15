'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react'
import { RoleEnhancement } from '../enhancements/RoleEnhancement'
import { FormatController } from '../enhancements/FormatController'
import { SmartConstraints } from '../enhancements/SmartConstraints'
import { ReasoningScaffolds } from '../enhancements/ReasoningScaffolds'
import { ConversationFlow } from '../enhancements/ConversationFlow'
import { usePromptBuilder } from '@/contexts/PromptBuilderContext'
import { ENHANCEMENT_PRESETS, validateEnhancementConflicts } from '@/lib/constants/enhancement-help'
import type { AdvancedEnhancements } from '@/src/types/index'

export function AdvancedEnhancementsStep() {
  const { state, updateAdvancedEnhancements } = usePromptBuilder()
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [conflicts, setConflicts] = useState<any[]>([])

  // Validate enhancements whenever they change
  useEffect(() => {
    const validationResults = validateEnhancementConflicts(state.advancedEnhancements)
    setConflicts(validationResults)
  }, [state.advancedEnhancements])

  const handlePresetChange = (presetId: string) => {
    if (presetId === 'none') {
      setSelectedPreset('')
      return
    }

    const preset = ENHANCEMENT_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      setSelectedPreset(presetId)
      updateAdvancedEnhancements(preset.enhancements)
    }
  }

  const handleRoleChange = (roleEnhancement: AdvancedEnhancements['roleEnhancement']) => {
    setSelectedPreset('') // Clear preset when manually changing
    updateAdvancedEnhancements({ roleEnhancement })
  }

  const handleFormatChange = (formatControl: AdvancedEnhancements['formatControl']) => {
    setSelectedPreset('') // Clear preset when manually changing
    updateAdvancedEnhancements({ formatControl })
  }

  const handleConstraintsChange = (smartConstraints: AdvancedEnhancements['smartConstraints']) => {
    setSelectedPreset('') // Clear preset when manually changing
    updateAdvancedEnhancements({ smartConstraints })
  }

  const handleReasoningChange = (reasoningScaffolds: AdvancedEnhancements['reasoningScaffolds']) => {
    setSelectedPreset('') // Clear preset when manually changing
    updateAdvancedEnhancements({ reasoningScaffolds })
  }

  const handleFlowChange = (conversationFlow: AdvancedEnhancements['conversationFlow']) => {
    setSelectedPreset('') // Clear preset when manually changing
    updateAdvancedEnhancements({ conversationFlow })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Advanced Enhancements</h2>
        <p className="text-muted-foreground">
          Fine-tune your prompt with advanced controls for role, format, constraints, and reasoning
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          These enhancements are optional but can significantly improve output quality. Enable only the ones relevant to your use case.
        </AlertDescription>
      </Alert>

      {/* Preset Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Presets</CardTitle>
          <CardDescription>
            Start with a preset configuration optimized for common use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedPreset || 'none'} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a preset..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Custom Configuration</SelectItem>
              {ENHANCEMENT_PRESETS.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  <div>
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs text-muted-foreground">{preset.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedPreset && (
            <div className="mt-3 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                Example Prompt:
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-400 italic">
                {ENHANCEMENT_PRESETS.find((p) => p.id === selectedPreset)?.examplePrompt}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Warnings/Errors */}
      {conflicts.length > 0 && (
        <Card className={conflicts.some((c) => c.type === 'error') ? 'border-red-300' : 'border-yellow-300'}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {conflicts.some((c) => c.type === 'error') ? (
                <AlertCircle className="h-5 w-5 text-red-600" />
              ) : (
                <Info className="h-5 w-5 text-yellow-600" />
              )}
              Enhancement Validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conflicts.map((conflict, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md ${
                    conflict.type === 'error'
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                  }`}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      conflict.type === 'error'
                        ? 'text-red-900 dark:text-red-300'
                        : 'text-yellow-900 dark:text-yellow-300'
                    }`}
                  >
                    {conflict.type === 'error' ? 'Error' : 'Warning'}: {conflict.message}
                  </div>
                  {conflict.suggestion && (
                    <div
                      className={`text-xs ${
                        conflict.type === 'error'
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-yellow-700 dark:text-yellow-400'
                      }`}
                    >
                      💡 {conflict.suggestion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Success */}
      {conflicts.length === 0 && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-300">
            All enhancement configurations are valid. No conflicts detected.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {state.advancedEnhancements.roleEnhancement && (
          <RoleEnhancement
            config={state.advancedEnhancements.roleEnhancement as any}
            onChange={handleRoleChange as any}
          />
        )}

        {state.advancedEnhancements.formatControl && (
          <FormatController
            config={state.advancedEnhancements.formatControl as any}
            onChange={handleFormatChange as any}
          />
        )}

        {state.advancedEnhancements.smartConstraints && (
          <SmartConstraints
            config={state.advancedEnhancements.smartConstraints as any}
            onChange={handleConstraintsChange as any}
          />
        )}

        {state.advancedEnhancements.reasoningScaffolds && (
          <ReasoningScaffolds
            config={state.advancedEnhancements.reasoningScaffolds as any}
            onChange={handleReasoningChange as any}
          />
        )}

        {state.advancedEnhancements.conversationFlow && (
          <ConversationFlow
            config={state.advancedEnhancements.conversationFlow as any}
            onChange={handleFlowChange as any}
          />
        )}
      </div>
    </div>
  )
}
