-- Test Automation System - Final Test

-- Step 1: Check current counts before test
SELECT 'BEFORE_TEST' as phase,
       (SELECT COUNT(*) FROM student_achievements) as achievements_count,
       (SELECT COUNT(*) FROM week_progress) as progress_count,
       (SELECT COUNT(*) FROM task_submissions WHERE status = 'approved') as approved_count;

-- Step 2: Find a submission to test with
SELECT 'TEST_SUBMISSION' as info,
       id,
       student_id,
       status,
       'Use this ID in the UPDATE below' as instruction
FROM task_submissions 
WHERE status IN ('pending', 'in_review', 'needs_changes')
LIMIT 1;

-- Step 3: Manual test (REPLACE THE ID BELOW)
-- UPDATE task_submissions SET status = 'approved' WHERE id = 'REPLACE_WITH_ACTUAL_ID';

-- Step 4: Check results after test (run after the UPDATE)
SELECT 'AFTER_TEST' as phase,
       (SELECT COUNT(*) FROM student_achievements) as achievements_count,
       (SELECT COUNT(*) FROM week_progress) as progress_count,
       (SELECT COUNT(*) FROM task_submissions WHERE status = 'approved') as approved_count;

-- Step 5: Show new achievements (if any)
SELECT 'NEW_ACHIEVEMENTS' as result,
       student_id,
       achievement_type,
       title,
       earned_at
FROM student_achievements
ORDER BY earned_at DESC
LIMIT 3;

-- Step 6: Show new progress (if any)
SELECT 'NEW_PROGRESS' as result,
       student_id,
       week_id,
       status,
       updated_at
FROM week_progress
ORDER BY updated_at DESC
LIMIT 3;

-- Step 7: Success indicator
SELECT 'SUCCESS_CHECK' as final_result,
       CASE WHEN EXISTS (SELECT 1 FROM student_achievements) 
            THEN '✅ Achievements system working' 
            ELSE '⚠️ No achievements yet - try approving a submission' END as achievements_status,
       CASE WHEN EXISTS (SELECT 1 FROM week_progress) 
            THEN '✅ Progress tracking working' 
            ELSE '⚠️ No progress yet - try approving a submission' END as progress_status;