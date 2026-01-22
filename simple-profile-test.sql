-- Simple test to check profiles table and recent users

-- 1. Check if profiles table exists and show its structure
SELECT 'PROFILES TABLE CHECK:' as status;
SELECT COUNT(*) as profile_count FROM public.profiles;

-- 2. Show recent users from auth.users
SELECT 'RECENT AUTH USERS:' as status;
SELECT 
  id,
  email,
  created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Show recent profiles
SELECT 'RECENT PROFILES:' as status;
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Check for users without profiles
SELECT 'USERS WITHOUT PROFILES:' as status;
SELECT 
  u.id,
  u.email,
  u.created_at as user_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;