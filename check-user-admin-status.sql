-- Check current user's admin status
SELECT 
    auth.uid() as current_user_id,
    auth.role() as auth_role;

-- Check user profile
SELECT 
    id,
    email,
    role,
    is_admin,
    created_at
FROM profiles 
WHERE id = auth.uid();

-- Test the is_admin function
SELECT is_admin() as admin_function_result;

-- Check if user can insert lessons
DO $$
BEGIN
    INSERT INTO lessons (title, type, content, week_id, order_index)
    VALUES (
        'User Permission Test',
        'text',
        'Testing user permissions',
        (SELECT id FROM weeks LIMIT 1),
        2
    );
    RAISE NOTICE 'User can insert lessons successfully';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'User cannot insert lessons: % %', SQLSTATE, SQLERRM;
END $$;