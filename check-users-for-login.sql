-- Check what users exist for login testing

-- Show all users with their profiles
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at as user_created,
  p.full_name,
  p.role,
  p.created_at as profile_created,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Email Confirmed'
    ELSE '❌ Email Not Confirmed'
  END as email_status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Count users by role
SELECT 
  p.role,
  COUNT(*) as count
FROM profiles p
GROUP BY p.role;

-- Check if there are any users without profiles (should be 0)
SELECT 
  COUNT(*) as users_without_profiles
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;