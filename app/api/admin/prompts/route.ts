import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/admin'

export async function GET() {
  try {
    // Check admin access
    await requireAdmin() // Check admin access

    const supabase = await createClient()

    // Get all prompts with aggregations
    const { data: prompts, error } = await supabase
      .from('prompts')
      .select('use_case, framework, is_template')

    if (error) {
      throw error
    }

    // Aggregate by domain
    const byDomain: Record<string, number> = {}
    const byFramework: Record<string, number> = {}
    let templates = 0

    prompts?.forEach(prompt => {
      if (prompt.use_case) {
        byDomain[prompt.use_case] = (byDomain[prompt.use_case] || 0) + 1
      }
      if (prompt.framework) {
        byFramework[prompt.framework] = (byFramework[prompt.framework] || 0) + 1
      }
      if (prompt.is_template) {
        templates++
      }
    })

    return NextResponse.json({
      total: prompts?.length || 0,
      byDomain,
      byFramework,
      templates,
    })
  } catch (error: any) {
    console.error('Admin prompts error:', error)
    return NextResponse.json(
      { error: error.message || 'Unauthorized' },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    )
  }
}
