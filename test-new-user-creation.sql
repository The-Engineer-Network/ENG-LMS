-- Test script to verify the trigger is working after recreating it

-- 1. Check current user count before test
SELECT 'BEFORE TEST - Current user count:' as status;
SELECT COUNT(*) as total_users FROM auth.users;
SELECT COUNT(*) as total_profiles FROM profiles;

-- 2. Show the most recent users and their profiles
SELECT 'CURRENT USERS AND PROFILES:' as status;
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  CASE WHEN p.id IS NOT NULL THEN 'YES' ELSE 'NO' END as has_profile,
  p.full_name,
  p.role,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 5;

-- 3. Verify trigger exists and is active
SELECT 'TRIGGER STATUS:' as status;
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 4. Check RLS policies
SELECT 'RLS POLICIES:' as status;
SELECT 
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'profiles' AND cmd IN ('INSERT', 'ALL');