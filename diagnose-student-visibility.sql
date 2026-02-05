-- Diagnose why students can't see weeks and lessons

-- 1. Check if weeks exist
SELECT 'WEEKS CHECK' as test_type,
       COUNT(*) as total_weeks,
       COUNT(DISTINCT track_id) as tracks_with_weeks
FROM weeks;

-- 2. Check if lessons exist
SELECT 'LESSONS CHECK' as test_type,
       COUNT(*) as total_lessons,
       COUNT(DISTINCT week_id) as weeks_with_lessons
FROM lessons;

-- 3. Check sample weeks with their lessons
SELECT 'SAMPLE WEEKS WITH LESSONS' as test_type;
SELECT 
  w.id as week_id,
  w.week_number,
  w.title as week_title,
  w.track_id,
  t.name as track_name,
  COUNT(l.id) as lesson_count
FROM weeks w
LEFT JOIN tracks t ON t.id = w.track_id
LEFT JOIN lessons l ON l.week_id = w.id
GROUP BY w.id, w.week_number, w.title, w.track_id, t.name
ORDER BY w.track_id, w.week_number
LIMIT 10;

-- 4. Check RLS policies on weeks
SELECT 'WEEKS RLS POLICIES' as test_type;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'weeks'
ORDER BY policyname;

-- 5. Check RLS policies on lessons
SELECT 'LESSONS RLS POLICIES' as test_type;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'lessons'
ORDER BY policyname;

-- 6. Check if RLS is enabled
SELECT 'RLS STATUS' as test_type;
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('weeks', 'lessons')
ORDER BY tablename;

-- 7. Check student enrollments
SELECT 'STUDENT ENROLLMENTS' as test_type;
SELECT 
  COUNT(*) as total_enrollments,
  COUNT(DISTINCT user_id) as unique_students,
  COUNT(DISTINCT track_id) as tracks_enrolled
FROM student_enrollments;

-- 8. Test query as if we're a student (simulating the app query)
SELECT 'SIMULATED STUDENT QUERY' as test_type;
SELECT 
  w.id,
  w.week_number,
  w.title,
  w.description,
  w.track_id,
  COUNT(l.id) as lessons_count
FROM weeks w
LEFT JOIN lessons l ON l.week_id = w.id
WHERE w.track_id IN (SELECT track_id FROM student_enrollments LIMIT 1)
GROUP BY w.id, w.week_number, w.title, w.description, w.track_id
ORDER BY w.order_index
LIMIT 5;

-- 9. Check if there are any lessons for the weeks
SELECT 'LESSONS DETAIL' as test_type;
SELECT 
  l.id,
  l.title,
  l.type,
  l.week_id,
  w.week_number,
  w.title as week_title
FROM lessons l
JOIN weeks w ON w.id = l.week_id
ORDER BY w.week_number, l.order_index
LIMIT 10;
