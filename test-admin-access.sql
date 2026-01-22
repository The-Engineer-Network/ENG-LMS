-- Test if admin access is working properly

-- 1. Check if is_admin function exists
SELECT 'CHECKING is_admin FUNCTION:' as test;
SELECT proname, prosrc FROM pg_proc WHERE proname = 'is_admin';

-- 2. Test the is_admin function with current user
SELECT 'TESTING is_admin() FUNCTION:' as test;
SELECT 
  auth.uid() as current_user_id,
  is_admin() as is_admin_result,
  (SELECT role FROM profiles WHERE id = auth.uid()) as user_role;

-- 3. Check if current user has admin profile
SELECT 'CURRENT USER PROFILE:' as test;
SELECT id, email, role FROM profiles WHERE id = auth.uid();

-- 4. Test basic table access
SELECT 'TESTING TABLE ACCESS:' as test;
SELECT 'Tracks count:' as table_name, COUNT(*) as count FROM tracks
UNION ALL
SELECT 'Cohorts count:', COUNT(*) FROM cohorts
UNION ALL
SELECT 'Students count:', COUNT(*) FROM student_enrollments;

-- 5. Check RLS policies on tracks table
SELECT 'RLS POLICIES ON TRACKS:' as test;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'tracks';