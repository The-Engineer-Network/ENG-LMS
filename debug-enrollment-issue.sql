-- Debug script to check why automatic enrollment isn't working

-- 1. Check if the trigger exists
SELECT 'Checking Trigger Status' as step;
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_automatic_enrollment';

-- 2. Check if the trigger function exists
SELECT 'Checking Trigger Function' as step;
SELECT 
    proname as function_name,
    prosrc as function_body
FROM pg_proc 
WHERE proname = 'trigger_automatic_enrollment';

-- 3. Check current profiles (users)
SELECT 'Current Profiles' as step;
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- 4. Check whitelist entries
SELECT 'Whitelist Entries' as step;
SELECT 
    w.id,
    w.email,
    w.status,
    t.name as track_name,
    c.name as cohort_name,
    w.added_date
FROM paid_learner_whitelist w
LEFT JOIN tracks t ON w.track_id = t.id
LEFT JOIN cohorts c ON w.cohort_id = c.id
ORDER BY w.added_date DESC;

-- 5. Check existing enrollments
SELECT 'Existing Enrollments' as step;
SELECT 
    se.id,
    p.email,
    p.full_name,
    t.name as track_name,
    c.name as cohort_name,
    se.status,
    se.enrolled_at
FROM student_enrollments se
JOIN profiles p ON se.user_id = p.id
LEFT JOIN tracks t ON se.track_id = t.id
LEFT JOIN cohorts c ON se.cohort_id = c.id
ORDER BY se.enrolled_at DESC;

-- 6. Check for profiles that should be enrolled but aren't
SELECT 'Profiles That Should Be Enrolled But Arent' as step;
SELECT 
    p.id,
    p.email,
    p.full_name,
    w.track_id,
    w.cohort_id,
    t.name as track_name,
    c.name as cohort_name
FROM profiles p
JOIN paid_learner_whitelist w ON p.email = w.email
LEFT JOIN tracks t ON w.track_id = t.id
LEFT JOIN cohorts c ON w.cohort_id = c.id
LEFT JOIN student_enrollments se ON p.id = se.user_id
WHERE w.status = 'active'
AND se.id IS NULL;

-- 7. Check if there are any weeks in the tracks
SELECT 'Weeks Available' as step;
SELECT 
    t.name as track_name,
    COUNT(w.id) as week_count
FROM tracks t
LEFT JOIN weeks w ON t.id = w.track_id
GROUP BY t.id, t.name;

-- 8. Test the trigger function manually (if there are unrolled users)
SELECT 'Testing Manual Enrollment Function' as step;
SELECT * FROM enroll_existing_whitelisted_users();
