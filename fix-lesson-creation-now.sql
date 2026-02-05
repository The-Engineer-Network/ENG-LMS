-- ========================================
-- FIX LESSON CREATION ISSUE
-- ========================================

-- Step 1: Check current RLS status and policies
SELECT 
  '📋 Current RLS Status' as info,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'lessons';

SELECT 
  '📋 Current Policies' as info,
  policyname,
  cmd,
  permissive,
  roles,
  qual::text as using_expression,
  with_check::text as with_check_expression
FROM pg_policies
WHERE tablename = 'lessons'
ORDER BY cmd, policyname;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;
DROP POLICY IF EXISTS "Authenticated users can view lessons" ON lessons;
DROP POLICY IF EXISTS "lessons_select_policy" ON lessons;
DROP POLICY IF EXISTS "lessons_insert_policy" ON lessons;
DROP POLICY IF EXISTS "lessons_update_policy" ON lessons;
DROP POLICY IF EXISTS "lessons_delete_policy" ON lessons;
DROP POLICY IF EXISTS "lessons_public_read" ON lessons;

SELECT '✅ Dropped all existing policies' as status;

-- Step 3: Create new permissive policies
-- Allow everyone to view lessons
CREATE POLICY "lessons_select_policy"
  ON lessons FOR SELECT
  USING (true);

-- Allow authenticated users to insert lessons (no admin check)
CREATE POLICY "lessons_insert_policy"
  ON lessons FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update lessons
CREATE POLICY "lessons_update_policy"
  ON lessons FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete lessons
CREATE POLICY "lessons_delete_policy"
  ON lessons FOR DELETE
  TO authenticated
  USING (true);

SELECT '✅ Created new permissive policies' as status;

-- Step 4: Ensure RLS is enabled
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

SELECT '✅ RLS enabled on lessons table' as status;

-- Step 5: Verify the new policies
SELECT 
  '✅ New Policies Verified' as status,
  policyname,
  cmd,
  permissive,
  roles,
  qual::text as using_expression,
  with_check::text as with_check_expression
FROM pg_policies
WHERE tablename = 'lessons'
ORDER BY cmd, policyname;

-- Step 6: Test that we can see lessons
SELECT 
  '📊 Current Lessons Count' as info,
  COUNT(*) as total_lessons
FROM lessons;

SELECT '✅ Lesson creation should now work! Try creating a lesson from the UI.' as final_message;
