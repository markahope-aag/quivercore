-- Admin Setup Script
-- Run this in Supabase SQL Editor to make yourself an admin

-- Step 1: Find your user ID (check the results)
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Step 2: Copy your user ID from above and replace 'YOUR-USER-ID-HERE' below
-- Then run this INSERT statement:

INSERT INTO admin_users (user_id, notes)
VALUES (
  'YOUR-USER-ID-HERE',  -- Replace with your actual user ID from Step 1
  'Primary admin - added via setup script'
);

-- Step 3: Verify you're an admin
SELECT
  au.id,
  au.user_id,
  u.email,
  au.created_at,
  au.notes
FROM admin_users au
JOIN auth.users u ON au.user_id = u.id;

-- You should now see your email in the results above!
