-- Temporarily allow all authenticated users to insert lessons
-- This is just to test if RLS is the issue

-- Drop the restrictive policy
DROP POLICY IF EXISTS "lessons_insert_for_admins" ON lessons;

-- Create a permissive policy for testing
CREATE POLICY "lessons_insert_temp_allow_all"
  ON lessons FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Verify
SELECT 
  'POLICY CHECK' as status,
  policyname,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'lessons' 
  AND cmd = 'INSERT';
