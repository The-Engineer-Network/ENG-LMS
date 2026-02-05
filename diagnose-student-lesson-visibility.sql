-- ========================================
-- DIAGNOSE STUDENT LESSON VISIBILITY ISSUE
-- ========================================

-- Step 1: Check if lessons exist in database
SELECT 
  '📊 Step 1: Lessons in Database' as step,
  COUNT(*) as total_lessons
FROM lessons;

-- Step 2: Show all lessons with their week info
SELECT 
  '📋 Step 2: All Lessons with Week Info' as step,
  l.id as lesson_id,
  l.title as lesson_title,
  l.type,
  l.order_index,
  l.created_at,
  w.id as week_id,
  w.title as week_title,
  w.week_number,
  t.name as track_name
FROM lessons l
JOIN weeks w ON l.week_id = w.id
JOIN tracks t ON w.track_id = t.id
ORDER BY t.name, w.week_number, l.order_index;

-- Step 3: Check RLS policies on lessons table
SELECT 
  '🔒 Step 3: RLS Policies on Lessons' as step,
  tablename,
  policyname,
  cmd as operation,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'lessons'
ORDER BY cmd;

-- Step 4: Check if RLS is enabled
SELECT 
  '🔐 Step 4: RLS Status' as step,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('lessons', 'weeks', 'assignments');

-- Step 5: Test SELECT as anonymous user (simulating student)
-- This will show if RLS is blocking reads
SET ROLE anon;
SELECT 
  '👤 Step 5: Test as Anonymous User' as step,
  COUNT(*) as lessons_visible_to_anon
FROM lessons;
RESET ROLE;

-- Step 6: Test SELECT as authenticated user
SET ROLE authenticated;
SELECT 
  '🔑 Step 6: Test as Authenticated User' as step,
  COUNT(*) as lessons_visible_to_authenticated
FROM lessons;
RESET ROLE;

-- Step 7: Check weeks with lesson counts
SELECT 
  '📚 Step 7: Weeks with Lesson Counts' as step,
  w.id as week_id,
  w.title as week_title,
  w.week_number,
  t.name as track_name,
  COUNT(l.id) as lesson_count
FROM weeks w
JOIN tracks t ON w.track_id = t.id
LEFT JOIN lessons l ON l.week_id = w.id
GROUP BY w.id, w.title, w.week_number, t.name
ORDER BY t.name, w.week_number;

-- Step 8: Check cache issue - show recent lesson creations
SELECT 
  '⏰ Step 8: Recently Created Lessons' as step,
  l.id,
  l.title,
  l.created_at,
  w.title as week_title,
  EXTRACT(EPOCH FROM (NOW() - l.created_at)) / 60 as minutes_ago
FROM lessons l
JOIN weeks w ON l.week_id = w.id
ORDER BY l.created_at DESC
LIMIT 10;

-- Step 9: Verify foreign key relationships
SELECT 
  '🔗 Step 9: Foreign Key Constraints' as step,
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

-- Step 10: Summary and recommendations
SELECT 
  '✅ Step 10: Summary' as step,
  (SELECT COUNT(*) FROM lessons) as total_lessons,
  (SELECT COUNT(*) FROM weeks) as total_weeks,
  (SELECT COUNT(DISTINCT week_id) FROM lessons) as weeks_with_lessons,
  (SELECT rowsecurity FROM pg_tables WHERE tablename = 'lessons') as rls_enabled;

SELECT '🎯 DIAGNOSIS COMPLETE!' as message,
       'Check the results above to identify the issue.' as next_step;
