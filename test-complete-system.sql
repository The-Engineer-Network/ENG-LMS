-- Complete System Test - Check All Components
-- This will test the entire automatic enrollment system

-- =============================================================================
-- STEP 1: Check Basic Infrastructure
-- =============================================================================

SELECT '=== INFRASTRUCTURE CHECK ===' as section;

-- Check if all required tables exist
SELECT 'TABLES_CHECK' as test_type,
       EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tracks') as tracks_exists,
       EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cohorts') as cohorts_exists,
       EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'weeks') as weeks_exists,
       EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'lessons') as lessons_exists,
       EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'assignments') as assignments_exists,
       EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') as profiles_exists,
       EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_enrollments') as enrollments_exists,
       EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'week_progress') as progress_exists,
       EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'paid_learner_whitelist') as whitelist_exists;

-- Check content counts
SELECT 'CONTENT_COUNT' as test_type,
       (SELECT COUNT(*) FROM tracks) as tracks_count,
       (SELECT COUNT(*) FROM cohorts) as cohorts_count,
       (SELECT COUNT(*) FROM weeks) as weeks_count,
       (SELECT COUNT(*) FROM lessons) as lessons_count,
       (SELECT COUNT(*) FROM assignments) as assignments_count;

-- =============================================================================
-- STEP 2: Check Trigger Function
-- =============================================================================

SELECT '=== TRIGGER FUNCTION CHECK ===' as section;

-- Check if the automatic enrollment function exists
SELECT 'FUNCTION_CHECK' as test_type,
       EXISTS (
           SELECT 1 FROM pg_proc p
           JOIN pg_namespace n ON n.oid = p.pronamespace
           WHERE n.nspname = 'public' 
           AND p.proname = 'handle_automatic_enrollment'
       ) as function_exists;

-- Check if the trigger exists
SELECT 'TRIGGER_CHECK' as test_type,
       EXISTS (
           SELECT 1 FROM pg_trigger t
           JOIN pg_class c ON c.oid = t.tgrelid
           WHERE c.relname = 'profiles'
           AND t.tgname = 'trigger_automatic_enrollment'
       ) as trigger_exists;

-- =============================================================================
-- STEP 3: Check RLS Policies
-- =============================================================================

SELECT '=== RLS POLICIES CHECK ===' as section;

-- Check student_enrollments policies
SELECT 'ENROLLMENT_POLICIES' as test_type,
       COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'student_enrollments';

-- Check profiles policies
SELECT 'PROFILES_POLICIES' as test_type,
       COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'profiles';

-- Check week_progress policies
SELECT 'PROGRESS_POLICIES' as test_type,
       COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'week_progress';

-- =============================================================================
-- STEP 4: Test Data Setup
-- =============================================================================

SELECT '=== TEST DATA SETUP ===' as section;

-- Ensure we have a test track
INSERT INTO tracks (id, name, description, created_at)
SELECT 
    gen_random_uuid(),
    'Test Track',
    'Track for testing automatic enrollment',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM tracks WHERE name = 'Test Track');

-- Ensure we have a test cohort
INSERT INTO cohorts (id, name, status, start_date, end_date, created_at)
SELECT 
    gen_random_uuid(),
    'Test Cohort 2024',
    'active',
    '2024-01-01'::date,
    '2024-12-31'::date,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM cohorts WHERE name = 'Test Cohort 2024');

-- Create test weeks
INSERT INTO weeks (id, track_id, week_number, order_index, title, description, created_at)
SELECT 
    gen_random_uuid(),
    t.id,
    1,
    1,
    'Test Week 1',
    'First week for testing',
    NOW()
FROM tracks t
WHERE t.name = 'Test Track'
AND NOT EXISTS (SELECT 1 FROM weeks WHERE week_number = 1 AND track_id = t.id);

INSERT INTO weeks (id, track_id, week_number, order_index, title, description, created_at)
SELECT 
    gen_random_uuid(),
    t.id,
    2,
    2,
    'Test Week 2',
    'Second week for testing',
    NOW()
FROM tracks t
WHERE t.name = 'Test Track'
AND NOT EXISTS (SELECT 1 FROM weeks WHERE week_number = 2 AND track_id = t.id);

-- Create a test whitelist entry
INSERT INTO paid_learner_whitelist (id, email, track_id, cohort_id, status, created_at)
SELECT 
    gen_random_uuid(),
    'test@example.com',
    t.id,
    c.id,
    'active',
    NOW()
FROM tracks t, cohorts c
WHERE t.name = 'Test Track' 
AND c.name = 'Test Cohort 2024'
AND NOT EXISTS (
    SELECT 1 FROM paid_learner_whitelist 
    WHERE email = 'test@example.com' 
    AND track_id = t.id 
    AND cohort_id = c.id
);

-- =============================================================================
-- STEP 5: Show Current System State
-- =============================================================================

SELECT '=== CURRENT SYSTEM STATE ===' as section;

-- Show all tracks and cohorts
SELECT 'AVAILABLE_TRACKS_COHORTS' as info,
       t.name as track_name,
       c.name as cohort_name,
       c.status as cohort_status
FROM tracks t
CROSS JOIN cohorts c
ORDER BY t.name, c.name;

-- Show whitelist entries
SELECT 'WHITELIST_ENTRIES' as info,
       w.email,
       t.name as track_name,
       c.name as cohort_name,
       w.status
FROM paid_learner_whitelist w
JOIN tracks t ON t.id = w.track_id
JOIN cohorts c ON c.id = w.cohort_id
ORDER BY w.email;

-- Show existing enrollments
SELECT 'EXISTING_ENROLLMENTS' as info,
       p.email,
       p.full_name,
       t.name as track_name,
       c.name as cohort_name,
       se.status as enrollment_status
FROM student_enrollments se
JOIN profiles p ON p.id = se.user_id
JOIN tracks t ON t.id = se.track_id
JOIN cohorts c ON c.id = se.cohort_id
ORDER BY p.email;

-- =============================================================================
-- STEP 6: System Readiness Report
-- =============================================================================

SELECT '=== SYSTEM READINESS REPORT ===' as section;

SELECT 'SYSTEM_STATUS' as report_type,
       CASE 
           WHEN (SELECT COUNT(*) FROM tracks) > 0 
           AND (SELECT COUNT(*) FROM cohorts) > 0 
           AND (SELECT COUNT(*) FROM weeks) > 0
           AND EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_automatic_enrollment')
           AND EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_automatic_enrollment')
           THEN 'READY'
           ELSE 'NOT_READY'
       END as status,
       'Automatic enrollment system is configured and ready for testing' as message;

-- Show next steps
SELECT 'NEXT_STEPS' as info,
       'System is ready for testing' as step1,
       'Create a user account through the signup form' as step2,
       'Verify automatic enrollment occurs' as step3,
       'Check week progress initialization' as step4;