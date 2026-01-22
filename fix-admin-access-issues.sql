-- Fix all admin access issues by ensuring proper RLS policies

-- First, let's make sure all tables have proper admin access policies
-- We'll use a more reliable admin detection method

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON student_enrollments;
DROP POLICY IF EXISTS "Admins can manage all submissions" ON task_submissions;
DROP POLICY IF EXISTS "Admins can manage all certificates" ON certificates;
DROP POLICY IF EXISTS "Admins can manage all clarity requests" ON clarity_call_requests;
DROP POLICY IF EXISTS "Admins can manage all tracks" ON tracks;
DROP POLICY IF EXISTS "Admins can manage all cohorts" ON cohorts;
DROP POLICY IF EXISTS "Admins can manage whitelist" ON paid_learner_whitelist;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user exists in profiles table with admin role
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO anon;

-- Create comprehensive admin policies using the function

-- Profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (is_admin());

-- Student enrollments
CREATE POLICY "Admins can manage all enrollments" ON student_enrollments
  FOR ALL USING (is_admin());

-- Task submissions
CREATE POLICY "Admins can manage all submissions" ON task_submissions
  FOR ALL USING (is_admin());

-- Certificates
CREATE POLICY "Admins can manage all certificates" ON certificates
  FOR ALL USING (is_admin());

-- Clarity call requests
CREATE POLICY "Admins can manage all clarity requests" ON clarity_call_requests
  FOR ALL USING (is_admin());

-- Tracks
CREATE POLICY "Admins can manage all tracks" ON tracks
  FOR ALL USING (is_admin());

-- Cohorts
CREATE POLICY "Admins can manage all cohorts" ON cohorts
  FOR ALL USING (is_admin());

-- Weeks
CREATE POLICY "Admins can manage all weeks" ON weeks
  FOR ALL USING (is_admin());

-- Lessons
CREATE POLICY "Admins can manage all lessons" ON lessons
  FOR ALL USING (is_admin());

-- Assignments
CREATE POLICY "Admins can manage all assignments" ON assignments
  FOR ALL USING (is_admin());

-- Whitelist
CREATE POLICY "Admins can manage whitelist" ON paid_learner_whitelist
  FOR ALL USING (is_admin());

-- Admin settings
CREATE POLICY "Admins can manage settings" ON admin_settings
  FOR ALL USING (is_admin());

-- Notifications
CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR ALL USING (is_admin());

-- Week progress
CREATE POLICY "Admins can view all progress" ON week_progress
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update progress" ON week_progress
  FOR UPDATE USING (is_admin());

-- Accountability partners
CREATE POLICY "Admins can manage partnerships" ON accountability_partners
  FOR ALL USING (is_admin());

-- Task submission files
CREATE POLICY "Admins can manage submission files" ON task_submission_files
  FOR ALL USING (is_admin());

-- Chat messages
CREATE POLICY "Admins can view all messages" ON chat_messages
  FOR SELECT USING (is_admin());

SELECT 'ADMIN ACCESS POLICIES FIXED - All admin functions should now work' as status;