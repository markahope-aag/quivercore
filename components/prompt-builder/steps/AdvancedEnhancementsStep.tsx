'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { RoleEnhancement } from '../enhancements/RoleEnhancement'
import { FormatController } from '../enhancements/FormatController'
import { SmartConstraints } from '../enhancements/SmartConstraints'
import { ReasoningScaffolds } from '../enhancements/ReasoningScaffolds'
import { ConversationFlow } from '../enhancements/ConversationFlow'
import { usePromptBuilder } from '@/contexts/PromptBuilderContext'
import type { AdvancedEnhancements } from '@/lib/utils/enhancementGenerators'

export function AdvancedEnhancementsStep() {
  const { state, updateAdvancedEnhancements } = usePromptBuilder()

  const handleRoleChange = (roleEnhancement: AdvancedEnhancements['roleEnhancement']) => {
    updateAdvancedEnhancements({ roleEnhancement })
  }

  const handleFormatChange = (formatController: AdvancedEnhancements['formatController']) => {
    updateAdvancedEnhancements({ formatController })
  }

  const handleConstraintsChange = (smartConstraints: AdvancedEnhancements['smartConstraints']) => {
    updateAdvancedEnhancements({ smartConstraints })
  }

  const handleReasoningChange = (reasoningScaffold: AdvancedEnhancements['reasoningScaffold']) => {
    updateAdvancedEnhancements({ reasoningScaffold })
  }

  const handleFlowChange = (conversationFlow: AdvancedEnhancements['conversationFlow']) => {
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

      <div className="space-y-6">
        <RoleEnhancement
          config={state.advancedEnhancements.roleEnhancement}
          onChange={handleRoleChange}
        />

        <FormatController
          config={state.advancedEnhancements.formatController}
          onChange={handleFormatChange}
        />

        <SmartConstraints
          config={state.advancedEnhancements.smartConstraints}
          onChange={handleConstraintsChange}
        />

        <ReasoningScaffolds
          config={state.advancedEnhancements.reasoningScaffold}
          onChange={handleReasoningChange}
        />

        <ConversationFlow
          config={state.advancedEnhancements.conversationFlow}
          onChange={handleFlowChange}
        />
      </div>
    </div>
  )
}
