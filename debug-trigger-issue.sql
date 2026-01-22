-- Debug why the trigger isn't working for new users

-- 1. Check if trigger exists and is properly configured
SELECT 'TRIGGER CHECK' as debug_step;
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing,
  action_orientation
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 2. Check if the function exists and has correct permissions
SELECT 'FUNCTION CHECK' as debug_step;
SELECT 
  proname,
  proowner,
  prosecdef,  -- Should be true for SECURITY DEFINER
  proacl      -- Access control list
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 3. Check for any conflicting triggers on auth.users
SELECT 'ALL TRIGGERS ON AUTH.USERS' as debug_step;
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- 4. Check RLS policies that might block profile creation
SELECT 'RLS POLICIES ON PROFILES' as debug_step;
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 5. Test if we can manually call the function (this will show any errors)
SELECT 'MANUAL FUNCTION TEST' as debug_step;
-- We'll create a test to see if the function works

-- 6. Check the newest user to see if they have a profile
SELECT 'NEWEST USER STATUS' as debug_step;
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.id as profile_id,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 3;