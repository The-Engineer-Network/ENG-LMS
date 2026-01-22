-- Test if the current user is recognized as admin in app context
-- This will help us understand why updates fail

-- 1. Check current user context
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- 2. Check if user exists in profiles and their role
SELECT 
  id,
  email,
  role,
  created_at
FROM profiles 
WHERE id = auth.uid();

-- 3. Test the exact admin check that the policy uses
SELECT 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) as is_admin_check;

-- 4. Test assignment update permission directly
-- This should return true if the user can update assignments
SELECT 
  has_table_privilege(auth.uid(), 'assignments', 'UPDATE') as can_update_table,
  has_table_privilege(auth.uid(), 'assignments', 'SELECT') as can_select_table;