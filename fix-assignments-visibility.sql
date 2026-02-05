-- Fix RLS policies for assignments table so students can see them

-- Drop existing policies if any
DROP POLICY IF EXISTS "assignments_select_policy" ON assignments;
DROP POLICY IF EXISTS "assignments_insert_policy" ON assignments;
DROP POLICY IF EXISTS "assignments_update_policy" ON assignments;
DROP POLICY IF EXISTS "assignments_delete_policy" ON assignments;

-- Enable RLS on assignments table
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view assignments (students need to see them)
CREATE POLICY "assignments_select_policy" ON assignments
  FOR SELECT
  USING (true);

-- Only admins can insert assignments
CREATE POLICY "assignments_insert_policy" ON assignments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Only admins can update assignments
CREATE POLICY "assignments_update_policy" ON assignments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Only admins can delete assignments
CREATE POLICY "assignments_delete_policy" ON assignments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
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
WHERE tablename = 'assignments';
