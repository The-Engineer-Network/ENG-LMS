-- Fix the infinite recursion in RLS policies

-- Drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON student_enrollments;
DROP POLICY IF EXISTS "Admins can view all submissions" ON task_submissions;
DROP POLICY IF EXISTS "Admins can view all submission files" ON task_submission_files;
DROP POLICY IF EXISTS "Admins can view all progress" ON week_progress;
DROP POLICY IF EXISTS "Admins can view all certificates" ON certificates;
DROP POLICY IF EXISTS "Admins can view all partnerships" ON accountability_partners;
DROP POLICY IF EXISTS "Admins can view all clarity requests" ON clarity_call_requests;
DROP POLICY IF EXISTS "Admins can manage all tracks" ON tracks;
DROP POLICY IF EXISTS "Admins can manage all cohorts" ON cohorts;
DROP POLICY IF EXISTS "Admins can manage whitelist" ON paid_learner_whitelist;

-- Create non-recursive admin policies using a different approach
-- Instead of checking profiles table, we'll check auth.users metadata or email

-- Profiles - Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    auth.jwt() ->> 'email' LIKE '%admin%' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- Allow admins to update profiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    auth.jwt() ->> 'email' LIKE '%admin%' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- Student enrollments - Allow admins to view all
CREATE POLICY "Admins can view all enrollments" ON student_enrollments
  FOR SELECT USING (
    auth.jwt() ->> 'email' LIKE '%admin%' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- Task submissions - Allow admins to view and update all
CREATE POLICY "Admins can manage all submissions" ON task_submissions
  FOR ALL USING (
    auth.jwt() ->> 'email' LIKE '%admin%' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- Certificates - Allow admins to manage all
CREATE POLICY "Admins can manage all certificates" ON certificates
  FOR ALL USING (
    auth.jwt() ->> 'email' LIKE '%admin%' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- Clarity call requests - Allow admins to manage all
CREATE POLICY "Admins can manage all clarity requests" ON clarity_call_requests
  FOR ALL USING (
    auth.jwt() ->> 'email' LIKE '%admin%' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- Tracks - Allow admins to manage all
CREATE POLICY "Admins can manage all tracks" ON tracks
  FOR ALL USING (
    auth.jwt() ->> 'email' LIKE '%admin%' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- Cohorts - Allow admins to manage all
CREATE POLICY "Admins can manage all cohorts" ON cohorts
  FOR ALL USING (
    auth.jwt() ->> 'email' LIKE '%admin%' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- Whitelist - Allow admins to manage
CREATE POLICY "Admins can manage whitelist" ON paid_learner_whitelist
  FOR ALL USING (
    auth.jwt() ->> 'email' LIKE '%admin%' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

SELECT 'RLS POLICIES FIXED - NO MORE RECURSION' as status;