-- FINAL FIX WITH DUPLICATE CLEANUP
-- This removes duplicates first, then applies all fixes

-- ============================================
-- PART 1: CLEAN UP DUPLICATES
-- ============================================

-- Remove duplicate enrollments (keep the first one by created_at or id)
DELETE FROM student_enrollments a
USING student_enrollments b
WHERE a.id > b.id
AND a.user_id = b.user_id
AND a.track_id = b.track_id;

-- Remove duplicate week progress (keep the first one)
DELETE FROM week_progress a
USING week_progress b
WHERE a.id > b.id
AND a.student_id = b.student_id
AND a.week_id = b.week_id;

-- Remove duplicate profiles by email (keep the first one)
DELETE FROM profiles a
USING profiles b
WHERE a.id > b.id
AND a.email = b.email
AND a.email IS NOT NULL;

-- ============================================
-- PART 2: ADD UNIQUE CONSTRAINTS
-- ============================================

-- Fix student_enrollments table
ALTER TABLE student_enrollments DROP CONSTRAINT IF EXISTS student_enrollments_user_track_unique;
ALTER TABLE student_enrollments ADD CONSTRAINT student_enrollments_user_track_unique UNIQUE (user_id, track_id);

-- Fix week_progress table
ALTER TABLE week_progress DROP CONSTRAINT IF EXISTS week_progress_student_week_unique;
ALTER TABLE week_progress ADD CONSTRAINT week_progress_student_week_unique UNIQUE (student_id, week_id);

-- Fix profiles table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;
ALTER TABLE profiles ADD PRIMARY KEY (id);
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- ============================================
-- PART 3: FIX AUTOMATIC ENROLLMENT TRIGGER
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_automatic_enrollment ON profiles;
CREATE TRIGGER trigger_automatic_enrollment
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_automatic_enrollment();

-- ============================================
-- PART 4: FIX RLS POLICIES
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
-- PART 5: ENROLL MISSING USERS
-- ============================================

DO $$
DECLARE
    rec RECORD;
    enrollment_count INTEGER := 0;
BEGIN
    -- Find students who should be enrolled but aren't
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
        AND p.role = 'student'
        AND se.id IS NULL
    LOOP
        -- Create enrollment
        INSERT INTO student_enrollments (
            user_id, track_id, cohort_id, status, progress_percentage,
            tasks_completed, total_tasks, enrolled_at
        ) VALUES (
            rec.user_id, rec.track_id, rec.cohort_id, 'active', 0, 0, 0, NOW()
        )
        ON CONFLICT (user_id, track_id) DO NOTHING;
        
        -- Create week progress
        INSERT INTO week_progress (student_id, week_id, status)
        SELECT 
            rec.user_id, w.id,
            CASE WHEN w.week_number = 1 THEN 'pending' ELSE 'locked' END
        FROM weeks w
        WHERE w.track_id = rec.track_id
        ON CONFLICT (student_id, week_id) DO NOTHING;
        
        enrollment_count := enrollment_count + 1;
        RAISE NOTICE 'Enrolled: % in % - %', rec.email, rec.track_name, rec.cohort_name;
    END LOOP;
    
    RAISE NOTICE 'Enrolled % students', enrollment_count;
END $$;

-- ============================================
-- PART 6: VERIFICATION
-- ============================================

SELECT '========================================' as info;
SELECT 'SYSTEM STATUS' as info;
SELECT '========================================' as info;

-- Show all enrollments
SELECT 
    p.email,
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
GROUP BY p.email, t.name, c.name, se.status, se.enrolled_at
ORDER BY se.enrolled_at DESC;

SELECT '========================================' as info;
SELECT 'ALL FIXES APPLIED!' as status;
SELECT '========================================' as info;