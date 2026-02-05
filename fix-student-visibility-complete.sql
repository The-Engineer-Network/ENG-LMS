-- Complete fix for student visibility of weeks and lessons
-- This script ensures students can see all weeks and lessons that teachers create

BEGIN;

-- Step 1: Drop all existing policies on weeks and lessons
DO $$ 
BEGIN
    -- Drop weeks policies
    DROP POLICY IF EXISTS "Anyone can view weeks" ON weeks;
    DROP POLICY IF EXISTS "Authenticated users can view weeks" ON weeks;
    DROP POLICY IF EXISTS "weeks_public_read" ON weeks;
    DROP POLICY IF EXISTS "weeks_read_all" ON weeks;
    DROP POLICY IF EXISTS "weeks_select_all" ON weeks;
    DROP POLICY IF EXISTS "Admins can manage all weeks" ON weeks;
    DROP POLICY IF EXISTS "Admins can manage weeks" ON weeks;
    DROP POLICY IF EXISTS "weeks_admin_manage" ON weeks;
    
    -- Drop lessons policies
    DROP POLICY IF EXISTS "Anyone can view lessons" ON lessons;
    DROP POLICY IF EXISTS "Authenticated users can view lessons" ON lessons;
    DROP POLICY IF EXISTS "lessons_public_read" ON lessons;
    DROP POLICY IF EXISTS "lessons_read_all" ON lessons;
    DROP POLICY IF EXISTS "lessons_select_all" ON lessons;
    DROP POLICY IF EXISTS "lessons_select_policy" ON lessons;
    DROP POLICY IF EXISTS "Admins can manage all lessons" ON lessons;
    DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;
    DROP POLICY IF EXISTS "lessons_admin_manage" ON lessons;
    DROP POLICY IF EXISTS "lessons_insert_all" ON lessons;
    DROP POLICY IF EXISTS "lessons_insert_policy" ON lessons;
    DROP POLICY IF EXISTS "lessons_update_all" ON lessons;
    DROP POLICY IF EXISTS "lessons_update_policy" ON lessons;
    DROP POLICY IF EXISTS "lessons_delete_all" ON lessons;
    DROP POLICY IF EXISTS "lessons_delete_policy" ON lessons;
    DROP POLICY IF EXISTS "Authenticated users can manage lessons" ON lessons;
    
    RAISE NOTICE 'All existing policies dropped';
END $$;

-- Step 2: Ensure RLS is enabled on both tables
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Step 3: Create simple, permissive SELECT policies for everyone
-- This allows all authenticated users (including students) to view weeks
CREATE POLICY "weeks_select_for_all"
  ON weeks FOR SELECT
  USING (true);

-- This allows all authenticated users (including students) to view lessons
CREATE POLICY "lessons_select_for_all"
  ON lessons FOR SELECT
  USING (true);

-- Step 4: Create admin management policies
-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admins can insert weeks
CREATE POLICY "weeks_insert_for_admins"
  ON weeks FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update weeks
CREATE POLICY "weeks_update_for_admins"
  ON weeks FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can delete weeks
CREATE POLICY "weeks_delete_for_admins"
  ON weeks FOR DELETE
  USING (is_admin());

-- Admins can insert lessons
CREATE POLICY "lessons_insert_for_admins"
  ON lessons FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update lessons
CREATE POLICY "lessons_update_for_admins"
  ON lessons FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can delete lessons
CREATE POLICY "lessons_delete_for_admins"
  ON lessons FOR DELETE
  USING (is_admin());

-- Step 5: Verify the setup
DO $$
DECLARE
  weeks_count INTEGER;
  lessons_count INTEGER;
  weeks_policies INTEGER;
  lessons_policies INTEGER;
BEGIN
  -- Count data
  SELECT COUNT(*) INTO weeks_count FROM weeks;
  SELECT COUNT(*) INTO lessons_count FROM lessons;
  
  -- Count policies
  SELECT COUNT(*) INTO weeks_policies FROM pg_policies WHERE tablename = 'weeks';
  SELECT COUNT(*) INTO lessons_policies FROM pg_policies WHERE tablename = 'lessons';
  
  RAISE NOTICE '=== VERIFICATION RESULTS ===';
  RAISE NOTICE 'Weeks in database: %', weeks_count;
  RAISE NOTICE 'Lessons in database: %', lessons_count;
  RAISE NOTICE 'Weeks policies: %', weeks_policies;
  RAISE NOTICE 'Lessons policies: %', lessons_policies;
  
  IF weeks_count = 0 THEN
    RAISE WARNING 'No weeks found in database! Teachers need to create weeks first.';
  END IF;
  
  IF lessons_count = 0 THEN
    RAISE WARNING 'No lessons found in database! Teachers need to create lessons first.';
  END IF;
  
  IF weeks_policies < 4 THEN
    RAISE WARNING 'Expected at least 4 policies on weeks table, found %', weeks_policies;
  END IF;
  
  IF lessons_policies < 4 THEN
    RAISE WARNING 'Expected at least 4 policies on lessons table, found %', lessons_policies;
  END IF;
END $$;

COMMIT;

-- Final verification query
SELECT 'FINAL CHECK' as status;

-- Show all weeks with lesson counts
SELECT 
  'Weeks with lessons' as check_type,
  w.id,
  w.week_number,
  w.title,
  t.name as track_name,
  COUNT(l.id) as lesson_count
FROM weeks w
LEFT JOIN tracks t ON t.id = w.track_id
LEFT JOIN lessons l ON l.week_id = w.id
GROUP BY w.id, w.week_number, w.title, t.name
ORDER BY w.week_number;

-- Show all policies
SELECT 
  'Current policies' as check_type,
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN qual = 'true' THEN 'Allow all'
    WHEN qual LIKE '%is_admin%' THEN 'Admin only'
    ELSE 'Custom'
  END as access_level
FROM pg_policies 
WHERE tablename IN ('weeks', 'lessons')
ORDER BY tablename, policyname;
