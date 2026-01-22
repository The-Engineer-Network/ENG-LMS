-- Check current status of users and profiles

-- 1. Count users and profiles
SELECT 'USER AND PROFILE COUNTS:' as status;
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users u LEFT JOIN profiles p ON u.id = p.id WHERE p.id IS NULL) as users_without_profiles;

-- 2. Show all users and their profile status
SELECT 'ALL USERS AND PROFILE STATUS:' as status;
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  CASE WHEN p.id IS NOT NULL THEN 'HAS PROFILE' ELSE 'NO PROFILE' END as profile_status,
  p.full_name,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 3. Show all profiles
SELECT 'ALL PROFILES:' as status;
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- 4. Check trigger status
SELECT 'TRIGGER STATUS:' as status;
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';