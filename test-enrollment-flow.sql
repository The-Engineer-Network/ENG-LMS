-- Test Complete Enrollment Flow
-- This script tests the entire automatic enrollment system

-- =============================================================================
-- STEP 1: Setup Test Environment
-- =============================================================================

-- Clean up any existing test data
DELETE FROM week_progress WHERE student_id IN (
    SELECT id FROM profiles WHERE email LIKE '%test-enrollment%'
);
DELETE FROM student_enrollments WHERE user_id IN (
    SELECT id FROM profiles WHERE email LIKE '%test-enrollment%'
);
DELETE FROM profiles WHERE email LIKE '%test-enrollment%';
DELETE FROM paid_learner_whitelist WHERE email LIKE '%test-enrollment%';

-- Create test track and cohort if they don't exist
INSERT INTO tracks (id, name, description, created_at)
SELECT 
    gen_random_uuid(),
    'Enrollment Test Track',
    'Track for testing automatic enrollment',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM tracks WHERE name = 'Enrollment Test Track');

INSERT INTO cohorts (id, name, status, start_date, end_date, created_at)
SELECT 
    gen_random_uuid(),
    'Enrollment Test Cohort',
    'active',
    '2024-01-01'::date,
    '2024-12-31'::date,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM cohorts WHERE name = 'Enrollment Test Cohort');

-- Create test weeks
INSERT INTO weeks (id, track_id, week_number, order_index, title, description, created_at)
SELECT 
    gen_random_uuid(),
    t.id,
    generate_series,
    generate_series,
    'Test Week ' || generate_series,
    'Week ' || generate_series || ' for enrollment testing',
    NOW()
FROM tracks t, generate_series(1, 5)
WHERE t.name = 'Enrollment Test Track'
AND NOT EXISTS (
    SELECT 1 FROM weeks 
    WHERE track_id = t.id 
    AND week_number = generate_series
);

-- =============================================================================
-- STEP 2: Create Test Whitelist Entry
-- =============================================================================

INSERT INTO paid_learner_whitelist (id, email, track_id, cohort_id, status, created_at)
SELECT 
    gen_random_uuid(),
    'test-enrollment@example.com',
    t.id,
    c.id,
    'active',
    NOW()
FROM tracks t, cohorts c
WHERE t.name = 'Enrollment Test Track' 
AND c.name = 'Enrollment Test Cohort'
AND NOT EXISTS (
    SELECT 1 FROM paid_learner_whitelist 
    WHERE email = 'test-enrollment@example.com'
);

-- =============================================================================
-- STEP 3: Simulate Profile Creation (This would normally happen via auth.users)
-- =============================================================================

-- Create a test profile to simulate what happens when a user signs up
INSERT INTO profiles (id, email, full_name, role, created_at)
VALUES (
    gen_random_uuid(),
    'test-enrollment@example.com',
    'Test Enrollment User',
    'student',
    NOW()
);

-- =============================================================================
-- STEP 4: Check Results
-- =============================================================================

-- Wait a moment for trigger to process
SELECT pg_sleep(1);

-- Check if enrollment was created automatically
SELECT 'ENROLLMENT_CHECK' as test_type,
       COUNT(*) as enrollments_created
FROM student_enrollments se
JOIN profiles p ON p.id = se.user_id
WHERE p.email = 'test-enrollment@example.com';

-- Check if week progress was initialized
SELECT 'PROGRESS_CHECK' as test_type,
       COUNT(*) as progress_records_created
FROM week_progress wp
JOIN profiles p ON p.id = wp.student_id
WHERE p.email = 'test-enrollment@example.com';

-- Show detailed enrollment information
SELECT 'ENROLLMENT_DETAILS' as info,
       p.full_name,
       p.email,
       t.name as track_name,
       c.name as cohort_name,
       se.status as enrollment_status,
       se.progress_percentage,
       se.tasks_completed,
       se.total_tasks,
       se.enrolled_at
FROM student_enrollments se
JOIN profiles p ON p.id = se.user_id
JOIN tracks t ON t.id = se.track_id
JOIN cohorts c ON c.id = se.cohort_id
WHERE p.email = 'test-enrollment@example.com';

-- Show week progress details
SELECT 'PROGRESS_DETAILS' as info,
       w.week_number,
       w.title as week_title,
       wp.status as progress_status,
       wp.created_at
