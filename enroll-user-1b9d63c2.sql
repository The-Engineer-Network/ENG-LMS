-- Manually enroll user 1b9d63c2-ef22-4264-852e-37ffc258cdf6

-- 1. Check if user exists
SELECT 'User Check:' as step;
SELECT id, email, full_name, role FROM profiles 
WHERE id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6';

-- 2. Check whitelist
SELECT 'Whitelist Check:' as step;
SELECT 
    w.email,
    t.name as track,
    c.name as cohort,
    w.status
FROM paid_learner_whitelist w
JOIN tracks t ON w.track_id = t.id
JOIN cohorts c ON w.cohort_id = c.id
WHERE w.email IN (
    SELECT email FROM profiles WHERE id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6'
);

-- 3. Check current enrollment
SELECT 'Current Enrollment:' as step;
SELECT * FROM student_enrollments 
WHERE user_id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6';

-- 4. Create enrollment if missing
DO $$
DECLARE
    user_email TEXT;
    user_name TEXT;
    whitelist_rec RECORD;
BEGIN
    -- Get user info
    SELECT email, full_name INTO user_email, user_name
    FROM profiles
    WHERE id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6';
    
    IF user_email IS NULL THEN
        RAISE NOTICE 'User not found!';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found user: % (%)', user_name, user_email;
    
    -- Get whitelist entry
    SELECT w.track_id, w.cohort_id, t.name as track_name, c.name as cohort_name
    INTO whitelist_rec
    FROM paid_learner_whitelist w
    JOIN tracks t ON w.track_id = t.id
    JOIN cohorts c ON w.cohort_id = c.id
    WHERE w.email = user_email
    AND w.status = 'active';
    
    IF NOT FOUND THEN
        RAISE NOTICE 'User not in whitelist!';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found whitelist: Track %, Cohort %', whitelist_rec.track_name, whitelist_rec.cohort_name;
    
    -- Delete any existing enrollment first
    DELETE FROM week_progress WHERE student_id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6';
    DELETE FROM student_enrollments WHERE user_id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6';
    
    -- Create fresh enrollment
    INSERT INTO student_enrollments (
        user_id, track_id, cohort_id, status, progress_percentage,
        tasks_completed, total_tasks, enrolled_at
    ) VALUES (
        '1b9d63c2-ef22-4264-852e-37ffc258cdf6',
        whitelist_rec.track_id,
        whitelist_rec.cohort_id,
        'active',
        0,
        0,
        0,
        NOW()
    );
    
    RAISE NOTICE 'Created enrollment';
    
    -- Create week progress
    INSERT INTO week_progress (student_id, week_id, status)
    SELECT 
        '1b9d63c2-ef22-4264-852e-37ffc258cdf6',
        w.id,
        CASE WHEN w.week_number = 1 THEN 'pending' ELSE 'locked' END
    FROM weeks w
    WHERE w.track_id = whitelist_rec.track_id;
    
    RAISE NOTICE 'Created week progress';
END $$;

-- 5. Verify
SELECT 'Final Verification:' as step;

SELECT 
    'Enrollment created!' as message,
    se.id,
    p.email,
    t.name as track,
    c.name as cohort,
    se.status,
    COUNT(wp.id) as weeks
FROM student_enrollments se
JOIN profiles p ON se.user_id = p.id
JOIN tracks t ON se.track_id = t.id
JOIN cohorts c ON se.cohort_id = c.id
LEFT JOIN week_progress wp ON wp.student_id = se.user_id
WHERE se.user_id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6'
GROUP BY se.id, p.email, t.name, c.name, se.status;

SELECT 'User should now be able to see their dashboard!' as status;