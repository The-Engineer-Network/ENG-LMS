-- ========================================
-- CHECK FOR TRIGGERS ON LESSONS TABLE
-- ========================================

-- Check all triggers on lessons table
SELECT 
  '⚡ Triggers on Lessons Table' as info,
  trigger_name,
  event_manipulation as event,
  action_timing as timing,
  action_orientation as orientation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'lessons'
ORDER BY trigger_name;

-- Check trigger functions
SELECT 
  '🔧 Trigger Functions' as info,
  n.nspname as schema,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname LIKE '%lesson%'
  AND n.nspname = 'public';

-- Check for any constraints that might cause issues
SELECT 
  '🔒 Constraints on Lessons' as info,
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'lessons'::regclass;

-- Try a direct insert test
DO $$
DECLARE
  test_week_id uuid;
  new_lesson_id uuid;
BEGIN
  -- Get a valid week_id
  SELECT id INTO test_week_id FROM weeks LIMIT 1;
  
  IF test_week_id IS NOT NULL THEN
    RAISE NOTICE '📝 Attempting test insert...';
    
    -- Try to insert a test lesson with a timeout
    INSERT INTO lessons (title, type, content, week_id, order_index)
    VALUES ('TEST LESSON - DELETE ME', 'text', 'Test content', test_week_id, 999)
    RETURNING id INTO new_lesson_id;
    
    RAISE NOTICE '✅ Test insert successful! Lesson ID: %', new_lesson_id;
    
    -- Clean up the test lesson
    DELETE FROM lessons WHERE id = new_lesson_id;
    RAISE NOTICE '✅ Test lesson cleaned up';
  ELSE
    RAISE NOTICE '❌ No weeks found to test with';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Test insert failed: %', SQLERRM;
    RAISE NOTICE '❌ Error detail: %', SQLSTATE;
END $$;

SELECT '✅ Check complete!' as status;
