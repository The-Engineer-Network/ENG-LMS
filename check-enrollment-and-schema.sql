-- Check if the user has an enrollment
SELECT 
  se.*,
  p.full_name,
  p.email,
  t.name as track_name,
  c.name as cohort_name
FROM student_enrollments se
LEFT JOIN profiles p ON p.id = se.user_id
LEFT JOIN tracks t ON t.id = se.track_id
LEFT JOIN cohorts c ON c.id = se.cohort_id
WHERE se.user_id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6';

-- Check if foreign key constraints exist
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('student_enrollments', 'week_progress', 'task_submissions')
ORDER BY tc.table_name, kcu.column_name;

-- Check RLS policies on student_enrollments
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'student_enrollments'
ORDER BY policyname;
