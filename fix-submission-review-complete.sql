-- Step 1: Disable RLS on task_submissions
ALTER TABLE task_submissions DISABLE ROW LEVEL SECURITY;

-- Step 2: Check if student_achievements table exists and disable RLS
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'student_achievements' AND schemaname = 'public') THEN
        ALTER TABLE student_achievements DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on student_achievements';
    ELSE
        RAISE NOTICE 'student_achievements table does not exist';
    END IF;
END $$;

-- Step 3: Check for triggers on task_submissions that might be causing issues
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'task_submissions'
  AND trigger_schema = 'public';

-- Step 4: Verify RLS status
SELECT 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename IN ('task_submissions', 'student_achievements')
    AND schemaname = 'public';
