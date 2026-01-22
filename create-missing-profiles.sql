-- Create profiles for existing auth.users that don't have profiles

-- First, let's see what users exist without profiles
SELECT 
  u.id,
  u.email,
  u.created_at,
  CASE 
    WHEN u.email LIKE '%admin%' THEN 'admin'
    ELSE 'student'
  END as suggested_role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Create profiles for users without them
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
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify the profiles were created
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at
FROM profiles p
ORDER BY p.created_at DESC;