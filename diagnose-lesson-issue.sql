-- ========================================
-- DIAGNOSE LESSON CREATION ISSUE
-- ========================================

-- 1. Check if lessons table exists and its structure
SELECT 
  '📋 Lessons Table Structure' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'lessons'
ORDER BY ordinal_position;

-- 2. Check RLS status
SELECT 
  '🔒 RLS Status' as info,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'lessons';

-- 3. Check current policies
SELECT 
  '📜 Current Policies' as info,
  policyname,
  cmd,
  permissive,
  roles,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies
WHERE tablename = 'lessons'
ORDER BY cmd;

-- 4. Check if there are any triggers that might interfere
SELECT 
  '⚡ Triggers on Lessons Table' as info,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'lessons';

-- 5. Check current user's role
SELECT 
  '👤 Current User Info' as info,
  current_user as user_name,
  current_role as role_name,
  session_user;

-- 6. Try a test insert (this will help identify the exact error)
DO $$
DECLARE
  test_week_id uuid;
BEGIN
  -- Get a valid week_id
  SELECT id INTO test_week_id FROM weeks LIMIT 1;
  
  IF test_week_id IS NOT NULL THEN
    -- Try to insert a test lesson
    INSERT INTO lessons (title, type, content, week_id, order_index)
    VALUES ('TEST LESSON - DELETE ME', 'text', 'Test content', test_week_id, 999);
    
    RAISE NOTICE '✅ Test insert successful!';
    
    -- Clean up the test lesson
    DELETE FROM lessons WHERE title = 'TEST LESSON - DELETE ME';
    RAISE NOTICE '✅ Test lesson cleaned up';
  ELSE
    RAISE NOTICE '❌ No weeks found to test with';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Test insert failed: %', SQLERRM;
END $$;

-- 7. Check for any foreign key constraints
SELECT 
  '🔗 Foreign Key Constraints' as info,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'lessons';

SELECT '✅ Diagnostic complete!' as status;
