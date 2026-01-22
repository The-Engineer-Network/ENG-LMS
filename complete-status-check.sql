-- Complete status check for user creation system

-- 1. Check if trigger exists and is active
SELECT 'TRIGGER STATUS' as check_type;
SELECT 
  trigger_name,
  event_manipulation, 
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 2. Check if function exists and view its code
SELECT 'FUNCTION STATUS' as check_type;
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 3. Check all users and their profile status
SELECT 'USER-PROFILE STATUS' as check_type;
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
ORDER BY u.created_at DESC;

-- 4. Check RLS policies that might affect profile creation
SELECT 'RLS POLICIES' as check_type;
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles' AND cmd IN ('INSERT', 'ALL');

-- 5. Check if there are any users without profiles (should be empty after fix)
SELECT 'USERS WITHOUT PROFILES' as check_type;
SELECT COUNT(*) as users_without_profiles
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;