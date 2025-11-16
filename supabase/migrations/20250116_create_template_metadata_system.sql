-- Template Metadata System Migration
-- Creates comprehensive metadata tables for prompt templates

-- 1. Template Metadata Table
CREATE TABLE IF NOT EXISTS template_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Metadata fields
  use_case_tags TEXT[] DEFAULT '{}',
  industry TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
  estimated_time TEXT,
  output_length TEXT,
  business_impact TEXT,
  team_usage TEXT[] DEFAULT '{}',
  
  -- Usage guidance
  prerequisites TEXT[] DEFAULT '{}',
  best_practices TEXT[] DEFAULT '{}',
  common_pitfalls TEXT[] DEFAULT '{}',
  follow_up_prompts TEXT[] DEFAULT '{}',
  success_metrics TEXT[] DEFAULT '{}',
  
  -- Enhancement recommendations
  vs_settings TEXT,
  compatible_frameworks TEXT[] DEFAULT '{}',
  advanced_enhancements TEXT[] DEFAULT '{}',
  
  -- Quality indicators
  user_rating NUMERIC(3, 2) DEFAULT 0 CHECK (user_rating >= 0 AND user_rating <= 5),
  usage_count INTEGER DEFAULT 0,
  author TEXT,
  example_outputs TEXT[] DEFAULT '{}',
  
  -- Social features
  variations UUID[] DEFAULT '{}', -- IDs of related templates
  related_templates UUID[] DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(prompt_id)
);

-- 2. Template Comments/Reviews Table
CREATE TABLE IF NOT EXISTS template_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_metadata_id UUID NOT NULL REFERENCES template_metadata(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_template_metadata_prompt_id ON template_metadata(prompt_id);
CREATE INDEX IF NOT EXISTS idx_template_metadata_user_id ON template_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_template_metadata_industry ON template_metadata(industry);
CREATE INDEX IF NOT EXISTS idx_template_metadata_difficulty ON template_metadata(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_template_metadata_rating ON template_metadata(user_rating DESC);
CREATE INDEX IF NOT EXISTS idx_template_metadata_usage_count ON template_metadata(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_template_metadata_use_case_tags ON template_metadata USING GIN(use_case_tags);
CREATE INDEX IF NOT EXISTS idx_template_comments_template_id ON template_comments(template_metadata_id);
CREATE INDEX IF NOT EXISTS idx_template_comments_user_id ON template_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_template_comments_created_at ON template_comments(created_at DESC);

-- 4. Function to update template rating based on comments
CREATE OR REPLACE FUNCTION update_template_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE template_metadata
  SET 
    user_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM template_comments
      WHERE template_metadata_id = COALESCE(NEW.template_metadata_id, OLD.template_metadata_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.template_metadata_id, OLD.template_metadata_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger to update rating when comments change
CREATE TRIGGER trigger_update_template_rating
  AFTER INSERT OR UPDATE OR DELETE ON template_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_template_rating();

-- 6. Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_template_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger for updated_at
CREATE TRIGGER trigger_template_metadata_updated_at
  BEFORE UPDATE ON template_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_template_metadata_updated_at();

-- 8. Function to increment template usage count
CREATE OR REPLACE FUNCTION increment_template_usage(template_metadata_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE template_metadata
  SET usage_count = usage_count + 1
  WHERE id = template_metadata_id;
END;
$$ LANGUAGE plpgsql;

-- 8. RLS Policies
ALTER TABLE template_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_comments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all template metadata (public templates)
CREATE POLICY "Anyone can view template metadata"
  ON template_metadata FOR SELECT
  USING (true);

-- Policy: Users can insert their own template metadata
CREATE POLICY "Users can insert their own template metadata"
  ON template_metadata FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own template metadata
CREATE POLICY "Users can update their own template metadata"
  ON template_metadata FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own template metadata
CREATE POLICY "Users can delete their own template metadata"
  ON template_metadata FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Anyone can view comments
CREATE POLICY "Anyone can view template comments"
  ON template_comments FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert comments
CREATE POLICY "Authenticated users can insert comments"
  ON template_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON template_comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON template_comments FOR DELETE
  USING (auth.uid() = user_id);

