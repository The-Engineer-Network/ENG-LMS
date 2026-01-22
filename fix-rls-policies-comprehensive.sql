-- Comprehensive RLS Policy Fix
-- This script addresses the RLS policy issues causing multiple fallback mechanisms

-- First, let's simplify the admin check function
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user is enrolled in a track
CREATE OR REPLACE FUNCTION is_enrolled_in_track(user_id UUID, track_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM student_enrollments 
    WHERE user_id = is_enrolled_in_track.user_id 
    AND track_id = is_enrolled_in_track.track_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Public read access for tracks" ON tracks;
DROP POLICY IF EXISTS "Admins can manage tracks" ON tracks;
DROP POLICY IF EXISTS "Public read access for weeks" ON weeks;
DROP POLICY IF EXISTS "Admins can manage weeks" ON weeks;
DROP POLICY IF EXISTS "Public read access for lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;
DROP POLICY IF EXISTS "Public read access for assignments" ON assignments;
DROP POLICY IF EXISTS "Admins can manage assignments" ON assignments;
DROP POLICY IF EXISTS "Students can view assignments in their track" ON assignments;

-- Create simplified, performant policies

-- TRACKS policies
CREATE POLICY "Anyone can read tracks" ON tracks
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage tracks" ON tracks
    FOR ALL USING (is_admin());

-- WEEKS policies  
CREATE POLICY "Anyone can read weeks" ON weeks
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage weeks" ON weeks
    FOR ALL USING (is_admin());

-- LESSONS policies
CREATE POLICY "Anyone can read lessons" ON lessons
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage lessons" ON lessons
    FOR ALL USING (is_admin());

-- ASSIGNMENTS policies
CREATE POLICY "Anyone can read assignments" ON assignments
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage assignments" ON assignments
    FOR ALL USING (is_admin());

-- COHORTS policies
DROP POLICY IF EXISTS "Public read access for cohorts" ON cohorts;
DROP POLICY IF EXISTS "Admins can manage cohorts" ON cohorts;

CREATE POLICY "Anyone can read cohorts" ON cohorts
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage cohorts" ON cohorts
    FOR ALL USING (is_admin());

-- STUDENT_ENROLLMENTS policies
DROP POLICY IF EXISTS "Students can view their own enrollment" ON student_enrollments;
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON student_enrollments;

CREATE POLICY "Students can view their own enrollment" ON student_enrollments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all enrollments" ON student_enrollments
    FOR ALL USING (is_admin());

-- TASK_SUBMISSIONS policies
DROP POLICY IF EXISTS "Students can view their own submissions" ON task_submissions;
DROP POLICY IF EXISTS "Students can insert their own submissions" ON task_submissions;
DROP POLICY IF EXISTS "Students can update their own submissions" ON task_submissions;
DROP POLICY IF EXISTS "Admins can manage all submissions" ON task_submissions;

CREATE POLICY "Students can view their own submissions" ON task_submissions
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own submissions" ON task_submissions
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own submissions" ON task_submissions
    FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Admins can manage all submissions" ON task_submissions
    FOR ALL USING (is_admin());

-- ACCOUNTABILITY_PARTNERS policies
DROP POLICY IF EXISTS "Students can view their partnerships" ON accountability_partners;
DROP POLICY IF EXISTS "Admins can manage partnerships" ON accountability_partners;

CREATE POLICY "Students can view their partnerships" ON accountability_partners
    FOR SELECT USING (
        auth.uid() = student1_id OR 
        auth.uid() = student2_id
    );

CREATE POLICY "Admins can manage partnerships" ON accountability_partners
    FOR ALL USING (is_admin());

-- CERTIFICATES policies
DROP POLICY IF EXISTS "Students can view their own certificates" ON certificates;
DROP POLICY IF EXISTS "Admins can manage certificates" ON certificates;

CREATE POLICY "Students can view their own certificates" ON certificates
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Admins can manage certificates" ON certificates
    FOR ALL USING (is_admin());

-- CLARITY_CALL_REQUESTS policies
DROP POLICY IF EXISTS "Students can manage their own requests" ON clarity_call_requests;
DROP POLICY IF EXISTS "Admins can manage all requests" ON clarity_call_requests;

CREATE POLICY "Students can manage their own requests" ON clarity_call_requests
    FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Admins can manage all requests" ON clarity_call_requests
    FOR ALL USING (is_admin());

-- PAID_LEARNER_WHITELIST policies
DROP POLICY IF EXISTS "Admins can manage whitelist" ON paid_learner_whitelist;

CREATE POLICY "Anyone can read whitelist for signup" ON paid_learner_whitelist
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage whitelist" ON paid_learner_whitelist
    FOR ALL USING (is_admin());

-- CHAT_MESSAGES policies
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON chat_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON chat_messages;

CREATE POLICY "Users can view their messages" ON chat_messages
    FOR SELECT USING (
        auth.uid() = sender_id OR 
        auth.uid() = recipient_id
    );

CREATE POLICY "Users can send messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Admins can view all messages" ON chat_messages
    FOR SELECT USING (is_admin());

-- PROFILES policies (ensure they're correct)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage all profiles" ON profiles
    FOR ALL USING (is_admin());

-- ADMIN_SETTINGS policies
DROP POLICY IF EXISTS "Admins can manage settings" ON admin_settings;

CREATE POLICY "Admins can manage settings" ON admin_settings
    FOR ALL USING (is_admin());

-- Add indexes to improve performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_student_enrollments_user_track ON student_enrollments(user_id, track_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_student ON task_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_accountability_partners_students ON accountability_partners(student1_id, student2_id);
CREATE INDEX IF NOT EXISTS idx_assignments_week ON assignments(week_id);
CREATE INDEX IF NOT EXISTS idx_lessons_week ON lessons(week_id);
CREATE INDEX IF NOT EXISTS idx_weeks_track ON weeks(track_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';