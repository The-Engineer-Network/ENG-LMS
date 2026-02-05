-- ============================================================================
-- STUDENT VISIBILITY FIX
-- ============================================================================
-- This script fixes the issue where students cannot see weeks and lessons
-- that teachers/admins have created.
--
-- PROBLEM: Students see empty weeks/lessons even though admins can see them
-- CAUSE: RLS policies are too restrictive or conflicting
-- SOLUTION: Clean slate with simple, clear policies
-- ============================================================================

-- STEP 1: Clean up all existing policies
DO $$ 
DECLARE
  policy_record RECORD;
BEGIN
    RAISE NOTICE 'Step 1: Removing all existing policies...';
    
    -- Drop all weeks policies
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'weeks'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON weeks', policy_record.policyname);
        RAISE NOTICE '  Dropped weeks policy: %', policy_record.policyname;
    END LOOP;
    
    -- Drop all lessons policies
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'lessons'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON lessons', policy_record.policyname);
        RAISE NOTICE '  Dropped lessons policy: %', policy_record.policyname;
    END LOOP;
    
    RAISE NOTICE 'Step 1 complete: All old policies removed';
END $$;

-- STEP 2: Ensure RLS is enabled
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- STEP 3: Create helper function for admin check
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- STEP 4: Create SELECT policies (allow everyone to read)
-- Everyone can view weeks (students, admins, authenticated users)
CREATE POLICY "weeks_select_for_all"
  ON weeks FOR SELECT
  USING (true);

-- Everyone can view lessons (students, admins, authenticated users)
CREATE POLICY "lessons_select_for_all"
  ON lessons FOR SELECT
  USING (true);

-- STEP 5: Create INSERT policies (admin only)
CREATE POLICY "weeks_insert_for_admins"
  ON weeks FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "lessons_insert_for_admins"
  ON lessons FOR INSERT
  WITH CHECK (is_admin());

-- STEP 6: Create UPDATE policies (admin only)
CREATE POLICY "weeks_update_for_admins"
  ON weeks FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "lessons_update_for_admins"
  ON lessons FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- STEP 7: Create DELETE policies (admin only)
CREATE POLICY "weeks_delete_for_admins"
  ON weeks FOR DELETE
  USING (is_admin());

CREATE POLICY "lessons_delete_for_admins"
  ON lessons FOR DELETE
  USING (is_admin());

-- STEP 8: Verify the setup
DO $$
DECLARE
  weeks_count INTEGER;
  lessons_count INTEGER;
  weeks_policies INTEGER;
  lessons_policies INTEGER;
  enrollments_count INTEGER;
BEGIN
  -- Count data
  SELECT COUNT(*) INTO weeks_count FROM weeks;
  SELECT COUNT(*) INTO lessons_count FROM lessons;
  SELECT COUNT(*) INTO enrollments_count FROM student_enrollments;
  
  -- Count policies
  SELECT COUNT(*) INTO weeks_policies FROM pg_policies WHERE tablename = 'weeks';
  SELECT COUNT(*) INTO lessons_policies FROM pg_policies WHERE tablename = 'lessons';
  
  RAISE NOTICE '';
  RAISE NOTICE '=== VERIFICATION RESULTS ===';
  RAISE NOTICE 'Database Content:';
  RAISE NOTICE '  - Weeks: %', weeks_count;
  RAISE NOTICE '  - Lessons: %', lessons_count;
  RAISE NOTICE '  - Student Enrollments: %', enrollments_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Security Policies:';
  RAISE NOTICE '  - Weeks policies: % (expected: 4)', weeks_policies;
  RAISE NOTICE '  - Lessons policies: % (expected: 4)', lessons_policies;
  RAISE NOTICE '';
  
  -- Warnings
  IF weeks_count = 0 THEN
    RAISE WARNING 'No weeks found! Admins need to create weeks first.';
  END IF;
  
  IF lessons_count = 0 THEN
    RAISE WARNING 'No lessons found! Admins need to create lessons first.';
  END IF;
  
  IF enrollments_count = 0 THEN
    RAISE WARNING 'No student enrollments found! Students need to sign up first.';
  END IF;
  
  IF weeks_policies != 4 THEN
    RAISE WARNING 'Expected 4 policies on weeks table, found %', weeks_policies;
  END IF;
  
  IF lessons_policies != 4 THEN
    RAISE WARNING 'Expected 4 policies on lessons table, found %', lessons_policies;
  END IF;
  
  -- Success message
  IF weeks_count > 0 AND lessons_count > 0 AND weeks_policies = 4 AND lessons_policies = 4 THEN
    RAISE NOTICE '✅ All checks passed! Students should now be able to see weeks and lessons.';
  ELSE
    RAISE NOTICE '⚠️ Please review warnings above';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== FIX COMPLETED ===';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Check the verification results above';
  RAISE NOTICE '2. Have a student log in and check if they can see weeks/lessons';
  RAISE NOTICE '3. Check browser console for any errors';
END $$;

-- ============================================================================
-- FINAL VERIFICATION QUERIES
-- ============================================================================

-- Show current policies
SELECT 
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN qual = 'true' THEN 'Allow all (students can access)'
    WHEN qual LIKE '%is_admin%' THEN 'Admin only'
    ELSE 'Custom rule'
  END as access_level
FROM pg_policies 
WHERE tablename IN ('weeks', 'lessons')
ORDER BY tablename, cmd, policyname;

-- Show weeks with lesson counts
SELECT 
  w.week_number,
  w.title as week_title,
  t.name as track_name,
  COUNT(l.id) as lesson_count,
  CASE 
    WHEN COUNT(l.id) = 0 THEN 'No lessons yet'
    ELSE 'Has lessons'
  END as status
FROM weeks w
LEFT JOIN tracks t ON t.id = w.track_id
LEFT JOIN lessons l ON l.week_id = w.id
GROUP BY w.id, w.week_number, w.title, t.name
ORDER BY w.week_number;
