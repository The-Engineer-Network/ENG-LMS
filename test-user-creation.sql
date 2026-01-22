-- Test script to check user creation and profile creation

-- 1. Check if trigger exists and is active
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%user%' OR trigger_name LIKE '%profile%';

-- 2. Check existing users in auth.users without profiles
SELECT 
  u.id,
  u.email,
  u.created_at as auth_created,
  p.id as profile_id,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 3. Check all profiles to see what exists
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- 4. Test the handle_new_user function manually (if needed)
-- This would simulate what happens when a user is created
-- SELECT handle_new_user() -- Don't run this directly

-- 5. Check if there are any RLS policies preventing profile creation
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles';