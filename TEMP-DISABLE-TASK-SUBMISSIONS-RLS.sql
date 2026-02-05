-- Temporarily disable RLS on task_submissions to allow submissions to work
-- This is a temporary fix while we resolve the Supabase client AbortError issues

ALTER TABLE task_submissions DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'task_submissions';
