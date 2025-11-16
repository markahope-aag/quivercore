-- Add source field to prompts table
-- Tracks where the prompt/template originated from

-- Add source column with default 'user'
ALTER TABLE prompts
ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'user'
CHECK (source IN ('user', 'app', 'community', 'third-party'));

-- Add comment explaining the field
COMMENT ON COLUMN prompts.source IS 'Source of the prompt: user (created by user), app (official QuiverCore), community (shared by community), third-party (imported from external source)';

-- Create index for filtering by source
CREATE INDEX IF NOT EXISTS idx_prompts_source ON prompts(source);

-- Create index for templates (prompts with variables)
CREATE INDEX IF NOT EXISTS idx_prompts_has_variables ON prompts((variables IS NOT NULL AND jsonb_typeof(variables) = 'object' AND variables != '{}'::jsonb));
