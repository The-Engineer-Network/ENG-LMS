-- Fix user admin permissions (without is_admin column)
-- First check current user
SELECT 
    auth.uid() as user_id,
    (SELECT email FROM profiles WHERE id = auth.uid()) as user_email,
    (SELECT role FROM profiles WHERE id = auth.uid()) as current_role;

-- Update current user to admin if they exist
UPDATE profiles 
SET role = 'admin'
WHERE id = auth.uid()
RETURNING id, email, role;

-- If no profile exists, create one
INSERT INTO profiles (id, email, role)
SELECT 
    auth.uid(),
    auth.email(),
    'admin'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
RETURNING id, email, role;

-- Test the is_admin function after update
SELECT is_admin() as admin_check_result;

-- Test lesson creation after admin fix
INSERT INTO lessons (title, type, content, week_id, order_index)
VALUES (
    'Admin Test Lesson After Fix',
    'text',
    'Testing after admin role fix',
    (SELECT id FROM weeks LIMIT 1),
    4
)
RETURNING id, title, created_at;