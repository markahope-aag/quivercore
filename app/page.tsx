import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Auth error:', error)
      redirect('/login')
    }

    if (user) {
      redirect('/prompts')
    } else {
      redirect('/login')
    }
  } catch (error: any) {
    console.error('Home page error:', error)
    redirect('/login')
  }
}
