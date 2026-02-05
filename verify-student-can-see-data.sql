-- Verify that students can actually see the data

-- 1. Check what data exists
SELECT 'DATA CHECK' as test;
SELECT 
  'Weeks' as table_name,
  COUNT(*) as total_rows
FROM weeks
UNION ALL
SELECT 
  'Lessons' as table_name,
  COUNT(*) as total_rows
FROM lessons
UNION ALL
SELECT 
  'Student Enrollments' as table_name,
  COUNT(*) as total_rows
FROM student_enrollments;

-- 2. Check a sample student enrollment
SELECT 'SAMPLE STUDENT ENROLLMENT' as test;
SELECT 
  se.user_id,
  se.track_id,
  p.email,
  p.full_name,
  t.name as track_name
FROM student_enrollments se
LEFT JOIN profiles p ON p.id = se.user_id
LEFT JOIN tracks t ON t.id = se.track_id
LIMIT 1;

-- 3. Check weeks for that track
SELECT 'WEEKS FOR STUDENT TRACK' as test;
WITH student_track AS (
  SELECT track_id FROM student_enrollments LIMIT 1
)
SELECT 
  w.id,
  w.week_number,
  w.title,
  w.track_id,
  COUNT(l.id) as lesson_count
FROM weeks w
LEFT JOIN lessons l ON l.week_id = w.id
WHERE w.track_id = (SELECT track_id FROM student_track)
GROUP BY w.id, w.week_number, w.title, w.track_id
ORDER BY w.week_number;

-- 4. Check RLS policies are correct
SELECT 'RLS POLICIES CHECK' as test;
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('weeks', 'lessons')
  AND cmd = 'SELECT'
ORDER BY tablename;

-- 5. Test if a query would work (simulating what the app does)
SELECT 'SIMULATED APP QUERY' as test;
SELECT 
  w.*,
  (SELECT json_agg(l.*) FROM lessons l WHERE l.week_id = w.id) as lessons,
  (SELECT json_agg(a.*) FROM assignments a WHERE a.week_id = w.id) as assignments
FROM weeks w
WHERE w.track_id = (SELECT track_id FROM student_enrollments LIMIT 1)
ORDER BY w.order_index;
