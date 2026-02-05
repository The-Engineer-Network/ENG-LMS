-- Fix for specific user who can't login

-- 1. First, let's check if this user exists in auth.users
SELECT 'Checking auth user:' as step;
SELECT id, email, created_at 
FROM auth.users 
WHERE id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6';

-- 2. Check if profile exists
SELECT 'Checking profile:' as step;
SELECT * FROM profiles 
WHERE id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6';

-- 3. Check if enrollment exists
SELECT 'Checking enrollment:' as step;
SELECT * FROM student_enrollments 
WHERE user_id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6';

-- 4. Disable RLS temporarily to fix the issue
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE week_progress DISABLE ROW LEVEL SECURITY;

-- 5. Create profile if it doesn't exist
INSERT INTO profiles (id, email, full_name, role)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', 'Student'),
    'student'
FROM auth.users u
WHERE u.id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6'
AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = u.id
);

-- 6. Check whitelist and create enrollment if needed
DO $$
DECLARE
    user_email TEXT;
    whitelist_rec RECORD;
BEGIN
    -- Get user email
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6';
    
    IF user_email IS NULL THEN
        RAISE NOTICE 'User not found in auth.users';
        RETURN;
    END IF;
    
    RAISE NOTICE 'User email: %', user_email;
    
    -- Check whitelist
    SELECT w.*, t.name as track_name, c.name as cohort_name
    INTO whitelist_rec
    FROM paid_learner_whitelist w
    JOIN tracks t ON w.track_id = t.id
    JOIN cohorts c ON w.cohort_id = c.id
    WHERE w.email = user_email
    AND w.status = 'active';
    
    IF NOT FOUND THEN
        RAISE NOTICE 'User not in whitelist: %', user_email;
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found whitelist entry for % - Track: %, Cohort: %', 
        user_email, whitelist_rec.track_name, whitelist_rec.cohort_name;
    
    -- Create enrollment if doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM student_enrollments 
        WHERE user_id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6'
    ) THEN
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
    ELSE
        RAISE NOTICE 'Enrollment already exists';
    END IF;
END $$;

-- 7. Re-enable RLS with proper policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_progress ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow all for authenticated" ON profiles;
DROP POLICY IF EXISTS "Allow all for service role" ON profiles;

-- Create simple policies that work
CREATE POLICY "profiles_select_policy"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_policy"
  ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "profiles_update_policy"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Same for enrollments
DROP POLICY IF EXISTS "Allow all for authenticated" ON student_enrollments;
DROP POLICY IF EXISTS "Allow all for service role" ON student_enrollments;

CREATE POLICY "enrollments_select_policy"
  ON student_enrollments FOR SELECT
  USING (true);

CREATE POLICY "enrollments_insert_policy"
  ON student_enrollments FOR INSERT
  WITH CHECK (true);

-- Same for week_progress
DROP POLICY IF EXISTS "Allow all for authenticated" ON week_progress;
DROP POLICY IF EXISTS "Allow all for service role" ON week_progress;

CREATE POLICY "week_progress_select_policy"
  ON week_progress FOR SELECT
  USING (true);

CREATE POLICY "week_progress_insert_policy"
  ON week_progress FOR INSERT
  WITH CHECK (true);

-- 8. Final verification
SELECT 'Final Status:' as step;

SELECT 
    'Profile exists' as check_type,
    COUNT(*) as count
FROM profiles 
WHERE id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6';

SELECT 
    'Enrollment exists' as check_type,
    COUNT(*) as count
FROM student_enrollments 
WHERE user_id = '1b9d63c2-ef22-4264-852e-37ffc258cdf6';

SELECT 'User should now be able to login!' as status;