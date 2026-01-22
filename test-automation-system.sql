-- Test the Automation System
-- This script tests the triggers and automation features we just deployed

-- =============================================================================
-- STEP 1: Check Current State
-- =============================================================================

-- Check if we have any existing data to work with
SELECT 'CURRENT_DATA' as check_type, 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'CURRENT_DATA', 'assignments', COUNT(*) FROM assignments
UNION ALL
SELECT 'CURRENT_DATA', 'task_submissions', COUNT(*) FROM task_submissions
UNION ALL
SELECT 'CURRENT_DATA', 'student_achievements', COUNT(*) FROM student_achievements
UNION ALL
SELECT 'CURRENT_DATA', 'week_progress', COUNT(*) FROM week_progress;

-- =============================================================================
-- STEP 2: Test Scenario Setup (if needed)
-- =============================================================================

-- Check if we have test data to work with
SELECT 'TEST_DATA_CHECK' as status,
       CASE WHEN EXISTS (SELECT 1 FROM task_submissions WHERE status != 'approved') 
            THEN 'Found submissions to test with' 
            ELSE 'No test submissions found' END as message;

-- Show existing submissions that we can test with
SELECT 'EXISTING_SUBMISSIONS' as type,
       id,
       student_id,
       assignment_id,
       status,
       created_at
FROM task_submissions 
WHERE status IN ('pending', 'in_review', 'needs_changes')
LIMIT 5;

-- =============================================================================
-- STEP 3: Manual Test (Run this if you have existing submissions)
-- =============================================================================

-- Test the triggers by approving the first available submission
-- UNCOMMENT AND MODIFY THE ID BELOW TO TEST:

/*
-- Replace 'your-submission-id-here' with an actual submission ID from above
UPDATE task_submissions 
SET status = 'approved',
    reviewed_at = NOW(),
    grade = '95'
WHERE id = 'your-submission-id-here'
AND status != 'approved';
*/

-- =============================================================================
-- STEP 4: Create Test Data (if no existing data)
-- =============================================================================

-- If you don't have test data, we can create some
-- UNCOMMENT THE SECTION BELOW TO CREATE TEST DATA:

/*
-- Create a test student profile (if needed)
INSERT INTO profiles (id, email, full_name, created_at)
VALUES (
    gen_random_uuid(),
    'test-student@example.com',
    'Test Student',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Get the test student ID
WITH test_student AS (
    SELECT id FROM profiles WHERE email = 'test-student@example.com'
),
test_assignment AS (
    SELECT id FROM assignments LIMIT 1
)
-- Create a test submission
INSERT INTO task_submissions (
    id,
    student_id,
    assignment_id,
    github_url,
    status,
    submitted_at,
    created_at
)
SELECT 
    gen_random_uuid(),
    ts.id,
    ta.id,
    'https://github.com/test/repo',
    'in_review',
    NOW(),
    NOW()
FROM test_student ts, test_assignment ta
WHERE NOT EXISTS (
    SELECT 1 FROM task_submissions 
    WHERE student_id = ts.id AND assignment_id = ta.id
);
*/

-- =============================================================================
-- STEP 5: Verification Queries
-- =============================================================================

-- Check achievements created by triggers
SELECT 'ACHIEVEMENTS_CHECK' as type,
       student_id,
       achievement_type,
       title,
       description,
       earned_at
FROM student_achievements
ORDER BY earned_at DESC;

-- Check week progress created by triggers
SELECT 'WEEK_PROGRESS_CHECK' as type,
       student_id,
       week_id,
       status,
       submitted_at,
       completed_at
FROM week_progress
ORDER BY updated_at DESC;

-- Check recent approved submissions (should trigger achievements)
SELECT 'RECENT_APPROVED' as type,
       student_id,
       assignment_id,
       status,
       grade,
       reviewed_at
FROM task_submissions
WHERE status = 'approved'
AND reviewed_at >= NOW() - INTERVAL '1 hour'
ORDER BY reviewed_at DESC;

-- =============================================================================
-- STEP 6: Trigger Function Status
-- =============================================================================

-- Verify trigger functions exist and are active
SELECT 'TRIGGER_STATUS' as type,
       trigger_name,
       event_object_table,
       action_timing,
       event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN (
    'trigger_update_student_progress',
    'trigger_create_student_achievements', 
    'trigger_update_week_progress_on_submission'
)
ORDER BY trigger_name;

-- =============================================================================
-- STEP 7: Test Instructions
-- =============================================================================

SELECT 'TEST_INSTRUCTIONS' as type,
       'To test the system manually:' as step_1,
       '1. Find a submission ID from EXISTING_SUBMISSIONS above' as step_2,
       '2. Uncomment and modify the UPDATE query in STEP 3' as step_3,
       '3. Run the UPDATE to approve a submission' as step_4,
       '4. Check ACHIEVEMENTS_CHECK and WEEK_PROGRESS_CHECK for new records' as step_5;

-- =============================================================================
-- STEP 8: Quick Test Query (Safe to run)
-- =============================================================================

-- This query simulates what would happen without actually changing data
SELECT 'SIMULATION' as type,
       'If we approved submission for student: ' || student_id as message,
       'Achievement would be created: ' || 
       CASE 
           WHEN (SELECT COUNT(*) FROM task_submissions ts2 WHERE ts2.student_id = ts.student_id AND ts2.status = 'approved') = 0 
           THEN 'First Submission Achievement'
           ELSE 'Milestone Achievement (if 5th or 10th)'
       END as achievement_prediction
FROM task_submissions ts
WHERE status != 'approved'
LIMIT 3;