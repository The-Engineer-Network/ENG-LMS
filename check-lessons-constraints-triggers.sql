-- Check what's causing the lessons insert to hang

-- 1. Check for triggers on lessons table
SELECT 
  'TRIGGERS ON LESSONS' as check_type,
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'lessons';

-- 2. Check for foreign key constraints
SELECT 
  'FOREIGN KEY CONSTRAINTS' as check_type,
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
WHERE tc.table_name = 'lessons' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- 3. Check for any locks on the lessons table
SELECT 
  'CURRENT LOCKS' as check_type,
  locktype,
  relation::regclass,
  mode,
  granted
FROM pg_locks
WHERE relation = 'lessons'::regclass;

-- 4. Check if there are any long-running queries
SELECT 
  'LONG RUNNING QUERIES' as check_type,
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query,
  state
FROM pg_stat_activity
WHERE state != 'idle'
  AND query NOT LIKE '%pg_stat_activity%'
ORDER BY duration DESC;

-- 5. Try a simple direct insert to see if it works
SELECT 'ATTEMPTING DIRECT INSERT' as check_type;
INSERT INTO lessons (
  title,
  type,
  week_id,
  order_index
) VALUES (
  'Test Lesson Direct',
  'video',
  (SELECT id FROM weeks LIMIT 1),
  999
) RETURNING id, title;

-- 6. Clean up the test
DELETE FROM lessons WHERE title = 'Test Lesson Direct';

SELECT 'TEST COMPLETE' as status;
