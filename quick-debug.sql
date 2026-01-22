-- Quick debug to check current state
-- 1. Check if lessons table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'lessons'
) as lessons_table_exists;

-- 2. Check current user admin status
SELECT 
    auth.uid() as user_id,
    is_admin() as is_admin_result;

-- 3. Check if we can insert into lessons table manually
INSERT INTO lessons (title, type, content, week_id, order_index)
SELECT 
    'Manual Test Lesson',
    'text',
    'Testing manual insertion',
    w.id,
    1
FROM weeks w
LIMIT 1
RETURNING id, title, created_at;