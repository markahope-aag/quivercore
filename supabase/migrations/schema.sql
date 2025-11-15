-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create enum for prompt types
CREATE TYPE prompt_type AS ENUM ('ai_prompt', 'email_template', 'snippet', 'other');

-- Prompts table
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type prompt_type NOT NULL DEFAULT 'ai_prompt',
  category TEXT,
  tags TEXT[],
  description TEXT,
  variables JSONB,
  embedding vector(1536),
  usage_count INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompt versions table
CREATE TABLE prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompt tests table
CREATE TABLE prompt_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  test_input JSONB,
  response TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_type ON prompts(type);
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_tags ON prompts USING GIN(tags);
CREATE INDEX idx_prompts_is_favorite ON prompts(is_favorite);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX idx_prompt_versions_prompt_id ON prompt_versions(prompt_id);
CREATE INDEX idx_prompt_tests_prompt_id ON prompt_tests(prompt_id);

-- Create index for vector similarity search
CREATE INDEX idx_prompts_embedding ON prompts USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Enable Row Level Security
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_tests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prompts
CREATE POLICY "Users can view their own prompts"
  ON prompts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prompts"
  ON prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts"
  ON prompts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts"
  ON prompts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for prompt_versions
CREATE POLICY "Users can view versions of their prompts"
  ON prompt_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = prompt_versions.prompt_id
      AND prompts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert versions for their prompts"
  ON prompt_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = prompt_versions.prompt_id
      AND prompts.user_id = auth.uid()
    )
  );

-- RLS Policies for prompt_tests
CREATE POLICY "Users can view tests of their prompts"
  ON prompt_tests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = prompt_tests.prompt_id
      AND prompts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tests for their prompts"
  ON prompt_tests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = prompt_tests.prompt_id
      AND prompts.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function for semantic search
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

