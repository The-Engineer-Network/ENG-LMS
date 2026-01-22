-- Test if the trigger is working properly

-- 1. Check if the trigger exists and is active
SELECT 
  trigger_name,
  event_manipulation, 
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 2. Check if the function exists
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 3. Verify all users now have profiles
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  p.id as profile_exists,
  p.full_name,
  p.role,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 4. Check RLS policies on profiles table
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles' AND cmd = 'INSERT';