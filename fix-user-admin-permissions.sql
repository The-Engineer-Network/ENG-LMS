-- Fix user admin permissions
-- First check current user
SELECT 
    auth.uid() as user_id,
    (SELECT email FROM profiles WHERE id = auth.uid()) as user_email,
    (SELECT role FROM profiles WHERE id = auth.uid()) as current_role;

-- Update current user to admin if they exist
UPDATE profiles 
SET role = 'admin', is_admin = true
WHERE id = auth.uid()
RETURNING id, email, role, is_admin;

-- If no profile exists, create one
INSERT INTO profiles (id, email, role, is_admin)
SELECT 
    auth.uid(),
    auth.email(),
    'admin',
    true
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
RETURNING id, email, role, is_admin;

-- Test lesson creation after admin fix
INSERT INTO lessons (title, type, content, week_id, order_index)
VALUES (
    'Admin Test Lesson',
    'text',
    'Testing after admin fix',
    (SELECT id FROM weeks LIMIT 1),
    3
)
RETURNING id, title, created_at;