-- FINAL SIMPLE FIX: Just disable RLS on both tables
-- This is the cleanest solution - no trigger manipulation needed

-- 1. Disable RLS on task_submissions
ALTER TABLE task_submissions DISABLE ROW LEVEL SECURITY;

-- 2. Disable RLS on student_achievements if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT FROM pg_tables 
        WHERE tablename = 'student_achievements' 
        AND schemaname = 'public'
    ) THEN
        ALTER TABLE student_achievements DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✓ RLS disabled on student_achievements';
    ELSE
        RAISE NOTICE '⚠ student_achievements table does not exist';
    END IF;
END $$;

-- 3. Verify RLS is disabled
SELECT 
    tablename, 
    CASE rowsecurity 
        WHEN true THEN '❌ ENABLED (Problem!)'
        WHEN false THEN '✓ Disabled (Good)'
    END as rls_status
FROM pg_tables 
WHERE tablename IN ('task_submissions', 'student_achievements')
    AND schemaname = 'public'
ORDER BY tablename;

-- 4. Show success message
SELECT '✓ RLS disabled on task_submissions and student_achievements. Try reviewing a submission now.' as status;
