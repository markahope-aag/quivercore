-- Create news_items table for home page news section
-- Allows admins to post news about new technologies, techniques, templates, etc.

CREATE TABLE IF NOT EXISTS news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  excerpt TEXT, -- Short description (1-2 sentences)
  content TEXT, -- Full content (optional, for detailed pages)
  category TEXT NOT NULL CHECK (category IN ('technology', 'technique', 'template', 'update', 'best_practice')),
  image_url TEXT, -- Optional featured image
  link_url TEXT, -- Optional link to external resource or internal page
  featured BOOLEAN DEFAULT false, -- Featured items appear first
  published BOOLEAN DEFAULT false, -- Draft vs published
  published_at TIMESTAMP WITH TIME ZONE, -- When to publish (scheduling)
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration date
  tags TEXT[], -- Array of tags for filtering
  metadata JSONB, -- Additional metadata (template_id, feature_id, etc.)
  created_by UUID REFERENCES auth.users(id), -- Admin who created it
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_news_items_published ON news_items(published, published_at) WHERE published = true;
CREATE INDEX idx_news_items_category ON news_items(category);
CREATE INDEX idx_news_items_featured ON news_items(featured) WHERE featured = true;
CREATE INDEX idx_news_items_expires ON news_items(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_news_items_tags ON news_items USING GIN(tags);

-- Enable RLS
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can read published news items
CREATE POLICY "Anyone can view published news items"
  ON news_items FOR SELECT
  USING (published = true 
    AND (published_at IS NULL OR published_at <= NOW())
    AND (expires_at IS NULL OR expires_at > NOW()));

-- Only admins can create/edit/delete
CREATE POLICY "Admins can create news items"
  ON news_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update news items"
  ON news_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete news items"
  ON news_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Update timestamp trigger
CREATE TRIGGER update_news_items_updated_at
  BEFORE UPDATE ON news_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE news_items IS 'News and announcements for the home page dashboard';
COMMENT ON COLUMN news_items.category IS 'Type of news: technology, technique, template, update, best_practice';
COMMENT ON COLUMN news_items.featured IS 'Featured items appear first in the news feed';
COMMENT ON COLUMN news_items.published_at IS 'Scheduled publish date/time. If NULL, item is published immediately when published=true';
COMMENT ON COLUMN news_items.expires_at IS 'Optional expiration date. News items expire after this date';
COMMENT ON COLUMN news_items.metadata IS 'Additional context: template_id, feature_id, external_url, etc.';


