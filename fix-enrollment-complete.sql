-- Complete fix for automatic enrollment system
-- Run this script to ensure everything works properly

-- 1. Ensure the automatic enrollment trigger function exists and is correct
CREATE OR REPLACE FUNCTION trigger_automatic_enrollment()
RETURNS TRIGGER AS $$
DECLARE
    whitelist_entry RECORD;
BEGIN
    RAISE NOTICE 'Trigger fired for user: %', NEW.email;
    
    -- Check if user is in whitelist
    SELECT w.*, t.name as track_name, c.name as cohort_name
    INTO whitelist_entry
    FROM paid_learner_whitelist w
    JOIN tracks t ON w.track_id = t.id
    JOIN cohorts c ON w.cohort_id = c.id
    WHERE w.email = NEW.email 
    AND w.status = 'active';
    
    IF FOUND THEN
        RAISE NOTICE 'Whitelist entry found for %, enrolling in track % cohort %', 
            NEW.email, whitelist_entry.track_name, whitelist_entry.cohort_name;
            
        -- Create enrollment
        INSERT INTO student_enrollments (
            user_id, track_id, cohort_id, status, progress_percentage, 
            tasks_completed, total_tasks, enrolled_at
        ) VALUES (
            NEW.id, whitelist_entry.track_id, whitelist_entry.cohort_id, 'active', 0, 
            0, 0, NOW()
        )
        ON CONFLICT (user_id, track_id) DO NOTHING;

        -- Create week progress records
        INSERT INTO week_progress (student_id, week_id, status)
        SELECT 
            NEW.id,
            w.id,
            CASE WHEN w.week_number = 1 THEN 'pending' ELSE 'locked' END
        FROM weeks w
        WHERE w.track_id = whitelist_entry.track_id
        ON CONFLICT (student_id, week_id) DO NOTHING;
        
        RAISE NOTICE 'User % successfully enrolled', NEW.email;
    ELSE
        RAISE NOTICE 'No whitelist entry found for %', NEW.email;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Recreate the trigger on profiles table
DROP TRIGGER IF EXISTS trigger_automatic_enrollment ON profiles;

CREATE TRIGGER trigger_automatic_enrollment
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_automatic_enrollment();

-- 3. Create auth.users trigger to auto-create profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  RAISE NOTICE 'Creating profile for new auth user: %', NEW.email;
  
  -- Create profile for new user
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Profile created for: %', NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate auth trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 4. Enroll any existing users who should be enrolled but aren't
DO $$
DECLARE
    rec RECORD;
    enrollment_count INTEGER := 0;
BEGIN
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
        
        enrollment_count := enrollment_count + 1;
        RAISE NOTICE 'Enrolled existing user: % in % - %', rec.email, rec.track_name, rec.cohort_name;
    END LOOP;
    
    RAISE NOTICE 'Enrolled % existing users', enrollment_count;
END $$;

-- 5. Verification
SELECT 'System Status Check' as section;

-- Check triggers
SELECT 
    'Triggers Status' as check_type,
    COUNT(*) as trigger_count
FROM information_schema.triggers 
WHERE trigger_name IN ('trigger_automatic_enrollment', 'on_auth_user_created');

-- Check enrollments
SELECT 
    'Current Enrollments' as check_type,
    COUNT(*) as enrollment_count
FROM student_enrollments;

-- Check profiles without enrollments
SELECT 
    'Profiles Without Enrollment' as check_type,
    COUNT(*) as count
FROM profiles p
LEFT JOIN student_enrollments se ON p.id = se.user_id
WHERE se.id IS NULL
AND p.role = 'student';

SELECT 'Fix completed successfully!' as status;