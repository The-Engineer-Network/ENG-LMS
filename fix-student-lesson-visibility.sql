-- ========================================
-- FIX STUDENT LESSON VISIBILITY
-- Ensure students can see lessons created by admin
-- ========================================

-- Step 1: Verify lessons exist
SELECT 
  '📊 Current Lessons in Database' as step,
  l.id,
  l.title,
  l.type,
  w.title as week_title,
  t.name as track_name
FROM lessons l
JOIN weeks w ON l.week_id = w.id
JOIN tracks t ON w.track_id = t.id
ORDER BY t.name, w.week_number, l.order_index;

-- Step 2: Check and fix RLS policies on lessons
-- Make sure SELECT policy allows everyone to read
DROP POLICY IF EXISTS "lessons_select_all" ON lessons;

CREATE POLICY "lessons_select_all"
  ON lessons FOR SELECT
  USING (true);

SELECT '✅ SELECT policy updated - all users can now read lessons' as step;

-- Step 3: Verify RLS policies on weeks (should also be permissive)
SELECT 
  '🔍 Checking Weeks RLS Policies' as step,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'weeks'
ORDER BY cmd;

-- Step 4: Verify RLS policies on assignments
SELECT 
  '🔍 Checking Assignments RLS Policies' as step,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'assignments'
ORDER BY cmd;

-- Step 5: Test query that students use (simulating getWeeksByTrack)
-- This is the exact query from the student pages
SELECT 
  '🧪 Testing Student Query' as step,
  'Testing weeks with lessons query...' as info;

-- Simulate the query students use
SELECT 
  w.*,
  json_agg(DISTINCT jsonb_build_object(
    'id', l.id,
    'title', l.title,
    'type', l.type,
    'duration', l.duration,
    'video_url', l.video_url,
    'content', l.content,
    'order_index', l.order_index
  )) FILTER (WHERE l.id IS NOT NULL) as lessons,
  json_agg(DISTINCT jsonb_build_object(
    'id', a.id,
    'title', a.title,
    'requirements', a.requirements,
    'deadline', a.deadline
  )) FILTER (WHERE a.id IS NOT NULL) as assignments
FROM weeks w
LEFT JOIN lessons l ON l.week_id = w.id
LEFT JOIN assignments a ON a.week_id = w.id
WHERE w.track_id = (SELECT id FROM tracks LIMIT 1)
GROUP BY w.id
ORDER BY w.order_index;

-- Step 6: Verify all tables have proper RLS
SELECT 
  '🔐 RLS Status Summary' as step,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('tracks', 'cohorts', 'weeks', 'lessons', 'assignments', 'student_enrollments')
ORDER BY tablename;

-- Step 7: Show final policy summary
SELECT 
  '📋 Final Policy Summary' as step,
  tablename,
  COUNT(*) as policy_count,
  string_agg(DISTINCT cmd::text, ', ') as operations
FROM pg_policies
WHERE tablename IN ('weeks', 'lessons', 'assignments')
GROUP BY tablename
ORDER BY tablename;

SELECT '✅ DONE! Students should now see all lessons.' as message,
       'If still not working, clear browser cache and refresh.' as tip;
