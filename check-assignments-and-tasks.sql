-- Check if assignments table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'assignments'
) as assignments_table_exists;

-- Check assignments table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'assignments'
ORDER BY ordinal_position;

-- Check all assignments in the database
SELECT 
  id,
  title,
  week_id,
  requirements,
  submission_guidelines,
  deadline
FROM assignments
ORDER BY id;

-- Check assignments with week and track info
SELECT 
  a.id,
  a.title,
  a.requirements,
  a.submission_guidelines,
  a.deadline,
  w.week_number,
  w.title as week_title,
  t.name as track_name
FROM assignments a
LEFT JOIN weeks w ON a.week_id = w.id
LEFT JOIN tracks t ON w.track_id = t.id
ORDER BY w.week_number, a.id;

-- Check RLS policies on assignments table
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
WHERE tablename = 'assignments';

-- Check if task_submissions table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'task_submissions'
) as task_submissions_table_exists;

-- Check all task submissions
SELECT 
  id,
  student_id,
  assignment_id,
  status,
  submitted_at
FROM task_submissions
ORDER BY submitted_at DESC NULLS LAST
LIMIT 10;
