import React from 'react'
import { usePromptBuilder } from '@/contexts/PromptBuilderContext'
import type {
  RoleEnhancement,
  FormatControl,
  SmartConstraints,
  ReasoningScaffolds,
  ConversationFlow,
} from '@/src/types/index'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X, Plus } from 'lucide-react'

const AdvancedEnhancementsStep: React.FC = () => {
  const { state, updateAdvancedEnhancements } = usePromptBuilder()
  const [activeTab, setActiveTab] = React.useState<string>('role')

  const enhancementTabs = [
    { id: 'role', label: 'Role & Expertise', description: 'Define AI expertise and authority level' },
    { id: 'format', label: 'Output Format', description: 'Control structure and style of responses' },
    { id: 'constraints', label: 'Smart Constraints', description: 'Set boundaries and requirements' },
    { id: 'reasoning', label: 'Reasoning', description: 'Enhance thinking and explanation quality' },
    { id: 'conversation', label: 'Conversation Flow', description: 'Multi-turn interaction design' },
  ]

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {enhancementTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div>
                <div>{tab.label}</div>
                <div className="text-xs text-gray-400">{tab.description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'role' && <RoleEnhancementPanel />}
        {activeTab === 'format' && <FormatControlPanel />}
        {activeTab === 'constraints' && <SmartConstraintsPanel />}
        {activeTab === 'reasoning' && <ReasoningScaffoldsPanel />}
        {activeTab === 'conversation' && <ConversationFlowPanel />}
      </div>
    </div>
  )
}

