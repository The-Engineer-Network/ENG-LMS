-- Fix weeks RLS policies to be more permissive for reading
-- The current policies are too restrictive and prevent normal operations

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can manage all weeks" ON weeks;
DROP POLICY IF EXISTS "Anyone can view weeks" ON weeks;

-- Create more permissive policies
-- Allow authenticated users to read weeks (needed for the app to function)
CREATE POLICY "Authenticated users can view weeks" ON weeks
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to manage weeks (create, update, delete)
CREATE POLICY "Admins can manage weeks" ON weeks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Also fix lessons policies to match
DROP POLICY IF EXISTS "Admins can manage all lessons" ON lessons;

CREATE POLICY "Authenticated users can view lessons" ON lessons
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage lessons" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Fix assignments policies too
DROP POLICY IF EXISTS "Admins can manage all assignments" ON assignments;

CREATE POLICY "Authenticated users can view assignments" ON assignments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage assignments" ON assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

SELECT 'WEEKS RLS POLICIES FIXED - Should now allow reading weeks for authenticated users' as status;