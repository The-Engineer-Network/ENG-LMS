-- Test student enrollments for the specific track/cohort combination

-- Check if the track and cohort exist
SELECT 'TRACK CHECK:' as info;
SELECT id, name FROM tracks WHERE id = '5ddfa9fe-c2b2-4820-8187-dd662cc07d58';

SELECT 'COHORT CHECK:' as info;
SELECT id, name FROM cohorts WHERE id = 'c4757891-00b5-40a5-a5f6-ae6f1df74066';

-- Check student enrollments for this combination
SELECT 'STUDENT ENROLLMENTS:' as info;
SELECT 
  se.id,
  se.user_id,
  se.track_id,
  se.cohort_id,
  p.full_name,
  p.email,
  t.name as track_name,
  c.name as cohort_name
FROM student_enrollments se
LEFT JOIN profiles p ON p.id = se.user_id
LEFT JOIN tracks t ON t.id = se.track_id
LEFT JOIN cohorts c ON c.id = se.cohort_id
WHERE se.track_id = '5ddfa9fe-c2b2-4820-8187-dd662cc07d58'
  AND se.cohort_id = 'c4757891-00b5-40a5-a5f6-ae6f1df74066';

-- Check all student enrollments
SELECT 'ALL STUDENT ENROLLMENTS:' as info;
SELECT COUNT(*) as total_enrollments FROM student_enrollments;

-- Check all profiles
SELECT 'ALL PROFILES:' as info;
SELECT COUNT(*) as total_profiles FROM profiles;

-- Check RLS policies on student_enrollments
SELECT 'RLS POLICIES:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'student_enrollments'
ORDER BY policyname;