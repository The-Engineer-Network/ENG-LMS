-- Check if the admin can actually insert lessons

-- 1. Show the INSERT policy
SELECT 
  'LESSONS INSERT POLICY' as check_type,
  policyname,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies 
WHERE tablename = 'lessons' 
  AND cmd = 'INSERT';

-- 2. Check the is_admin function definition
SELECT 
  'IS_ADMIN FUNCTION' as check_type,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'is_admin';

-- 3. Test if auth.uid() returns something
SELECT 
  'AUTH UID TEST' as check_type,
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN 'No authenticated user'
    ELSE 'User is authenticated'
  END as status;

-- 4. Check if current user is admin
SELECT 
  'CURRENT USER ADMIN CHECK' as check_type,
  p.id,
  p.email,
  p.role,
  CASE 
    WHEN p.role = 'admin' THEN 'YES - User is admin'
    ELSE 'NO - User is not admin'
  END as is_admin_status
FROM profiles p
WHERE p.id = auth.uid();

-- 5. Test the is_admin() function directly
SELECT 
  'IS_ADMIN FUNCTION RESULT' as check_type,
  is_admin() as result,
  CASE 
    WHEN is_admin() THEN 'Function returns TRUE'
    ELSE 'Function returns FALSE - THIS IS THE PROBLEM!'
  END as explanation;
