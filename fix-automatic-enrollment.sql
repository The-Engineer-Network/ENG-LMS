-- Fix automatic enrollment for whitelisted users during signup
-- This addresses the missing RLS policies that prevent enrollment creation

-- Add missing INSERT policies for student_enrollments table
CREATE POLICY "Users can insert their own enrollments" ON student_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can insert enrollments" ON student_enrollments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Add UPDATE policy for progress updates
CREATE POLICY "Users can update their own enrollments" ON student_enrollments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all enrollments" ON student_enrollments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Ensure profiles table has proper INSERT policy for new user creation
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle automatic enrollment after signup
CREATE OR REPLACE FUNCTION handle_automatic_enrollment()
RETURNS TRIGGER AS $$
DECLARE
    whitelist_entry RECORD;
    enrollment_id UUID;
BEGIN
    -- Check if user has a whitelist entry
    SELECT * INTO whitelist_entry
    FROM paid_learner_whitelist
    WHERE email = NEW.email
    AND status = 'active'
    LIMIT 1;
    
    -- If whitelisted, create enrollment automatically
    IF whitelist_entry IS NOT NULL THEN
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
            20,
            NOW(),
            'active'
        ) RETURNING id INTO enrollment_id;
        
        -- Log successful enrollment
        RAISE NOTICE 'Automatic enrollment created for user % with enrollment ID %', NEW.id, enrollment_id;
        
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
        ON CONFLICT (student_id, week_id) DO NOTHING;
        
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

-- Verify the fix by checking current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'student_enrollments'
ORDER BY policyname;

-- Test query to verify enrollment creation works
-- (This will be used for testing after deployment)
/*
-- Test automatic enrollment for existing whitelisted users without enrollments
INSERT INTO student_enrollments (user_id, track_id, cohort_id, progress_percentage, tasks_completed, total_tasks, enrolled_at, status)
SELECT 
    p.id,
    w.track_id,
    w.cohort_id,
    0,
    0,
    20,
    NOW(),
    'active'
FROM profiles p
JOIN paid_learner_whitelist w ON w.email = p.email
LEFT JOIN student_enrollments se ON se.user_id = p.id
WHERE w.status = 'active'
AND se.id IS NULL
AND p.role = 'student';
*/