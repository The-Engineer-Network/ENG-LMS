-- Check the specific user you're trying to login with

-- Check if the user exists in auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'CONFIRMED'
    ELSE 'NOT CONFIRMED'
  END as email_status
FROM auth.users 
WHERE email = 'emmanueladewunmi51@gmail.com';

-- Check if the user has a profile
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles 
WHERE email = 'emmanueladewunmi51@gmail.com';

-- Check if there are any issues with the user account
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.banned_until,
  u.deleted_at,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'emmanueladewunmi51@gmail.com';