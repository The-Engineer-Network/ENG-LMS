-- Comprehensive diagnostic and fix for user/profile issues

-- 1. Check current state
SELECT '=== CURRENT STATE DIAGNOSIS ===' as section;

-- Check if profiles table exists and is empty
SELECT 'PROFILES TABLE STATUS:' as check_type;
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_profiles,
  COUNT(CASE WHEN role = 'student' THEN 1 END) as student_profiles
FROM profiles;

-- Check auth.users
SELECT 'AUTH USERS STATUS:' as check_type;
SELECT 
  COUNT(*) as total_auth_users,
  MIN(created_at) as oldest_user,
  MAX(created_at) as newest_user
FROM auth.users;

-- Show all users without profiles
SELECT 'USERS WITHOUT PROFILES:' as check_type;
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.email_confirmed_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- Check if trigger exists
SELECT 'TRIGGER STATUS:' as check_type;
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 2. Fix all users without profiles
SELECT '=== FIXING USERS WITHOUT PROFILES ===' as section;

INSERT INTO profiles (id, email, full_name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.user_metadata->>'full_name',
    split_part(u.email, '@', 1)
  ) as full_name,
  CASE 
    WHEN u.email LIKE '%admin%' THEN 'admin'
    ELSE 'student'
  END as role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 3. Verify the fix
SELECT '=== VERIFICATION AFTER FIX ===' as section;

SELECT 'PROFILES AFTER FIX:' as check_type;
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_profiles,
  COUNT(CASE WHEN role = 'student' THEN 1 END) as student_profiles
FROM profiles;

SELECT 'REMAINING USERS WITHOUT PROFILES:' as check_type;
SELECT COUNT(*) as users_without_profiles
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Show all current profiles
SELECT 'ALL CURRENT PROFILES:' as check_type;
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at,
  u.created_at as user_created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

SELECT '=== DIAGNOSIS COMPLETE ===' as section;