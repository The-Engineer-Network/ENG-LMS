-- Fix the 2 users without profiles immediately

-- Create profiles for existing users without profiles
INSERT INTO profiles (id, email, full_name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    split_part(u.email, '@', 1)
  ) as full_name,
  CASE 
    WHEN u.email LIKE '%admin%' THEN 'admin'
    ELSE 'student'
  END as role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Verify the fix worked
SELECT 'VERIFICATION - Users without profiles after fix:' as status;
SELECT COUNT(*) as users_without_profiles
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Show all profiles created
SELECT 'VERIFICATION - All profiles:' as status;
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC;