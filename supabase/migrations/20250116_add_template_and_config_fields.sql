-- Add is_template and builder_config fields to prompts table
-- This migration adds fields to distinguish templates from prompts
-- and preserve full builder configuration for reconstruction

-- 1. Add is_template boolean field
ALTER TABLE prompts
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;

-- 2. Add builder_config JSONB field to store complete builder state
ALTER TABLE prompts
ADD COLUMN IF NOT EXISTS builder_config JSONB DEFAULT NULL;

-- 3. Create index for is_template for efficient filtering
CREATE INDEX IF NOT EXISTS idx_prompts_is_template ON prompts(is_template);

-- 4. Create GIN index for builder_config JSONB queries
CREATE INDEX IF NOT EXISTS idx_prompts_builder_config ON prompts USING GIN(builder_config);

-- 5. Add comment explaining the fields
COMMENT ON COLUMN prompts.is_template IS 'Indicates whether this is a reusable template (true) or a specific prompt (false)';
COMMENT ON COLUMN prompts.builder_config IS 'Complete builder configuration (BasePromptConfig, VSEnhancement, AdvancedEnhancements) for reconstruction';

-- 6. Update the match_prompts function to include new fields
CREATE OR REPLACE FUNCTION match_prompts(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10,
  user_filter uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  content text,
  type prompt_type,
  category text,
  tags text[],
  description text,
  variables jsonb,
  usage_count integer,
  is_favorite boolean,
  is_template boolean,
  builder_config jsonb,
  use_case text,
  framework text,
  enhancement_technique text,
  archived boolean,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.title,
    p.content,
    p.type,
    p.category,
    p.tags,
    p.description,
    p.variables,
    p.usage_count,
    p.is_favorite,
    p.is_template,
    p.builder_config,
    p.use_case,
    p.framework,
    p.enhancement_technique,
    p.archived,
    p.last_used_at,
    p.created_at,
    p.updated_at,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM prompts p
  WHERE
    p.embedding IS NOT NULL
    AND (user_filter IS NULL OR p.user_id = user_filter)
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
