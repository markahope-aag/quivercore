import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { TemplateMetadataRow } from '@/lib/types/templates'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Get template metadata
    const { data: metadata, error } = await supabase
      .from('template_metadata')
      .select('*')
      .eq('prompt_id', id)
      .single()

    if (error || !metadata) {
      return NextResponse.json(
        { error: 'Template metadata not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(metadata)
  } catch (error) {
    console.error('Error fetching template metadata:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Check if metadata already exists
    const { data: existing } = await supabase
      .from('template_metadata')
      .select('id')
      .eq('prompt_id', id)
      .single()

    const metadataData: Partial<TemplateMetadataRow> = {
      prompt_id: id,
      user_id: user.id,
      use_case_tags: body.metadata?.useCaseTags || [],
      industry: body.metadata?.industry || null,
      difficulty_level: body.metadata?.difficultyLevel || null,
      estimated_time: body.metadata?.estimatedTime || null,
      output_length: body.metadata?.outputLength || null,
      business_impact: body.metadata?.businessImpact || null,
      team_usage: body.metadata?.teamUsage || [],
      prerequisites: body.guidance?.prerequisites || [],
      best_practices: body.guidance?.bestPractices || [],
      common_pitfalls: body.guidance?.commonPitfalls || [],
      follow_up_prompts: body.guidance?.followUpPrompts || [],
      success_metrics: body.guidance?.successMetrics || [],
      vs_settings: body.recommendations?.vsSettings || null,
      compatible_frameworks: body.recommendations?.compatibleFrameworks || [],
      advanced_enhancements: body.recommendations?.advancedEnhancements || [],
      author: body.quality?.author || null,
      example_outputs: body.quality?.exampleOutputs || [],
      variations: body.social?.variations || [],
      related_templates: body.social?.relatedTemplates || [],
    }

    let result
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('template_metadata')
        .update(metadataData)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('template_metadata')
        .insert(metadataData)
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json(result, { status: existing ? 200 : 201 })
  } catch (error) {
    console.error('Error saving template metadata:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

