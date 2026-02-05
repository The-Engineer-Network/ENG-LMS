-- ========================================
-- TEST LESSON INSERT DIRECTLY
-- ========================================

-- First, check if there are any triggers on lessons table
SELECT 
  'Triggers on lessons table' as check_type,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'lessons';

-- Check for foreign key constraints
SELECT
  'Foreign Key Constraints' as check_type,
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

-- Check lessons table structure
SELECT 
  'Lessons Table Structure' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'lessons'
ORDER BY ordinal_position;

-- Try a direct insert with minimal data
DO $$
DECLARE
  test_week_id uuid;
  new_lesson_id uuid;
BEGIN
  -- Get a valid week_id
  SELECT id INTO test_week_id FROM weeks LIMIT 1;
  
  IF test_week_id IS NULL THEN
    RAISE NOTICE 'No weeks found in database';
  ELSE
    RAISE NOTICE 'Using week_id: %', test_week_id;
    
    -- Try to insert a test lesson
    INSERT INTO lessons (
      title,
      type,
      week_id,
      order_index
    ) VALUES (
      'TEST LESSON - DELETE ME',
      'video',
      test_week_id,
      999
    ) RETURNING id INTO new_lesson_id;
    
    RAISE NOTICE '✅ Test lesson inserted successfully with id: %', new_lesson_id;
    
    -- Clean up - delete the test lesson
    DELETE FROM lessons WHERE id = new_lesson_id;
    RAISE NOTICE '✅ Test lesson deleted';
  END IF;
END $$;

-- Check if there are any blocking locks
SELECT 
  'Active Locks' as check_type,
  locktype,
  relation::regclass,
  mode,
  granted
FROM pg_locks
WHERE relation = 'lessons'::regclass;

SELECT '✅ Diagnostic complete' as result;
