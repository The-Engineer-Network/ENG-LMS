-- Debug lesson RLS issues
-- 1. Check current user
SELECT 
    auth.uid() as user_id,
    auth.role() as auth_role;

-- 2. Check user profile and admin status
SELECT 
    id,
    email,
    role,
    is_admin,
    created_at
FROM profiles 
WHERE id = auth.uid();

-- 3. Test the admin check function
SELECT is_admin() as admin_check_result;

-- 4. Check if RLS is enabled on lessons table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'lessons';

-- 5. Test lesson creation with detailed error info
DO $$
BEGIN
    INSERT INTO lessons (title, type, content, week_id, order_index)
    VALUES (
        'Debug Test Lesson',
        'text',
        'Testing lesson creation',
        (SELECT id FROM weeks LIMIT 1),
        1
    );
    RAISE NOTICE 'Lesson created successfully';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating lesson: % %', SQLSTATE, SQLERRM;
END $$;