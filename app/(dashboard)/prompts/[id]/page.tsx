import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PromptDetail } from '@/components/prompts/prompt-detail'
import { PromptDetailSkeleton } from '@/components/prompts/prompt-detail-skeleton'
import { Suspense } from 'react'

interface PromptDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PromptDetailPage({ params }: PromptDetailPageProps) {
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
    <Suspense fallback={<PromptDetailSkeleton />}>
      <PromptDetail prompt={prompt} />
    </Suspense>
  )
}

