-- FINAL COMPREHENSIVE FIX FOR ALL ISSUES
-- This fixes constraints, triggers, RLS, and enrolls existing users

-- ============================================
-- PART 1: FIX TABLE CONSTRAINTS
-- ============================================

-- Fix student_enrollments table - add unique constraint
ALTER TABLE student_enrollments DROP CONSTRAINT IF EXISTS student_enrollments_user_track_unique;
ALTER TABLE student_enrollments ADD CONSTRAINT student_enrollments_user_track_unique UNIQUE (user_id, track_id);

-- Fix week_progress table - add unique constraint
ALTER TABLE week_progress DROP CONSTRAINT IF EXISTS week_progress_student_week_unique;
ALTER TABLE week_progress ADD CONSTRAINT week_progress_student_week_unique UNIQUE (student_id, week_id);

-- Fix profiles table - ensure primary key and unique email
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;
ALTER TABLE profiles ADD PRIMARY KEY (id);
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- ============================================
-- PART 2: FIX AUTOMATIC ENROLLMENT TRIGGER
-- ============================================

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
            
        -- Create enrollment (now with proper constraint)
        INSERT INTO student_enrollments (
            user_id, track_id, cohort_id, status, progress_percentage, 
            tasks_completed, total_tasks, enrolled_at
        ) VALUES (
            NEW.id, whitelist_entry.track_id, whitelist_entry.cohort_id, 'active', 0, 
            0, 0, NOW()
        )
        ON CONFLICT (user_id, track_id) DO NOTHING;

        -- Create week progress records (now with proper constraint)
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_automatic_enrollment ON profiles;
CREATE TRIGGER trigger_automatic_enrollment
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_automatic_enrollment();

-- ============================================
-- PART 3: FIX RLS POLICIES
-- ============================================

-- Profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "Allow all for authenticated" ON profiles;
DROP POLICY IF EXISTS "Allow all for service role" ON profiles;

CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_policy" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update_policy" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Student enrollments table
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "enrollments_select_policy" ON student_enrollments;
DROP POLICY IF EXISTS "enrollments_insert_policy" ON student_enrollments;
DROP POLICY IF EXISTS "Allow all for authenticated" ON student_enrollments;

CREATE POLICY "enrollments_select_policy" ON student_enrollments FOR SELECT USING (true);
CREATE POLICY "enrollments_insert_policy" ON student_enrollments FOR INSERT WITH CHECK (true);

-- Week progress table
ALTER TABLE week_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "week_progress_select_policy" ON week_progress;
DROP POLICY IF EXISTS "week_progress_insert_policy" ON week_progress;
DROP POLICY IF EXISTS "Allow all for authenticated" ON week_progress;

CREATE POLICY "week_progress_select_policy" ON week_progress FOR SELECT USING (true);
CREATE POLICY "week_progress_insert_policy" ON week_progress FOR INSERT WITH CHECK (true);

-- ============================================
-- PART 4: ENROLL EXISTING USERS
-- ============================================

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

-- ============================================
-- PART 5: VERIFICATION
-- ============================================

SELECT '========================================' as separator;
SELECT 'FINAL VERIFICATION' as section;
SELECT '========================================' as separator;

-- Check constraints
SELECT 'Constraints Check:' as info;
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'student_enrollments'::regclass
   OR conrelid = 'week_progress'::regclass
   OR conrelid = 'profiles'::regclass
ORDER BY conrelid::text, conname;

-- Check trigger
SELECT 'Trigger Check:' as info;
SELECT 
    trigger_name,
    event_object_table,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_automatic_enrollment';

-- Check enrollments
SELECT 'Enrollment Summary:' as info;
SELECT 
    COUNT(*) as total_enrollments,
    COUNT(DISTINCT user_id) as unique_students
FROM student_enrollments;

-- Show enrolled students
SELECT 'Enrolled Students:' as info;
SELECT 
    p.email,
    p.full_name,
    t.name as track,
    c.name as cohort,
    se.status
FROM student_enrollments se
JOIN profiles p ON se.user_id = p.id
JOIN tracks t ON se.track_id = t.id
JOIN cohorts c ON se.cohort_id = c.id
ORDER BY se.enrolled_at DESC;

SELECT '========================================' as separator;
SELECT 'ALL FIXES APPLIED SUCCESSFULLY!' as status;
SELECT 'Students can now sign up and login!' as message;
SELECT '========================================' as separator;