-- Fix lesson creation issue
-- First, let's check the current user's admin status
SELECT 
    p.id,
    p.email,
    p.role,
    is_admin() as admin_check
FROM profiles p
WHERE p.id = auth.uid();

-- Check if the lessons table has proper RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'lessons';

-- Temporarily disable RLS on lessons table to test
-- ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;

-- Test lesson creation
-- INSERT INTO lessons (title, type, content, week_id, order_index)
-- VALUES (
--     'Test Lesson After Fix',
--     'text',
--     'Testing after RLS fix',
--     (SELECT id FROM weeks LIMIT 1),
--     1
-- )
-- RETURNING *;

-- Re-enable RLS
-- ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;