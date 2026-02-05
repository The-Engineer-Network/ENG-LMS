-- Disable RLS on task_submissions (already done, but ensuring)
ALTER TABLE task_submissions DISABLE ROW LEVEL SECURITY;

-- Disable RLS on student_achievements if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'student_achievements' AND schemaname = 'public') THEN
        ALTER TABLE student_achievements DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on student_achievements';
    ELSE
        RAISE NOTICE 'student_achievements table does not exist';
    END IF;
END $$;

-- Find and disable any triggers on task_submissions that reference student_achievements
DO $$
DECLARE
    trigger_rec RECORD;
BEGIN
    FOR trigger_rec IN 
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers
        WHERE event_object_table = 'task_submissions'
          AND trigger_schema = 'public'
          AND (
              action_statement LIKE '%student_achievements%' 
              OR action_statement LIKE '%award_achievement%'
              OR action_statement LIKE '%update_achievements%'
          )
    LOOP
        EXECUTE format('ALTER TABLE %I DISABLE TRIGGER %I', 
                      trigger_rec.event_object_table, 
                      trigger_rec.trigger_name);
        RAISE NOTICE 'Disabled trigger: %', trigger_rec.trigger_name;
    END LOOP;
END $$;

-- Verify status
SELECT 
    'task_submissions' as table_name,
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'task_submissions' AND schemaname = 'public'
UNION ALL
SELECT 
    'student_achievements' as table_name,
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'student_achievements' AND schemaname = 'public';

-- List all triggers on task_submissions
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    tgenabled as enabled_status
FROM information_schema.triggers t
JOIN pg_trigger pt ON pt.tgname = t.trigger_name
WHERE event_object_table = 'task_submissions'
  AND trigger_schema = 'public'
ORDER BY trigger_name;
