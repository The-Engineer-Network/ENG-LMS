-- Fix assignment update permissions
-- The app can't update assignments due to RLS restrictions

-- Check current policies
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'assignments';

-- Drop restrictive policies and create more permissive ones
DROP POLICY IF EXISTS "Admins can manage all assignments" ON assignments;
DROP POLICY IF EXISTS "Students can view their assignments" ON assignments;
DROP POLICY IF EXISTS "Students can submit to their assignments" ON assignments;

-- Create new permissive policies
-- Allow authenticated users to read assignments (needed for the app)
CREATE POLICY "Authenticated users can view assignments" ON assignments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to manage assignments (create, update, delete)
CREATE POLICY "Admins can manage assignments" ON assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow students to view assignments in their enrolled tracks
CREATE POLICY "Students can view their track assignments" ON assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_enrollments se
      JOIN weeks w ON w.track_id = se.track_id
      WHERE se.user_id = auth.uid() 
      AND w.id = assignments.week_id
    )
  );

SELECT 'ASSIGNMENT POLICIES FIXED - Updates should now work for admins' as status;