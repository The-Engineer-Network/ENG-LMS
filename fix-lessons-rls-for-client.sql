-- Fix lessons RLS for Supabase client
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view lessons" ON lessons;
DROP POLICY IF EXISTS "Authenticated users can view lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;

-- Create simpler policies that work with Supabase client
-- Allow all authenticated users to view lessons
CREATE POLICY "Authenticated users can view lessons" ON lessons
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow all authenticated users to manage lessons (temporary - for testing)
CREATE POLICY "Authenticated users can manage lessons" ON lessons
  FOR ALL USING (auth.role() = 'authenticated');

-- Test if current session is authenticated
SELECT 
    auth.uid() as user_id,
    auth.role() as user_role,
    auth.email() as user_email;

-- Check lesson count before test
SELECT COUNT(*) as lesson_count_before FROM lessons;

-- The UI should now be able to create lessons
-- After testing, we can make the policy more restrictive