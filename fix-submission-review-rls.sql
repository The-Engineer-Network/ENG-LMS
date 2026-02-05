-- Ensure RLS is disabled on task_submissions for updates
ALTER TABLE task_submissions DISABLE ROW LEVEL SECURITY;

-- Check if student_achievements table exists and disable RLS on it too
ALTER TABLE IF EXISTS student_achievements DISABLE ROW LEVEL SECURITY;

-- Verify RLS status
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename IN ('task_submissions', 'student_achievements')
  AND schemaname = 'public';
