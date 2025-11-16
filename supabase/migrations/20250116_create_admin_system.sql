-- Admin System Migration
-- Creates admin users table and helper functions

-- 1. Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  notes TEXT,
  UNIQUE(user_id)
);

-- 2. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- 3. Add comment
COMMENT ON TABLE admin_users IS 'Tracks which users have admin privileges';

-- 4. Drop existing function if it exists (with CASCADE to drop dependent policies),
--    then create helper function to check if a user is an admin
DROP FUNCTION IF EXISTS is_admin(UUID) CASCADE;

CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS Policies for admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view the admin_users table
CREATE POLICY "Admins can view admin_users"
  ON admin_users FOR SELECT
  USING (is_admin(auth.uid()));

-- Only admins can insert new admins
CREATE POLICY "Admins can insert admin_users"
  ON admin_users FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Only admins can delete admins
CREATE POLICY "Admins can delete admin_users"
  ON admin_users FOR DELETE
  USING (is_admin(auth.uid()));

-- 6. Insert the first admin user (YOU - replace with your actual user_id after signup)
-- This will need to be done manually via SQL after you know your user_id
-- Example: INSERT INTO admin_users (user_id, notes) VALUES ('your-user-id-here', 'Initial admin user');
