-- Add enhancement_technique field to prompts table
-- Enhancement technique represents advanced techniques to improve prompt performance

ALTER TABLE prompts ADD COLUMN enhancement_technique TEXT;

-- Add index for faster filtering by enhancement technique
CREATE INDEX idx_prompts_enhancement_technique ON prompts(enhancement_technique);

-- Update the match_prompts function to include enhancement_technique in the query
DROP FUNCTION IF EXISTS match_prompts(vector, double precision, integer, uuid);

CREATE OR REPLACE FUNCTION match_prompts(
  query_embedding vector(1536),
  match_threshold double precision,
  match_count integer,
  filter_user_id uuid
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  content text,
  description text,
  use_case text,
  framework text,
  enhancement_technique text,
  tags text[],
  variables jsonb,
  usage_count integer,
  is_favorite boolean,
  created_at timestamptz,
  updated_at timestamptz,
  similarity double precision
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    prompts.id,
    prompts.user_id,
    prompts.title,
    prompts.content,
    prompts.description,
    prompts.use_case,
    prompts.framework,
    prompts.enhancement_technique,
    prompts.tags,
    prompts.variables,
    prompts.usage_count,
    prompts.is_favorite,
    prompts.created_at,
    prompts.updated_at,
    1 - (prompts.embedding <=> query_embedding) AS similarity
  FROM prompts
  WHERE prompts.user_id = filter_user_id
    AND 1 - (prompts.embedding <=> query_embedding) > match_threshold
  ORDER BY prompts.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
