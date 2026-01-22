-- Safe Automation Test Script
-- This script checks actual table structure before running queries

-- =============================================================================
-- STEP 1: Check Table Structures First
-- =============================================================================

-- Check what columns exist in each table
SELECT 'PROFILES_STRUCTURE' as table_info, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

SELECT 'TASK_SUBMISSIONS_STRUCTURE' as table_info, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'task_submissions'
ORDER BY ordinal_position;

SELECT 'ASSIGNMENTS_STRUCTURE' as table_info, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'assignments'
ORDER BY ordinal_position;

-- Check our new tables
SELECT 'STUDENT_ACHIEVEMENTS_STRUCTURE' as table_info, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'student_achievements'
ORDER BY ordinal_position;

SELECT 'WEEK_PROGRESS_STRUCTURE' as table_info, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'week_progress'
ORDER BY ordinal_position;

-- =============================================================================
-- STEP 2: Check Current Data (Safe Queries)
-- =============================================================================

-- Count records in each table
SELECT 'DATA_COUNT' as check_type, 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'DATA_COUNT', 'assignments', COUNT(*) FROM assignments
UNION ALL
SELECT 'DATA_COUNT', 'task_submissions', COUNT(*) FROM task_submissions
UNION ALL
SELECT 'DATA_COUNT', 'student_achievements', COUNT(*) FROM student_achievements
UNION ALL
SELECT 'DATA_COUNT', 'week_progress', COUNT(*) FROM week_progress;

-- =============================================================================
-- STEP 3: Check Existing Submissions (Safe)
-- =============================================================================

-- Show existing submissions with only columns we know exist
SELECT 'EXISTING_SUBMISSIONS' as type,
       id,
       student_id,
       assignment_id,
       status
FROM task_submissions 
WHERE status IN ('pending', 'in_review', 'needs_changes')
LIMIT 5;

-- =============================================================================
-- STEP 4: Check Trigger Status
-- =============================================================================

-- Verify our triggers were created
SELECT 'TRIGGER_STATUS' as type,
       trigger_name,
       event_object_table,
       action_timing,
       event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%student%'
ORDER BY trigger_name;

-- =============================================================================
-- STEP 5: Test Trigger Functions Exist
-- =============================================================================

-- Check if our functions were created
SELECT 'FUNCTION_STATUS' as type,
       routine_name,
       routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'update_student_progress',
    'create_student_achievements',
    'update_week_progress_on_submission'
);

-- =============================================================================
-- STEP 6: Simple Manual Test (Safe)
-- =============================================================================

-- Check if we have any submissions we can test with
SELECT 'TEST_CANDIDATES' as type,
       COUNT(*) as available_submissions,
       'Run manual test if count > 0' as instruction
FROM task_submissions 
WHERE status != 'approved';

-- Show one submission we could test with (if any exist)
SELECT 'SAMPLE_SUBMISSION' as type,
       id as submission_id,
       student_id,
       status,
       'Use this ID for manual testing' as instruction
FROM task_submissions 
WHERE status != 'approved'
LIMIT 1;

-- =============================================================================
-- STEP 7: Check Current Achievements and Progress
-- =============================================================================

-- Check if any achievements exist
SELECT 'CURRENT_ACHIEVEMENTS' as type,
       COUNT(*) as total_achievements,
       COUNT(DISTINCT student_id) as students_with_achievements
FROM student_achievements;

-- Check if any progress records exist
SELECT 'CURRENT_PROGRESS' as type,
       COUNT(*) as total_progress_records,
       COUNT(DISTINCT student_id) as students_with_progress
FROM week_progress;

-- Show sample achievements if any exist
SELECT 'SAMPLE_ACHIEVEMENTS' as type,
       student_id,
       achievement_type,
       title,
       earned_at
FROM student_achievements
ORDER BY earned_at DESC
LIMIT 3;

-- Show sample progress if any exists
SELECT 'SAMPLE_PROGRESS' as type,
       student_id,
       week_id,
       status,
       submitted_at,
       completed_at
FROM week_progress
ORDER BY updated_at DESC
LIMIT 3;

-- =============================================================================
-- STEP 8: Manual Test Instructions
-- =============================================================================

SELECT 'MANUAL_TEST_INSTRUCTIONS' as type,
       'To test the automation system:' as step_1,
       '1. Copy a submission_id from SAMPLE_SUBMISSION above' as step_2,
       '2. Run: UPDATE task_submissions SET status = ''approved'' WHERE id = ''your-id-here'';' as step_3,
       '3. Check student_achievements and week_progress tables for new records' as step_4,
       '4. The triggers should automatically create achievement and progress records' as step_5;

-- =============================================================================
-- STEP 9: System Health Summary
-- =============================================================================

SELECT 'SYSTEM_HEALTH' as type,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_achievements') 
            THEN '✅ student_achievements table exists' 
            ELSE '❌ student_achievements table missing' END as achievements_table,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'week_progress') 
            THEN '✅ week_progress table exists' 
            ELSE '❌ week_progress table missing' END as progress_table,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_update_student_progress') 
            THEN '✅ Progress trigger active' 
            ELSE '❌ Progress trigger missing' END as progress_trigger,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_create_student_achievements') 
            THEN '✅ Achievement trigger active' 
            ELSE '❌ Achievement trigger missing' END as achievement_trigger;