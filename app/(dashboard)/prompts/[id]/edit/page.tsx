import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PromptForm } from '@/components/prompts/prompt-form'

interface EditPromptPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPromptPage({ params }: EditPromptPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  const { data: prompt, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !prompt) {
    redirect('/prompts')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Prompt</h1>
        <p className="text-muted-foreground">
          Update your prompt, template, or snippet
        </p>
      </div>
      <PromptForm prompt={prompt} />
    </div>
  )
}

