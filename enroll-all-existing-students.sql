-- Enroll ALL existing students who are in whitelist but not enrolled
-- This ensures no student is left behind

DO $$
DECLARE
    rec RECORD;
    enrollment_count INTEGER := 0;
    week_count INTEGER;
BEGIN
    RAISE NOTICE 'Starting enrollment process for existing students...';
    
    -- Find all students who should be enrolled but aren't
    FOR rec IN 
        SELECT 
            p.id as user_id,
            p.email,
            p.full_name,
            w.track_id,
            w.cohort_id,
            t.name as track_name,
            c.name as cohort_name
        FROM profiles p
        JOIN paid_learner_whitelist w ON p.email = w.email
        JOIN tracks t ON w.track_id = t.id
        JOIN cohorts c ON w.cohort_id = c.id
        LEFT JOIN student_enrollments se ON p.id = se.user_id AND w.track_id = se.track_id
        WHERE w.status = 'active'
        AND p.role = 'student'
        AND se.id IS NULL
    LOOP
        RAISE NOTICE 'Processing student: % (%)', rec.full_name, rec.email;
        
        -- Create enrollment
        INSERT INTO student_enrollments (
            user_id, track_id, cohort_id, status, progress_percentage,
            tasks_completed, total_tasks, enrolled_at
        ) VALUES (
            rec.user_id,
            rec.track_id,
            rec.cohort_id,
            'active',
            0,
            0,
            0,
            NOW()
        )
        ON CONFLICT (user_id, track_id) DO NOTHING;
        
        -- Create week progress records
        INSERT INTO week_progress (student_id, week_id, status)
        SELECT 
            rec.user_id,
            w.id,
            CASE WHEN w.week_number = 1 THEN 'pending' ELSE 'locked' END
        FROM weeks w
        WHERE w.track_id = rec.track_id
        ON CONFLICT (student_id, week_id) DO NOTHING;
        
        -- Count weeks created
        SELECT COUNT(*) INTO week_count
        FROM week_progress
        WHERE student_id = rec.user_id;
        
        enrollment_count := enrollment_count + 1;
        RAISE NOTICE '✓ Enrolled: % in % - % (% weeks initialized)', 
            rec.email, rec.track_name, rec.cohort_name, week_count;
    END LOOP;
    
    IF enrollment_count = 0 THEN
        RAISE NOTICE 'No students needed enrollment - all existing students are already enrolled!';
    ELSE
        RAISE NOTICE '========================================';
        RAISE NOTICE 'SUCCESS: Enrolled % students!', enrollment_count;
        RAISE NOTICE '========================================';
    END IF;
END $$;

-- Show summary of all enrollments
SELECT 'Enrollment Summary' as section;

SELECT 
    p.email,
    p.full_name,
    t.name as track,
    c.name as cohort,
    se.status,
    se.enrolled_at,
    COUNT(wp.id) as weeks_initialized
FROM student_enrollments se
JOIN profiles p ON se.user_id = p.id
JOIN tracks t ON se.track_id = t.id
JOIN cohorts c ON se.cohort_id = c.id
LEFT JOIN week_progress wp ON wp.student_id = p.id
GROUP BY p.email, p.full_name, t.name, c.name, se.status, se.enrolled_at
ORDER BY se.enrolled_at DESC;

-- Show any students still not enrolled
SELECT 'Students Still Not Enrolled (if any)' as section;

SELECT 
    p.email,
    p.full_name,
    p.role,
    CASE 
        WHEN w.id IS NULL THEN 'Not in whitelist'
        WHEN w.status != 'active' THEN 'Whitelist not active'
        ELSE 'Unknown issue'
    END as reason
FROM profiles p
LEFT JOIN paid_learner_whitelist w ON p.email = w.email AND w.status = 'active'
LEFT JOIN student_enrollments se ON p.id = se.user_id
WHERE p.role = 'student'
AND se.id IS NULL;

SELECT 'Process completed!' as status;