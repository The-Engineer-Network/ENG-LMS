-- Deploy enrollment system (run after drop-and-recreate-functions.sql)
-- This script sets up the automatic enrollment system

-- 1. Ensure automatic enrollment function exists
CREATE OR REPLACE FUNCTION enroll_existing_whitelisted_users()
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    track_name TEXT,
    cohort_name TEXT,
    enrollment_status TEXT
) AS $$
DECLARE
    rec RECORD;
    enrollment_id UUID;
BEGIN
    -- Find whitelisted users who aren't enrolled yet
    FOR rec IN 
        SELECT 
            p.id as user_id,
            p.email,
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
        AND se.id IS NULL
    LOOP
        -- Create enrollment
        INSERT INTO student_enrollments (
            user_id, track_id, cohort_id, status, progress_percentage, 
            tasks_completed, total_tasks, enrolled_at
        ) VALUES (
            rec.user_id, rec.track_id, rec.cohort_id, 'active', 0, 
            0, 0, NOW()
        ) RETURNING id INTO enrollment_id;

        -- Create week progress records
        INSERT INTO week_progress (student_id, week_id, status)
        SELECT 
            rec.user_id,
            w.id,
            CASE WHEN w.week_number = 1 THEN 'pending' ELSE 'locked' END
        FROM weeks w
        WHERE w.track_id = rec.track_id;

        -- Return result
        user_id := rec.user_id;
        email := rec.email;
        track_name := rec.track_name;
        cohort_name := rec.cohort_name;
        enrollment_status := 'enrolled';
        
        RETURN NEXT;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure automatic enrollment trigger exists
CREATE OR REPLACE FUNCTION trigger_automatic_enrollment()
RETURNS TRIGGER AS $$
DECLARE
    whitelist_entry RECORD;
BEGIN
    -- Check if user is in whitelist
    SELECT w.*, t.name as track_name, c.name as cohort_name
    INTO whitelist_entry
    FROM paid_learner_whitelist w
    JOIN tracks t ON w.track_id = t.id
    JOIN cohorts c ON w.cohort_id = c.id
    WHERE w.email = NEW.email 
    AND w.status = 'active';
    
    IF FOUND THEN
        -- Create enrollment
        INSERT INTO student_enrollments (
            user_id, track_id, cohort_id, status, progress_percentage, 
            tasks_completed, total_tasks, enrolled_at
        ) VALUES (
            NEW.id, whitelist_entry.track_id, whitelist_entry.cohort_id, 'active', 0, 
            0, 0, NOW()
        );

        -- Create week progress records
        INSERT INTO week_progress (student_id, week_id, status)
        SELECT 
            NEW.id,
            w.id,
            CASE WHEN w.week_number = 1 THEN 'pending' ELSE 'locked' END
        FROM weeks w
        WHERE w.track_id = whitelist_entry.track_id;
        
        RAISE NOTICE 'User % automatically enrolled in track % cohort %', 
            NEW.email, whitelist_entry.track_name, whitelist_entry.cohort_name;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_automatic_enrollment ON profiles;

-- Create the trigger
CREATE TRIGGER trigger_automatic_enrollment
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_automatic_enrollment();

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION enroll_existing_whitelisted_users() TO authenticated;

-- 4. Ensure sample data exists for testing
DO $$
DECLARE
    track_count INTEGER;
    cohort_count INTEGER;
    whitelist_count INTEGER;
BEGIN
    -- Check if we have basic data
    SELECT COUNT(*) INTO track_count FROM tracks;
    SELECT COUNT(*) INTO cohort_count FROM cohorts;
    SELECT COUNT(*) INTO whitelist_count FROM paid_learner_whitelist;
    
    -- Create sample track if none exists
    IF track_count = 0 THEN
        INSERT INTO tracks (id, name, description) VALUES 
        (gen_random_uuid(), 'Full Stack Development', 'Complete web development bootcamp');
        RAISE NOTICE 'Created sample track';
    END IF;
    
    -- Create sample cohort if none exists
    IF cohort_count = 0 THEN
        INSERT INTO cohorts (id, name, start_date, end_date, status) VALUES 
        (gen_random_uuid(), 'Cohort 2024-01', '2024-01-01', '2024-06-30', 'Active');
        RAISE NOTICE 'Created sample cohort';
    END IF;
    
    -- Create sample whitelist entry if none exists
    IF whitelist_count = 0 THEN
        INSERT INTO paid_learner_whitelist (email, track_id, cohort_id, status)
        SELECT 
            'test@example.com',
            t.id,
            c.id,
            'active'
        FROM tracks t, cohorts c
        LIMIT 1;
        RAISE NOTICE 'Created sample whitelist entry';
    END IF;
END $$;

-- 5. Final verification
SELECT 'Enrollment system deployed successfully' as status;

-- Check trigger exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_automatic_enrollment')
        THEN 'Automatic enrollment trigger: EXISTS'
        ELSE 'Automatic enrollment trigger: MISSING'
    END as trigger_status;

-- Check functions exist
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'enroll_existing_whitelisted_users')
        THEN 'Enrollment functions: EXISTS'
        ELSE 'Enrollment functions: MISSING'
    END as function_status;

-- Check sample data
SELECT 
    (SELECT COUNT(*) FROM tracks) as tracks_count,
    (SELECT COUNT(*) FROM cohorts) as cohorts_count,
    (SELECT COUNT(*) FROM paid_learner_whitelist) as whitelist_count;