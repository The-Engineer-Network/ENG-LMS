-- Simple System Check - No assumptions about column names

-- =============================================================================
-- STEP 1: Check if our new tables exist
-- =============================================================================

SELECT 'TABLE_EXISTS' as check_type,
       table_name,
       CASE WHEN table_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('student_achievements', 'week_progress');

-- =============================================================================
-- STEP 2: Show actual structure of new tables (if they exist)
-- =============================================================================

-- Check student_achievements structure
SELECT 'STUDENT_ACHIEVEMENTS_COLUMNS' as info, 
       column_name, 
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'student_achievements'
ORDER BY ordinal_position;

-- Check week_progress structure  
SELECT 'WEEK_PROGRESS_COLUMNS' as info,
       column_name,
       data_type, 
       is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'week_progress'
ORDER BY ordinal_position;

-- =============================================================================
-- STEP 3: Check triggers exist
-- =============================================================================

SELECT 'TRIGGERS' as info,
       trigger_name,
       event_object_table,
       'Trigger exists' as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%student%'
ORDER BY trigger_name;

-- =============================================================================
-- STEP 4: Check functions exist
-- =============================================================================

SELECT 'FUNCTIONS' as info,
       routine_name,
       'Function exists' as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
    'update_student_progress',
    'create_student_achievements', 
    'update_week_progress_on_submission'
);

-- =============================================================================
-- STEP 5: Simple data counts (safe)
-- =============================================================================

-- Count main tables
SELECT 'DATA_COUNTS' as info, 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'DATA_COUNTS', 'task_submissions', COUNT(*) FROM task_submissions
UNION ALL  
SELECT 'DATA_COUNTS', 'assignments', COUNT(*) FROM assignments;

-- Count new tables (only if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_achievements') THEN
        RAISE NOTICE 'student_achievements count: %', (SELECT COUNT(*) FROM student_achievements);
    ELSE
        RAISE NOTICE 'student_achievements table does not exist';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'week_progress') THEN
        RAISE NOTICE 'week_progress count: %', (SELECT COUNT(*) FROM week_progress);
    ELSE
        RAISE NOTICE 'week_progress table does not exist';
    END IF;
END $$;

-- =============================================================================
-- STEP 6: Show available test submissions
-- =============================================================================

SELECT 'TEST_SUBMISSIONS' as info,
       id,
       student_id,
       status,
       'Available for testing' as note
FROM task_submissions 
WHERE status != 'approved'
LIMIT 3;

-- =============================================================================
-- STEP 7: System status summary
-- =============================================================================

SELECT 'SYSTEM_STATUS' as summary,
       'Check the results above to see what was created successfully' as instruction,
       'If tables are missing, the deployment may have failed partially' as note;