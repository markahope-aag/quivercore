-- Add archive and last_used_at fields to prompts table
ALTER TABLE prompts
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE;

-- Create index for archived column for faster filtering
CREATE INDEX IF NOT EXISTS idx_prompts_archived ON prompts(archived);

-- Create index for last_used_at for sorting
CREATE INDEX IF NOT EXISTS idx_prompts_last_used_at ON prompts(last_used_at DESC);

-- Update existing prompts to have last_used_at = updated_at if null
UPDATE prompts
SET last_used_at = updated_at
WHERE last_used_at IS NULL;
