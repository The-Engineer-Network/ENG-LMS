-- Fix the 2 existing users that don't have profiles

-- Create profiles for the existing users
INSERT INTO profiles (id, email, full_name, role)
VALUES 
  (
    'aee37826-357b-4ac0-823d-af197be7e979',
    'emmanueladewunmi15@gmail.com',
    'emmanueladewunmi15',
    'student'
  ),
  (
    '96e7ff38-ff3e-4bb4-9b05-0aa76ca7eedb',
    'emmanueladewunmi51@gmail.com', 
    'emmanueladewunmi51',
    'student'
  )
ON CONFLICT (id) DO NOTHING;

-- Verify the profiles were created
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles 
WHERE id IN (
  'aee37826-357b-4ac0-823d-af197be7e979',
  '96e7ff38-ff3e-4bb4-9b05-0aa76ca7eedb'
);

-- Check if trigger is working by viewing trigger info
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';