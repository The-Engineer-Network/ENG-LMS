-- Debug why is_admin() function is not working

-- Check current user and their profile
SELECT 'CURRENT USER DEBUG:' as debug_step;
SELECT 
  auth.uid() as current_user_id,
  auth.jwt() ->> 'email' as current_email;

-- Check if user has admin profile
SELECT 'USER PROFILE CHECK:' as debug_step;
SELECT 
  id,
  email, 
  role,
  created_at
FROM profiles 
WHERE id = auth.uid();

-- Test is_admin function step by step
SELECT 'is_admin() FUNCTION TEST:' as debug_step;
SELECT 
  auth.uid() as user_id,
  (SELECT role FROM profiles WHERE id = auth.uid()) as user_role,
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' as role_check,
  is_admin() as function_result;

-- Check if there are any admin users at all
SELECT 'ALL ADMIN USERS:' as debug_step;
SELECT id, email, role FROM profiles WHERE role = 'admin';