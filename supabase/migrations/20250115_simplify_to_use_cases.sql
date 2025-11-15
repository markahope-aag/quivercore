-- Remove type and category fields from prompts table
-- Note: We're keeping the columns but will stop using them in the app
-- If you want to fully remove them later, you can run:
-- ALTER TABLE prompts DROP COLUMN type;
-- ALTER TABLE prompts DROP COLUMN category;
-- DROP TYPE IF EXISTS prompt_type;

-- For now, we'll just set defaults and make them nullable
ALTER TABLE prompts ALTER COLUMN type DROP NOT NULL;
ALTER TABLE prompts ALTER COLUMN type SET DEFAULT NULL;

-- Update match_prompts function to remove type and category
DROP FUNCTION IF EXISTS match_prompts(vector, double precision, integer, uuid);

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
