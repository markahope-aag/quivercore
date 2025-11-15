import { PromptForm } from '@/components/prompts/prompt-form'

export default function NewPromptPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Prompt</h1>
        <p className="text-muted-foreground">
          Add a new prompt, email template, or snippet to your library
        </p>
      </div>
      <PromptForm />
    </div>
  )
}

