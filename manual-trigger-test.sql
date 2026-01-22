-- Manual Trigger Test
-- Run this AFTER running test-automation-safe.sql to see your table structure

-- =============================================================================
-- STEP 1: Find a submission to test with
-- =============================================================================

-- Show available submissions for testing
SELECT 'AVAILABLE_FOR_TEST' as info,
       id,
       student_id,
       assignment_id,
       status,
       'Copy this ID for testing' as instruction
FROM task_submissions 
WHERE status IN ('pending', 'in_review', 'needs_changes')
LIMIT 3;

-- =============================================================================
-- STEP 2: Manual Test (Replace the ID below)
-- =============================================================================

-- INSTRUCTIONS:
-- 1. Copy a submission ID from the query above
-- 2. Replace 'YOUR_SUBMISSION_ID_HERE' with the actual ID
-- 3. Uncomment and run the UPDATE statement below

/*
UPDATE task_submissions 
SET status = 'approved'
WHERE id = 'YOUR_SUBMISSION_ID_HERE';
*/

-- =============================================================================
-- STEP 3: Check Results After Running the Update
-- =============================================================================

-- Check if achievements were created (run after the UPDATE)
SELECT 'NEW_ACHIEVEMENTS' as result_type,
       student_id,
       achievement_type,
       title,
       description,
       earned_at
FROM student_achievements
WHERE earned_at >= NOW() - INTERVAL '5 minutes'
ORDER BY earned_at DESC;

-- Check if week progress was updated (run after the UPDATE)
SELECT 'NEW_PROGRESS' as result_type,
       student_id,
       week_id,
       status,
       completed_at,
       updated_at
FROM week_progress
WHERE updated_at >= NOW() - INTERVAL '5 minutes'
ORDER BY updated_at DESC;

-- Check the approved submission
SELECT 'APPROVED_SUBMISSION' as result_type,
       id,
       student_id,
       status,
       'This should show approved status' as verification
FROM task_submissions
WHERE status = 'approved'
AND id IN (
    -- Add your test submission ID here if you want to verify
    SELECT id FROM task_submissions WHERE status = 'approved' ORDER BY id DESC LIMIT 1
);

-- =============================================================================
-- STEP 4: Verification Summary
-- =============================================================================

SELECT 'TEST_SUMMARY' as summary,
       'If triggers worked correctly, you should see:' as expectation_1,
       '1. New record in student_achievements (First Submission achievement)' as expectation_2,
       '2. New record in week_progress (status = approved)' as expectation_3,
       '3. The submission status changed to approved' as expectation_4;

-- =============================================================================
-- STEP 5: Create Test Data (if no submissions exist)
-- =============================================================================

-- If you don't have any submissions to test with, uncomment this section:

/*
-- Create test data for trigger testing
WITH test_student AS (
    SELECT id FROM profiles LIMIT 1
),
test_assignment AS (
    SELECT id FROM assignments LIMIT 1
)
INSERT INTO task_submissions (
    id,
    student_id,
    assignment_id,
    github_url,
    status,
    submitted_at
)
SELECT 
    gen_random_uuid(),
    ts.id,
    ta.id,
    'https://github.com/test/repo',
    'in_review',
    NOW()
FROM test_student ts, test_assignment ta
WHERE EXISTS (SELECT 1 FROM test_student) 
AND EXISTS (SELECT 1 FROM test_assignment)
RETURNING id, student_id, 'Test submission created - use this ID above' as instruction;
*/