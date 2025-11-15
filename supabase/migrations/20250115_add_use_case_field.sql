-- Add use_case field to prompts table
ALTER TABLE prompts ADD COLUMN use_case TEXT;

-- Create index for use_case field for efficient filtering
CREATE INDEX idx_prompts_use_case ON prompts(use_case);

-- Drop the existing match_prompts function first
DROP FUNCTION IF EXISTS match_prompts(vector, double precision, integer, uuid);

-- Recreate the match_prompts function with use_case included
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
  use_case text,
  tags text[],
  description text,
  variables jsonb,
  usage_count integer,
  is_favorite boolean,
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
    p.use_case,
    p.tags,
    p.description,
    p.variables,
    p.usage_count,
    p.is_favorite,
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
