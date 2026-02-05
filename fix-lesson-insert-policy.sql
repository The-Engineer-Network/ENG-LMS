-- Fix the lesson INSERT policy to work from client

-- Drop the current INSERT policy
DROP POLICY IF EXISTS "lessons_insert_for_admins" ON lessons;

-- Create a new INSERT policy that checks profiles directly
CREATE POLICY "lessons_insert_for_admins"
  ON lessons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Verify the policy was created
SELECT 
  'VERIFICATION' as status,
  policyname,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'lessons' 
  AND cmd = 'INSERT';

-- Test if it works
SELECT 
  'TEST' as status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    ) THEN 'Policy should allow INSERT'
    ELSE 'Policy will block INSERT - user is not admin'
  END as result;
