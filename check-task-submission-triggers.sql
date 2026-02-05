-- Check all triggers on task_submissions table
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.action_timing,
    t.action_statement,
    p.proname as function_name
FROM information_schema.triggers t
LEFT JOIN pg_proc p ON t.action_statement LIKE '%' || p.proname || '%'
WHERE t.event_object_table = 'task_submissions'
  AND t.trigger_schema = 'public'
ORDER BY t.trigger_name;

-- Check if student_achievements table exists
SELECT EXISTS (
    SELECT FROM pg_tables 
    WHERE tablename = 'student_achievements' 
    AND schemaname = 'public'
) as student_achievements_exists;

-- If it exists, check its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'student_achievements'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check RLS status on both tables
SELECT 
    schemaname,
    tablename, 
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE tablename IN ('task_submissions', 'student_achievements')
    AND schemaname = 'public';
