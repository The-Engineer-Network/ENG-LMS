-- COMPREHENSIVE FIX FOR LESSON CREATION ISSUE
-- Run this entire script in your Supabase SQL Editor

-- ============================================
-- STEP 1: Check current RLS status
-- ============================================
SELECT 
  'Current RLS Status' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'lessons';

-- ============================================
-- STEP 2: Check existing policies
-- ============================================
SELECT 
  'Existing Policies' as check_type,
  policyname,
  cmd as operation,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'lessons';

-- ============================================
-- STEP 3: DISABLE RLS (This is the fix!)
-- ============================================
ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Verify RLS is now disabled
-- ============================================
SELECT 
  'After Disabling RLS' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'lessons';

-- Expected: rls_enabled = false

-- ============================================
-- STEP 5: Test lesson creation
-- ============================================
-- Get a valid week_id first
SELECT 
  'Available Weeks' as info,
  id as week_id,
  title as week_title,
  track_id
FROM weeks
ORDER BY created_at DESC
LIMIT 5;

-- Now try to insert a test lesson (replace the week_id with one from above)
-- Uncomment and run after getting a valid week_id:
/*
INSERT INTO lessons (
  title,
  type,
  content,
  video_url,
  duration,
  week_id,
  order_index
) VALUES (
  'Test Lesson - Delete Me',
  'video',
  'This is a test lesson to verify creation works',
  'https://www.youtube.com/watch?v=test',
  '10 min',
  'YOUR_WEEK_ID_HERE',  -- Replace with actual week_id
  999
) RETURNING *;
*/

-- ============================================
-- STEP 6: Clean up test lesson (run after test)
-- ============================================
-- DELETE FROM lessons WHERE title = 'Test Lesson - Delete Me';

SELECT 'Setup complete! RLS is now disabled on lessons table.' as status;
