-- ========================================
-- FINAL FIX FOR LESSONS RLS POLICIES
-- This makes lessons RLS match the working weeks policies
-- ========================================

-- Step 1: Check current state
SELECT 
  '📊 Current State' as step,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('weeks', 'lessons');

-- Step 2: Show current policies on both tables
SELECT 
  '📋 Current Policies' as step,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename IN ('weeks', 'lessons')
ORDER BY tablename, cmd;

-- Step 3: Drop ALL existing policies on lessons
DROP POLICY IF EXISTS "Anyone can view lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;
DROP POLICY IF EXISTS "Authenticated users can view lessons" ON lessons;
DROP POLICY IF EXISTS "lessons_select_policy" ON lessons;
DROP POLICY IF EXISTS "lessons_insert_policy" ON lessons;
DROP POLICY IF EXISTS "lessons_update_policy" ON lessons;
DROP POLICY IF EXISTS "lessons_delete_policy" ON lessons;
DROP POLICY IF EXISTS "lessons_public_read" ON lessons;
DROP POLICY IF EXISTS "lessons_select_all" ON lessons;
DROP POLICY IF EXISTS "lessons_insert_all" ON lessons;
DROP POLICY IF EXISTS "lessons_update_all" ON lessons;
DROP POLICY IF EXISTS "lessons_delete_all" ON lessons;

SELECT '✅ Dropped all existing lesson policies' as step;

-- Step 4: Create super permissive policies (same as weeks which work)
CREATE POLICY "lessons_select_all"
  ON lessons FOR SELECT
  USING (true);

CREATE POLICY "lessons_insert_all"
  ON lessons FOR INSERT
  WITH CHECK (true);

CREATE POLICY "lessons_update_all"
  ON lessons FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "lessons_delete_all"
  ON lessons FOR DELETE
  USING (true);

SELECT '✅ Created new permissive policies' as step;

-- Step 5: Ensure RLS is enabled
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

SELECT '✅ RLS enabled on lessons table' as step;

-- Step 6: Verify the new setup
SELECT 
  '✅ Final Verification' as step,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'lessons'
ORDER BY cmd;

-- Step 7: Test insert capability
DO $$
BEGIN
  -- Try to insert a test lesson (will be rolled back)
  BEGIN
    INSERT INTO lessons (title, type, week_id, order_index)
    VALUES ('TEST LESSON - WILL BE DELETED', 'text', 
            (SELECT id FROM weeks LIMIT 1), 999);
    
    -- Delete the test lesson
    DELETE FROM lessons WHERE title = 'TEST LESSON - WILL BE DELETED';
    
    RAISE NOTICE '✅ Insert test successful - RLS policies are working correctly';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Insert test failed: %', SQLERRM;
  END;
END $$;

SELECT '🎉 Done! Lessons RLS policies now match weeks policies. Try creating a lesson from the UI.' as message;
