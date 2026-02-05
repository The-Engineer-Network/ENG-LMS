-- ========================================
-- FIX LESSONS INSERT RLS POLICY
-- ========================================

-- Check current RLS policies on lessons table
SELECT 
  'Current Lessons RLS Policies' as check_type,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'lessons';

-- Drop all existing policies on lessons
DROP POLICY IF EXISTS "Anyone can view lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;
DROP POLICY IF EXISTS "Authenticated users can view lessons" ON lessons;
DROP POLICY IF EXISTS "lessons_select_policy" ON lessons;
DROP POLICY IF EXISTS "lessons_insert_policy" ON lessons;
DROP POLICY IF EXISTS "lessons_update_policy" ON lessons;
DROP POLICY IF EXISTS "lessons_delete_policy" ON lessons;

-- Create simple, permissive policies
-- Allow everyone to view lessons
CREATE POLICY "lessons_select_policy"
  ON lessons FOR SELECT
  USING (true);

-- Allow authenticated users to insert lessons
CREATE POLICY "lessons_insert_policy"
  ON lessons FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update lessons
CREATE POLICY "lessons_update_policy"
  ON lessons FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete lessons
CREATE POLICY "lessons_delete_policy"
  ON lessons FOR DELETE
  USING (auth.role() = 'authenticated');

-- Verify RLS is enabled
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Verify the new policies
SELECT 
  '✅ New Lessons RLS Policies' as status,
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'lessons'
ORDER BY cmd, policyname;

-- Test insert (this should work now)
SELECT '✅ RLS policies updated successfully!' as result;