// Role Enhancement Panel
const RoleEnhancementPanel: React.FC = () => {
  const { state, updateAdvancedEnhancements } = usePromptBuilder()
  const config = state.advancedEnhancements?.roleEnhancement || {
    enabled: false,
    expertiseLevel: 'intermediate' as const,
    domainSpecialty: '',
    authorityLevel: 'advisory' as const,
  }

  const handleChange = (updates: Partial<RoleEnhancement>) => {
    const newConfig = { ...config, ...updates }
    updateAdvancedEnhancements({
      roleEnhancement: newConfig,
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Role Enhancement</CardTitle>
            <CardDescription>Define the AI's expertise level and authority</CardDescription>
          </div>
          <Switch checked={config.enabled} onCheckedChange={(enabled) => handleChange({ enabled })} />
        </div>
      </CardHeader>
      {config.enabled && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Expertise Level</Label>
            <Select
              value={config.expertiseLevel}
              onValueChange={(value: RoleEnhancement['expertiseLevel']) =>
                handleChange({ expertiseLevel: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="novice">Novice</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
                <SelectItem value="world-class">World-Class</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Domain Specialty</Label>
            <Input
              value={config.domainSpecialty}
              onChange={(e) => handleChange({ domainSpecialty: e.target.value })}
              placeholder="e.g., Machine Learning, Marketing Strategy"
            />
          </div>

          <div className="space-y-2">
            <Label>Experience Years (Optional)</Label>
            <Input
              type="number"
              value={config.experienceYears || ''}
              onChange={(e) =>
                handleChange({ experienceYears: e.target.value ? parseInt(e.target.value) : undefined })
              }
              placeholder="e.g., 10"
            />
          </div>

          <div className="space-y-2">
            <Label>Context Setting (Optional)</Label>
            <Textarea
              value={config.contextSetting || ''}
              onChange={(e) => handleChange({ contextSetting: e.target.value })}
              placeholder="Additional context about the role"
            />
          </div>

          <div className="space-y-2">
            <Label>Authority Level</Label>
            <Select
              value={config.authorityLevel}
              onValueChange={(value: RoleEnhancement['authorityLevel']) =>
                handleChange({ authorityLevel: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="advisory">Advisory</SelectItem>
                <SelectItem value="authoritative">Authoritative</SelectItem>
                <SelectItem value="definitive">Definitive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Format Control Panel
const FormatControlPanel: React.FC = () => {
  const { state, updateAdvancedEnhancements } = usePromptBuilder()
  const config = state.advancedEnhancements?.formatControl || {
    enabled: false,
    structure: 'paragraphs' as const,
    lengthSpec: { type: 'word-count' as const },
    styleGuide: 'formal' as const,
  }

  const handleChange = (updates: Partial<FormatControl>) => {
    const newConfig = { ...config, ...updates }
    updateAdvancedEnhancements({
      formatControl: newConfig,
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Format Control</CardTitle>
            <CardDescription>Control the structure and style of responses</CardDescription>
          </div>
          <Switch checked={config.enabled} onCheckedChange={(enabled) => handleChange({ enabled })} />
        </div>
      </CardHeader>
      {config.enabled && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Structure</Label>
            <Select
              value={config.structure}
              onValueChange={(value: FormatControl['structure']) => handleChange({ structure: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bullet-points">Bullet Points</SelectItem>
                <SelectItem value="numbered-list">Numbered List</SelectItem>
                <SelectItem value="paragraphs">Paragraphs</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="table">Table</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.structure === 'custom' && (
            <div className="space-y-2">
              <Label>Custom Format</Label>
              <Textarea
                value={config.customFormat || ''}
                onChange={(e) => handleChange({ customFormat: e.target.value })}
                placeholder="Describe the custom format structure"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Length Specification</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={config.lengthSpec.type}
                onValueChange={(value: FormatControl['lengthSpec']['type']) =>
                  handleChange({ lengthSpec: { ...config.lengthSpec, type: value } })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="word-count">Word Count</SelectItem>
                  <SelectItem value="sentence-count">Sentence Count</SelectItem>
                  <SelectItem value="paragraph-count">Paragraph Count</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Min"
                value={config.lengthSpec.min || ''}
                onChange={(e) =>
                  handleChange({
                    lengthSpec: { ...config.lengthSpec, min: e.target.value ? parseInt(e.target.value) : undefined },
                  })
                }
              />
              <Input
                type="number"
                placeholder="Target"
                value={config.lengthSpec.target || ''}
                onChange={(e) =>
                  handleChange({
                    lengthSpec: { ...config.lengthSpec, target: e.target.value ? parseInt(e.target.value) : undefined },
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Style Guide</Label>
            <Select
              value={config.styleGuide}
              onValueChange={(value: FormatControl['styleGuide']) => handleChange({ styleGuide: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="conversational">Conversational</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Smart Constraints Panel
const SmartConstraintsPanel: React.FC = () => {
  const { state, updateAdvancedEnhancements } = usePromptBuilder()
  const config = state.advancedEnhancements?.smartConstraints || {
    enabled: false,
    positiveConstraints: [],
    negativeConstraints: [],
    boundaryConditions: [],
    qualityGates: [],
  }

  const handleChange = (updates: Partial<SmartConstraints>) => {
    const newConfig = { ...config, ...updates }
    updateAdvancedEnhancements({
      smartConstraints: newConfig,
    })
  }

  const addConstraint = (type: 'positive' | 'negative' | 'boundary' | 'quality', value: string) => {
    if (!value.trim()) return

    const updates: Partial<SmartConstraints> = {}
    switch (type) {
      case 'positive':
        updates.positiveConstraints = [...config.positiveConstraints, value]
        break
      case 'negative':
        updates.negativeConstraints = [...config.negativeConstraints, value]
        break
      case 'boundary':
        updates.boundaryConditions = [...config.boundaryConditions, value]
        break
      case 'quality':
        updates.qualityGates = [...config.qualityGates, value]
        break
    }
    handleChange(updates)
  }

  const removeConstraint = (type: 'positive' | 'negative' | 'boundary' | 'quality', index: number) => {
    const updates: Partial<SmartConstraints> = {}
    switch (type) {
      case 'positive':
        updates.positiveConstraints = config.positiveConstraints.filter((_: string, i: number) => i !== index)
        break
      case 'negative':
        updates.negativeConstraints = config.negativeConstraints.filter((_: string, i: number) => i !== index)
        break
      case 'boundary':
        updates.boundaryConditions = config.boundaryConditions.filter((_: string, i: number) => i !== index)
        break
      case 'quality':
        updates.qualityGates = config.qualityGates.filter((_: string, i: number) => i !== index)
        break
    }
    handleChange(updates)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Smart Constraints</CardTitle>
            <CardDescription>Set boundaries, requirements, and quality gates</CardDescription>
          </div>
          <Switch checked={config.enabled} onCheckedChange={(enabled) => handleChange({ enabled })} />
        </div>
      </CardHeader>
      {config.enabled && (
        <CardContent className="space-y-6">
          <ConstraintList
            title="Positive Constraints (Must Include)"
            items={config.positiveConstraints}
            onAdd={(value) => addConstraint('positive', value)}
            onRemove={(index) => removeConstraint('positive', index)}
          />
          <ConstraintList
            title="Negative Constraints (Must Avoid)"
            items={config.negativeConstraints}
            onAdd={(value) => addConstraint('negative', value)}
            onRemove={(index) => removeConstraint('negative', index)}
          />
          <ConstraintList
            title="Boundary Conditions"
            items={config.boundaryConditions}
            onAdd={(value) => addConstraint('boundary', value)}
            onRemove={(index) => removeConstraint('boundary', index)}
          />
          <ConstraintList
            title="Quality Gates"
            items={config.qualityGates}
            onAdd={(value) => addConstraint('quality', value)}
            onRemove={(index) => removeConstraint('quality', index)}
          />
        </CardContent>
      )}
    </Card>
  )
}

// Constraint List Component
const ConstraintList: React.FC<{
  title: string
  items: string[]
  onAdd: (value: string) => void
  onRemove: (index: number) => void
}> = ({ title, items, onAdd, onRemove }) => {
  const [inputValue, setInputValue] = React.useState('')

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim())
      setInputValue('')
    }
  }

  return (
    <div className="space-y-2">
      <Label>{title}</Label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add constraint..."
        />
        <Button type="button" onClick={handleAdd} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <span className="text-sm">{item}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
              className="h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

// Reasoning Scaffolds Panel
const ReasoningScaffoldsPanel: React.FC = () => {
  const { state, updateAdvancedEnhancements } = usePromptBuilder()
  const config = state.advancedEnhancements?.reasoningScaffolds || {
    enabled: false,
    showWork: false,
    stepByStep: false,
    exploreAlternatives: false,
    confidenceScoring: false,
    reasoningStyle: 'logical' as const,
  }

  const handleChange = (updates: Partial<ReasoningScaffolds>) => {
    const newConfig = { ...config, ...updates }
    updateAdvancedEnhancements({
      reasoningScaffolds: newConfig,
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Reasoning Scaffolds</CardTitle>
            <CardDescription>Enhance thinking and explanation quality</CardDescription>
          </div>
          <Switch checked={config.enabled} onCheckedChange={(enabled) => handleChange({ enabled })} />
        </div>
      </CardHeader>
      {config.enabled && (
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Show Work</Label>
            <Switch checked={config.showWork} onCheckedChange={(value) => handleChange({ showWork: value })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Step-by-Step</Label>
            <Switch
              checked={config.stepByStep}
              onCheckedChange={(value) => handleChange({ stepByStep: value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Explore Alternatives</Label>
            <Switch
              checked={config.exploreAlternatives}
              onCheckedChange={(value) => handleChange({ exploreAlternatives: value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Confidence Scoring</Label>
            <Switch
              checked={config.confidenceScoring}
              onCheckedChange={(value) => handleChange({ confidenceScoring: value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Reasoning Style</Label>
            <Select
              value={config.reasoningStyle}
              onValueChange={(value: ReasoningScaffolds['reasoningStyle']) =>
                handleChange({ reasoningStyle: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="logical">Logical</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="analytical">Analytical</SelectItem>
                <SelectItem value="practical">Practical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Conversation Flow Panel
const ConversationFlowPanel: React.FC = () => {
  const { state, updateAdvancedEnhancements } = usePromptBuilder()
  const config = state.advancedEnhancements?.conversationFlow || {
    enabled: false,
    contextPreservation: false,
    followUpTemplates: [],
    clarificationProtocols: false,
    iterationImprovement: false,
  }

  const handleChange = (updates: Partial<ConversationFlow>) => {
    const newConfig = { ...config, ...updates }
    updateAdvancedEnhancements({
      conversationFlow: newConfig,
    })
  }

  const [followUpInput, setFollowUpInput] = React.useState('')

  const addFollowUp = () => {
    if (followUpInput.trim()) {
      handleChange({ followUpTemplates: [...config.followUpTemplates, followUpInput.trim()] })
      setFollowUpInput('')
    }
  }

  const removeFollowUp = (index: number) => {
    handleChange({
      followUpTemplates: config.followUpTemplates.filter((_: string, i: number) => i !== index),
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Conversation Flow</CardTitle>
            <CardDescription>Multi-turn interaction design</CardDescription>
          </div>
          <Switch checked={config.enabled} onCheckedChange={(enabled) => handleChange({ enabled })} />
        </div>
      </CardHeader>
      {config.enabled && (
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Context Preservation</Label>
            <Switch
              checked={config.contextPreservation}
              onCheckedChange={(value) => handleChange({ contextPreservation: value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Clarification Protocols</Label>
            <Switch
              checked={config.clarificationProtocols}
              onCheckedChange={(value) => handleChange({ clarificationProtocols: value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Iteration Improvement</Label>
            <Switch
              checked={config.iterationImprovement}
              onCheckedChange={(value) => handleChange({ iterationImprovement: value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Follow-Up Templates</Label>
            <div className="flex gap-2">
              <Input
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addFollowUp()}
                placeholder="Add follow-up question template..."
              />
              <Button type="button" onClick={addFollowUp} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {config.followUpTemplates.map((template: string, index: number) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">{template}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFollowUp(index)}
                    className="h-6 w-6"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default AdvancedEnhancementsStep

