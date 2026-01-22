-- Deploy Automatic Enrollment Fix for Whitelisted Users
-- This ensures students who are whitelisted get automatically enrolled when they sign up

-- First, add missing RLS policies for student_enrollments
DROP POLICY IF EXISTS "Users can insert their own enrollments" ON student_enrollments;
CREATE POLICY "Users can insert their own enrollments" ON student_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can insert enrollments" ON student_enrollments;
CREATE POLICY "Admins can insert enrollments" ON student_enrollments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can update their own enrollments" ON student_enrollments;
CREATE POLICY "Users can update their own enrollments" ON student_enrollments
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update all enrollments" ON student_enrollments;
CREATE POLICY "Admins can update all enrollments" ON student_enrollments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Ensure profiles table has proper INSERT policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Add missing UPDATE policy for profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Add missing INSERT/UPDATE policies for week_progress
DROP POLICY IF EXISTS "Students can insert their own progress" ON week_progress;
CREATE POLICY "Students can insert their own progress" ON week_progress
  FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update their own progress" ON week_progress;
CREATE POLICY "Students can update their own progress" ON week_progress
  FOR UPDATE USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Admins can manage all progress" ON week_progress;
CREATE POLICY "Admins can manage all progress" ON week_progress
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create improved function to handle automatic enrollment
CREATE OR REPLACE FUNCTION handle_automatic_enrollment()
RETURNS TRIGGER AS $$
DECLARE
    whitelist_entry RECORD;
    enrollment_id UUID;
    week_count INTEGER;
BEGIN
    -- Only process for student role
    IF NEW.role != 'student' THEN
        RETURN NEW;
    END IF;
    
    -- Check if user has a whitelist entry
    SELECT * INTO whitelist_entry
    FROM paid_learner_whitelist
    WHERE email = NEW.email
    AND status = 'active'
    LIMIT 1;
    
    -- If whitelisted, create enrollment automatically
    IF whitelist_entry IS NOT NULL THEN
        -- Check if enrollment already exists
        IF NOT EXISTS (
            SELECT 1 FROM student_enrollments 
            WHERE user_id = NEW.id 
            AND track_id = whitelist_entry.track_id 
            AND cohort_id = whitelist_entry.cohort_id
        ) THEN
            -- Get total weeks for this track
            SELECT COUNT(*) INTO week_count
            FROM weeks
            WHERE track_id = whitelist_entry.track_id;
            
            -- Create enrollment
            INSERT INTO student_enrollments (
                user_id,
                track_id,
                cohort_id,
                progress_percentage,
                tasks_completed,
                total_tasks,
                enrolled_at,
                status
            ) VALUES (
                NEW.id,
                whitelist_entry.track_id,
                whitelist_entry.cohort_id,
                0,
                0,
                COALESCE(week_count, 20),
                NOW(),
                'active'
            ) RETURNING id INTO enrollment_id;
            
            -- Log successful enrollment
            RAISE NOTICE 'Automatic enrollment created for user % (%) with enrollment ID %', NEW.full_name, NEW.email, enrollment_id;
            
            -- Initialize week progress for the enrolled student
            INSERT INTO week_progress (student_id, week_id, status, created_at, updated_at)
            SELECT 
                NEW.id,
                w.id,
                CASE WHEN w.week_number = 1 THEN 'pending' ELSE 'locked' END,
                NOW(),
                NOW()
            FROM weeks w
            WHERE w.track_id = whitelist_entry.track_id
            ORDER BY w.order_index
            ON CONFLICT (student_id, week_id) DO NOTHING;
            
            RAISE NOTICE 'Week progress initialized for user %', NEW.id;
        ELSE
            RAISE NOTICE 'Enrollment already exists for user % (%)', NEW.full_name, NEW.email;
        END IF;
    ELSE
        RAISE NOTICE 'No whitelist entry found for user % (%)', NEW.full_name, NEW.email;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically enroll whitelisted users
DROP TRIGGER IF EXISTS trigger_automatic_enrollment ON profiles;
CREATE TRIGGER trigger_automatic_enrollment
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_automatic_enrollment();

-- Create function to manually enroll existing whitelisted users who don't have enrollments
CREATE OR REPLACE FUNCTION enroll_existing_whitelisted_users()
RETURNS TABLE(user_id UUID, email TEXT, track_name TEXT, cohort_name TEXT, enrollment_created BOOLEAN) AS $$
DECLARE
    user_record RECORD;
    enrollment_id UUID;
    week_count INTEGER;
BEGIN
    -- Find whitelisted users without enrollments
    FOR user_record IN
        SELECT 
            p.id,
            p.email,
            p.full_name,
            w.track_id,
            w.cohort_id,
            t.name as track_name,
            c.name as cohort_name
        FROM profiles p
        JOIN paid_learner_whitelist w ON w.email = p.email
        JOIN tracks t ON t.id = w.track_id
        JOIN cohorts c ON c.id = w.cohort_id
        LEFT JOIN student_enrollments se ON se.user_id = p.id AND se.track_id = w.track_id AND se.cohort_id = w.cohort_id
        WHERE w.status = 'active'
        AND p.role = 'student'
        AND se.id IS NULL
    LOOP
        -- Get total weeks for this track
        SELECT COUNT(*) INTO week_count
        FROM weeks
        WHERE track_id = user_record.track_id;
        
        -- Create enrollment
        INSERT INTO student_enrollments (
            user_id,
            track_id,
            cohort_id,
            progress_percentage,
            tasks_completed,
            total_tasks,
            enrolled_at,
            status
        ) VALUES (
            user_record.id,
            user_record.track_id,
            user_record.cohort_id,
            0,
            0,
            COALESCE(week_count, 20),
            NOW(),
            'active'
        ) RETURNING id INTO enrollment_id;
        
        -- Initialize week progress
        INSERT INTO week_progress (student_id, week_id, status, created_at, updated_at)
        SELECT 
            user_record.id,
            w.id,
            CASE WHEN w.week_number = 1 THEN 'pending' ELSE 'locked' END,
            NOW(),
            NOW()
        FROM weeks w
        WHERE w.track_id = user_record.track_id
        ORDER BY w.order_index
        ON CONFLICT (student_id, week_id) DO NOTHING;
        
        -- Return result
        user_id := user_record.id;
        email := user_record.email;
        track_name := user_record.track_name;
        cohort_name := user_record.cohort_name;
        enrollment_created := TRUE;
        
        RETURN NEXT;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to enroll existing whitelisted users
SELECT * FROM enroll_existing_whitelisted_users();

-- Verify the policies are in place
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('student_enrollments', 'profiles', 'week_progress')
ORDER BY tablename, policyname;

-- Test query to verify everything is working
SELECT 
    p.full_name,
    p.email,
    p.role,
    se.id as enrollment_id,
    t.name as track_name,
    c.name as cohort_name,
    se.status as enrollment_status,
    COUNT(wp.id) as week_progress_count
FROM profiles p
LEFT JOIN student_enrollments se ON se.user_id = p.id
LEFT JOIN tracks t ON t.id = se.track_id
LEFT JOIN cohorts c ON c.id = se.cohort_id
LEFT JOIN week_progress wp ON wp.student_id = p.id
WHERE p.role = 'student'
GROUP BY p.id, p.full_name, p.email, p.role, se.id, t.name, c.name, se.status
ORDER BY p.created_at DESC;