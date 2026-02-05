-- Check and fix admin user role

-- 1. First, let's see all users and their roles
SELECT 'ALL USERS' as check_type;
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
ORDER BY created_at;

-- 2. Find users who should be admin (you can identify by email)
-- Replace 'your-admin-email@example.com' with your actual admin email
SELECT 'POTENTIAL ADMIN USERS' as check_type;
SELECT 
  id,
  email,
  full_name,
  role,
  CASE 
    WHEN role = 'admin' THEN 'Already admin'
    ELSE 'Needs to be set as admin'
  END as status
FROM profiles
WHERE email LIKE '%admin%' OR email LIKE '%teacher%' OR created_at = (SELECT MIN(created_at) FROM profiles);

-- 3. Update the first user to be admin (usually the first user is the admin)
-- If you know your admin email, replace the WHERE clause
UPDATE profiles 
SET role = 'admin'
WHERE id = (SELECT id FROM profiles ORDER BY created_at LIMIT 1)
RETURNING id, email, full_name, role;

-- 4. Verify the update
SELECT 'VERIFICATION' as check_type;
SELECT 
  id,
  email,
  full_name,
  role
FROM profiles
WHERE role = 'admin';

-- 5. If you need to set a specific user as admin by email, uncomment and modify this:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