FROM week_progress wp
JOIN profiles p ON p.id = wp.student_id
JOIN weeks w ON w.id = wp.week_id
WHERE p.email = 'test-enrollment@example.com'
ORDER BY w.week_number;

-- =============================================================================
-- STEP 5: Test Edge Cases
-- =============================================================================

-- Test 1: User not in whitelist
INSERT INTO profiles (id, email, full_name, role, created_at)
VALUES (
    gen_random_uuid(),
    'not-whitelisted@example.com',
    'Not Whitelisted User',
    'student',
    NOW()
);

SELECT pg_sleep(1);

SELECT 'NON_WHITELISTED_CHECK' as test_type,
       COUNT(*) as enrollments_created,
       'Should be 0' as expected
FROM student_enrollments se
JOIN profiles p ON p.id = se.user_id
WHERE p.email = 'not-whitelisted@example.com';

-- Test 2: Admin user (should not trigger enrollment)
INSERT INTO profiles (id, email, full_name, role, created_at)
VALUES (
    gen_random_uuid(),
    'admin-test@example.com',
    'Admin Test User',
    'admin',
    NOW()
);

SELECT pg_sleep(1);

SELECT 'ADMIN_USER_CHECK' as test_type,
       COUNT(*) as enrollments_created,
       'Should be 0' as expected
FROM student_enrollments se
JOIN profiles p ON p.id = se.user_id
WHERE p.email = 'admin-test@example.com';

-- =============================================================================
-- STEP 6: Test Manual Enrollment Function
-- =============================================================================

-- Create another whitelisted user but don't trigger automatic enrollment
INSERT INTO paid_learner_whitelist (id, email, track_id, cohort_id, status, created_at)
SELECT 
    gen_random_uuid(),
    'manual-test@example.com',
    t.id,
    c.id,
    'active',
    NOW()
FROM tracks t, cohorts c
WHERE t.name = 'Enrollment Test Track' 
AND c.name = 'Enrollment Test Cohort';

-- Create profile without triggering automatic enrollment (simulate existing user)
INSERT INTO profiles (id, email, full_name, role, created_at)
VALUES (
    gen_random_uuid(),
    'manual-test@example.com',
    'Manual Test User',
    'student',
    NOW() - INTERVAL '1 day'  -- Created before whitelist entry
);

-- Test the manual enrollment function
SELECT 'MANUAL_ENROLLMENT_TEST' as test_type,
       user_id,
       email,
       track_name,
       cohort_name,
       enrollment_created
FROM enroll_existing_whitelisted_users()
WHERE email = 'manual-test@example.com';

-- =============================================================================
-- STEP 7: Final System Status
-- =============================================================================

SELECT 'FINAL_TEST_RESULTS' as summary,
       (SELECT COUNT(*) FROM student_enrollments se 
        JOIN profiles p ON p.id = se.user_id 
        WHERE p.email LIKE '%test%') as total_test_enrollments,
       (SELECT COUNT(*) FROM week_progress wp 
        JOIN profiles p ON p.id = wp.student_id 
        WHERE p.email LIKE '%test%') as total_test_progress_records,
       'Automatic enrollment system test completed' as status;

-- Show all test users and their enrollment status
SELECT 'TEST_USERS_SUMMARY' as info,
       p.email,
       p.role,
       CASE WHEN se.id IS NOT NULL THEN 'ENROLLED' ELSE 'NOT_ENROLLED' END as enrollment_status,
       COALESCE(t.name, 'N/A') as track_name,
       (SELECT COUNT(*) FROM week_progress WHERE student_id = p.id) as progress_records
FROM profiles p
LEFT JOIN student_enrollments se ON se.user_id = p.id
LEFT JOIN tracks t ON t.id = se.track_id
WHERE p.email LIKE '%test%'
ORDER BY p.email;

-- =============================================================================
-- STEP 8: Cleanup (Optional - comment out if you want to keep test data)
-- =============================================================================

/*
-- Uncomment to clean up test data
DELETE FROM week_progress WHERE student_id IN (
    SELECT id FROM profiles WHERE email LIKE '%test%'
);
DELETE FROM student_enrollments WHERE user_id IN (
    SELECT id FROM profiles WHERE email LIKE '%test%'
);
DELETE FROM profiles WHERE email LIKE '%test%';
DELETE FROM paid_learner_whitelist WHERE email LIKE '%test%';
*/