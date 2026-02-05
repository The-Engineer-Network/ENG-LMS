-- Alternative approach: Grant permissions instead of disabling triggers
-- This allows the trigger to work while bypassing RLS

-- 1. Disable RLS on both tables
ALTER TABLE task_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS student_achievements DISABLE ROW LEVEL SECURITY;

-- 2. Grant full permissions to authenticated users on student_achievements
GRANT ALL ON student_achievements TO authenticated;
GRANT ALL ON student_achievements TO anon;

-- 3. Grant usage on sequences if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'student_achievements_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE student_achievements_id_seq TO authenticated;
        GRANT USAGE, SELECT ON SEQUENCE student_achievements_id_seq TO anon;
    END IF;
END $$;

-- 4. Verify permissions
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    tableowner
FROM pg_tables 
WHERE tablename IN ('task_submissions', 'student_achievements')
    AND schemaname = 'public';

-- 5. Show grants
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_name IN ('task_submissions', 'student_achievements')
    AND table_schema = 'public'
ORDER BY table_name, grantee;
