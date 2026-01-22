-- Test the trigger manually to see if it's working

-- 1. Check if the trigger function exists and can be called
SELECT 'FUNCTION TEST:' as test_type;
SELECT 
  proname,
  prosecdef,
  proacl
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 2. Check trigger configuration
SELECT 'TRIGGER CONFIGURATION:' as test_type;
SELECT 
  t.trigger_name,
  t.event_manipulation,
  t.action_timing,
  t.action_orientation,
  t.action_statement,
  p.proname as function_name
FROM information_schema.triggers t
LEFT JOIN pg_proc p ON t.action_statement LIKE '%' || p.proname || '%'
WHERE t.trigger_name = 'on_auth_user_created';

-- 3. Check RLS policies that might block the trigger
SELECT 'RLS POLICIES ON PROFILES:' as test_type;
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'profiles' AND cmd IN ('INSERT', 'ALL');

-- 4. Test if we can insert into profiles table directly (simulating trigger)
SELECT 'DIRECT INSERT TEST:' as test_type;
-- This will test if there are any constraints preventing inserts

-- Create a test profile to see if basic insert works
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  gen_random_uuid(),
  'test-trigger@example.com',
  'Test User',
  'student'
)
ON CONFLICT (id) DO NOTHING;

-- Check if the test profile was created
SELECT 
  id,
  email,
  full_name,
  role
FROM profiles 
WHERE email = 'test-trigger@example.com';

-- Clean up test profile
DELETE FROM profiles WHERE email = 'test-trigger@example.com';