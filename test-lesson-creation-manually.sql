-- Test lesson creation manually to identify the issue
-- First, check current user and admin status
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role;

-- Check if current user is admin
SELECT 
    p.id,
    p.email,
    p.role,
    p.is_admin
FROM profiles p
WHERE p.id = auth.uid();

-- Test manual lesson creation
INSERT INTO lessons (title, type, content, week_id, order_index)
VALUES (
    'Test Lesson Manual',
    'text',
    'This is a test lesson created manually',
    (SELECT id FROM weeks LIMIT 1),
    1
)
RETURNING *;