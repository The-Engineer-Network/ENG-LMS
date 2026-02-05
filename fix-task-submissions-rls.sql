-- Fix RLS policies for task_submissions table

-- Drop existing policies if any
DROP POLICY IF EXISTS "task_submissions_select_policy" ON task_submissions;
DROP POLICY IF EXISTS "task_submissions_insert_policy" ON task_submissions;
DROP POLICY IF EXISTS "task_submissions_update_policy" ON task_submissions;
DROP POLICY IF EXISTS "task_submissions_delete_policy" ON task_submissions;

-- Enable RLS on task_submissions table
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;

-- Students can view their own submissions, admins can view all
CREATE POLICY "task_submissions_select_policy" ON task_submissions
  FOR SELECT
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Students can insert their own submissions
CREATE POLICY "task_submissions_insert_policy" ON task_submissions
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- Students can update their own submissions (resubmit), admins can update any
CREATE POLICY "task_submissions_update_policy" ON task_submissions
  FOR UPDATE
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can delete submissions
CREATE POLICY "task_submissions_delete_policy" ON task_submissions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'task_submissions';
