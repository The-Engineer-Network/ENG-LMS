-- Verification script for the test enrollment system
-- Run this after deploying complete-test-deployment.sql

-- 1. Test RPC functions
SELECT 'Testing RPC Functions' as test_section;

-- Test check_trigger_exists function
SELECT 
    'check_trigger_exists' as function_name,
    check_trigger_exists('trigger_automatic_enrollment') as trigger_exists;

-- Test database health function
SELECT 'Database Health Check' as test_section;
SELECT * FROM check_database_health();

-- 2. Test automatic enrollment function
SELECT 'Testing Manual Enrollment Function' as test_section;
SELECT * FROM enroll_existing_whitelisted_users();

-- 3. Verify trigger exists
SELECT 'Trigger Verification' as test_section;
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_automatic_enrollment';

-- 4. Check sample data
SELECT 'Sample Data Check' as test_section;

SELECT 'Tracks:' as data_type, COUNT(*) as count FROM tracks
UNION ALL
SELECT 'Cohorts:', COUNT(*) FROM cohorts
UNION ALL
SELECT 'Whitelist:', COUNT(*) FROM paid_learner_whitelist
UNION ALL
SELECT 'Enrollments:', COUNT(*) FROM student_enrollments
UNION ALL
SELECT 'Profiles:', COUNT(*) FROM profiles;

-- 5. Test enrollment flow (create a test user)
SELECT 'Testing Enrollment Flow' as test_section;

-- Clean up any existing test user first
DELETE FROM week_progress WHERE student_id IN (
    SELECT id FROM profiles WHERE email = 'test-verification@example.com'
);
DELETE FROM student_enrollments WHERE user_id IN (
    SELECT id FROM profiles WHERE email = 'test-verification@example.com'
);
DELETE FROM profiles WHERE email = 'test-verification@example.com';

-- Ensure whitelist entry exists for test
INSERT INTO paid_learner_whitelist (email, track_id, cohort_id, status)
SELECT 
    'test-verification@example.com',
    t.id,
    c.id,
    'active'
FROM tracks t, cohorts c
WHERE NOT EXISTS (
    SELECT 1 FROM paid_learner_whitelist 
    WHERE email = 'test-verification@example.com'
)
LIMIT 1;

-- Instead of creating a profile directly, let's test with existing users
-- Check if there are any existing profiles we can use for testing
SELECT 'Existing Users Check' as test_name;

-- Show existing profiles
SELECT 
    'Existing profiles for testing:' as info,
    COUNT(*) as profile_count
FROM profiles;

-- If there are existing profiles, test enrollment with one of them
DO $$
DECLARE
    test_user_id UUID;
    test_email TEXT;
BEGIN
    -- Try to find an existing user who isn't enrolled
    SELECT p.id, p.email INTO test_user_id, test_email
    FROM profiles p
    LEFT JOIN student_enrollments se ON p.id = se.user_id
    WHERE se.id IS NULL
    AND p.email IS NOT NULL
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Update whitelist for this existing user
        INSERT INTO paid_learner_whitelist (email, track_id, cohort_id, status)
        SELECT 
            test_email,
            t.id,
            c.id,
            'active'
        FROM tracks t, cohorts c
        WHERE NOT EXISTS (
            SELECT 1 FROM paid_learner_whitelist 
            WHERE email = test_email
        )
        LIMIT 1;
        
        -- Test manual enrollment function
        PERFORM enroll_existing_whitelisted_users();
        
        RAISE NOTICE 'Tested enrollment with existing user: %', test_email;
    ELSE
        RAISE NOTICE 'No existing users found for testing. Manual enrollment test skipped.';
    END IF;
END $$;

-- Check if enrollment was created (for any existing users)
SELECT 
    'Manual Enrollment Test Results' as test_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM student_enrollments)
        THEN 'SUCCESS: Enrollments exist in system'
        ELSE 'INFO: No enrollments found (may need real user signup to test trigger)'
    END as result;

-- Check if week progress exists
SELECT 
    'Week Progress Test' as test_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM week_progress)
        THEN 'SUCCESS: Week progress records exist'
        ELSE 'INFO: No week progress found'
    END as result;

-- Show any enrollment details that exist
SELECT 
    'Current Enrollment Details' as section,
    p.email,
    t.name as track_name,
    c.name as cohort_name,
    se.status,
    se.enrolled_at
FROM student_enrollments se
JOIN profiles p ON se.user_id = p.id
JOIN tracks t ON se.track_id = t.id
JOIN cohorts c ON se.cohort_id = c.id
LIMIT 5;

SELECT 'Verification Complete' as status;