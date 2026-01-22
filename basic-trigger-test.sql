-- Basic Trigger Test - Works with any table structure

-- =============================================================================
-- STEP 1: Find a submission to test with
-- =============================================================================

SELECT 'FIND_TEST_SUBMISSION' as step,
       id as submission_id,
       student_id,
       status,
       'Copy this ID for manual test' as instruction
FROM task_submissions 
WHERE status IN ('pending', 'in_review', 'needs_changes')
LIMIT 1;

-- =============================================================================
-- STEP 2: Manual Test Instructions
-- =============================================================================

SELECT 'MANUAL_TEST' as step,
       'Replace YOUR_ID_HERE with a submission ID from above' as instruction_1,
       'Then uncomment and run the UPDATE below' as instruction_2;

-- MANUAL TEST: Uncomment the line below and replace YOUR_ID_HERE with actual ID
-- UPDATE task_submissions SET status = 'approved' WHERE id = 'YOUR_ID_HERE';

-- =============================================================================
-- STEP 3: Check results (run AFTER the manual update)
-- =============================================================================

-- Check if student_achievements table has new records
SELECT 'ACHIEVEMENTS_RESULT' as result,
       COUNT(*) as total_achievements,
       'Check if this number increased after approval' as note
FROM student_achievements;

-- Show recent achievements (if any)
SELECT 'RECENT_ACHIEVEMENTS' as result,
       student_id,
       achievement_type,
       title
FROM student_achievements
ORDER BY earned_at DESC
LIMIT 3;

-- Check if week_progress table has new records  
SELECT 'PROGRESS_RESULT' as result,
       COUNT(*) as total_progress_records,
       'Check if this number increased after approval' as note
FROM week_progress;

-- Show recent progress (if any)
SELECT 'RECENT_PROGRESS' as result,
       student_id,
       week_id,
       status
FROM week_progress
ORDER BY updated_at DESC
LIMIT 3;

-- =============================================================================
-- STEP 4: Verify the submission was updated
-- =============================================================================

SELECT 'SUBMISSION_STATUS' as result,
       id,
       student_id,
       status,
       'This should show approved if test worked' as verification
FROM task_submissions
WHERE status = 'approved'
ORDER BY id DESC
LIMIT 3;

-- =============================================================================
-- STEP 5: Simple success check
-- =============================================================================

SELECT 'SUCCESS_CHECK' as final_result,
       CASE 
           WHEN EXISTS (SELECT 1 FROM student_achievements) 
           THEN '✅ Achievements table has data'
           ELSE '⚠️ No achievements created yet'
       END as achievements_status,
       CASE 
           WHEN EXISTS (SELECT 1 FROM week_progress) 
           THEN '✅ Progress table has data'
           ELSE '⚠️ No progress records yet'
       END as progress_status;