-- Check specific student enrollment status
-- Replace 'student@email.com' with the actual student email

-- 1. Check if student profile exists
SELECT 'Student Profile Check' as step;
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM profiles
WHERE email = 'student@email.com'; -- REPLACE WITH ACTUAL EMAIL

-- 2. Check if student is in whitelist
SELECT 'Whitelist Check' as step;
SELECT 
    w.id,
    w.email,
    w.status,
    t.name as track_name,
    c.name as cohort_name
FROM paid_learner_whitelist w
LEFT JOIN tracks t ON w.track_id = t.id
LEFT JOIN cohorts c ON w.cohort_id = c.id
WHERE w.email = 'student@email.com'; -- REPLACE WITH ACTUAL EMAIL

-- 3. Check if student has enrollment
SELECT 'Enrollment Check' as step;
SELECT 
    se.id,
    se.user_id,
    p.email,
    t.name as track_name,
    c.name as cohort_name,
    se.status,
    se.enrolled_at
FROM student_enrollments se
JOIN profiles p ON se.user_id = p.id
LEFT JOIN tracks t ON se.track_id = t.id
LEFT JOIN cohorts c ON se.cohort_id = c.id
WHERE p.email = 'student@email.com'; -- REPLACE WITH ACTUAL EMAIL

-- 4. Check week progress
SELECT 'Week Progress Check' as step;
SELECT 
    wp.id,
    w.week_number,
    w.title,
    wp.status,
    wp.submitted_at
FROM week_progress wp
JOIN weeks w ON wp.week_id = w.id
JOIN profiles p ON wp.student_id = p.id
WHERE p.email = 'student@email.com' -- REPLACE WITH ACTUAL EMAIL
ORDER BY w.week_number;

-- 5. If no enrollment found, manually enroll this specific student
DO $$
DECLARE
    student_profile RECORD;
    whitelist_entry RECORD;
BEGIN
    -- Get student profile
    SELECT * INTO student_profile
    FROM profiles
    WHERE email = 'student@email.com'; -- REPLACE WITH ACTUAL EMAIL
    
    IF NOT FOUND THEN
        RAISE NOTICE 'Student profile not found for email: student@email.com';
        RETURN;
    END IF;
    
    -- Get whitelist entry
    SELECT w.*, t.name as track_name, c.name as cohort_name
    INTO whitelist_entry
    FROM paid_learner_whitelist w
    JOIN tracks t ON w.track_id = t.id
    JOIN cohorts c ON w.cohort_id = c.id
    WHERE w.email = 'student@email.com' -- REPLACE WITH ACTUAL EMAIL
    AND w.status = 'active';
    
    IF NOT FOUND THEN
        RAISE NOTICE 'No active whitelist entry found for: student@email.com';
        RETURN;
    END IF;
    
    -- Check if already enrolled
    IF EXISTS (
        SELECT 1 FROM student_enrollments 
        WHERE user_id = student_profile.id 
        AND track_id = whitelist_entry.track_id
    ) THEN
        RAISE NOTICE 'Student already enrolled';
        RETURN;
    END IF;
    
    -- Create enrollment
    INSERT INTO student_enrollments (
        user_id, track_id, cohort_id, status, progress_percentage,
        tasks_completed, total_tasks, enrolled_at
    ) VALUES (
        student_profile.id,
        whitelist_entry.track_id,
        whitelist_entry.cohort_id,
        'active',
        0,
        0,
        0,
        NOW()
    );
    
    -- Create week progress
    INSERT INTO week_progress (student_id, week_id, status)
    SELECT 
        student_profile.id,
        w.id,
        CASE WHEN w.week_number = 1 THEN 'pending' ELSE 'locked' END
    FROM weeks w
    WHERE w.track_id = whitelist_entry.track_id
    ON CONFLICT (student_id, week_id) DO NOTHING;
    
    RAISE NOTICE 'Successfully enrolled student: % in % - %', 
        student_profile.email, whitelist_entry.track_name, whitelist_entry.cohort_name;
END $$;

-- 6. Final verification
SELECT 'Final Verification' as step;
SELECT 
    'Student is now enrolled!' as message,
    p.email,
    t.name as track,
    c.name as cohort,
    se.status,
    COUNT(wp.id) as weeks_initialized
FROM student_enrollments se
JOIN profiles p ON se.user_id = p.id
JOIN tracks t ON se.track_id = t.id
JOIN cohorts c ON se.cohort_id = c.id
LEFT JOIN week_progress wp ON wp.student_id = p.id
WHERE p.email = 'student@email.com' -- REPLACE WITH ACTUAL EMAIL
GROUP BY p.email, t.name, c.name, se.status;