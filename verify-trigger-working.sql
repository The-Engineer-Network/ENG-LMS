-- Quick check to see if the trigger created a profile for the newest user

-- Show the newest user and their profile status
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  CASE WHEN p.id IS NOT NULL THEN '✅ HAS PROFILE' ELSE '❌ NO PROFILE' END as profile_status,
  p.full_name,
  p.role,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 3;

-- Count check
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM profiles) 
    THEN '✅ ALL USERS HAVE PROFILES' 
    ELSE '❌ SOME USERS MISSING PROFILES' 
  END as status;